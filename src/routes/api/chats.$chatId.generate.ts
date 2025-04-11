import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma, runTransaction, tx } from "~/server/prisma";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { poke } from "~/server/pusher";
import { authenticate } from "~/server/auth";

const store = new Map<string, ReadableStream>();

export const APIRoute = createAPIFileRoute("/api/chats/$chatId/generate")({
  POST: async ({ request, params }) => {
    const user = await authenticate(request);
    const existing = store.get(params.chatId);

    if (existing) {
      const [a, b] = existing.tee();
      store.set(params.chatId, a);
      return new Response(b.pipeThrough(new TextEncoderStream()), {
        status: 200,
        headers: {
          contentType: "text/plain; charset=utf-8",
        },
      });
    }

    if (user.openAiApiKey == null) throw new Error("No OpenAI API key found");
    const openai = createOpenAI({ apiKey: user.openAiApiKey });
    const chat = await prisma.chat.findFirstOrThrow({
      where: { id: params.chatId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    const result = streamText({
      model: openai(user.currentModel.code),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer the user's questions. You may use markdown to format your answers.",
        },
        ...chat.messages.map((message) => ({
          role:
            message.role === "USER"
              ? ("user" as const)
              : ("assistant" as const),
          content: message.content,
        })),
      ],
      onFinish: async (message) => {
        store.delete(params.chatId);
        await runTransaction(async () => {
          await tx().chat.update({
            where: { id: params.chatId },
            data: {
              version: { increment: 1 },
            },
          });
          await tx().message.create({
            data: {
              id: crypto.randomUUID(),
              content: message.text,
              chatId: params.chatId,
              role: "SYSTEM",
            },
          });
        });
        poke(user.id);
      },
    });

    void result.consumeStream();
    const [a, b] = result.textStream.tee();
    store.set(params.chatId, b);
    return new Response(a.pipeThrough(new TextEncoderStream()), {
      status: 200,
      headers: {
        contentType: "text/plain; charset=utf-8",
      },
    });
  },
});
