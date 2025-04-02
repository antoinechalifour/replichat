import { z } from "zod";
import { rollback, Transaction } from "~/server/prisma";
import { ClientGroups } from "./ClientGroups";
import { Clients } from "./Clients";
import { MutationHandler } from "./MutationHandler";
import { MutationNames } from "./mutations";

const mutationSchema = z.object({
  id: z.number(),
  clientID: z.string(),
  name: z.string(),
  args: z.any(),
});
export type Mutation = z.infer<typeof mutationSchema>;

export const pushRequestSchema = z.object({
  clientGroupID: z.string(),
  mutations: z.array(mutationSchema),
});
export type PushRequest = z.infer<typeof pushRequestSchema>;

const unauthorized = () => new Response("Unauthorized", { status: 401 });

export class PushHandler {
  constructor(
    private readonly tx: Transaction,
    private readonly clientGroups: ClientGroups,
    private readonly clients: Clients,
    private readonly mutators: Map<string, MutationHandler<MutationNames>>,
  ) {}

  async handle(userId: string, push: PushRequest): Promise<void> {
    for (const mutation of push.mutations) {
      try {
        await this.processMutation(mutation, push.clientGroupID, userId);
      } catch {
        await this.processMutation(mutation, push.clientGroupID, userId, true);
      }
    }
  }

  private processMutation(
    mutation: Mutation,
    clientGroupID: string,
    userID: string,
    errorMode = false,
  ) {
    return this.tx.run("sync.push", async () => {
      const clientGroup = await this.clientGroups.get(clientGroupID, userID);
      // 4. Verify requesting user owns specified client group.
      if (clientGroup.userID !== userID) throw unauthorized();
      // 5. getClient(mutation.clientID) or default
      const client = await this.clients.get(mutation.clientID, clientGroup.id);
      // 6. Verify requesting client group owns requested client
      if (client.clientGroupID !== clientGroupID) throw unauthorized();
      // 7. let nextMutationID = client.lastMutationID + 1
      const nextMutationID = client.lastMutationID + 1;

      // 8. Rollback transaction and skip mutation if already processed (mutation.id < nextMutationID)
      if (mutation.id < nextMutationID) return;
      // 9. Rollback transaction and error if mutation from future (mutation.id > nextMutationID)
      if (mutation.id > nextMutationID) rollback();

      // 10. If errorMode != true then
      if (!errorMode) {
        try {
          await this.mutate(userID, mutation);
        } catch (e) {
          console.error(
            `Could not process mutation ${mutation.name}`,
            mutation.args,
            e,
          );
          throw e;
        }
      }

      // 11. putClientGroup()
      await this.clientGroups.save({
        id: clientGroupID,
        userID,
        cvrVersion: clientGroup.cvrVersion,
      });

      // 12. saveClientGroup()
      await this.clients.save({
        id: mutation.clientID,
        clientGroupID: clientGroupID,
        lastMutationID: nextMutationID,
      });
    });
  }

  private async mutate(userID: string, mutation: Mutation) {
    console.log(`User: ${userID}, processing mutation`, mutation);
    const mutationContext = { userId: userID };
    const mutator = this.mutators.get(mutation.name);
    if (mutator == null) throw new Response("Bad request", { status: 400 });
    await mutator.handler(mutation.args, mutationContext);
  }
}
