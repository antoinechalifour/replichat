import { ChatMessageViewModel } from "~/shared/ChatMessageViewModel";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageListItemLayout } from "./ChatMessageListItemLayout";
import { StreamedMessage } from "./StreamedMessage";

export function CurrentMessages({
  messages,
  containerHeight,
  stream,
}: {
  messages: ChatMessageViewModel[];
  containerHeight: number;
  stream: null | { chatId: string; messageId: string };
}) {
  return (
    <div
      className="scroll-m-10 flex flex-col gap-4"
      style={{ minHeight: `${containerHeight}px` }}
      ref={(node) => node?.scrollIntoView({ behavior: "smooth" })}
    >
      <ChatMessageList messages={messages} />

      {stream != null && (
        <ChatMessageListItemLayout role="SYSTEM">
          <StreamedMessage
            chatId={stream.chatId}
            messageId={stream.messageId}
          />
        </ChatMessageListItemLayout>
      )}
    </div>
  );
}
