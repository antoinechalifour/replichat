import {
  ComponentProps,
  ComponentType,
  startTransition,
  useEffect,
  useState,
} from "react";
import clsx from "clsx";
import {
  FilterChatFn,
  getChats,
  isCreatedToday,
  isCreatedYesterday,
  useFilteredChats,
} from "~/client/chats";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Command } from "cmdk";
import { IconButton } from "~/components/IconButton";
import { Icon } from "~/components/Icon";
import Fuse from "fuse.js";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { useReplicache } from "~/components/Replicache";
import { useToggle } from "~/components/useToggleProvider";

function withClassnames<T extends { className?: string }>(
  Component: ComponentType<T>,
  classNames: string,
) {
  return (props: T) => (
    <Component {...props} className={clsx(classNames, props.className)} />
  );
}

const CommandItem = withClassnames(
  Command.Item,
  "relative px-4 py-3 text-sm flex items-center gap-4 bg-transparent data-[selected=true]:bg-gray-100 hover:bg-gray-100 rounded-md cursor-pointer text-gray-700",
);
const CommandGroup = withClassnames(
  Command.Group,
  "overflow-hidden [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:my-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-gray-500",
);

function CustomCommandItem({
  icon: IconComponent,
  children,
  className,
  ...props
}: ComponentProps<typeof CommandItem> & {
  icon: ComponentProps<typeof Icon>["as"];
  onSelect?: () => Promise<void>;
}) {
  return (
    <CommandItem className={clsx("flex items-center", className)} {...props}>
      <Icon
        as={IconComponent}
        className="shrink-0 text-gray-400"
        size="small"
      />
      <div className="grow">{children}</div>
    </CommandItem>
  );
}

function ChatsCommandGroup({
  title,
  filterFn,
}: {
  title: string;
  filterFn: FilterChatFn;
}) {
  const chats = useFilteredChats(filterFn);
  const navigate = useNavigate();
  const { setOpen } = useToggle();

  if (chats.length === 0) return null;

  return (
    <CommandGroup heading={title}>
      {chats.map((chat) => (
        <CustomCommandItem
          key={chat.id}
          id={chat.id}
          value={`${chat.title} ${chat.id}`}
          icon={MessageCircleIcon}
          onSelect={async () => {
            await navigate({
              to: "/chats/$chatId",
              params: { chatId: chat.id },
            });
            setOpen(false);
          }}
        >
          {chat.title}
        </CustomCommandItem>
      ))}
    </CommandGroup>
  );
}

function DefaultCommandPaletteOptions() {
  const navigate = useNavigate();
  const { setOpen } = useToggle();

  return (
    <>
      <CustomCommandItem
        icon={MessageCircleIcon}
        onSelect={async () => {
          await navigate({ to: "/" });
          setOpen(false);
        }}
      >
        New Chat
      </CustomCommandItem>

      <ChatsCommandGroup title="Today" filterFn={isCreatedToday} />
      <ChatsCommandGroup title="Yesterday" filterFn={isCreatedYesterday} />
    </>
  );
}

function SearchCommandPaletteOptions({
  fuse,
  search,
}: {
  fuse: Fuse<ChatViewModel>;
  search: string;
}) {
  const navigate = useNavigate();
  const { setOpen } = useToggle();

  return (
    <>
      {fuse.search(search).map((value) => {
        const [match] = value.matches ?? [];

        return (
          <CustomCommandItem
            key={value.item.id}
            icon={MessageCircleIcon}
            onSelect={async () => {
              await navigate({
                to: "/chats/$chatId",
                params: { chatId: value.item.id },
              });
              setOpen(false);
            }}
          >
            <div className="flex flex-col grow">
              <span>{value.item.title}</span>
              <span className="line-clamp-1 text-gray-500 text-xs">
                {match?.key === "title" && value.item.title}
                {match?.key === "messages.content" && match.value}
              </span>
            </div>
          </CustomCommandItem>
        );
      })}
    </>
  );
}

export const CommandPalette = () => {
  const { open, setOpen } = useToggle();
  const [search, setSearch] = useState("");
  const r = useReplicache();
  const [fuse] = useState(
    () =>
      new Fuse<ChatViewModel>([], {
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
    return r.subscribe(getChats, {
      onData: (chats) => fuse.setCollection(chats),
    });
  }, [fuse, r]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        startTransition(() => {
          setOpen((open) => !open);
        });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={false}
      label="Command palette"
      className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-2xl"
    >
      <header className="p-4 pr-3 gap-3 flex items-center border-b border-gray-200">
        <Command.Input
          className="grow p-2 outline-0"
          placeholder="Search chats..."
          value={search}
          onValueChange={setSearch}
        />

        <IconButton
          title="Close"
          variant="rounded"
          icon={XIcon}
          onClick={() => setOpen(false)}
        />
      </header>
      <Command.List className={clsx("h-72 overflow-y-auto p-2")}>
        <Command.Empty className="py-6 text-center text-sm">
          No results found.
        </Command.Empty>

        {search === "" && <DefaultCommandPaletteOptions />}
        {search !== "" && (
          <SearchCommandPaletteOptions fuse={fuse} search={search} />
        )}
      </Command.List>
    </Command.Dialog>
  );
};
