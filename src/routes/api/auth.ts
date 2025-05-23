import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getAuth } from "@clerk/tanstack-react-start/server";
import { prisma } from "~/server/prisma";

export const APIRoute = createAPIFileRoute("/api/auth")({
  GET: async ({ request }) => {
    try {
      const { userId } = await getAuth(request);
      if (!userId) throw new Response("Unauthorized", { status: 401 });
      const defaultModel = await prisma.model.findUniqueOrThrow({
        where: { code: "gpt-4o-search-preview" },
      });
      await prisma.user.upsert({
        where: { externalId: userId },
        create: { externalId: userId, currentModelId: defaultModel.id },
        update: {},
      });
      return new Response(null, { status: 307, headers: { Location: "/" } });
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }
  },
});
