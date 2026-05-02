-- Cross-project AI usage tracking
CREATE TABLE "ai_usage_log" (
    "id" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_usage_log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_usage_log_project_createdAt_idx" ON "ai_usage_log"("project", "createdAt" DESC);
CREATE INDEX "ai_usage_log_createdAt_idx" ON "ai_usage_log"("createdAt" DESC);
CREATE INDEX "ai_usage_log_provider_idx" ON "ai_usage_log"("provider");
