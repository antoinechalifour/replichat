import { MessageRole } from "./Chat";
import { Chats, ChatsAdapter } from "./Chats";

export class AddMessage {
  constructor(private readonly chats: Chats) {}

  async execute({
    chatId,
    userId,
    messageId,
    messageContent,
    role,
  }: {
    chatId: string;
    userId: string;
    role: MessageRole;
    messageId: string;
    messageContent: string;
  }) {
    const chat = await this.chats.ofId(chatId, userId);
    chat.addMessage({ id: messageId, message: messageContent, role });
    await this.chats.save(chat);
  }
}

export const addMessage = new AddMessage(new ChatsAdapter());
