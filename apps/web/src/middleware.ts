import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const DASHBOARD_PREFIX = [
  "/overview",
  "/projects",
  "/posts",
  "/pages",
  "/media",
  "/growth",
  "/analytics",
  "/search",
  "/seo",
  "/webhooks",
  "/api-keys",
  "/team",
  "/settings",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("rankflo_session")?.value;

  // Logged-in users on homepage → go to dashboard
  if (pathname === "/" && sessionToken) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (DASHBOARD_PREFIX.some((prefix) => pathname.startsWith(prefix))) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
