import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { PenSquareIcon } from "lucide-react";
import { Icon } from "~/components/Icon";
import { NavFilteredChatList } from "~/components/chats/NavFilteredChatList";
import {
  isCreatedPrevious7Days,
  isCreatedToday,
  isCreatedYesterday,
} from "~/client/chats";
import { UserButton } from "@clerk/tanstack-react-start";
import { useUser } from "~/client/users";
import { SetupApiKeyAlertDialog } from "~/components/SetupApiKeyAlertDialog";
import { ModelSelect } from "~/components/models/ModelSelect";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const user = useUser();

  // TODO: loading screen
  if (user == null) return null;

  return (
    <main className="bg-gray-50 flex items-start">
      <nav className="p-3 w-64 h-screen sticky top-0 space-y-5">
        <div className="flex justify-between items-center">
          <p className="p-2 text-sm font-semibold text-gray-600">RepliChat</p>
          <button
            title="Create chat"
            className="p-2 bg-transparent transition-colors hover:bg-gray-200 rounded"
            onClick={() => navigate({ to: "/" })}
          >
            <Icon as={PenSquareIcon} />
          </button>
        </div>

        <NavFilteredChatList title="Today" filterFn={isCreatedToday} />
        <NavFilteredChatList title="Yesterday" filterFn={isCreatedYesterday} />
        <NavFilteredChatList
          title="Previous 7 Days"
          filterFn={isCreatedPrevious7Days}
        />
      </nav>
      <div className="grow shrink-0 flex flex-col bg-white min-h-screen">
        <header className="p-3 flex items-center justify-between">
          <ModelSelect user={user} />

          <UserButton />
        </header>

        <Outlet />
      </div>

      {!user.hasOpenAiApiKey && <SetupApiKeyAlertDialog userId={user.id} />}
    </main>
  );
}
