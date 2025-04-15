import { ChatViewModel } from "~/shared/ChatViewModel";
import { useReplicache } from "~/components/Replicache";
import { DeleteAlertDialog } from "~/components/DeleteAlertDialog";

export function DeleteChatAlertDialog({
  chat,
  open,
  onOpenChange,
}: {
  chat: ChatViewModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const r = useReplicache();

  const onConfirm = () => r.mutate.deleteChat({ id: chat.id });

  return (
    <DeleteAlertDialog
      title="Delete chat?"
      description={
        <>
          This will delete <strong>{chat.title}</strong>.
        </>
      }
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
