import { tx } from "~/server/prisma";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { promiseAllObject } from "~/utils/promises";
import { UserViewModel } from "~/shared/UserViewModel";
import { ModelViewModel } from "~/shared/ModelViewModel";

export type CVREntitiesVersions = {
  chats: Record<string, number>;
  users: Record<string, number>;
  models: Record<string, number>;
};

type FetchPatchedEntitiesParams = {
  chats: string[];
  users: string[];
  models: string[];
};

type CVREntitiesDetails = {
  chats: ChatViewModel[];
  users: UserViewModel[];
  models: ModelViewModel[];
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
    const [chats, users, models] = await Promise.all([
      tx().chat.findMany({
        where: { userId },
        select: { id: true, updatedAt: true },
      }),
      tx().user.findMany({
        where: { id: userId },
      }),
      tx().model.findMany(),
    ]);

    return {
      chats: this.cvrEntities(chats),
      users: this.cvrEntities(users),
      models: this.cvrEntities(models),
    };
  }

  getEntitiesDetails(
    userId: string,
    { chats, users, models }: FetchPatchedEntitiesParams,
  ): Promise<CVREntitiesDetails> {
    return promiseAllObject({
      chats: this.fetchChats(userId, chats),
      users: this.fetchUsers(userId, users),
      models: this.fetchModels(models),
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

  private async fetchUsers(
    userId: string,
    ids: string[],
  ): Promise<UserViewModel[]> {
    if (ids.length === 0) return [];
    const [id] = ids;
    if (id !== userId)
      throw new Error(`User ${userId} is not allowed to fetch ${id}`);
    const results = await tx().user.findMany({
      where: { id: userId },
    });

    return results.map(
      (result): UserViewModel => ({
        id: result.id,
        currentModelId: result.currentModelId,
        hasOpenAiApiKey: result.openAiApiKey != null,
      }),
    );
  }

  private async fetchModels(models: string[]) {
    const results = await tx().model.findMany({
      where: { id: { in: models } },
    });
    return results.map(
      (result): ModelViewModel => ({
        id: result.id,
        name: result.name,
        code: result.code,
        description: result.description,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      }),
    );
  }

  private cvrEntities(entities: Array<{ id: string; updatedAt: Date }>) {
    return Object.fromEntries(
      entities.map((entity) => [entity.id, entity.updatedAt.getTime()]),
    );
  }
}
