import Redis from "ioredis";

export function createRedis() {
  return new Redis(process.env.REDIS_URL!);
}

export const redis = createRedis();
