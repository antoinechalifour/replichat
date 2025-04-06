import * as React from "react";
import {
  createContext,
  DependencyList,
  PropsWithChildren,
  use,
  useEffect,
  useState,
} from "react";
import { unstable_batchedUpdates } from "react-dom";
import { Replicache, WriteTransaction } from "replicache";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { pusher } from "~/client/pusher";
import { channelForUser } from "~/shared/Pusher";
import { chatKey } from "~/client/chats";

const mutators = {
  createChat: async (
    tx: WriteTransaction,
    args: { id: string; message: string },
  ) => {
    await tx.set(chatKey(args.id), {
      id: args.id,
      title: "Untitled",
      messages: [
        {
          id: crypto.randomUUID(),
          content: args.message,
          role: "USER",
          createdAt: new Date().toISOString(),
          synced: false,
        },
      ],
      createdAt: new Date().toISOString(),
    } satisfies ChatViewModel);
    return args.id;
  },
  updateChat: async (
    tx: WriteTransaction,
    args: { chatId: string; title: string },
  ) => {
    const chat = await tx.get<ChatViewModel>(chatKey(args.chatId));
    if (chat == null) return;
    await tx.set(chatKey(args.chatId), {
      ...chat,
      title: args.title,
    });
  },
  deleteChat: async (tx: WriteTransaction, args: { chatId: string }) => {
    await tx.del(chatKey(args.chatId));
  },
  sendMessage: async (
    tx: WriteTransaction,
    args: { chatId: string; message: string },
  ) => {
    const chat = await tx.get<ChatViewModel>(chatKey(args.chatId));
    if (chat == null) return;
    await tx.set(`chats/${args.chatId}`, {
      ...chat,
      messages: [
        ...chat.messages,
        { id: crypto.randomUUID(), content: args.message, role: "USER" },
      ],
    });
  },
} as const;

const context = createContext<null | Replicache<typeof mutators>>(null);

export function ReplicacheProvider({
  userId,
  children,
}: PropsWithChildren<{ userId: string }>) {
  const replicache = React.useMemo(() => {
    return new Replicache({
      name: userId,
      licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
      pushURL: "/api/replicache/push",
      pullURL: "/api/replicache/pull",
      pushDelay: 0,
      schemaVersion: "1.2",
      mutators,
    });
  }, [userId]);

  useEffect(() => {
    const handler = () => replicache.pull();
    const channel = pusher.subscribe(channelForUser(userId));
    channel.bind("poke", handler);
    return () => {
      channel.unbind("poke", handler);
      channel.unsubscribe();
    };
  }, [replicache, userId]);

  return <context.Provider value={replicache}>{children}</context.Provider>;
}

export function useReplicache() {
  const replicache = use(context);
  if (replicache == null) throw new Error("Replicache not found");
  return replicache;
}

export type Subscribable<Tx> = {
  subscribe<Data>(
    query: (tx: Tx) => Promise<Data>,
    options: {
      onData: (data: Data) => void;
      isEqual?: ((a: Data, b: Data) => boolean) | undefined;
    },
  ): () => void;
};

// We wrap all the callbacks in a `unstable_batchedUpdates` call to ensure that
// we do not render things more than once over all of the changed subscriptions.

let hasPendingCallback = false;
let callbacks: (() => void)[] = [];

function doCallback() {
  const cbs = callbacks;
  callbacks = [];
  hasPendingCallback = false;
  unstable_batchedUpdates(() => {
    for (const callback of cbs) {
      callback();
    }
  });
}

export type RemoveUndefined<T> = T extends undefined ? never : T;

export type UseSubscribeOptions<QueryRet, Default> = {
  /** Default can already be undefined since it is an unbounded type parameter. */
  default?: Default;
  dependencies?: DependencyList | undefined;
  isEqual?: ((a: QueryRet, b: QueryRet) => boolean) | undefined;
};

/**
 * Runs a query and returns the result. Re-runs automatically whenever the
 * query changes.
 *
 * NOTE: Changing `r` will cause the query to be re-run, but changing `query`
 * or `options` will not (by default). This is by design because these two
 * values are often object/array/function literals which change on every
 * render. If you want to re-run the query when these change, you can pass
 * them as dependencies.
 */
export function useSubscribe<Tx, QueryRet, Default = undefined>(
  r: Subscribable<Tx> | null | undefined,
  query: (tx: Tx) => Promise<QueryRet>,
  options: UseSubscribeOptions<QueryRet, Default> = {},
): RemoveUndefined<QueryRet> | Default {
  const { default: def, dependencies = [], isEqual } = options;
  const [snapshot, setSnapshot] = useState<QueryRet | undefined>(undefined);
  useEffect(() => {
    if (!r) {
      return;
    }

    const unsubscribe = r.subscribe(query, {
      onData: (data) => {
        // This is safe because we know that subscribe in fact can only return
        // `R` (the return type of query or def).
        callbacks.push(() => setSnapshot(data));
        if (!hasPendingCallback) {
          void Promise.resolve().then(doCallback);
          hasPendingCallback = true;
        }
      },
      isEqual,
    });

    return () => {
      unsubscribe();
      setSnapshot(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r, ...dependencies]);
  if (snapshot === undefined) {
    return def as Default;
  }
  return snapshot as RemoveUndefined<QueryRet>;
}
