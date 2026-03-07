import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";

/**
 * Public Lead-Capture API — Newsletter / Subscriber Endpoint
 *
 * External websites call this to subscribe visitors to a RankFlo-managed list.
 * Authentication: project API key passed as `project_key` in the JSON body.
 *
 * POST /api/v1/subscribe
 *   Body (JSON):
 *     email        — required, subscriber email address
 *     name         — optional, subscriber display name
 *     project_key  — required, project API key (blg_xxx)
 *     source       — optional, e.g. "newsletter-cta", "popup", "landing-page"
 *     tags         — optional, string array of tags
 *     referrer     — optional, referring URL
 */
export async function POST(req: NextRequest) {
  try {
    // ─── PARSE BODY ────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { email, name, project_key, source, tags, referrer } = body as {
      email?: string;
      name?: string;
      project_key?: string;
      source?: string;
      tags?: string[];
      referrer?: string;
    };

    // ─── VALIDATE REQUIRED FIELDS ──────────────────
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid `email` field." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!project_key || typeof project_key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid `project_key` field." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // ─── AUTH: LOOK UP PROJECT BY API KEY ──────────
    if (!project_key.startsWith("blg_")) {
      return NextResponse.json(
        { error: "Invalid API key format. Keys start with `blg_`." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const project = await db.project.findUnique({
      where: { apiKey: project_key },
      select: { id: true, organizationId: true, status: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Invalid API key. Project not found." },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (project.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Project is archived. Reactivate to accept subscribers." },
        { status: 403, headers: corsHeaders() }
      );
    }

    // ─── UPSERT SUBSCRIBER ────────────────────────
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.subscriber.findUnique({
      where: {
        organizationId_email: {
          organizationId: project.organizationId,
          email: normalizedEmail,
        },
      },
      select: { id: true, status: true },
    });

    let subscriberId: string;

    if (existing) {
      if (existing.status === "ACTIVE") {
        // Already subscribed — return success silently (idempotent)
        return NextResponse.json(
          { success: true, message: "Subscribed successfully." },
          { status: 200, headers: corsHeaders() }
        );
      }

      // Reactivate previously unsubscribed / bounced subscriber
      const updated = await db.subscriber.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          name: name ?? undefined,
          source: source ?? undefined,
          referrer: referrer ?? undefined,
          tags: Array.isArray(tags) ? tags : undefined,
          projectId: project.id,
          unsubscribedAt: null,
          subscribedAt: new Date(),
        },
        select: { id: true },
      });
      subscriberId = updated.id;
    } else {
      // Create new subscriber
      const created = await db.subscriber.create({
        data: {
          organizationId: project.organizationId,
          projectId: project.id,
          email: normalizedEmail,
          name: name ?? null,
          status: "ACTIVE",
          source: source ?? null,
          referrer: referrer ?? null,
          tags: Array.isArray(tags) ? tags : [],
        },
        select: { id: true },
      });
      subscriberId = created.id;
    }

    // ─── TRACK CONVERSION EVENT (if goal exists) ──
    try {
      const goal = await db.conversionGoal.findFirst({
        where: {
          organizationId: project.organizationId,
          eventType: "subscribe",
          isActive: true,
        },
        select: { id: true },
      });

      if (goal) {
        await db.conversionEvent.create({
          data: {
            organizationId: project.organizationId,
            goalId: goal.id,
            referrer: referrer ?? null,
            metadata: {
              subscriberId,
              source: source ?? null,
              email: normalizedEmail,
            },
          },
        });
      }
    } catch (conversionError) {
      // Non-critical — log but don't fail the request
      console.error("Failed to track conversion event:", conversionError);
    }

    return NextResponse.json(
      { success: true, message: "Subscribed successfully." },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Subscribe API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// ─── OPTIONS (CORS preflight) ──────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// ─── HELPERS ────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
