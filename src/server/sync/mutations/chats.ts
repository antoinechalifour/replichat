import { z } from "zod";
import { createMutationHandler } from "../MutationHandler";
import { prisma, tx } from "~/server/prisma";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { poke } from "~/server/pusher";
import { createChat } from "~/server/chats/CreateChat";
import { updateChat } from "~/server/chats/UpdateChat";
import { addMessage } from "~/server/chats/AddMessage";

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

  await updateChat.execute({
    id: chatId,
    userId,
    updates: { title: response.text },
  });

  poke(userId);
}

export const createChatMutation = createMutationHandler("createChat")
  .validate((args) =>
    z
      .object({
        id: z.string(),
        message: z.object({
          id: z.string(),
          content: z.string(),
        }),
      })
      .parse(args),
  )
  .handler(async ({ args, ctx }) => {
    await createChat.execute({
      id: args.id,
      userId: ctx.userId,
      message: args.message,
    });
    // TODO: post-commit
    setTimeout(() => generateChatName(ctx.userId, args.id), 1000);
  });

export const updateChatMutation = createMutationHandler("updateChat")
  .validate((args) =>
    z
      .object({
        id: z.string(),
        updates: z.object({
          title: z.string(),
        }),
      })
      .parse(args),
  )
  .handler(({ args, ctx }) =>
    updateChat.execute({
      id: args.id,
      userId: ctx.userId,
      updates: args.updates,
    }),
  );

export const deleteChatMutation = createMutationHandler("deleteChat")
  .validate((args) =>
    z
      .object({
        id: z.string(),
      })
      .parse(args),
  )
  .handler(async ({ args, ctx }) => {
    await tx().chat.delete({ where: { id: args.id, userId: ctx.userId } });
  });

export const addUserMessageMutation = createMutationHandler("addUserMessage")
  .validate((args) =>
    z
      .object({
        chatId: z.string(),
        message: z.object({
          id: z.string(),
          content: z.string(),
        }),
      })
      .parse(args),
  )
  .handler(({ args, ctx }) =>
    addMessage.execute({
      chatId: args.chatId,
      userId: ctx.userId,
      messageId: args.message.id,
      messageContent: args.message.content,
      role: "USER",
    }),
  );
