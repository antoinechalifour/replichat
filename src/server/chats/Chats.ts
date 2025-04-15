import { tx } from "~/server/prisma";
import { Chat, Message } from "./Chat";

export interface Chats {
  ofId(id: string): Promise<Chat>;
  save(chat: Chat): Promise<void>;
}

export class ChatsAdapter implements Chats {
  async ofId(id: string): Promise<Chat> {
    const row = await tx().chat.findUniqueOrThrow({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return new Chat(
      row.id,
      row.userId,
      row.title,
      row.messages.map(
        (message) => new Message(message.id, message.content, message.role),
      ),
    );
  }

  async save(chat: Chat): Promise<void> {
    await tx().chat.upsert({
      where: { id: chat.id, userId: chat.userId },
      create: {
        id: chat.id,
        userId: chat.userId,
        title: chat.title,
        version: 1,
      },
      update: {
        title: chat.title,
        version: { increment: 1 },
      },
    });

    for (const message of chat.messages) {
      await tx().message.upsert({
        where: { id: message.id },
        create: {
          id: message.id,
          content: message.content,
          chatId: chat.id,
          role: message.role,
        },
        update: {},
      });
    }
  }
}
