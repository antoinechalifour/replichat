import { PromptComposer } from "~/components/chats/PromptComposer";
import { useReplicache } from "~/components/Replicache";

export function ChatPromptComposer({ chatId }: { chatId: string }) {
  const r = useReplicache();
  const onSubmit = async (message: string) => {
    await r.mutate.sendMessage({
      chatId,
      message,
    });
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-3">
      <PromptComposer onSubmit={onSubmit} />
    </div>
  );
}
