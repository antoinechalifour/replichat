import { Chats, ChatsAdapter } from "./Chats";
import { Chat, Message } from "./Chat";
import { postCommit } from "~/server/prisma";

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
      console.log("Transaction commited !");
    });
  }
}

export const createChat = new CreateChat(new ChatsAdapter());
