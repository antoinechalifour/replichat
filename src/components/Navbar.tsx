import { useNavigate } from "@tanstack/react-router";
import { PenSquareIcon } from "lucide-react";
import { NavFilteredChatList } from "./chats/NavFilteredChatList";
import { Icon } from "./Icon";
import {
  isCreatedPrevious7Days,
  isCreatedToday,
  isCreatedYesterday,
} from "~/client/chats";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="p-3 w-64 h-screen sticky top-0 flex flex-col">
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
