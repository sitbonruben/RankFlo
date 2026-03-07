import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/overview", "/posts", "/settings", "/team", "/media", "/analytics", "/seo", "/webhooks", "/api-keys", "/projects"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/for/", "/compare/", "/features", "/pricing"],
        disallow: ["/api/", "/overview", "/posts", "/settings"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/for/", "/compare/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog/", "/for/", "/compare/", "/features", "/pricing", "/llms.txt"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/blog/", "/for/", "/compare/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
