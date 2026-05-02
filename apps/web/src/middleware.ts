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
  "/calendar",
  "/conversions",
  "/llms",
  "/onboarding",
  "/subscribers",
];

function addNoIndex(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("rankflo_session")?.value;
  const host = request.headers.get("host") ?? "";
  const isAppSubdomain = host.startsWith("app.");

  if (pathname === "/" && sessionToken) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return addNoIndex(NextResponse.next());
  }

  if (DASHBOARD_PREFIX.some((prefix) => pathname.startsWith(prefix))) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return addNoIndex(NextResponse.next());
  }

  if (isAppSubdomain) {
    return addNoIndex(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
