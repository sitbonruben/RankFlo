import { PRODUCTS, type Product } from "./products";

export interface ComparisonData {
  competitor: string;
  tagline: string;
  description: string;
  rankfloAdvantages: string[];
  competitorAdvantages: string[];
  comparison: { feature: string; rankflo: string; competitor: string }[];
}

// Direct RankFlo vs X comparisons (high-priority competitors, hand-crafted copy)
export const DIRECT_COMPARISONS: Record<string, ComparisonData> = {
  "rankflo-vs-wordpress": {
    competitor: "WordPress",
    tagline: "Modern, type-safe, and AI-powered",
    description: "Compare RankFlo and WordPress. See why teams are choosing a modern, open-source blog platform with AI content generation, built-in analytics, and a developer-first architecture.",
    rankfloAdvantages: ["AI content generation built-in", "Type-safe API (tRPC)", "Built-in analytics (no plugins)", "Modern stack (Next.js, React, TypeScript)", "No plugin security vulnerabilities", "Real-time SEO scoring in editor"],
    competitorAdvantages: ["Massive plugin ecosystem", "Decades of community support", "More themes available", "Lower learning curve for non-developers"],
    comparison: [
      { feature: "AI Content Generation", rankflo: "Built-in", competitor: "Plugin required" },
      { feature: "Analytics", rankflo: "Built-in, cookieless", competitor: "Plugin required" },
      { feature: "SEO Tools", rankflo: "Built-in, real-time", competitor: "Plugin required (Yoast)" },
      { feature: "API", rankflo: "Type-safe tRPC + REST", competitor: "REST only" },
      { feature: "Self-hosting", rankflo: "Docker (5 min)", competitor: "LAMP stack" },
      { feature: "TypeScript SDK", rankflo: "Yes", competitor: "No" },
    ],
  },
  "rankflo-vs-ghost": {
    competitor: "Ghost",
    tagline: "More features, fully open source",
    description: "Compare RankFlo and Ghost. Both are modern publishing platforms, but RankFlo adds AI content generation, headless CMS API, and a more flexible architecture.",
    rankfloAdvantages: ["AI content generation", "Headless CMS with tRPC", "Team RBAC built-in", "i18n / multi-language support", "Webhook system", "Programmatic SEO tools"],
    competitorAdvantages: ["More mature platform", "Built-in newsletter/subscriptions", "Established brand", "Simpler setup"],
    comparison: [
      { feature: "AI Content", rankflo: "Built-in", competitor: "Not available" },
      { feature: "Headless API", rankflo: "tRPC + REST + SDK", competitor: "Content API only" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Basic built-in" },
      { feature: "i18n", rankflo: "Full support", competitor: "Limited" },
      { feature: "Webhooks", rankflo: "HMAC-signed, retry logic", competitor: "Basic" },
      { feature: "License", rankflo: "MIT", competitor: "MIT" },
    ],
  },
  "rankflo-vs-medium": {
    competitor: "Medium",
    tagline: "Own your content, own your audience",
    description: "Compare RankFlo and Medium. Stop renting your audience on someone else's platform. Self-host, use your own domain, and keep full control.",
    rankfloAdvantages: ["Full data ownership", "Custom domain included", "No paywall restrictions", "Built-in analytics", "SEO optimization tools", "API access to your content"],
    competitorAdvantages: ["Built-in audience network", "Zero setup required", "Social features", "Partner program monetization"],
    comparison: [
      { feature: "Data Ownership", rankflo: "Full ownership", competitor: "Platform-owned" },
      { feature: "Custom Domain", rankflo: "Yes", competitor: "Paid feature" },
      { feature: "SEO Control", rankflo: "Full control", competitor: "Limited" },
      { feature: "API Access", rankflo: "Full API", competitor: "Read-only" },
      { feature: "Analytics", rankflo: "Full dashboard", competitor: "Basic stats" },
      { feature: "Monetization", rankflo: "Your choice", competitor: "Partner program" },
    ],
  },
  "rankflo-vs-substack": {
    competitor: "Substack",
    tagline: "Blog + newsletter, fully under your control",
    description: "Compare RankFlo and Substack. Get the publishing power of Substack with full ownership, custom domains, and developer-friendly APIs.",
    rankfloAdvantages: ["Full data ownership", "Custom domain", "AI content generation", "Developer API", "Self-hostable", "No platform fees"],
    competitorAdvantages: ["Built-in email delivery", "Subscription management", "Discovery network", "Simple pricing"],
    comparison: [
      { feature: "AI Writing", rankflo: "Built-in", competitor: "Not available" },
      { feature: "Data Ownership", rankflo: "Full", competitor: "Platform-dependent" },
      { feature: "Custom Domain", rankflo: "Free", competitor: "Paid" },
      { feature: "API", rankflo: "Full tRPC + REST", competitor: "Limited" },
      { feature: "Self-hosting", rankflo: "Yes", competitor: "No" },
      { feature: "SEO Tools", rankflo: "Built-in", competitor: "Basic" },
    ],
  },
  "rankflo-vs-hashnode": {
    competitor: "Hashnode",
    tagline: "Open source, self-hostable, AI-powered",
    description: "Compare RankFlo and Hashnode for developer blogging. Both target developers, but RankFlo is fully open source, self-hostable, and includes AI content generation.",
    rankfloAdvantages: ["Fully open source (MIT)", "Self-hostable with Docker", "AI content generation", "Headless CMS API", "Team RBAC", "Custom integrations"],
    competitorAdvantages: ["Developer community network", "Free hosting", "GitHub-backed auth", "Newsletter built-in"],
    comparison: [
      { feature: "Open Source", rankflo: "MIT License", competitor: "Closed source" },
      { feature: "Self-hosting", rankflo: "Docker", competitor: "Not available" },
      { feature: "AI Content", rankflo: "Built-in", competitor: "Limited" },
      { feature: "API", rankflo: "tRPC + REST + SDK", competitor: "GraphQL" },
      { feature: "Analytics", rankflo: "Full dashboard", competitor: "Basic" },
      { feature: "SEO Tools", rankflo: "Real-time scoring", competitor: "Basic SEO" },
    ],
  },
  "rankflo-vs-contentful": {
    competitor: "Contentful",
    tagline: "Blog-first CMS with AI superpowers",
    description: "Compare RankFlo and Contentful. While Contentful is a general-purpose headless CMS, RankFlo is purpose-built for blogging with AI, analytics, and SEO built in.",
    rankfloAdvantages: ["Purpose-built for blogs", "AI content generation", "Built-in analytics", "SEO scoring", "Much simpler pricing", "Self-hostable"],
    competitorAdvantages: ["General-purpose CMS", "Enterprise-grade infrastructure", "Richer content modeling", "Larger ecosystem"],
    comparison: [
      { feature: "AI Content", rankflo: "Built-in", competitor: "Third-party" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Not included" },
      { feature: "SEO Tools", rankflo: "Built-in", competitor: "Not included" },
      { feature: "Pricing", rankflo: "Free + $5/mo", competitor: "Free + $300/mo" },
      { feature: "Self-hosting", rankflo: "Yes", competitor: "No" },
      { feature: "Open Source", rankflo: "MIT", competitor: "Proprietary" },
    ],
  },
  "rankflo-vs-strapi": {
    competitor: "Strapi",
    tagline: "Blog-optimized with AI and analytics built in",
    description: "Compare RankFlo and Strapi. Both are open-source, but RankFlo is purpose-built for blogging with AI content generation, analytics, and SEO tools included.",
    rankfloAdvantages: ["Blog-optimized editor", "AI content generation", "Built-in analytics", "SEO scoring", "Purpose-built for publishing", "Simpler setup"],
    competitorAdvantages: ["General-purpose CMS", "Content type builder", "More flexible data modeling", "Plugin marketplace"],
    comparison: [
      { feature: "Focus", rankflo: "Blog-first", competitor: "General CMS" },
      { feature: "AI Content", rankflo: "Built-in", competitor: "Plugin" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Not included" },
      { feature: "SEO", rankflo: "Real-time scoring", competitor: "Not included" },
      { feature: "License", rankflo: "MIT", competitor: "MIT (with EE)" },
      { feature: "Setup Time", rankflo: "5 minutes", competitor: "15+ minutes" },
    ],
  },
  "rankflo-vs-sanity": {
    competitor: "Sanity",
    tagline: "Blog-ready with zero configuration",
    description: "Compare RankFlo and Sanity. Sanity is a powerful structured content platform, while RankFlo gives you a complete blogging solution out of the box.",
    rankfloAdvantages: ["Zero-config blog setup", "AI content generation", "Built-in analytics", "SEO tools included", "Self-hostable", "Simpler pricing"],
    competitorAdvantages: ["Flexible content modeling", "Real-time collaboration", "GROQ query language", "Customizable Studio"],
    comparison: [
      { feature: "Setup", rankflo: "Ready in 5 min", competitor: "Requires configuration" },
      { feature: "AI Content", rankflo: "Built-in", competitor: "Third-party" },
      { feature: "Analytics", rankflo: "Built-in", competitor: "Not included" },
      { feature: "SEO Tools", rankflo: "Built-in", competitor: "Not included" },
      { feature: "Self-hosting", rankflo: "Docker", competitor: "Cloud only" },
      { feature: "Open Source", rankflo: "MIT", competitor: "Partially open" },
    ],
  },
};

// Auto-generate RankFlo vs X for every product in catalog not in DIRECT_COMPARISONS
function autoDirectComparison(product: Product): ComparisonData {
  const customDomainCell = (p: Product) => (p.customDomain ? "Yes" : "Limited/paid");
  return {
    competitor: product.name,
    tagline: `A simpler, AI-powered alternative`,
    description: `Compare RankFlo and ${product.name}. See how RankFlo's AI content generation, built-in SEO tools, and headless CMS stack up against ${product.name} for modern publishing teams.`,
    rankfloAdvantages: [
      "AI content generation built-in",
      "Real-time SEO scoring",
      "Type-safe tRPC + REST API",
      "Self-hostable (MIT license)",
      "Built-in analytics (cookieless)",
      "Multi-language support",
    ],
    competitorAdvantages: product.pros.slice(0, 4),
    comparison: [
      { feature: "AI Content", rankflo: "Built-in", competitor: product.aiBuiltIn ? "Available" : "Not available" },
      { feature: "Self-hosting", rankflo: "Docker (5 min)", competitor: product.selfHosted ? "Available" : "Not available" },
      { feature: "Open Source", rankflo: "MIT", competitor: product.openSource ? "Yes" : "Proprietary" },
      { feature: "Headless API", rankflo: "tRPC + REST + SDK", competitor: product.headlessApi ? "Yes" : "Limited" },
      { feature: "Custom Domain", rankflo: "Free", competitor: customDomainCell(product) },
      { feature: "Pricing", rankflo: "Free + $5/mo Pro", competitor: product.pricingSummary },
    ],
  };
}

// Build full direct comparison map — hand-crafted entries + auto-generated for the rest
export const ALL_DIRECT_COMPARISONS: Record<string, ComparisonData> = (() => {
  const map: Record<string, ComparisonData> = { ...DIRECT_COMPARISONS };
  for (const [slug, product] of Object.entries(PRODUCTS)) {
    const key = `rankflo-vs-${slug}`;
    if (!(key in map)) {
      map[key] = autoDirectComparison(product);
    }
  }
  return map;
})();

// Third-party comparisons — X vs Y (no RankFlo). RankFlo is positioned as "also consider" at top.
// Curated list of high-search-volume pairs.
export const THIRD_PARTY_PAIRS: Array<[string, string]> = [
  ["wordpress", "ghost"],
  ["wordpress", "medium"],
  ["wordpress", "substack"],
  ["wordpress", "webflow"],
  ["wordpress", "wix"],
  ["wordpress", "squarespace"],
  ["wordpress", "hashnode"],
  ["wordpress", "contentful"],
  ["wordpress", "strapi"],
  ["wordpress", "sanity"],
  ["wordpress", "notion"],
  ["wordpress", "blogger"],
  ["ghost", "medium"],
  ["ghost", "substack"],
  ["ghost", "hashnode"],
  ["ghost", "beehiiv"],
  ["ghost", "webflow"],
  ["ghost", "contentful"],
  ["ghost", "wordpress"],
  ["medium", "substack"],
  ["medium", "hashnode"],
  ["medium", "ghost"],
  ["medium", "wordpress"],
  ["medium", "devto"],
  ["substack", "beehiiv"],
  ["substack", "ghost"],
  ["substack", "convertkit"],
  ["substack", "medium"],
  ["substack", "wordpress"],
  ["beehiiv", "substack"],
  ["beehiiv", "convertkit"],
  ["beehiiv", "ghost"],
  ["contentful", "strapi"],
  ["contentful", "sanity"],
  ["contentful", "storyblok"],
  ["contentful", "prismic"],
  ["contentful", "hygraph"],
  ["contentful", "datocms"],
  ["contentful", "payload"],
  ["contentful", "directus"],
  ["sanity", "contentful"],
  ["sanity", "strapi"],
  ["sanity", "storyblok"],
  ["sanity", "prismic"],
  ["sanity", "payload"],
  ["sanity", "hygraph"],
  ["strapi", "contentful"],
  ["strapi", "sanity"],
  ["strapi", "directus"],
  ["strapi", "payload"],
  ["strapi", "keystone"] as [string, string],
  ["payload", "strapi"],
  ["payload", "sanity"],
  ["payload", "directus"],
  ["payload", "contentful"],
  ["storyblok", "contentful"],
  ["storyblok", "sanity"],
  ["storyblok", "prismic"],
  ["prismic", "contentful"],
  ["prismic", "sanity"],
  ["prismic", "storyblok"],
  ["hygraph", "contentful"],
  ["hygraph", "sanity"],
  ["datocms", "contentful"],
  ["datocms", "sanity"],
  ["hashnode", "devto"],
  ["hashnode", "medium"],
  ["hashnode", "ghost"],
  ["hashnode", "substack"],
  ["devto", "hashnode"],
  ["devto", "medium"],
  ["webflow", "wordpress"],
  ["webflow", "squarespace"],
  ["webflow", "wix"],
  ["wix", "squarespace"],
  ["wix", "wordpress"],
  ["squarespace", "wordpress"],
  ["squarespace", "wix"],
  ["squarespace", "webflow"],
  ["notion", "wordpress"],
  ["notion", "ghost"],
  ["notion", "medium"],
  ["hugo", "jekyll"],
  ["hugo", "astro"],
  ["jekyll", "hugo"],
  ["astro", "hugo"],
  ["astro", "jekyll"],
  ["astro", "docusaurus"],
  ["docusaurus", "gitbook"],
  ["docusaurus", "mintlify"],
  ["gitbook", "mintlify"],
  ["gitbook", "docusaurus"],
  ["mintlify", "gitbook"],
  ["mintlify", "docusaurus"],
  ["convertkit", "substack"],
  ["convertkit", "beehiiv"],
  ["blogger", "wordpress"],
  ["blogger", "medium"],
  ["tumblr", "wordpress"],
  ["tumblr", "medium"],
  ["buttercms", "contentful"],
  ["buttercms", "sanity"],
  ["buttercms", "strapi"],
];

// Filter out any pairs where a product isn't in our catalog
export const VALID_THIRD_PARTY_PAIRS = THIRD_PARTY_PAIRS.filter(
  ([a, b]) => PRODUCTS[a] && PRODUCTS[b]
);

// Generate slug for third-party comparison
export function thirdPartySlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}

// Parse a slug — returns either a direct (rankflo-vs-X) or third-party (a-vs-b) comparison
export type ParsedComparisonSlug =
  | { type: "direct"; product: Product; data: ComparisonData }
  | { type: "third-party"; a: Product; b: Product }
  | { type: "not-found" };

export function parseComparisonSlug(slug: string): ParsedComparisonSlug {
  if (slug.startsWith("rankflo-vs-")) {
    const productSlug = slug.replace("rankflo-vs-", "");
    const product = PRODUCTS[productSlug];
    const data = ALL_DIRECT_COMPARISONS[slug];
    if (product && data) return { type: "direct", product, data };
    return { type: "not-found" };
  }

  // Third-party: a-vs-b
  const match = slug.match(/^([a-z0-9]+)-vs-([a-z0-9]+)$/);
  if (match) {
    const aSlug = match[1];
    const bSlug = match[2];
    if (aSlug && bSlug) {
      const a = PRODUCTS[aSlug];
      const b = PRODUCTS[bSlug];
      if (a && b && a.slug !== b.slug) return { type: "third-party", a, b };
    }
  }
  return { type: "not-found" };
}

// Map overlapping /compare/ slugs → corresponding blog post slugs
// For these, we set canonical to the blog post (longer, better-ranked content)
// to avoid keyword cannibalization.
export const BLOG_CANONICAL_MAP: Record<string, string> = {
  "rankflo-vs-wordpress": "rankflo-vs-wordpress-developers",
  "rankflo-vs-ghost": "rankflo-vs-ghost-comparison",
  "rankflo-vs-medium": "rankflo-vs-medium",
  "rankflo-vs-hashnode": "rankflo-vs-hashnode",
  "rankflo-vs-contentful": "rankflo-vs-contentful-comparison",
  "rankflo-vs-strapi": "rankflo-vs-strapi-headless-cms",
  "rankflo-vs-sanity": "rankflo-vs-sanity-comparison",
};

// All slugs that should be in the sitemap
export function getAllComparisonSlugs(): string[] {
  const direct = Object.keys(ALL_DIRECT_COMPARISONS);
  const thirdParty = VALID_THIRD_PARTY_PAIRS.map(([a, b]) => thirdPartySlug(a, b));
  return [...direct, ...thirdParty];
}
