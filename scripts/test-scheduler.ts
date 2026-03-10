#!/usr/bin/env node

/**
 * Scheduler Test Utility
 * 
 * Commands: pending, upcoming, dry-run, test-post, test-social, publish, logs, cleanup, help
 * Example: ts-node scripts/test-scheduler.ts pending
 */

import { db } from "@rankflo/db";

const command = process.argv[2] || "pending";

async function getPendingCount() {
  const now = new Date();

  const [posts, socialPosts] = await Promise.all([
    db.post.count({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
        deletedAt: null,
      },
    }),
    db.socialPost.count({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
    }),
  ]);

  return { posts, socialPosts };
}

async function showPending() {
  console.log("\n=== Pending Scheduled Items ===\n");

  const now = new Date();

  const posts = await db.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      organizationId: true,
    },
    take: 20,
  });

  if (posts.length === 0) {
    console.log("No pending blog posts");
  } else {
    console.log(`Pending blog posts (${posts.length}):`);
    posts.forEach((post) => {
      const ago = Math.floor(
        (now.getTime() - (post.scheduledAt?.getTime() || 0)) / 1000,
      );
      console.log(
        `  - ${post.title} (ID: ${post.id}) - ${ago}s ago`,
      );
    });
  }

  const socialPosts = await db.socialPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: {
      socialAccount: {
        select: { platform: true, accountName: true },
      },
    },
    take: 20,
  });

  if (socialPosts.length === 0) {
    console.log("No pending social posts");
  } else {
    console.log(`\nPending social posts (${socialPosts.length}):`);
    socialPosts.forEach((sp) => {
      const ago = Math.floor(
        (now.getTime() - (sp.scheduledAt?.getTime() || 0)) / 1000,
      );
      console.log(
        `  - ${sp.socialAccount.platform}/${sp.socialAccount.accountName}: "${sp.content.substring(0, 50)}..." (ID: ${sp.id})`,
      );
    });
  }

  console.log();
}

async function showUpcoming() {
  console.log("\n=== Upcoming Scheduled Items (Next 7 Days) ===\n");

  const now = new Date();
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const posts = await db.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { gte: now, lte: futureDate },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      scheduledAt: true,
    },
    orderBy: { scheduledAt: "asc" },
    take: 20,
  });

  if (posts.length === 0) {
    console.log("No upcoming blog posts");
  } else {
    console.log(`Upcoming blog posts (${posts.length}):`);
    posts.forEach((post) => {
      const inMs = (post.scheduledAt?.getTime() || 0) - now.getTime();
      const hours = Math.floor(inMs / (1000 * 60 * 60));
      console.log(
        `  - ${post.title} (ID: ${post.id}) - in ${hours}h`,
      );
    });
  }

  console.log();
}

async function dryRun() {
  console.log("\n=== Dry Run (No Changes) ===\n");

  const counts = await getPendingCount();
  console.log(
    `Found ${counts.posts} pending blog posts and ${counts.socialPosts} pending social posts\n`,
  );

  if (counts.posts === 0 && counts.socialPosts === 0) {
    console.log("No items to publish. Create test items first:");
    console.log("  ts-node scripts/test-scheduler.ts test-post");
    console.log("  ts-node scripts/test-scheduler.ts test-social\n");
    return;
  }

  console.log("In a real run, these items would be published:");
  await showPending();
}

async function publishAll() {
  console.log("\n=== Publishing All Pending Items ===\n");

  const { publishScheduledContent } = await import(
    "@rankflo/api/services/scheduler"
  );

  const result = await publishScheduledContent();

  console.log(`Published ${result.postsPublished} blog posts`);
  console.log(`Published ${result.socialPostsPublished} social posts`);

  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    result.errors.forEach((err) => {
      console.log(`  - ${err.type} ${err.id}: ${err.error}`);
    });
  }

  console.log();
}

async function showLogs() {
  console.log("\n=== Recent Published Items (Last 20) ===\n");

  const logs = await db.auditLog.findMany({
    where: {
      action: { in: ["post.auto_published", "social_post.auto_published"] },
    },
    orderBy: { timestamp: "desc" },
    take: 20,
  });

  if (logs.length === 0) {
    console.log("No published items found.\n");
    return;
  }

  logs.forEach((log) => {
    const action =
      log.action === "post.auto_published" ? "📝 Post" : "📱 Social";
    console.log(`${action} ${log.entityId} - ${log.timestamp.toISOString()}`);
  });

  console.log();
}

async function main() {
  try {
    switch (command) {
      case "pending":
        await showPending();
        break;
      case "upcoming":
        await showUpcoming();
        break;
      case "dry-run":
        await dryRun();
        break;
      case "publish":
        await publishAll();
        break;
      case "logs":
        await showLogs();
        break;
      case "--help":
      case "-h":
      case "help":
        console.log(`
Scheduler Test Utility

Usage: ts-node scripts/test-scheduler.ts [command]

Commands:
  pending      - Show pending scheduled items
  upcoming     - Show next 7 days
  dry-run      - Simulate without changes
  publish      - Actually publish pending items
  logs         - Show recent publications
  help         - Show this message
        `);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
