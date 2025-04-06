import { use, useMemo } from "react";
import { ReadTransaction } from "replicache";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { DateTime } from "luxon";
import { useReplicache, useSubscribe } from "~/components/Replicache";

async function getChats(tx: ReadTransaction) {
  const chats = await tx
    .scan<ChatViewModel>({ prefix: "chats/" })
    .values()
    .toArray();

  return [...(chats as ChatViewModel[])].sort(sortByCreatedAtDesc);
}

export type FilterChatFn = (chat: ChatViewModel) => boolean;

async function getChatsWithFilter(tx: ReadTransaction, filterFn: FilterChatFn) {
  const chats = await getChats(tx);

  return [...(chats as ChatViewModel[])].filter(filterFn);
}

function sortByCreatedAtDesc(
  a: { createdAt: string },
  b: { createdAt: string },
) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function useFilteredChats(filterFn: FilterChatFn) {
  const r = useReplicache();
  const promise = useMemo(
    () => r.query((tx) => getChatsWithFilter(tx, filterFn)),
    [r, filterFn],
  );
  const defaultChats = use(promise);
  return useSubscribe(r, (tx) => getChatsWithFilter(tx, filterFn), {
    default: defaultChats,
    dependencies: [filterFn],
  });
}

async function getChat(tx: ReadTransaction, chatId: string) {
  const chat = await tx.get<ChatViewModel>(`chats/${chatId}`);
  if (chat == null) return null;
  return { ...chat } as ChatViewModel;
}

export function useChat(chatId: string) {
  const r = useReplicache();
  return useSubscribe(r, (tx) => getChat(tx, chatId), {
    default: null,
    dependencies: [chatId],
  });
}

export const isCreatedToday = (chat: ChatViewModel) => {
  const today = DateTime.now().toISODate();
  return DateTime.fromISO(chat.createdAt).toISODate() === today;
};

export const isCreatedYesterday = (chat: ChatViewModel) => {
  const yesterday = DateTime.now().minus({ day: 1 }).toISODate();
  return DateTime.fromISO(chat.createdAt).toISODate() === yesterday;
};

export const isCreatedPrevious7Days = (chat: ChatViewModel) => {
  const yesterday = DateTime.now().minus({ day: 1 }).toISODate();
  const limit = DateTime.now().minus({ day: 8 }).toISODate();
  const createdAt = DateTime.fromISO(chat.createdAt).toISODate();
  return createdAt >= limit && createdAt < yesterday;
};
