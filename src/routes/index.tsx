import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    return context.user;
  },
});

function Home() {
  const data = Route.useLoaderData();
  return (
    <div className="bg-slate-50 min-h-screen flex justify-center items-center">
      <div className="p-3 bg-white rounded border border-slate-200 shadow-sm w-full max-w-screen-sm focus-within:border-slate-300 transition-all">
        <form className="flex items-stretch">
          <textarea
            className="grow resize-none focus:outline-0"
            name="test"
            rows={2}
            placeholder="Type your message here"
          />
          <button className="p-2">Envoyer</button>
        </form>
      </div>
    </div>
  );
}
