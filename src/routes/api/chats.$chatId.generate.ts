import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma, runTransaction, tx } from "~/server/prisma";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { poke } from "~/server/pusher";
import { authenticate } from "~/server/auth";
import {
  consumeRedisStream,
  redis,
  writeReadableStreamToRedisStream,
} from "~/server/redis";
import { Message } from "@prisma/client";
import { z } from "zod";
import {
  asyncIterableToReadableStream,
  streamTextResponse,
} from "~/server/stream";

const chatMessageStreamName = (args: { chatId: string; messageId: string }) =>
  `stream_chat:${args.chatId}:reply_to:${args.messageId}`;

async function doCallOpenAI(args: {
  apiKey: string;
  model: string;
  userId: string;
  chatId: string;
  messages: Message[];
}) {
  console.log("[OpenAI] Streaming...");
  const openai = createOpenAI({ apiKey: args.apiKey });
  const result = streamText({
    model: openai(args.model),
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Answer the user's questions. You may use markdown to format your answers.",
      },
      ...args.messages.map((message) => ({
        role:
          message.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: message.content,
      })),
    ],
    onFinish: async (message) => {
      await runTransaction(async () => {
        await tx().chat.update({
          where: { id: args.chatId },
          data: {
            version: { increment: 1 },
          },
        });
        await tx().message.create({
          data: {
            id: crypto.randomUUID(),
            content: message.text,
            chatId: args.chatId,
            role: "SYSTEM",
          },
        });
      });
      poke(args.userId);
    },
  });

  void result.consumeStream();
  return result;
}

const ChunkSchema = z
  .object({ type: z.literal("init") })
  .or(z.object({ type: z.literal("end") }))
  .or(z.object({ type: z.literal("delta"), delta: z.string() }));

function streamFromCache(streamName: string) {
  console.log("[Redis] Streaming...");
  return asyncIterableToReadableStream(
    consumeRedisStream({
      streamName,
      parseChunk: (chunk) => ChunkSchema.parse(chunk),
      getYieldedChunk: (chunk) => {
        if (chunk.type === "delta") return chunk.delta;
        return null;
      },
      isComplete: (chunk) => chunk.type === "end",
    }),
  );
}

export const APIRoute = createAPIFileRoute("/api/chats/$chatId/generate")({
  POST: async ({ request, params }) => {
    const user = await authenticate(request);
    const chat = await prisma.chat.findFirstOrThrow({
      where: { id: params.chatId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    const streamName = chatMessageStreamName({
      chatId: chat.id,
      messageId: chat.messages[chat.messages.length - 1].id,
    });
    const exists = await redis.exists(streamName);

    if (exists === 1) {
      return streamTextResponse(streamFromCache(streamName));
    } else {
      if (user.openAiApiKey == null) throw new Error("No OpenAI API key found");

      const result = await doCallOpenAI({
        apiKey: user.openAiApiKey,
        model: user.currentModel.code,
        messages: chat.messages,
        userId: user.id,
        chatId: params.chatId,
      });

      const [forClient, forCache] = result.textStream.tee();
      void writeReadableStreamToRedisStream({
        streamName,
        readableStream: forCache,
      });

      return streamTextResponse(forClient);
    }
  },
});
