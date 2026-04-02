import { NextResponse } from "next/server";
import { db } from "@rankflo/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "ok", ts: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: "unreachable", ts: new Date().toISOString() },
      { status: 503 },
    );
  }
}
