import { PromptComposer } from "~/components/chats/PromptComposer";
import { useReplicache } from "~/components/Replicache";

export function ChatPromptComposer({
  chatId,
  disabled,
}: {
  chatId: string;
  disabled: boolean;
}) {
  const r = useReplicache();
  const onSubmit = async (message: string) => {
    const messageId = crypto.randomUUID();
    await r.mutate.sendMessage({
      chatId,
      messageId,
      message,
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-3">
      <PromptComposer onSubmit={onSubmit} disabled={disabled} />
    </div>
  );
}
