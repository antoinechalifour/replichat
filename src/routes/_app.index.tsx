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
      message,
    });
    await navigate({
      to: "/chats/$chatId",
      params: { chatId: id },
    });
  };

  return (
    <div className="flex flex-col grow items-center justify-center">
      <h1 className="text-balance font-semibold text-3xl mb-4">
        What can I help with?
      </h1>
      <div className="max-w-2xl w-full">
        <PromptComposer onSubmit={onSubmit} autofocus />
      </div>
    </div>
  );
}
