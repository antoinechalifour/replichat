import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PromptComposer } from "~/components/chats/PromptComposer";
import { useReplicache } from "~/components/Replicache";

export const Route = createFileRoute("/_app/")({
  component: Home,
  ssr: false,
});

function Home() {
  const r = useReplicache();
  const navigate = useNavigate();
  const onSubmit = async (message: string) => {
    const id = await r.mutate.createChat({
      id: crypto.randomUUID(),
      message: {
        id: crypto.randomUUID(),
        content: message,
      },
    });
    await navigate({
      to: "/chats/$chatId",
      params: { chatId: id },
    });
  };

  return (
    <div className="flex flex-col grow items-center justify-center">
      <h1 className="text-balance font-medium text-3xl mb-6">
        What can I help with?
      </h1>
      <div className="max-w-2xl w-full max-sm:px-3">
        <PromptComposer onSubmit={onSubmit} autofocus />
      </div>
    </div>
  );
}
