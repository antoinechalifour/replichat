import { useReplicache } from "~/components/Replicache";
import {
  PropsWithChildren,
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getChats } from "~/client/chats";
import Fuse from "fuse.js";
import { Icon } from "~/components/Icon";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog } from "radix-ui";
import { IconButton } from "~/components/IconButton";

const SearchDialogResults = ({
  search,
  onSelect,
}: {
  search: string;
  onSelect(): void;
}) => {
  const r = useReplicache();
  const promise = useMemo(() => {
    return r.query(getChats);
  }, []);
  const initialChats = use(promise);
  const [fuse] = useState(
    () =>
      new Fuse(initialChats, {
        keys: [
          {
            name: "title",
            weight: 0.7,
          },
          {
            name: "messages.content",
            weight: 0.3,
          },
        ],
        includeMatches: true,
        includeScore: true,
        threshold: 0.3,
        distance: 100,
      }),
  );

  useEffect(() => {
    return r.experimentalWatch((diffs) => {
      for (const diff of diffs) {
        console.log(diff);
        // TODO: sync fuse here
      }
    });
  }, []);

  return (
    <section className="h-72 overflow-y-auto p-2">
      <ol>
        {fuse.search(search).map((value) => {
          const [match] = value.matches ?? [];
          return (
            <li
              key={value.item.id}
              className="relative px-4 py-2 flex items-center gap-3 bg-transparent hover:bg-gray-100 rounded-md"
            >
              <Icon
                as={MessageCircleIcon}
                className="shrink-0 text-gray-400"
                size="small"
              />
              <div className="flex flex-col grow">
                <span>{value.item.title}</span>
                <span className="line-clamp-1 text-gray-500 text-xs">
                  {match?.key === "title" && value.item.title}
                  {match?.key === "messages.content" && match.value}
                </span>

                <Link
                  to="/chats/$chatId"
                  params={{ chatId: value.item.id }}
                  className="rounded-md absolute inset-0 cursor-pointer"
                  onClick={onSelect}
                >
                  <span className="sr-only">Go to chat {value.item.id}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
export const SearchDialog = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Suspense>
          <Dialog.Content className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-full max-w-xl">
              <Dialog.Title className="sr-only">Search chats</Dialog.Title>
              <header className="p-4 pr-3 gap-3 flex items-center border-b border-gray-200">
                <input
                  type="text"
                  className="grow p-2 outline-0"
                  placeholder="Search chats..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Dialog.Close asChild>
                  <IconButton title="Close" variant="rounded" icon={XIcon} />
                </Dialog.Close>
              </header>

              <SearchDialogResults
                search={search}
                onSelect={() => setOpen(false)}
              />
            </div>
          </Dialog.Content>
        </Suspense>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
