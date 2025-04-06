import { tx } from "~/server/prisma";

export type ReplicacheClientGroup = {
  id: string;
  userID: string;
  cvrVersion: number;
};

export interface ClientGroups {
  getOrNew(id: string, userId: string): Promise<ReplicacheClientGroup>;
  save(clientGroup: ReplicacheClientGroup): Promise<void>;
}

export class ClientGroupsAdapter implements ClientGroups {
  async getOrNew(id: string, userId: string): Promise<ReplicacheClientGroup> {
    const clientGroup = await tx().replicacheClientGroup.findFirst({
      where: { id },
    });

    if (clientGroup == null)
      return {
        id,
        userID: userId,
        cvrVersion: 0,
      };

    return {
      id: clientGroup.id,
      userID: clientGroup.userId,
      cvrVersion: clientGroup.cvrVersion,
    };
  }

  async save(clientGroup: ReplicacheClientGroup): Promise<void> {
    await tx().replicacheClientGroup.upsert({
      where: { id: clientGroup.id },
      create: {
        id: clientGroup.id,
        userId: clientGroup.userID,
        cvrVersion: clientGroup.cvrVersion,
        updatedAt: new Date(),
      },
      update: {
        userId: clientGroup.userID,
        cvrVersion: clientGroup.cvrVersion,
        updatedAt: new Date(),
      },
    });
  }
}
