-- CreateEnum
CREATE TYPE "CalendarEntryType" AS ENUM ('BLOG_POST', 'SOCIAL_POST', 'EMAIL_CAMPAIGN', 'LANDING_PAGE', 'VIDEO', 'PODCAST', 'WEBINAR', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarEntryStatus" AS ENUM ('IDEA', 'PLANNED', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "calendar_entries" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entryType" "CalendarEntryType" NOT NULL DEFAULT 'BLOG_POST',
    "status" "CalendarEntryStatus" NOT NULL DEFAULT 'IDEA',
    "postId" TEXT,
    "assigneeId" TEXT,
    "color" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_entries_organizationId_scheduledDate_idx" ON "calendar_entries"("organizationId", "scheduledDate");

-- CreateIndex
CREATE INDEX "calendar_entries_organizationId_status_idx" ON "calendar_entries"("organizationId", "status");

-- CreateIndex
CREATE INDEX "calendar_entries_assigneeId_idx" ON "calendar_entries"("assigneeId");

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
