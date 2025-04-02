import { NavChatList } from "~/components/chats/NavChatList";
import { FilterChatFn, useFilteredChats } from "~/client/chats";

export function NavFilteredChatList({
  title,
  filterFn,
}: {
  title: string;
  filterFn: FilterChatFn;
}) {
  const chats = useFilteredChats(filterFn);
  if (chats.length === 0) return null;

  return <NavChatList title={title} chats={chats} />;
}
