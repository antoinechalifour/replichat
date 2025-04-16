import {
  chatMessageStreamName,
  createStreamCache,
} from "~/server/chats/StreamResponse";
import { streamText } from "ai";
import { prisma, runTransaction } from "~/server/prisma";
import { addMessage } from "~/server/chats/AddMessage";
import { poke } from "~/server/pusher";
import { createOpenAI } from "@ai-sdk/openai";
import { raise } from "~/utils/errors";

class GenerateSystemMessage {
  async execute({ chatId, userId }: { userId: string; chatId: string }) {
    const [chat, { openai, model }] = await Promise.all([
      this.getChat(chatId),
      this.getAI(userId),
    ]);
    const cache = createStreamCache(
      chatMessageStreamName({
        chatId,
        messageId: chat.messages[chat.messages.length - 1].id,
      }),
    );
    await cache.create();

    const result = streamText({
      model: openai(model),
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
      onError: (error) => {
        console.error(error);
        // TODO: retry
      },
      onFinish: async (message) => {
        await runTransaction(() =>
          addMessage.execute({
            chatId,
            userId,
            messageId: crypto.randomUUID(),
            messageContent: message.text,
            role: "SYSTEM",
          }),
        );
        poke(userId);
        // TODO: expire stream
      },
    });

    await cache.write(result.textStream);
  }

  private getChat(chatId: string) {
    return prisma.chat.findFirstOrThrow({
      where: { id: chatId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  private async getAI(userId: string) {
    const settings = await this.getAISettings(userId);
    return {
      openai: createOpenAI({ apiKey: settings.apiKey }),
      model: settings.model,
    };
  }

  private async getAISettings(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
        openAiApiKey: { not: null },
      },
      include: { currentModel: { select: { code: true } } },
    });

    return {
      apiKey: user.openAiApiKey ?? raise(new Error("API_KEY_NOT_FOUND")),
      model: user.currentModel.code,
    };
  }
}

export const generateSystemMessage = new GenerateSystemMessage();
