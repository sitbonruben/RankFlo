import { db } from "@rankflo/db";

export interface SchedulerResult {
  postsPublished: number;
  errors: Array<{ id: string; type: "post"; error: string }>;
}

/**
 * Publish all scheduled posts and social posts that have reached their scheduled time.
 * This function is designed to be called by cron jobs or scheduled workers.
 */
export async function publishScheduledContent(): Promise<SchedulerResult> {
  const result: SchedulerResult = {
    postsPublished: 0,
    errors: [],
  };

  const now = new Date();

  try {
    const scheduledPosts = await db.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
        deletedAt: null,
      },
      select: {
        id: true,
        organizationId: true,
        slug: true,
        title: true,
        scheduledAt: true,
      },
    });

    for (const post of scheduledPosts) {
      try {
        await db.post.update({
          where: { id: post.id },
          data: { status: "PUBLISHED", publishedAt: now },
        });

        await db.auditLog.create({
          data: {
            organizationId: post.organizationId,
            action: "post.auto_published",
            entityType: "Post",
            entityId: post.id,
            metadata: {
              scheduledAt: post.scheduledAt?.toISOString(),
              publishedAt: now.toISOString(),
            },
          },
        });

        result.postsPublished++;
        console.log(`[Scheduler] Published post: ${post.id} (${post.slug})`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push({ id: post.id, type: "post", error: errorMsg });
        console.error(`[Scheduler] Failed to publish post ${post.id}:`, error);
      }
    }

    return result;
  } catch (error) {
    console.error("[Scheduler] Fatal error in scheduler:", error);
    throw error;
  }
}

/**
 * Get a count of pending scheduled items
 */
export async function getPendingScheduledCount(): Promise<{ posts: number }> {
  const now = new Date();

  const posts = await db.post.count({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
      deletedAt: null,
    },
  });

  return { posts };
}
