import { ChatViewModel } from "~/shared/ChatViewModel";
import clsx from "clsx";
import Markdown from "react-markdown";

export const getChatMessageId = (messageId: string) =>
  `chat-message-${messageId}`;

export function ChatMessageList({ chat }: { chat: ChatViewModel }) {
  return (
    <ol className="flex flex-col space-y-4">
      {chat.messages.map((message) => (
        <li
          id={getChatMessageId(message.id)}
          key={message.id}
          className={clsx("px-5 py-2.5", {
            "max-w-lg self-end bg-gray-100 rounded-3xl":
              message.role === "USER",
            prose: message.role === "SYSTEM",
          })}
        >
          <Markdown>{message.content}</Markdown>
        </li>
      ))}
    </ol>
  );
}
