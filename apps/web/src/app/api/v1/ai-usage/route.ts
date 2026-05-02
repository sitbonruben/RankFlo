import { NextResponse } from "next/server";
import { db } from "@rankflo/db";

// Secret key that all projects must include — prevents unauthorized writes
const TRACKING_SECRET = process.env.AI_USAGE_TRACKING_SECRET ?? "rf_track_8f3a2c5b6e1f4a7d";

const VALID_PROJECTS = ["helpzen", "leadsterhub", "mailpanda", "bugwizz", "doxly", "rankflo", "widersales"];

// CORS headers for cross-origin requests from other projects
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS });
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization")?.replace("Bearer ", "");
    if (auth !== TRACKING_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
    }

    const body = await req.json();
    const { project, feature, provider, model, inputTokens, outputTokens, costUsd, durationMs, userId, metadata } = body;

    if (!project || !feature || !provider || !model) {
      return NextResponse.json(
        { error: "Missing required fields: project, feature, provider, model" },
        { status: 400, headers: CORS },
      );
    }

    if (!VALID_PROJECTS.includes(project)) {
      return NextResponse.json(
        { error: `Invalid project. Valid: ${VALID_PROJECTS.join(", ")}` },
        { status: 400, headers: CORS },
      );
    }

    await db.aiUsageLog.create({
      data: {
        project,
        feature,
        provider,
        model,
        inputTokens: inputTokens ?? 0,
        outputTokens: outputTokens ?? 0,
        costUsd: costUsd ?? 0,
        durationMs: durationMs ?? null,
        userId: userId ?? null,
        metadata: metadata ?? null,
      },
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (error) {
    console.error("[ai-usage] Error:", error);
    return NextResponse.json({ ok: true }, { headers: CORS }); // always 200 to not break callers
  }
}

// GET — admin query for usage data
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (auth !== TRACKING_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS });
  }

  const url = new URL(req.url);
  const project = url.searchParams.get("project");
  const days = parseInt(url.searchParams.get("days") ?? "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = { createdAt: { gte: since } };
  if (project) where.project = project;

  const [logs, summary] = await Promise.all([
    db.aiUsageLog.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.aiUsageLog.aggregate({
      where: where as never,
      _sum: { inputTokens: true, outputTokens: true, costUsd: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    logs,
    summary: {
      totalRequests: summary._count,
      totalInputTokens: summary._sum.inputTokens ?? 0,
      totalOutputTokens: summary._sum.outputTokens ?? 0,
      totalCostUsd: summary._sum.costUsd ?? 0,
    },
  }, { headers: CORS });
}
