import { Chats, ChatsAdapter } from "./Chats";
import { Chat, Message } from "./Chat";
import { postCommit } from "~/server/prisma";
import { emitter } from "~/server/emitter";

export class CreateChat {
  constructor(private readonly chats: Chats) {}

  async execute(args: {
    id: string;
    userId: string;
    message: { id: string; content: string };
  }) {
    const message = new Message(args.message.id, args.message.content, "USER");
    const chat = new Chat(args.id, args.userId, "Untitled", [message]);
    await this.chats.save(chat);

    postCommit(() => {
      emitter.emit("chat.created", {
        chatId: chat.id,
        userId: chat.userId,
      });
    });
  }
}

export const createChat = new CreateChat(new ChatsAdapter());
