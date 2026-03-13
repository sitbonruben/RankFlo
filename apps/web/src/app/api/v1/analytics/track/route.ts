import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";

/**
 * Public analytics tracking endpoint.
 * Called by tracker.js embedded in customer sites.
 *
 * POST /api/v1/analytics/track
 * Body: {
 *   projectKey: string,   // blg_xxx API key
 *   eventType: string,    // "pageview" | "duration" | ...
 *   path?: string,
 *   referrer?: string,
 *   visitorId: string,
 *   sessionId: string,
 *   device?: string,
 *   duration?: number,
 *   utmSource?, utmMedium?, utmCampaign?, utmTerm?, utmContent?
 * }
 */
export async function POST(req: NextRequest) {
  // Silently succeed in environments without a database (e.g. local dev)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const projectKey = body.projectKey as string | undefined;
    if (!projectKey) {
      return NextResponse.json({ error: "Missing projectKey" }, { status: 400 });
    }

    // Look up project by API key
    const project = await db.project.findUnique({
      where: { apiKey: projectKey },
      select: { id: true, organizationId: true, status: true },
    });

    if (!project || project.status === "ARCHIVED") {
      // Silently accept to avoid leaking info to potential attackers
      return NextResponse.json({ ok: true });
    }

    const eventType = String(body.eventType ?? "pageview");
    const path = body.path ? String(body.path).slice(0, 500) : null;
    const referrer = body.referrer ? String(body.referrer).slice(0, 1000) : null;
    const visitorId = body.visitorId ? String(body.visitorId).slice(0, 64) : "anon";
    const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : "anon";
    const device = body.device ? String(body.device).slice(0, 32) : null;
    const duration = typeof body.duration === "number" ? body.duration : null;
    const utmSource = body.utmSource ? String(body.utmSource).slice(0, 200) : null;
    const utmMedium = body.utmMedium ? String(body.utmMedium).slice(0, 200) : null;
    const utmCampaign = body.utmCampaign ? String(body.utmCampaign).slice(0, 200) : null;
    const utmTerm = body.utmTerm ? String(body.utmTerm).slice(0, 200) : null;
    const utmContent = body.utmContent ? String(body.utmContent).slice(0, 200) : null;

    // Detect country from CF-IPCountry or X-Forwarded-For geo
    const country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? null;

    await db.analyticsEvent.create({
      data: {
        organizationId: project.organizationId,
        projectId: project.id,
        eventType,
        path,
        referrer,
        visitorId,
        sessionId,
        device,
        duration: duration ?? undefined,
        utmSource: utmSource ?? undefined,
        utmMedium: utmMedium ?? undefined,
        utmCampaign: utmCampaign ?? undefined,
        utmTerm: utmTerm ?? undefined,
        utmContent: utmContent ?? undefined,
        country: country ?? undefined,
      },
    });

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      },
    );
  } catch (err) {
    console.error("[analytics/track]", err);
    return NextResponse.json({ ok: true }); // Always succeed to avoid breaking customer sites
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
