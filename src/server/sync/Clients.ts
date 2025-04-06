import { tx } from "~/server/prisma";
import { VersionSearchResult } from "~/server/sync/Version";

export type ReplicacheClient = {
  id: string;
  clientGroupID: string;
  lastMutationID: number;
};

export interface Clients {
  get(id: string, clientGroupId: string): Promise<ReplicacheClient>;
  save(client: ReplicacheClient): Promise<void>;
  getVersionsInClientGroup(
    clientGroupID: string,
  ): Promise<VersionSearchResult[]>;
}

export class ClientsAdapter implements Clients {
  async get(id: string, clientGroupId: string): Promise<ReplicacheClient> {
    const client = await tx().replicacheClient.findFirst({
      where: { id },
    });

    if (client == null)
      return {
        id,
        clientGroupID: clientGroupId,
        lastMutationID: 0,
      };

    return {
      id: client.id,
      clientGroupID: client.clientGroupId,
      lastMutationID: client.lastMutationId,
    };
  }

  async save(client: ReplicacheClient): Promise<void> {
    await tx().replicacheClient.upsert({
      where: { id: client.id },
      create: {
        id: client.id,
        clientGroupId: client.clientGroupID,
        lastMutationId: client.lastMutationID,
        updatedAt: new Date(),
      },
      update: {
        lastMutationId: client.lastMutationID,
        updatedAt: new Date(),
      },
    });
  }

  async getVersionsInClientGroup(
    clientGroupID: string,
  ): Promise<VersionSearchResult[]> {
    const results = await tx().replicacheClient.findMany({
      where: { clientGroupId: clientGroupID },
    });

    return results.map((result) => ({
      id: result.id,
      version: result.lastMutationId,
    }));
  }
}
