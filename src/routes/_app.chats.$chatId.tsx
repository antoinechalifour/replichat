import { createFileRoute } from "@tanstack/react-router";
import { StreamedMessage } from "~/components/chats/StreamedMessage";
import { ChatPromptComposer } from "~/components/chats/ChatPromptComposer";
import { useChat } from "~/client/chats";
import { ChatMessageList } from "~/components/chats/ChatMessageList";
import { useRedirectOnNotFound } from "~/client/hooks/useRedirectOnNotFound";

export const Route = createFileRoute("/_app/chats/$chatId")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const chat = useChat(params.chatId);
  useRedirectOnNotFound(chat);

  if (chat == null) return null;

  const lastMessage = chat.messages[chat.messages.length - 1];
  const shouldStream = lastMessage.role === "USER" && lastMessage.synced;

  return (
    <>
      <div className="grow flex flex-col overflow-hidden relative">
        <div className="absolute p-3 pb-10 inset-0 overflow-y-auto">
          <div className="mx-auto max-w-2xl grow flex flex-col overflow-hidden space-y-4">
            <ChatMessageList chat={chat} />

            {shouldStream && (
              <div className="px-5 py-2.5 prose">
                <StreamedMessage
                  chatId={params.chatId}
                  messageId={lastMessage.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatPromptComposer chatId={params.chatId} />
    </>
  );
}
