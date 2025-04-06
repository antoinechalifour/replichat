-- CreateTable
CREATE TABLE "ReplicacheCVR" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cvr" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplicacheCVR_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReplicacheCVR" ADD CONSTRAINT "ReplicacheCVR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
