import { PatchOperation, PullResponse } from "replicache";
import { z } from "zod";
import { Cookie, cookie } from "./Cookie";
import { Transaction } from "~/server/prisma";
import { ClientGroups } from "./ClientGroups";
import {
  CVRs,
  diffCVR,
  isCVRDiffEmpty,
  ReplicacheCVR,
  ReplicacheCVREntries,
} from "./CVRs";
import { CVREntities } from "./CVREntities";
import { VersionSearchResult } from "~/server/sync/Version";
import { promiseAllObject } from "~/utils/promises";
import { Clients } from "~/server/sync/Clients";

export const pullRequestSchema = z.object({
  clientGroupID: z.string(),
  cookie: z.union([cookie, z.null()]),
});
export type PullRequest = z.infer<typeof pullRequestSchema>;

export const cvrEntriesFromSearch = (result: VersionSearchResult[]) => {
  const r: ReplicacheCVREntries = {};
  for (const row of result) {
    r[row.id] = row.version;
  }
  return r;
};

export class PullHandler {
  constructor(
    private readonly tx: Transaction,
    private readonly clientGroups: ClientGroups,
    private readonly clients: Clients,
    private readonly cvrs: CVRs,
    private readonly cvrEntities: CVREntities,
  ) {}

  async handle(userId: string, pull: PullRequest): Promise<PullResponse> {
    const prevCVR = pull.cookie
      ? await this.cvrs.get(pull.cookie.cvrID)
      : undefined;
    const baseCVR: ReplicacheCVR = prevCVR ?? {};

    const result = await this.tx.run("sync.pull", async () => {
      const clientGroup = await this.clientGroups.get(
        pull.clientGroupID,
        userId,
      );
      const cvrEntities = await this.cvrEntities.getCVREntities(userId);
      const clientsVersions = await this.clients.getVersionsInClientGroup(
        pull.clientGroupID,
      );
      const nextCVR: ReplicacheCVR = {
        ...Object.fromEntries(
          cvrEntities.map((entity) => [entity.type, entity.entities]),
        ),
        clients: cvrEntriesFromSearch(clientsVersions),
      };
      const diff = diffCVR(baseCVR, nextCVR);
      if (prevCVR && isCVRDiffEmpty(diff)) return null;

      // TODO
      const entityTypes = Object.keys(diff).filter((key) => key !== "clients");
      const entities_new = await promiseAllObject(
        Object.fromEntries(
          entityTypes.map((type) => [
            type,
            this.cvrEntities.getEntities(userId, type, diff[type].puts),
          ]),
        ),
      );

      const clients: ReplicacheCVREntries = {};
      for (const clientID of diff.clients.puts) {
        clients[clientID] = nextCVR.clients[clientID];
      }

      const baseCVRVersion = pull.cookie?.order ?? 0;
      const nextCVRVersion =
        Math.max(baseCVRVersion, clientGroup.cvrVersion) + 1;

      await this.clientGroups.save({
        ...clientGroup,
        cvrVersion: nextCVRVersion,
      });

      return {
        entities: Object.fromEntries(
          entityTypes.map((type) => [
            type,
            {
              dels: diff[type].dels ?? [],
              puts: entities_new[type] ?? [],
            },
          ]),
        ),
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
    console.log("Patch", patch);

    return {
      cookie,
      lastMutationIDChanges,
      patch,
    };
  }
}
