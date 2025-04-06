import { tx } from "~/server/prisma";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { promiseAllObject } from "~/utils/promises";

export type CVREntitiesVersions = {
  chats: Record<string, number>;
};

type FetchPatchedEntitiesParams = {
  chats: string[];
};

type CVREntitiesDetails = {
  chats: ChatViewModel[];
};

export interface CVREntities {
  getEntitiesVersion(userId: string): Promise<CVREntitiesVersions>;
  getEntitiesDetails(
    userId: string,
    params: FetchPatchedEntitiesParams,
  ): Promise<CVREntitiesDetails>;
}

export class CVREntitiesAdapter implements CVREntities {
  async getEntitiesVersion(userId: string): Promise<CVREntitiesVersions> {
    const [chats] = await Promise.all([
      tx().chat.findMany({
        where: { userId },
        select: { id: true, updatedAt: true },
      }),
    ]);

    return {
      chats: this.cvrEntities(chats),
    };
  }

  getEntitiesDetails(
    userId: string,
    { chats }: FetchPatchedEntitiesParams,
  ): Promise<CVREntitiesDetails> {
    return promiseAllObject({
      chats: this.fetchChats(userId, chats),
    });
  }

  private async fetchChats(userId: string, ids: string[]) {
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

  private cvrEntities(entities: Array<{ id: string; updatedAt: Date }>) {
    return Object.fromEntries(
      entities.map((entity) => [entity.id, entity.updatedAt.getTime()]),
    );
  }
}
