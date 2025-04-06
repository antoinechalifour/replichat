/*
  Warnings:

  - Added the required column `currentModelId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentModelId" TEXT;
UPDATE "User" SET "currentModelId" = 'cm96289hq0000moc98mpd4h4a' WHERE "currentModelId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "currentModelId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentModelId_fkey" FOREIGN KEY ("currentModelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
