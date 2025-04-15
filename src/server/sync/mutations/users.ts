import { z } from "zod";
import { tx } from "~/server/prisma";
import { createMutationHandler } from "../MutationHandler";

export const setApiKeyMutation = createMutationHandler("setApiKey")
  .validate((args) => z.object({ apiKey: z.string().min(1) }).parse(args))
  .handler(async ({ args, ctx }) => {
    await tx().user.update({
      where: { id: ctx.userId },
      data: { openAiApiKey: args.apiKey },
    });
  });

export const setCurrentModelMutation = createMutationHandler("setCurrentModel")
  .validate((args) => z.object({ modelId: z.string().min(1) }).parse(args))
  .handler(async ({ args, ctx }) => {
    await tx().user.update({
      where: { id: ctx.userId },
      data: { currentModelId: args.modelId },
    });
  });
