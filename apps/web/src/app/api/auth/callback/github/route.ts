import { NextRequest, NextResponse } from "next/server";
import { exchangeGitHubCode, handleOAuthCallback } from "@rankflo/auth/oauth";
import { SESSION } from "@rankflo/core/constants";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_cancelled`);
    }

    if (!code) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_code`);
    }

    const storedState = req.cookies.get("oauth_state")?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(`${APP_URL}/login?error=invalid_state`);
    }

    const profile = await exchangeGitHubCode(code);

    if (!profile.email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`);
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const { token, isNewUser } = await handleOAuthCallback(profile, ipAddress, userAgent);

    const destination = isNewUser ? `${APP_URL}/onboarding` : `${APP_URL}/overview`;
    const response = NextResponse.redirect(destination);

    response.cookies.set(SESSION.cookieName, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION.maxAgeDays * 24 * 60 * 60,
    });

    response.cookies.delete("oauth_state");

    return response;
  } catch (err) {
    console.error("[auth/callback/github]", err);
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
