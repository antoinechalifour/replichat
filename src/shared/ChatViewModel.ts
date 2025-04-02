import { ChatMessageViewModel } from "~/shared/ChatMessageViewModel";

export type ChatViewModel = {
  id: string;
  title: string;
  messages: Array<ChatMessageViewModel>;
  createdAt: string;
};
