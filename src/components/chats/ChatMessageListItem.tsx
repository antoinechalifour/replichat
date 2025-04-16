import { ChatMessageViewModel } from "~/shared/ChatMessageViewModel";
import Markdown from "react-markdown";
import { getChatMessageId } from "./ChatMessageList";
import { ChatMessageListItemLayout } from "./ChatMessageListItemLayout";
import { CopyIcon } from "lucide-react";
import { IconButton } from "~/components/IconButton";
import { Hint } from "~/components/Hint";
import { toast } from "sonner";

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
      {message.role === "SYSTEM" && (
        <div className="absolute -bottom-2 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Hint text="Copy to clipboard">
            <IconButton
              title="Copy to clipboard"
              size="small"
              onClick={async () => {
                await navigator.clipboard.writeText(message.content);
                toast.success("Copied to clipboard");
              }}
              icon={CopyIcon}
              className="text-gray-500"
            />
          </Hint>
        </div>
      )}
    </ChatMessageListItemLayout>
  );
}
