import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow all public pages, block dashboard routes
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/about"],
        disallow: [
          "/api/",
          "/overview",
          "/posts",
          "/settings",
          "/team",
          "/media",
          "/analytics",
          "/seo",
          "/webhooks",
          "/api-keys",
          "/projects",
          "/onboarding",
          "/calendar",
          "/subscribers",
        ],
      },
      // Google Search
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/about"],
        disallow: ["/api/", "/overview", "/posts", "/settings"],
      },
      // Google AI (Bard / Gemini training)
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing"],
      },
      // OpenAI / ChatGPT
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/llms.txt"],
      },
      // Anthropic Claude
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/llms.txt"],
      },
      // Anthropic crawler (alternate UA)
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/llms.txt"],
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/llms.txt"],
      },
      // Apple Siri / Apple Intelligence
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing"],
      },
      // Meta AI
      {
        userAgent: "Meta-ExternalAgent",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/"],
      },
      // Cohere AI
      {
        userAgent: "cohere-ai",
        allow: ["/", "/blog/", "/docs/", "/for/", "/compare/", "/features", "/pricing", "/llms.txt"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
