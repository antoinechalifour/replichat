import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { authenticate } from "~/server/auth";
import { sync } from "~/server/sync/SyncServer";
import { pullRequestSchema } from "~/server/sync/PullHandler";

export const APIRoute = createAPIFileRoute("/api/replicache/pull")({
  POST: async ({ request }) => {
    const user = await authenticate(request);
    const body = await request.json();
    const response = await sync.pull(user.id, pullRequestSchema.parse(body));
    return json(response);
  },
});
