-- CreateTable
CREATE TABLE "ReplicacheClientGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cvrVersion" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplicacheClientGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplicacheClient" (
    "id" TEXT NOT NULL,
    "clientGroupId" TEXT NOT NULL,
    "lastMutationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplicacheClient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReplicacheClientGroup" ADD CONSTRAINT "ReplicacheClientGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplicacheClient" ADD CONSTRAINT "ReplicacheClient_clientGroupId_fkey" FOREIGN KEY ("clientGroupId") REFERENCES "ReplicacheClientGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
