import { NextRequest, NextResponse } from "next/server";
import { SESSION } from "@rankflo/core/constants";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export async function GET(req: NextRequest) {
  // Clear the HttpOnly session cookie server-side and redirect to login
  const response = NextResponse.redirect(`${APP_URL}/login`);
  response.cookies.set(SESSION.cookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
