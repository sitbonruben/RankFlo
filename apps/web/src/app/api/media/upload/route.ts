import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@rankflo/auth";
import { SESSION, PLAN_LIMITS } from "@rankflo/core/constants";
import { db } from "@rankflo/db";
import { presignPut, isS3Configured, s3PublicUrl } from "@/lib/s3-presign";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm",
  "application/pdf",
];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map((c) => {
      const [key, ...val] = c.split("=");
      return [key, val.join("=")] as [string, string];
    }),
  );
}

export async function POST(req: NextRequest) {
  const cookies = parseCookies(req.headers.get("cookie") ?? "");
  const token = cookies[SESSION.cookieName];
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isS3Configured()) {
    return NextResponse.json(
      { error: "Storage not configured. Set S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY in environment." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null) as {
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null;

  if (!body?.fileName || !body?.mimeType || !body?.fileSize) {
    return NextResponse.json({ error: "fileName, mimeType, and fileSize are required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(body.mimeType)) {
    return NextResponse.json({ error: `File type ${body.mimeType} is not allowed` }, { status: 400 });
  }

  if (body.fileSize > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
  }

  // ── Storage quota enforcement ──────────────────────────────
  const orgId = session.membership?.organizationId;
  const plan = session.membership?.organization?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

  if (orgId && limits.maxMediaStorageMb !== -1) {
    const usage = await db.media.aggregate({
      where: { organizationId: orgId },
      _sum: { fileSize: true },
    });
    const usedBytes = usage._sum.fileSize ?? 0;
    const limitBytes = limits.maxMediaStorageMb * 1024 * 1024;

    if (usedBytes + body.fileSize > limitBytes) {
      const usedMb = Math.round(usedBytes / (1024 * 1024));
      return NextResponse.json(
        { error: `Storage limit reached (${usedMb} MB / ${limits.maxMediaStorageMb} MB). Upgrade to Pro for more storage.` },
        { status: 403 },
      );
    }
  }

  const ext = body.fileName.split(".").pop() ?? "bin";
  const key = `uploads/${session.user.id}/${randomUUID()}.${ext}`;

  const presignedUrl = presignPut({
    bucket: process.env.S3_BUCKET!,
    region: process.env.S3_REGION!,
    accessKey: process.env.S3_ACCESS_KEY!,
    secretKey: process.env.S3_SECRET_KEY!,
    endpoint: process.env.S3_ENDPOINT || undefined,
    key,
    mimeType: body.mimeType,
  });

  const publicUrl = s3PublicUrl(key);

  return NextResponse.json({ presignedUrl, publicUrl, key });
}
