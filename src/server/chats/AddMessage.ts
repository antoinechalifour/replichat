import { MessageRole } from "./Chat";
import { Chats, ChatsAdapter } from "./Chats";

export class AddMessage {
  constructor(private readonly chats: Chats) {}

  async execute({
    chatId,
    message,
    role,
  }: {
    chatId: string;
    role: MessageRole;
    message: string;
  }) {
    const chat = await this.chats.ofId(chatId);
    chat.addMessage({ message, role });
    await this.chats.save(chat);
  }
}

export const addMessage = new AddMessage(new ChatsAdapter());
