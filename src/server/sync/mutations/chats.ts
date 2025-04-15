import { z } from "zod";
import { createMutationHandler } from "../MutationHandler";
import { prisma, tx } from "~/server/prisma";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { poke } from "~/server/pusher";
import { createChat } from "~/server/chats/CreateChat";

async function generateChatName(userId: string, chatId: string) {
  const chat = await prisma.chat.findFirstOrThrow({
    where: { id: chatId },
    include: {
      user: true,
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  const message = chat.messages[0];
  const apiKey = chat.user.openAiApiKey;
  if (message == null || apiKey == null) return;
  const openai = createOpenAI({ apiKey: apiKey });

  const response = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: `Generate a chat title based on the following message: "${message.content}". The title should be short (3-4 words) and descriptive. Not quotes, no markdown, just plain text`,
      },
    ],
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { title: response.text },
  });

  poke(userId);
}

export const createChatMutation = createMutationHandler("createChat")
  .validate((args) =>
    z
      .object({
        id: z.string(),
        // TODO: message object + content
        messageId: z.string(),
        message: z.string(),
      })
      .parse(args),
  )
  .handler(async ({ args, ctx }) => {
    await createChat.execute({
      id: args.id,
      userId: ctx.userId,
      message: { id: args.messageId, content: args.message },
    });
    // TODO: post-commit
    setTimeout(() => generateChatName(ctx.userId, args.id), 1000);
  });

export const updateChatMutation = createMutationHandler("updateChat")
  .validate((args) =>
    z
      .object({
        chatId: z.string(),
        title: z.string(),
      })
      .parse(args),
  )
  .handler(async ({ args, ctx }) => {
    await tx().chat.update({
      where: { id: args.chatId, userId: ctx.userId },
      data: { title: args.title },
    });
  });

export const deleteChatMutation = createMutationHandler("deleteChat")
  .validate((args) =>
    z
      .object({
        chatId: z.string(),
      })
      .parse(args),
  )
  .handler(async ({ args, ctx }) => {
    await tx().chat.delete({ where: { id: args.chatId, userId: ctx.userId } });
  });

export const sendMessageMutation = createMutationHandler("sendMessage")
  .validate((args) =>
    z
      .object({
        chatId: z.string(),
        messageId: z.string(),
        message: z.string(),
      })
      .parse(args),
  )
  .handler(async ({ args }) => {
    await tx().chat.update({
      where: { id: args.chatId },
      data: { version: { increment: 1 } },
    });
    await tx().message.create({
      data: {
        id: args.messageId,
        content: args.message,
        role: "USER",
        chatId: args.chatId,
      },
    });
  });
