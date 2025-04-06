import { tx } from "~/server/prisma";
import { ChatViewModel } from "~/shared/ChatViewModel";

export type CVREntity = {
  type: string;
  entities: Record<string, number>;
};

export interface CVREntities {
  getCVREntities(userId: string): Promise<CVREntity[]>;
  getEntities(
    userId: string,
    type: string,
    ids: string[],
  ): Promise<{ id: string }[]>;
}

/*
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

 */

export class CVREntitiesAdapter implements CVREntities {
  async getCVREntities(userId: string): Promise<CVREntity[]> {
    const [chats] = await Promise.all([
      tx().chat.findMany({
        where: { userId },
        select: { id: true, updatedAt: true },
      }),
    ]);

    return [
      {
        type: "chats",
        entities: this.cvrEntities(chats),
      },
    ];
  }

  async getEntities(
    userId: string,
    type: string,
    ids: string[],
  ): Promise<{ id: string }[]> {
    if (type === "chats") {
      const results = await tx().chat.findMany({
        where: { id: { in: ids }, userId },
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

    throw new Error(`Unknown CVR entity type: ${type}`);
  }

  private cvrEntities(entities: Array<{ id: string; updatedAt: Date }>) {
    return Object.fromEntries(
      entities.map((entity) => [entity.id, entity.updatedAt.getTime()]),
    );
  }
}
