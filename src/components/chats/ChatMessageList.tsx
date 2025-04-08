import { ChatViewModel } from "~/shared/ChatViewModel";
import { ChatMessageListItem } from "./ChatMessageListItem";

export const getChatMessageId = (messageId: string) =>
  `chat-message-${messageId}`;

export function ChatMessageList({
  messages,
}: {
  messages: ChatViewModel["messages"];
}) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <ChatMessageListItem key={message.id} message={message} />
      ))}
    </div>
  );
}
