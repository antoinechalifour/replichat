import { Chats, ChatsAdapter } from "./Chats";
import { Chat, Message } from "./Chat";

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
  }
}

export const createChat = new CreateChat(new ChatsAdapter());
