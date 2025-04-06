import { PullResponse } from "replicache";
import { poke } from "../pusher";
import { PushHandler, PushRequest } from "./PushHandler";
import { PullHandler, PullRequest } from "./PullHandler";
import { ClientGroupsAdapter } from "./ClientGroups";
import { ClientsAdapter } from "./Clients";
import { CVRsAdapter } from "./CVRs";
import { PrismaTransaction } from "~/server/prisma";
import { mutators } from "./mutations";
import { CVREntitiesAdapter } from "./CVREntities";

interface ReplicacheSync {
  pull(userId: string, pullRequest: PullRequest): Promise<PullResponse>;
  push(userId: string, push: PushRequest): Promise<void>;
}

export class SyncServer implements ReplicacheSync {
  constructor(
    private readonly pullHandler: PullHandler,
    private readonly pushHandler: PushHandler,
  ) {}

  pull(userId: string, pullRequest: PullRequest): Promise<PullResponse> {
    return this.pullHandler.handle(userId, pullRequest);
  }

  async push(userId: string, push: PushRequest): Promise<void> {
    await this.pushHandler.handle(userId, push);
    poke(userId);
  }
}

const clientGroups = new ClientGroupsAdapter();
const cvrs = new CVRsAdapter();
const cvrEntities = new CVREntitiesAdapter();
const clients = new ClientsAdapter();
const transaction = new PrismaTransaction();

export const sync = new SyncServer(
  new PullHandler(transaction, clientGroups, clients, cvrs, cvrEntities),
  new PushHandler(
    transaction,
    clientGroups,
    clients,
    new Map(Object.entries(mutators)),
  ),
);
