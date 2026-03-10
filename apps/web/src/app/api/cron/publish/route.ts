import { NextRequest, NextResponse } from "next/server";
import { publishScheduledContent } from "@rankflo/api/services/scheduler";

/**
 * POST /api/cron/publish
 *
 * This endpoint publishes all scheduled posts and social posts that have reached their scheduled time.
 * It's designed to be called by an external cron service (like cron-job.org, AWS EventBridge, etc.)
 *
 * Security: Requires a CRON_SECRET token in the Authorization header
 *
 * Example curl:
 * curl -X POST https://your-domain.com/api/cron/publish \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET" \
 *   -H "Content-Type: application/json"
 *
 * Expected response:
 * {
 *   "success": true,
 *   "timestamp": "2024-03-09T12:00:00Z",
 *   "data": {
 *     "postsPublished": 2,
 *     "socialPostsPublished": 5,
 *     "errors": []
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the cron secret
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error(
        "[Cron API] CRON_SECRET environment variable is not set",
      );
      return NextResponse.json(
        {
          success: false,
          error: "Cron secret not configured",
        },
        { status: 500 },
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid Authorization header",
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring("Bearer ".length);
    if (token !== cronSecret) {
      console.warn("[Cron API] Invalid cron secret provided");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authorization token",
        },
        { status: 403 },
      );
    }

    // Execute the scheduler
    console.log("[Cron API] Starting scheduled content publishing");
    const result = await publishScheduledContent();

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: result,
    };

    console.log("[Cron API] Scheduler completed:", response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Cron API] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cron/publish
 *
 * Health check endpoint. Returns the count of pending scheduled items.
 * Also secured with CRON_SECRET for safety.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the cron secret
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Cron secret not configured",
        },
        { status: 500 },
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid Authorization header",
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring("Bearer ".length);
    if (token !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authorization token",
        },
        { status: 403 },
      );
    }

    // Get pending counts
    const { getPendingScheduledCount } = await import(
      "@rankflo/api/services/scheduler"
    );
    const pending = await getPendingScheduledCount();

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          pendingPostsCount: pending.posts,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Cron API] Health check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
