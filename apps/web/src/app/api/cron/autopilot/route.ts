import { NextRequest, NextResponse } from "next/server";
import { runAutopilot } from "@rankflo/api/services/autopilot";

function verifySecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const auth = request.headers.get("Authorization");
  return !!auth && auth === `Bearer ${cronSecret}`;
}

/**
 * POST /api/cron/autopilot
 *
 * Runs AI content generation for all projects with autopilot enabled
 * that are due for a new post based on their configured frequency.
 *
 * Call this hourly from your cron service.
 */
export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron/Autopilot] Starting autopilot run");
    const result = await runAutopilot();
    console.log("[Cron/Autopilot] Completed:", result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: result,
    });
  } catch (error) {
    console.error("[Cron/Autopilot] Error:", error);
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

export async function GET(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { db } = await import("@rankflo/db");
  const now = new Date();

  const [enabled, due] = await Promise.all([
    db.project.count({ where: { autopilotEnabled: true } }),
    db.project.count({
      where: {
        autopilotEnabled: true,
        OR: [{ autopilotNextRunAt: null }, { autopilotNextRunAt: { lte: now } }],
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    data: { autopilotProjectsEnabled: enabled, autopilotProjectsDue: due },
  });
}
