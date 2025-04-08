import { ChatMessageViewModel } from "~/shared/ChatMessageViewModel";
import Markdown from "react-markdown";
import { getChatMessageId } from "./ChatMessageList";
import { ChatMessageListItemLayout } from "./ChatMessageListItemLayout";

export function ChatMessageListItem({
  message,
}: {
  message: ChatMessageViewModel;
}) {
  return (
    <ChatMessageListItemLayout
      role={message.role}
      id={getChatMessageId(message.id)}
    >
      <Markdown>{message.content}</Markdown>
    </ChatMessageListItemLayout>
  );
}
