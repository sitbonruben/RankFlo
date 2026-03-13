-- Add projectId to analytics_events for per-project filtering
ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "projectId" TEXT;

CREATE INDEX IF NOT EXISTS "analytics_events_projectId_timestamp_idx"
  ON "analytics_events"("projectId", "timestamp" DESC);
