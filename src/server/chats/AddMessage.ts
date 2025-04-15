import { MessageRole } from "./Chat";
import { Chats, ChatsAdapter } from "./Chats";

export class AddMessage {
  constructor(private readonly chats: Chats) {}

  async execute({
    chatId,
    messageId,
    messageContent,
    role,
  }: {
    chatId: string;
    role: MessageRole;
    messageId: string;
    messageContent: string;
  }) {
    const chat = await this.chats.ofId(chatId);
    chat.addMessage({ id: messageId, message: messageContent, role });
    await this.chats.save(chat);
  }
}

export const addMessage = new AddMessage(new ChatsAdapter());
