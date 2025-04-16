import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserButton } from "@clerk/tanstack-react-start";
import { useUser } from "~/client/users";
import { SetupApiKeyAlertDialog } from "~/components/SetupApiKeyAlertDialog";
import { ModelSelect } from "~/components/models/ModelSelect";
import { Navbar } from "~/components/Navbar";
import { DrawerMenu } from "~/components/DrawerMenu";
import { useIsWide } from "~/client/hooks/useIsWide";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  const isWide = useIsWide();

  if (user == null) return null;

  return (
    <main className="bg-gray-50 flex items-start">
      {isWide && <Navbar />}
      <div className="grow shrink-0 flex flex-col bg-white min-h-screen">
        <header className="p-3 flex items-center justify-between border-b border-gray-100">
          {!isWide && <DrawerMenu />}
          <ModelSelect user={user} />

          <UserButton />
        </header>

        <Outlet />
      </div>

      {!user.hasOpenAiApiKey && <SetupApiKeyAlertDialog userId={user.id} />}
    </main>
  );
}
