import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const isAppSubdomain = host.startsWith("app.");

  // The app.* subdomain is the dashboard — block all crawling.
  // Marketing pages on app.* should defer to the canonical at rankflo.io.
  if (isAppSubdomain) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      host: BASE_URL,
    };
  }

  const PUBLIC_ALLOW = ["/", "/blog/", "/docs/", "/for/", "/compare/", "/alternatives/", "/integrations/", "/glossary/", "/migrate/", "/use-cases/", "/tools/", "/features", "/pricing", "/about"];
  const DASHBOARD_DISALLOW = [
    "/api/",
    "/overview",
    "/posts",
    "/pages",
    "/projects",
    "/media",
    "/settings",
    "/team",
    "/analytics",
    "/search",
    "/seo",
    "/webhooks",
    "/api-keys",
    "/onboarding",
    "/calendar",
    "/subscribers",
    "/conversions",
    "/llms",
    "/admin",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  return {
    rules: [
      { userAgent: "*", allow: PUBLIC_ALLOW, disallow: DASHBOARD_DISALLOW },
      { userAgent: "Googlebot", allow: PUBLIC_ALLOW, disallow: DASHBOARD_DISALLOW },
      { userAgent: "Google-Extended", allow: PUBLIC_ALLOW },
      { userAgent: "GPTBot", allow: [...PUBLIC_ALLOW, "/llms.txt"] },
      { userAgent: "ClaudeBot", allow: [...PUBLIC_ALLOW, "/llms.txt"] },
      { userAgent: "anthropic-ai", allow: [...PUBLIC_ALLOW, "/llms.txt"] },
      { userAgent: "PerplexityBot", allow: [...PUBLIC_ALLOW, "/llms.txt"] },
      { userAgent: "Applebot-Extended", allow: PUBLIC_ALLOW },
      { userAgent: "Meta-ExternalAgent", allow: PUBLIC_ALLOW },
      { userAgent: "cohere-ai", allow: [...PUBLIC_ALLOW, "/llms.txt"] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
