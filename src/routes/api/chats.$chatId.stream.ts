import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "~/server/prisma";
import { authenticate } from "~/server/auth";
import { streamTextResponse } from "~/server/stream";

import { messageStreams } from "~/server/chats/MessageStreams";

export const APIRoute = createAPIFileRoute("/api/chats/$chatId/stream")({
  POST: async ({ request, params }) => {
    await authenticate(request);
    const chat = await prisma.chat.findFirstOrThrow({
      where: { id: params.chatId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    try {
      const stream = await messageStreams.ofMessage(
        chat.id,
        chat.messages[0].id,
      );
      return streamTextResponse(stream);
    } catch {
      return new Response(null, { status: 404 });
    }
  },
});
