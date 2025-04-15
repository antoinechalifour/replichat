import { z } from "zod";
import { createMutationHandler } from "../MutationHandler";
import { tx } from "~/server/prisma";
import { createChat } from "~/server/chats/CreateChat";
import { updateChat } from "~/server/chats/UpdateChat";
import { addMessage } from "~/server/chats/AddMessage";

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
