import { useMeasure } from "react-use";
import { createFileRoute } from "@tanstack/react-router";
import { ChatPromptComposer } from "~/components/chats/ChatPromptComposer";
import { useChat } from "~/client/chats";
import { ChatMessageList } from "~/components/chats/ChatMessageList";
import { useRedirectOnNotFound } from "~/client/hooks/useRedirectOnNotFound";
import { ChatMessageViewModel } from "~/shared/ChatMessageViewModel";
import { CurrentMessages } from "~/components/chats/CurrentMessages";
import { useState } from "react";

export const Route = createFileRoute("/_app/chats/$chatId")({
  ssr: false,
  component: RouteComponent,
  remountDeps: ({ params }) => params,
  wrapInSuspense: true,
});

function splitMessages(
  messages: ChatMessageViewModel[],
): [ChatMessageViewModel[], ChatMessageViewModel[]] {
  // Find the index of the last message with role 'USER'
  let lastUserIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "USER") {
      lastUserIndex = i;
      break;
    }
  }

  // If no USER message is found, return an empty first part and the whole array as the second part
  if (lastUserIndex === -1) {
    return [[], messages];
  }

  // Split the messages:
  // First part: all messages before the last USER message
  // Second part: last USER message and everything after
  const firstPart = messages.slice(0, lastUserIndex);
  const secondPart = messages.slice(lastUserIndex);
  return [firstPart, secondPart];
}

function RouteComponent() {
  const params = Route.useParams();
  const chat = useChat(params.chatId);
  useRedirectOnNotFound(chat);
  const [ref, size] = useMeasure<HTMLDivElement>();
  const [dirty, setDirty] = useState(false);

  if (chat == null) return null;

  // Split the messages : 1st:the old messages, 2nd: the last user message and maybe the system response
  const [oldMessages, currentMessages] = splitMessages(chat.messages);
  const lastMessage = chat.messages[chat.messages.length - 1];
  const stream =
    lastMessage.role === "USER" && lastMessage.synced
      ? {
          chatId: params.chatId,
          messageId: lastMessage.id,
        }
      : null;

  return (
    <>
      <div className="grow flex flex-col overflow-hidden relative" ref={ref}>
        <div className="absolute p-3 pb-10 inset-0 overflow-y-auto">
          <div className="mx-auto max-w-2xl grow flex flex-col gap-4">
            <ChatMessageList messages={oldMessages} />
            <CurrentMessages
              messages={currentMessages}
              containerHeight={dirty ? size.height : null}
              scrollBehavior={dirty ? "smooth" : "auto"}
              stream={stream}
            />
          </div>
        </div>
      </div>
      <ChatPromptComposer
        onSubmitted={() => setDirty(true)}
        chatId={params.chatId}
        disabled={stream != null}
      />
    </>
  );
}
