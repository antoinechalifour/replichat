import { createRedis, writeReadableStreamToRedisStream } from "~/server/redis";

export function createStreamCache(streamName: string) {
  const redis = createRedis();

  const exists = async () => {
    const result = await redis.set(`${streamName}:lock`, "1", "EX", 60, "NX");
    return result !== "OK";
  };

  const check = async () => {
    const result = await redis.exists(streamName);
    return result !== 0;
  };

  const create = () => redis.xadd(streamName, "*", "type", "init");
  const write = (readableStream: ReadableStream<string>) =>
    writeReadableStreamToRedisStream({
      redis,
      streamName,
      readableStream,
    });
  const end = () => redis.xadd(streamName, "*", "type", "end");
  return { exists, check, create, write, end };
}

export function chatMessageStreamName(args: {
  chatId: string;
  messageId: string;
}) {
  return `stream_chat:${args.chatId}:reply_to:${args.messageId}`;
}
