-- Add translationGroupId to posts for multi-language support
ALTER TABLE "posts" ADD COLUMN "translationGroupId" TEXT;
CREATE INDEX "posts_translationGroupId_idx" ON "posts"("translationGroupId");
