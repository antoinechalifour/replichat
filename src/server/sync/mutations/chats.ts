import { z } from "zod";
import { createMutationHandler } from "../MutationHandler";
import { prisma, tx } from "~/server/prisma";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { poke } from "~/server/pusher";

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

export const createChat = createMutationHandler("createChat")
  .validate((args) =>
    z
      .object({
        id: z.string(),
        messageId: z.string(),
        message: z.string(),
      })
      .parse(args),
  )
  .handler(async ({ args, ctx }) => {
    await tx().chat.create({
      data: {
        id: args.id,
        userId: ctx.userId,
        version: 1,
        messages: {
          create: {
            id: args.messageId,
            role: "USER",
            content: args.message,
          },
        },
      },
    });
    setTimeout(() => generateChatName(ctx.userId, args.id), 2000);
  });

export const updateChat = createMutationHandler("updateChat")
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

export const deleteChat = createMutationHandler("deleteChat")
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

export const sendMessage = createMutationHandler("sendMessage")
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
