import { ChatViewModel } from "~/shared/ChatViewModel";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NavChatListMenu } from "./NavChatListMenu";
import { EditChatForm } from "./EditChatForm";
import clsx from "clsx";

function NavChatListItem({ chat }: { chat: ChatViewModel }) {
  const [mode, setMode] = useState<"link" | "edit">("link");
  const matchRoute = useMatchRoute();
  const params = matchRoute({
    to: "/chats/$chatId",
    params: { chatId: chat.id },
  });

  return (
    <li
      className={clsx(
        "relative group",
        "flex items-center gap-1",
        "text-sm p-2 hover:bg-gray-200 bg-transparent transition-colors rounded-lg ",
        { "!bg-gray-300/70": params !== false },
      )}
    >
      {mode === "edit" && (
        <EditChatForm chat={chat} onDone={() => setMode("link")} />
      )}
      {mode === "link" && (
        <>
          <span className="line-clamp-1 grow">{chat.title}</span>

          <Link
            to="/chats/$chatId"
            params={{ chatId: chat.id }}
            className="absolute block inset-0.5 rounded-lg"
          >
            <span className="sr-only">{chat.title}</span>
          </Link>

          <NavChatListMenu chat={chat} onEditMode={() => setMode("edit")} />
        </>
      )}
    </li>
  );
}

export const NavChatList = ({
  title,
  chats,
}: {
  title: string;
  chats: ChatViewModel[];
}) => {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-700 p-2">{title}</h3>
      <ol className="flex flex-col">
        {chats.map((chat) => (
          <NavChatListItem key={chat.id} chat={chat} />
        ))}
      </ol>
    </div>
  );
};
