import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "~/server/prisma";
import { authenticate } from "~/server/auth";
import { consumeRedisStream } from "~/server/redis";
import { z } from "zod";
import {
  asyncIterableToReadableStream,
  streamTextResponse,
} from "~/server/stream";
import {
  chatMessageStreamName,
  createStreamCache,
} from "~/server/chats/StreamResponse";

const ChunkSchema = z
  .object({ type: z.literal("init") })
  .or(z.object({ type: z.literal("end") }))
  .or(z.object({ type: z.literal("delta"), delta: z.string() }));

function streamFromCache(streamName: string) {
  console.log("[Redis] Streaming...");
  return asyncIterableToReadableStream(
    consumeRedisStream({
      streamName,
      parseChunk: (chunk) => ChunkSchema.parse(chunk),
      getYieldedChunk: (chunk) => {
        if (chunk.type === "delta") return chunk.delta;
        return null;
      },
      isComplete: (chunk) => chunk.type === "end",
    }),
  );
}

export const APIRoute = createAPIFileRoute("/api/chats/$chatId/stream")({
  POST: async ({ request, params }) => {
    await authenticate(request);
    const chat = await prisma.chat.findFirstOrThrow({
      where: { id: params.chatId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const streamName = chatMessageStreamName({
      chatId: chat.id,
      messageId: chat.messages[0].id,
    });

    const streamCache = createStreamCache(streamName);
    const exists = await streamCache.check();

    if (exists) {
      return streamTextResponse(streamFromCache(streamName));
    } else {
      return new Response(null, { status: 404 });
    }
  },
});
