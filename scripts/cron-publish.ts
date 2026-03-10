#!/usr/bin/env node

/**
 * RankFlo Scheduled Content Publisher
 *
 * This script publishes all scheduled posts and social posts that have reached their scheduled time.
 * It's designed to be run by system cron, pm2, or other job schedulers.
 *
 * Usage:
 *
 * 1. Direct execution:
 *    ts-node scripts/cron-publish.ts
 *
 * 2. Via npm script (add to package.json):
 *    "cron:publish": "ts-node scripts/cron-publish.ts"
 *    pnpm cron:publish
 *
 * 3. Via system cron:
 *    # Run every minute
 *    * * * * * cd /path/to/rankflo && pnpm cron:publish
 *
 *    # Or every 5 minutes
 *    */5 * * * * cd /path/to/rankflo && pnpm cron:publish
 *
 * 4. Via PM2:
 *    pm2 start scripts/cron-publish.ts --name "rankflo-scheduler" --cron "*/5 * * * *"
 *    # Or with ecosystem file (pm2.config.js):
 *    module.exports = {
 *      apps: [
 *        {
 *          name: "rankflo-scheduler",
 *          script: "scripts/cron-publish.ts",
 *          exec_interpreter: "node --loader tsx/esm",
 *          cron_time: "*/5 * * * *",
 *        }
 *      ]
 *    }
 *
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string (required)
 *   LOG_LEVEL - Log level (debug, info, warn, error) - default: info
 *   DRY_RUN - If set to "true", simulate without making changes - default: false
 *
 * Exit codes:
 *   0 - Success
 *   1 - Error running scheduler
 *   2 - Missing environment variables
 */

import { db } from "@rankflo/db";

interface LoggerOptions {
  level: "debug" | "info" | "warn" | "error";
}

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLogLevel = LOG_LEVELS[
  (process.env.LOG_LEVEL as keyof typeof LOG_LEVELS) || "info"
];

function log(level: keyof typeof LOG_LEVELS, message: string, data?: unknown) {
  if (LOG_LEVELS[level] >= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

async function publishScheduledContent() {
  const isDryRun = process.env.DRY_RUN === "true";

  if (isDryRun) {
    log("info", "Running in DRY_RUN mode - no changes will be made");
  }

  const now = new Date();
  log("debug", "Starting scheduled content publishing", {
    timestamp: now.toISOString(),
    dryRun: isDryRun,
  });

  const results = {
    postsPublished: 0,
    socialPostsPublished: 0,
    postErrors: [] as Array<{ id: string; error: string }>,
    socialPostErrors: [] as Array<{ id: string; error: string }>,
  };

  try {
    // Find scheduled posts to publish
    log("debug", "Fetching scheduled posts...");
    const scheduledPosts = await db.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
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

    log("info", `Found ${scheduledPosts.length} scheduled posts to publish`);

    // Publish each post
    for (const post of scheduledPosts) {
      try {
        log("debug", `Publishing post: ${post.id}`, {
          slug: post.slug,
          scheduledAt: post.scheduledAt?.toISOString(),
        });

        if (!isDryRun) {
          // Update post status
          await db.post.update({
            where: { id: post.id },
            data: {
              status: "PUBLISHED",
              publishedAt: now,
            },
          });

          // Log in audit log
          await db.auditLog.create({
            data: {
              organizationId: post.organizationId,
              action: "post.auto_published",
              entityType: "Post",
              entityId: post.id,
              metadata: {
                scheduledAt: post.scheduledAt?.toISOString(),
                publishedAt: now.toISOString(),
                runBy: "cron-publish-script",
              },
            },
          });
        }

        results.postsPublished++;
        log(
          "info",
          `Published post: ${post.slug} (ID: ${post.id}) from org ${post.organizationId}`,
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.postErrors.push({
          id: post.id,
          error: errorMsg,
        });
        log(
          "error",
          `Failed to publish post ${post.id}: ${errorMsg}`,
          error,
        );
      }
    }

    // Find scheduled social posts to publish
    log("debug", "Fetching scheduled social posts...");
    const scheduledSocialPosts = await db.socialPost.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
          },
        },
      },
    });

    log(
      "info",
      `Found ${scheduledSocialPosts.length} scheduled social posts to publish`,
    );

    // Publish each social post
    for (const socialPost of scheduledSocialPosts) {
      try {
        log("debug", `Publishing social post: ${socialPost.id}`, {
          platform: socialPost.socialAccount.platform,
          account: socialPost.socialAccount.accountName,
          scheduledAt: socialPost.scheduledAt?.toISOString(),
        });

        if (!isDryRun) {
          // Update status to PUBLISHING
          await db.socialPost.update({
            where: { id: socialPost.id },
            data: {
              status: "PUBLISHING",
            },
          });

          // TODO: In production, call the actual social platform APIs here
          // For now, just mark as published
          await db.socialPost.update({
            where: { id: socialPost.id },
            data: {
              status: "PUBLISHED",
              publishedAt: now,
              externalId: `auto-${Date.now()}`,
            },
          });

          // Log in audit log
          await db.auditLog.create({
            data: {
              organizationId: socialPost.organizationId,
              action: "social_post.auto_published",
              entityType: "SocialPost",
              entityId: socialPost.id,
              metadata: {
                platform: socialPost.socialAccount.platform,
                accountName: socialPost.socialAccount.accountName,
                scheduledAt: socialPost.scheduledAt?.toISOString(),
                publishedAt: now.toISOString(),
                runBy: "cron-publish-script",
              },
            },
          });
        }

        results.socialPostsPublished++;
        log(
          "info",
          `Published social post: ${socialPost.socialAccount.platform}/${socialPost.socialAccount.accountName} (ID: ${socialPost.id})`,
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.socialPostErrors.push({
          id: socialPost.id,
          error: errorMsg,
        });
        log(
          "error",
          `Failed to publish social post ${socialPost.id}: ${errorMsg}`,
          error,
        );
      }
    }
  } catch (error) {
    log("error", "Fatal error in scheduler", error);
    throw error;
  }

  return results;
}

async function main() {
  try {
    // Validate environment
    if (!process.env.DATABASE_URL) {
      log("error", "DATABASE_URL environment variable is required");
      process.exit(2);
    }

    log("info", "RankFlo Scheduled Content Publisher starting");
    log(
      "debug",
      "Environment",
      {
        nodeEnv: process.env.NODE_ENV,
        logLevel: process.env.LOG_LEVEL || "info",
        dryRun: process.env.DRY_RUN === "true",
      },
    );

    const results = await publishScheduledContent();

    // Print summary
    log("info", "Scheduler completed", {
      postsPublished: results.postsPublished,
      socialPostsPublished: results.socialPostsPublished,
      postErrors: results.postErrors.length,
      socialPostErrors: results.socialPostErrors.length,
    });

    if (results.postErrors.length > 0) {
      log("warn", "Post publishing errors:", results.postErrors);
    }

    if (results.socialPostErrors.length > 0) {
      log("warn", "Social post publishing errors:", results.socialPostErrors);
    }

    process.exit(0);
  } catch (error) {
    log("error", "Scheduler failed", error);
    process.exit(1);
  }
}

// Run the main function
main();
