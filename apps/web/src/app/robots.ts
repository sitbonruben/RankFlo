import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export default function robots(): MetadataRoute.Robots {
  // Same rules on rankflo.io and app.rankflo.io.
  // app.* responses already carry X-Robots-Tag: noindex, nofollow via
  // middleware — that's what keeps the dashboard subdomain out of the
  // index. We deliberately ALLOW crawling so Google can read the noindex
  // header and the rel=canonical pointing back to rankflo.io, which is
  // what consolidates ranking signals. Disallowing the host outright
  // would prevent Google from ever seeing those signals.
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
