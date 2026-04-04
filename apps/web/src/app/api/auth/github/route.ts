import { NextResponse } from "next/server";
import { getGitHubAuthUrl } from "@rankflo/auth/oauth";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 500 });
  }

  const state = randomBytes(32).toString("hex");
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";
  const redirectUri = `${APP_URL}/api/auth/callback/github`;
  const url = getGitHubAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
