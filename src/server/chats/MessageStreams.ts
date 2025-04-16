import { z } from "zod";
import {
  consumeRedisStream,
  createRedis,
  writeReadableStreamToRedisStream,
} from "~/server/redis";
import { asyncIterableToReadableStream } from "~/server/stream";

export interface MessageStreams {
  ofMessage(chatId: string, messageId: string): Promise<ReadableStream<string>>;
  save(args: {
    chatId: string;
    messageId: string;
    stream: ReadableStream<string>;
  }): Promise<void>;
  delete(chatId: string, messageId: string): Promise<void>;
}

const ChunkSchema = z
  .object({ type: z.literal("init") })
  .or(z.object({ type: z.literal("end") }))
  .or(z.object({ type: z.literal("delta"), delta: z.string() }));

export class MessageStreamsAdapter implements MessageStreams {
  async ofMessage(
    chatId: string,
    messageId: string,
  ): Promise<ReadableStream<string>> {
    const redis = createRedis();
    const key = MessageStreamsAdapter.streamKey(chatId, messageId);
    const result = await redis.exists(key);
    const exists = result !== 0;
    if (!exists) throw new Error("Stream not found");

    return asyncIterableToReadableStream(
      consumeRedisStream({
        key: key,
        parseChunk: (chunk) => ChunkSchema.parse(chunk),
        getYieldedChunk: (chunk) => {
          if (chunk.type === "delta") return chunk.delta;
          return null;
        },
        isComplete: (chunk) => chunk.type === "end",
      }),
    );
  }

  private static streamKey(chatId: string, messageId: string) {
    return `stream_chat:${{ chatId, messageId }.chatId}:reply_to:${{ chatId, messageId }.messageId}`;
  }

  async save(args: {
    chatId: string;
    messageId: string;
    stream: ReadableStream<string>;
  }): Promise<void> {
    const redis = createRedis();
    const key = MessageStreamsAdapter.streamKey(args.chatId, args.messageId);

    await redis.xadd(key, "*", "type", "init");
    await writeReadableStreamToRedisStream({
      redis,
      readableStream: args.stream,
      streamName: key,
    });
    await redis.xadd(key, "*", "type", "end");
  }

  async delete(chatId: string, messageId: string): Promise<void> {
    const redis = createRedis();
    await redis.del(MessageStreamsAdapter.streamKey(chatId, messageId));
  }
}

export const messageStreams = new MessageStreamsAdapter();
