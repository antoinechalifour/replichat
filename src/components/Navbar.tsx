import { useNavigate } from "@tanstack/react-router";
import { PenSquareIcon, SearchIcon } from "lucide-react";
import { NavFilteredChatList } from "./chats/NavFilteredChatList";
import {
  isCreatedPrevious7Days,
  isCreatedToday,
  isCreatedYesterday,
} from "~/client/chats";
import { IconButton } from "./IconButton";
import { SearchDialogButton } from "./SearchDialogButton";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="p-3 w-64 h-screen sticky top-0 flex flex-col">
      <div className="flex items-center">
        <p className="p-2 text-sm font-semibold text-gray-600 mr-auto">
          RepliChat
        </p>
        <SearchDialogButton />
        <IconButton
          title="Create chat"
          onClick={() => navigate({ to: "/" })}
          icon={PenSquareIcon}
        />
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
