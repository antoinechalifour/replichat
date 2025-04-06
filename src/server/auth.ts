import { getAuth } from "@clerk/tanstack-react-start/server";
import { prisma } from "~/server/prisma";

export async function authenticateOrNull(request: Request) {
  const auth = await getAuth(request);
  if (auth.userId == null) return null;
  return prisma.user.findFirstOrThrow({
    where: { externalId: auth.userId },
    include: { currentModel: { select: { code: true } } },
  });
}

export async function authenticate(request: Request) {
  const user = await authenticateOrNull(request);
  if (user == null) throw new Response("Unauthorized", { status: 401 });
  return user;
}
