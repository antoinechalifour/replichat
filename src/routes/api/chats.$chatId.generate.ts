import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma, runTransaction, tx } from "~/server/prisma";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { MessageRole } from "@prisma/client";
import { poke } from "~/server/pusher";
import { authenticate } from "~/server/auth";

export const APIRoute = createAPIFileRoute("/api/chats/$chatId/generate")({
  POST: async ({ request, params }) => {
    const user = await authenticate(request);
    if (user.openAiApiKey == null) throw new Error("No OpenAI API key found");
    const openai = createOpenAI({ apiKey: user.openAiApiKey });
    const chat = await prisma.chat.findFirstOrThrow({
      where: { id: params.chatId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    const result = streamText({
      model: openai("gpt-4o"),
      messages: chat.messages.map((message) => ({
        role: message.role.toLowerCase() as Lowercase<MessageRole>,
        content: message.content,
      })),
      onFinish: async (message) => {
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

    return result.toTextStreamResponse();
  },
});
