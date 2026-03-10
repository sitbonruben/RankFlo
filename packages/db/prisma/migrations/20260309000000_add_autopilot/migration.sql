-- Add autopilot fields to projects table
ALTER TABLE "projects" ADD COLUMN "autopilotEnabled"     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "autopilotFrequency"   INTEGER NOT NULL DEFAULT 2;
ALTER TABLE "projects" ADD COLUMN "autopilotContentType" TEXT    NOT NULL DEFAULT 'blog-post';
ALTER TABLE "projects" ADD COLUMN "autopilotAutoPublish" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN "autopilotLastRunAt"   TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "autopilotNextRunAt"   TIMESTAMP(3);

-- Index for efficient cron queries
CREATE INDEX "projects_autopilot_idx" ON "projects"("autopilotEnabled", "autopilotNextRunAt");
