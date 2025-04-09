import { NavFilteredChatList } from "./chats/NavFilteredChatList";
import {
  isCreatedPrevious7Days,
  isCreatedToday,
  isCreatedYesterday,
} from "~/client/chats";
import { SearchDialogButton } from "./SearchDialogButton";
import { CreateChatButton } from "~/components/CreateChatButton";

export function Navbar() {
  return (
    <nav className="p-3 w-64 h-screen sticky top-0 flex flex-col">
      <div className="flex items-center">
        <p className="p-2 text-sm font-semibold text-gray-600 mr-auto">
          RepliChat
        </p>
        <SearchDialogButton />
        <CreateChatButton />
      </div>

      <div className="grow overflow-y-auto space-y-5 pt-5">
        <NavFilteredChatList title="Today" filterFn={isCreatedToday} />
        <NavFilteredChatList title="Yesterday" filterFn={isCreatedYesterday} />
        <NavFilteredChatList
          title="Previous 7 Days"
          filterFn={isCreatedPrevious7Days}
        />
      </div>
    </nav>
  );
}
