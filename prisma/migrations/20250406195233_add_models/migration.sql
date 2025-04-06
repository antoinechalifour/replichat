-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Model_code_key" ON "Model"("code");

INSERT INTO "Model" ("id", "name", "description", "code") VALUES
('cm96289hq0000moc98mpd4h4a', 'ChatGPT-4o', 'Great for most questions', 'gpt-4o'),
('cm962aaj20000moc96bdq61kf', 'ChatGPT-4o mini', 'Faster for most questions', 'gpt-4o-mini'),
('cm962aet60000moc962fofc9e', 'ChatGPT o1', 'Uses advanced reasoning', 'o1'),
('cm962bvxm0000moc9fp973sz2', 'ChatGPT o3-mini', 'Fast at advanced reasoning', 'o3-mini');