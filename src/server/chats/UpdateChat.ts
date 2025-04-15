import { Chats, ChatsAdapter } from "./Chats";
import { ChatUpdates } from "./Chat";

export class UpdateChat {
  constructor(private readonly chats: Chats) {}

  async execute(args: { id: string; userId: string; updates: ChatUpdates }) {
    const chat = await this.chats.ofId(args.id, args.userId);
    chat.applyUpdates(args.updates);
    await this.chats.save(chat);
  }
}

export const updateChat = new UpdateChat(new ChatsAdapter());
