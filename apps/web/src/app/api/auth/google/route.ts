import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@rankflo/auth/oauth";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.rankflo.io";

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 500 },
    );
  }

  const state = randomBytes(32).toString("hex");
  const redirectUri = `${APP_URL}/api/auth/callback/google`;
  const url = getGoogleAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(url);

  // Store state in a cookie for CSRF verification
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
