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
    const customEvent = body.customEvent ? String(body.customEvent).slice(0, 200) : null;
    const properties = customEvent
      ? { event: customEvent, ...(body.properties && typeof body.properties === "object" ? body.properties as Record<string, unknown> : {}) }
      : null;
    const path = body.path ? String(body.path).slice(0, 500) : null;
    const referrer = body.referrer ? String(body.referrer).slice(0, 1000) : null;
    const visitorId = body.visitorId ? String(body.visitorId).slice(0, 64) : "anon";
    const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : "anon";
    const device = body.device ? String(body.device).slice(0, 32) : null;

    // Detect browser from User-Agent if not sent by tracker
    const ua = req.headers.get("user-agent") ?? "";
    let browser = body.browser ? String(body.browser) : null;
    if (!browser && ua) {
      if (ua.includes("Firefox/")) browser = "Firefox";
      else if (ua.includes("Edg/")) browser = "Edge";
      else if (ua.includes("Chrome/")) browser = "Chrome";
      else if (ua.includes("Safari/")) browser = "Safari";
      else browser = "Other";
    }
    let os = body.os ? String(body.os) : null;
    if (!os && ua) {
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Mac OS")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    }
    const duration = typeof body.duration === "number" ? body.duration : null;
    const utmSource = body.utmSource ? String(body.utmSource).slice(0, 200) : null;
    const utmMedium = body.utmMedium ? String(body.utmMedium).slice(0, 200) : null;
    const utmCampaign = body.utmCampaign ? String(body.utmCampaign).slice(0, 200) : null;
    const utmTerm = body.utmTerm ? String(body.utmTerm).slice(0, 200) : null;
    const utmContent = body.utmContent ? String(body.utmContent).slice(0, 200) : null;

    // Detect country from headers or IP geolocation
    let country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? null;
    if (!country) {
      // Fallback: resolve country from IP using free API (non-blocking, best-effort)
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? req.headers.get("x-real-ip");
      if (ip && ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
        try {
          const geo = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
            signal: AbortSignal.timeout(2000),
          });
          if (geo.ok) {
            const data = (await geo.json()) as { countryCode?: string };
            country = data.countryCode ?? null;
          }
        } catch {
          // Silently ignore — country is optional
        }
      }
    }

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
        browser: browser ?? undefined,
        os: os ?? undefined,
        duration: duration ?? undefined,
        utmSource: utmSource ?? undefined,
        utmMedium: utmMedium ?? undefined,
        utmCampaign: utmCampaign ?? undefined,
        utmTerm: utmTerm ?? undefined,
        utmContent: utmContent ?? undefined,
        country: country ?? undefined,
        properties: properties ?? undefined,
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
