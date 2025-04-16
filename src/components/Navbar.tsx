import { NavFilteredChatList } from "./chats/NavFilteredChatList";
import {
  isCreatedPrevious7Days,
  isCreatedToday,
  isCreatedYesterday,
} from "~/client/chats";
import { SearchDialogButton } from "./SearchDialogButton";
import { CreateChatButton } from "~/components/CreateChatButton";
import { useIsWide } from "~/client/hooks/useIsWide";
import { Drawer } from "vaul";
import { Icon } from "~/components/Icon";
import { EqualIcon } from "lucide-react";

export function NavbarContent() {
  const isWide = useIsWide();
  return (
    <>
      <div className="flex items-center p-3 pb-0">
        {isWide ? (
          <p className="p-2 text-sm font-semibold text-gray-600 mr-auto">
            RepliChat
          </p>
        ) : (
          <Drawer.Close className="-m-3 p-3 mr-auto">
            <Icon as={EqualIcon} />
          </Drawer.Close>
        )}
        <SearchDialogButton />
        <CreateChatButton />
      </div>

      <div className="grow overflow-y-auto space-y-5 pt-5 p-3">
        <NavFilteredChatList title="Today" filterFn={isCreatedToday} />
        <NavFilteredChatList title="Yesterday" filterFn={isCreatedYesterday} />
        <NavFilteredChatList
          title="Previous 7 Days"
          filterFn={isCreatedPrevious7Days}
        />
      </div>
    </>
  );
}

export function Navbar() {
  return (
    <nav className="w-64 h-screen sticky top-0 flex flex-col">
      <NavbarContent />
    </nav>
  );
}
