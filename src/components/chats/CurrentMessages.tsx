import { ChatMessageViewModel } from "~/shared/ChatMessageViewModel";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageListItemLayout } from "./ChatMessageListItemLayout";
import { StreamedMessage } from "./StreamedMessage";

export function CurrentMessages({
  messages,
  containerHeight,
  scrollBehavior,
  stream,
}: {
  messages: ChatMessageViewModel[];
  containerHeight: number | null;
  scrollBehavior: "smooth" | "auto";
  stream: null | { chatId: string; messageId: string };
}) {
  return (
    <div
      className="scroll-m-4 flex flex-col gap-4"
      style={{
        minHeight: containerHeight != null ? `${containerHeight}px` : undefined,
      }}
      ref={(node) => node?.scrollIntoView({ behavior: scrollBehavior })}
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
