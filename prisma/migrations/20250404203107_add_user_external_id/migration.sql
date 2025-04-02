/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "firstname",
DROP COLUMN "lastname",
ADD COLUMN     "externalId" TEXT;

UPDATE "User" SET "externalId" = gen_random_uuid()::TEXT;

ALTER TABLE "User" ALTER COLUMN "externalId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");
