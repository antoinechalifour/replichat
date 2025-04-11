import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma, runTransaction, tx } from "~/server/prisma";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { poke } from "~/server/pusher";
import { authenticate } from "~/server/auth";
import { createRedis, redis } from "~/server/redis";
import { Message } from "@prisma/client";

function chatMessageStreamName(args: { chatId: string; messageId: string }) {
  return `stream_chat:${args.chatId}:reply_to:${args.messageId}`;
}

async function writeToRedisStream(args: {
  chatId: string;
  messageId: string;
  readable: ReadableStream<string>;
}) {
  const reader = args.readable.getReader();
  const redis = createRedis();

  try {
    await redis.xadd(chatMessageStreamName(args), "*", "type", "init");
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        await redis.xadd(chatMessageStreamName(args), "*", "type", "end");
        return;
      }
      console.log("[OpenAI] Writing to Redis", value);
      await redis.xadd(
        chatMessageStreamName(args),
        "*",
        "type",
        "delta",
        "delta",
        value,
      );
    }
  } catch (err) {
    console.log("writeToRedisStream", err);
  }
}

async function doCallOpenAI(args: {
  apiKey: string;
  model: string;
  userId: string;
  chatId: string;
  messages: Message[];
}) {
  console.log("[OpenAI] Streaming...");
  const openai = createOpenAI({ apiKey: args.apiKey });
  const replyToId = args.messages[args.messages.length - 1].id;
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

  const [a, b] = result.textStream.tee();
  void writeToRedisStream({
    readable: b,
    chatId: args.chatId,
    messageId: replyToId,
  });

  return new Response(a.pipeThrough(new TextEncoderStream()), {
    status: 200,
    headers: {
      contentType: "text/plain; charset=utf-8",
    },
  });
}

async function* readRedisStream(streamName: string) {
  let lastId = "0";
  const redis = createRedis();

  while (true) {
    const result = await redis.xread("BLOCK", 0, "STREAMS", streamName, lastId);
    if (result) {
      for (const [, messages] of result) {
        for (const [id, fields] of messages) {
          // Convert the flat array of fields to an object.
          const chunk: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            chunk[fields[i]] = fields[i + 1];
          }

          lastId = id;

          const theChunk = chunk as
            | { type: "init" }
            | { type: "end" }
            | { type: "delta"; delta: string };

          if (theChunk.type === "delta") yield theChunk.delta;

          if (chunk.type === "end") {
            return;
          }
        }
      }
    }
  }
}

async function readFromStream(args: { chatId: string; messageId: string }) {
  console.log("[Redis] Streaming...");
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        for await (const chunk of readRedisStream(
          chatMessageStreamName(args),
        )) {
          console.log("[Redis] chunk", chunk);
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    status: 200,
    headers: {
      contentType: "text/plain; charset=utf-8",
    },
  });
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
    const exists = await redis.exists(
      chatMessageStreamName({
        chatId: chat.id,
        messageId: chat.messages[chat.messages.length - 1].id,
      }),
    );
    console.log("[Generate]", chat.id, "exists", exists === 0);

    if (exists === 1) {
      return readFromStream({
        chatId: chat.id,
        messageId: chat.messages[chat.messages.length - 1].id,
      });
    } else {
      if (user.openAiApiKey == null) throw new Error("No OpenAI API key found");

      return doCallOpenAI({
        apiKey: user.openAiApiKey,
        model: user.currentModel.code,
        messages: chat.messages,
        userId: user.id,
        chatId: params.chatId,
      });
    }
  },
});
