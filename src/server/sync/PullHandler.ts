import { PatchOperation, PullResponse } from "replicache";
import { z } from "zod";
import { Cookie, cookie } from "./Cookie";
import { Transaction, tx } from "~/server/prisma";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { ClientGroups } from "~/server/sync/ClientGroups";
import { getClientVersionOfClientGroup } from "~/server/sync/Clients";
import {
  CVRs,
  diffCVR,
  isCVRDiffEmpty,
  ReplicacheCVR,
  ReplicacheCVREntries,
} from "~/server/sync/CVRs";

export const pullRequestSchema = z.object({
  clientGroupID: z.string(),
  cookie: z.union([cookie, z.null()]),
});
export type PullRequest = z.infer<typeof pullRequestSchema>;

export type VersionSearchResult = {
  id: string;
  version: number;
};
export const cvrEntriesFromSearch = (result: VersionSearchResult[]) => {
  const r: ReplicacheCVREntries = {};
  for (const row of result) {
    r[row.id] = row.version;
  }
  return r;
};

async function getChatsVersion(userID: string) {
  const results = await tx().chat.findMany({ where: { userId: userID } });
  return results.map((result) => ({
    id: result.id,
    version: result.updatedAt.getTime(),
  }));
}

async function getChats(ids: string[]) {
  const results = await tx().chat.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return results.map(
    (result): ChatViewModel => ({
      id: result.id,
      title: result.title,
      messages: result.messages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role,
        createdAt: message.createdAt.toISOString(),
        synced: true,
      })),
      createdAt: result.createdAt.toISOString(),
    }),
  );
}

export class PullHandler {
  constructor(
    private readonly tx: Transaction,
    private readonly clientGroups: ClientGroups,
    private readonly cvrs: CVRs,
  ) {}

  async handle(userId: string, pull: PullRequest): Promise<PullResponse> {
    // console.log("------------------------------------------------------");
    // console.log("PULL");
    // 1. let prevCVR = getCVR(body.cookie.cvrID)
    const prevCVR = pull.cookie
      ? await this.cvrs.get(pull.cookie.cvrID)
      : undefined;
    // console.log("1 > prevCVR", prevCVR);
    // 2. let baseCVR = prevCVR or default
    const baseCVR: ReplicacheCVR = prevCVR ?? {};
    // console.log("2 > baseCVR", baseCVR);

    // console.log("3 > Begin transaction");
    // 3. Begin transaction
    const result = await this.tx.run("sync.pull", async () => {
      // 4. getClientGroup(body.clientGroupID), or default
      const clientGroup = await this.clientGroups.get(
        pull.clientGroupID,
        userId,
      );
      // console.log("4 > clientGroup", clientGroup);

      // 6. Read all id/version pairs from the database that should be in the client view. This query can be any arbitrary function of the DB, including read authorization, paging, etc.
      const [chatsVersion] = await Promise.all([getChatsVersion(userId)]);
      // console.log("6 > chatsVersion", chatsVersion);

      // 7: Read all clients in the client group.
      const clientsVersions = await getClientVersionOfClientGroup(
        pull.clientGroupID,
      );
      // console.log("7 > clientsVersions", clientsVersions);

      // 8. Build nextCVR from entities and clients.
      const nextCVR: ReplicacheCVR = {
        chats: cvrEntriesFromSearch(chatsVersion),
        clients: cvrEntriesFromSearch(clientsVersions),
      };
      // console.log("8 > nextCVR", nextCVR);

      // 9. Calculate the difference between baseCVR and nextCVR
      const diff = diffCVR(baseCVR, nextCVR);
      // console.log("9 > Diff", diff);

      // 10. If prevCVR was found and two CVRs are identical then exit this transaction and return a no-op PullResopnse to client:
      if (prevCVR && isCVRDiffEmpty(diff)) {
        // console.log("10 > Empty diff", diff);
        return null;
      }

      // 11. Fetch all entities from database that are new or changed between baseCVR and nextCVR
      const [chats] = await Promise.all([getChats(diff.chats.puts)]);
      // console.log("11 > chats", chats);

      // 12. let clientChanges = clients that are new or changed since baseCVR
      const clients: ReplicacheCVREntries = {};
      for (const clientID of diff.clients.puts) {
        clients[clientID] = nextCVR.clients[clientID];
      }
      // console.log("12 > clients", clients);

      // 13. let nextCVRVersion = Math.max(pull.cookie?.order ?? 0, clientGroup.cvrVersion) + 1
      const baseCVRVersion = pull.cookie?.order ?? 0;
      const nextCVRVersion =
        Math.max(baseCVRVersion, clientGroup.cvrVersion) + 1;
      // console.log(
      //   "13 > base / next cvr version",
      //   baseCVRVersion,
      //   nextCVRVersion,
      // );

      // 14. putClientGroup():
      await this.clientGroups.save({
        ...clientGroup,
        cvrVersion: nextCVRVersion,
      });
      // console.log("14 > Saved client group");

      return {
        entities: {
          chats: { dels: diff.chats.dels, puts: chats },
        },
        clients,
        nextCVR,
        nextCVRVersion,
      };
    }); // 15. Commit
    // console.log("15 > Transaction commited");

    if (result === null) {
      return {
        cookie: pull.cookie,
        lastMutationIDChanges: {},
        patch: [],
      };
    }

    const { entities, clients, nextCVR, nextCVRVersion } = result;

    // 16. let nextCVRID = randomID()
    const cvrID = crypto.randomUUID();

    // 17. putCVR(nextCVR)
    await this.cvrs.save(cvrID, nextCVR);
    // console.log("17 > Updated cvr", nextCVR);

    /* 18.
      Create a PullResponse with:
        A patch with:
          op:clear if prevCVR === undefined
          op:put for every created or changed entity
          op:del for every deleted entity
        {order: nextCVRVersion, cvrID} as the cookie.
        lastMutationIDChanges with entries for every client that has changed.
       */
    const patch: PatchOperation[] = [];
    if (prevCVR === undefined) patch.push({ op: "clear" });

    for (const [name, { puts, dels }] of Object.entries(entities)) {
      for (const id of dels) {
        patch.push({ op: "del", key: `${name}/${id}` });
      }
      for (const entity of puts) {
        patch.push({
          op: "put",
          key: `${name}/${entity.id}`,
          value: entity,
        });
      }
    }

    const cookie: Cookie = {
      order: nextCVRVersion,
      cvrID,
    };

    const lastMutationIDChanges = clients;

    // console.log("------------------------------------------------------");

    return {
      cookie,
      lastMutationIDChanges,
      patch,
    };
  }
}
