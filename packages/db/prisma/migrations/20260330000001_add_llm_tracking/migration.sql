-- CreateTable: llm_mentions
CREATE TABLE "llm_mentions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "snippet" TEXT,
    "url" TEXT,
    "brandName" TEXT NOT NULL DEFAULT '',
    "sentiment" TEXT NOT NULL DEFAULT 'neutral',
    "rank" INTEGER,
    "notes" TEXT,
    "mentionedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: llm_prompts
CREATE TABLE "llm_prompts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT,
    "lastTestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "llm_mentions_organizationId_mentionedAt_idx" ON "llm_mentions"("organizationId", "mentionedAt" DESC);
CREATE INDEX "llm_mentions_organizationId_platform_idx" ON "llm_mentions"("organizationId", "platform");
CREATE INDEX "llm_mentions_organizationId_brandName_idx" ON "llm_mentions"("organizationId", "brandName");
CREATE INDEX "llm_prompts_organizationId_idx" ON "llm_prompts"("organizationId");

-- AddForeignKey
ALTER TABLE "llm_mentions" ADD CONSTRAINT "llm_mentions_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "llm_prompts" ADD CONSTRAINT "llm_prompts_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
