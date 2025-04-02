import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { authenticate } from "~/server/auth";
import { sync } from "~/server/sync/SyncServer";
import { pushRequestSchema } from "~/server/sync/PushHandler";

export const APIRoute = createAPIFileRoute("/api/replicache/push")({
  POST: async (args) => {
    const user = await authenticate(args.request);
    const body = await args.request.json();
    await sync.push(user.id, pushRequestSchema.parse(body));
    return json({ message: 'Hello "/api/replicache/push"!' });
  },
});
