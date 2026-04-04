import { NextRequest, NextResponse } from "next/server";
import { SESSION } from "@rankflo/core/constants";
import { invalidateSession, hashSessionToken } from "@rankflo/auth";
import { db } from "@rankflo/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION.cookieName)?.value;

  // Invalidate server-side session
  if (token) {
    try {
      const hashedToken = hashSessionToken(token);
      const session = await db.session.findUnique({ where: { token: hashedToken } });
      if (session) {
        await invalidateSession(session.id);
      }
    } catch {
      // Ignore — still clear the cookie
    }
  }

  // Clear the cookie server-side (this works for HttpOnly cookies)
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set(SESSION.cookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.delete(SESSION.cookieName);

  return response;
}

// Also support GET for simple link-based sign out
export async function GET(req: NextRequest) {
  return POST(req);
}
