import { z } from "zod";

export const cookie = z.object({
  order: z.number(),
  cvrID: z.string(),
});
export type Cookie = z.infer<typeof cookie>;
