import Redis from "ioredis";

export function createRedis() {
  return new Redis(process.env.REDIS_URL!);
}

export const redis = createRedis();

export async function* consumeRedisStream<TChunk, TYield>({
  key,
  parseChunk,
  getYieldedChunk,
  isComplete,
}: {
  key: string;
  parseChunk(chunk: unknown): TChunk;
  getYieldedChunk(chunk: TChunk): TYield | null;
  isComplete(chunk: TChunk): boolean;
}) {
  let lastId = "0";
  const redis = createRedis();

  try {
    while (true) {
      const result = await redis.xread("BLOCK", 0, "STREAMS", key, lastId);
      if (result) {
        for (const [, messages] of result) {
          for (const [id, fields] of messages) {
            // Convert the flat array of fields to an object.
            const chunk: Record<string, string> = {};
            for (let i = 0; i < fields.length; i += 2) {
              chunk[fields[i]] = fields[i + 1];
            }

            lastId = id;
            const parsed = parseChunk(chunk);
            const yielded = getYieldedChunk(parsed);
            if (yielded != null) yield yielded;
            if (isComplete(parsed)) {
              return;
            }
          }
        }
      }
    }
  } finally {
    await redis.quit();
  }
}

export async function writeReadableStreamToRedisStream(args: {
  redis: Redis;
  readableStream: ReadableStream<string>;
  streamName: string;
}) {
  const reader = args.readableStream.getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    await redis.xadd(args.streamName, "*", "type", "delta", "delta", value);
  }
}
