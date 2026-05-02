export interface IntegrationData {
  slug: string;
  name: string;
  category: "framework" | "hosting" | "automation" | "tool" | "migration";
  tagline: string;
  description: string;
  benefits: string[];
  codeExample?: string;
  codeLanguage?: string;
  faq: Array<{ q: string; a: string }>;
  logo?: string;
}

export const INTEGRATIONS: Record<string, IntegrationData> = {
  // === FRAMEWORKS ===
  nextjs: {
    slug: "nextjs",
    name: "Next.js",
    category: "framework",
    tagline: "Blog + CMS for Next.js 15",
    description: "RankFlo is built for Next.js. Use our TypeScript SDK with App Router, Server Components, and ISR to build blazing-fast content sites.",
    benefits: [
      "App Router & Server Components support",
      "TypeScript SDK with full type inference",
      "ISR & on-demand revalidation via webhooks",
      "Built on Next.js 15 ourselves",
      "Works with Vercel, Netlify, self-hosted",
    ],
    codeExample: `import { createRankfloClient } from "@rankflo/sdk";

const client = createRankfloClient({
  apiKey: process.env.RANKFLO_API_KEY!,
});

export default async function BlogPage() {
  const { data: posts } = await client.content.list();
  return posts.map((post) => <article key={post.slug}>{post.title}</article>);
}`,
    codeLanguage: "typescript",
    faq: [
      { q: "Does RankFlo work with Next.js App Router?", a: "Yes — RankFlo is built for Next.js 15 App Router. Use our TypeScript SDK in Server Components for zero-JS content rendering." },
      { q: "How do I revalidate when content changes?", a: "Use webhooks. Configure a RankFlo webhook to POST to your Next.js API route on post.published/updated. In the handler, call revalidatePath or revalidateTag." },
      { q: "Can I self-host?", a: "Yes — RankFlo is MIT licensed and runs in Docker alongside your Next.js app or on separate infrastructure." },
    ],
  },
  astro: {
    slug: "astro",
    name: "Astro",
    category: "framework",
    tagline: "Content API for Astro content collections",
    description: "Astro ships zero JS by default. Pair it with RankFlo's REST API for a blazing-fast, SEO-first content stack.",
    benefits: [
      "REST API + content collections integration",
      "Zero JS by default with Astro",
      "Image optimization built into RankFlo",
      "Webhook-based rebuilds",
      "Works with any Astro hosting",
    ],
    codeExample: `// src/pages/blog/[slug].astro
import { defineCollection } from "astro:content";
import { createRankfloClient } from "@rankflo/sdk";

const client = createRankfloClient({ apiKey: import.meta.env.RANKFLO_API_KEY });

export async function getStaticPaths() {
  const { data: posts } = await client.content.list();
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}`,
    codeLanguage: "typescript",
    faq: [
      { q: "How do I use RankFlo with Astro content collections?", a: "Fetch content via our REST API in getStaticPaths, then render via Astro's standard component model." },
      { q: "Can I trigger rebuilds when posts publish?", a: "Yes — use webhooks to ping your hosting provider's rebuild endpoint (Netlify, Vercel, Cloudflare Pages)." },
    ],
  },
  nuxt: {
    slug: "nuxt",
    name: "Nuxt",
    category: "framework",
    tagline: "Vue-based blog + CMS for Nuxt",
    description: "Use RankFlo's REST API with Nuxt 3. Full TypeScript support, SSR, ISR, and auto-generated routes.",
    benefits: [
      "Nuxt 3 compatible",
      "REST API with TypeScript",
      "useFetch / useAsyncData support",
      "Works with Nuxt's ISR",
      "Self-hostable or SaaS",
    ],
    codeExample: `// pages/blog/[slug].vue
const { data: post } = await useFetch(\`/api/content/\${route.params.slug}\`);`,
    codeLanguage: "typescript",
    faq: [
      { q: "Does RankFlo work with Nuxt SSR?", a: "Yes — fetch content server-side in useAsyncData or useFetch, then hydrate on the client." },
    ],
  },
  sveltekit: {
    slug: "sveltekit",
    name: "SvelteKit",
    category: "framework",
    tagline: "Headless CMS for SvelteKit",
    description: "Use RankFlo with SvelteKit's load functions for fast, SEO-friendly content sites. TypeScript SDK included.",
    benefits: [
      "SvelteKit load functions",
      "TypeScript SDK",
      "SSR + CSR support",
      "Image optimization",
      "Works with any SvelteKit host",
    ],
    codeExample: `// +page.server.ts
export async function load({ params }) {
  const { data } = await client.content.get({ slug: params.slug });
  return { post: data };
}`,
    codeLanguage: "typescript",
    faq: [
      { q: "How does RankFlo integrate with SvelteKit?", a: "Fetch content in load functions, then render in your Svelte components. Full TypeScript support throughout." },
    ],
  },
  remix: {
    slug: "remix",
    name: "Remix",
    category: "framework",
    tagline: "Blog CMS for Remix + React Router",
    description: "RankFlo pairs with Remix's loader pattern for progressive-enhancement content sites.",
    benefits: [
      "Works with Remix loaders",
      "TypeScript SDK",
      "Full SSR",
      "React 19 compatible",
      "Self-hostable",
    ],
    codeExample: `// routes/blog.$slug.tsx
export async function loader({ params }: LoaderArgs) {
  const { data } = await client.content.get({ slug: params.slug });
  return json({ post: data });
}`,
    codeLanguage: "typescript",
    faq: [
      { q: "Does RankFlo support Remix v2?", a: "Yes — and React Router 7. Use our SDK in loaders for server-side data fetching." },
    ],
  },
  gatsby: {
    slug: "gatsby",
    name: "Gatsby",
    category: "framework",
    tagline: "Source plugin for Gatsby sites",
    description: "Migrating from Gatsby? RankFlo provides a REST source that works with Gatsby's data layer.",
    benefits: [
      "REST API for Gatsby source",
      "GraphQL via transformers",
      "Webhook-based rebuilds",
      "Image optimization",
      "Migration path from Gatsby-only setups",
    ],
    faq: [
      { q: "How do I migrate from Gatsby to RankFlo?", a: "Fetch content via our REST API in gatsby-node.js createPages, or migrate fully to Next.js/Astro with our SDK." },
    ],
  },
  hugo: {
    slug: "hugo",
    name: "Hugo",
    category: "framework",
    tagline: "Hugo data source for RankFlo content",
    description: "Use RankFlo as the content layer for Hugo sites — fetch content at build time via REST.",
    benefits: [
      "REST API to Hugo data files",
      "Content versioning",
      "Image optimization",
      "Webhook rebuilds",
      "Faster authoring vs Markdown-only",
    ],
    faq: [
      { q: "How do I use RankFlo with Hugo?", a: "Fetch content via REST in a build script, convert to Hugo's Markdown or data files, then hugo build." },
    ],
  },
  jekyll: {
    slug: "jekyll",
    name: "Jekyll",
    category: "framework",
    tagline: "Modern content for Jekyll sites",
    description: "Keep Jekyll for rendering, use RankFlo for authoring. Pull content via REST into Jekyll's collections.",
    benefits: [
      "REST integration",
      "GitHub Pages compatible",
      "Image optimization",
      "Webhook rebuilds",
      "Non-technical author UI",
    ],
    faq: [
      { q: "Does RankFlo work with GitHub Pages?", a: "Yes — fetch content via REST in a GitHub Action, commit generated Markdown to the Pages repo, and Pages builds automatically." },
    ],
  },
  eleventy: {
    slug: "eleventy",
    name: "Eleventy",
    category: "framework",
    tagline: "Data source for 11ty sites",
    description: "Use RankFlo as an 11ty global data source. Author via our UI, render via 11ty.",
    benefits: [
      "Eleventy JS data files",
      "REST fetching",
      "Image optimization",
      "Works with any 11ty theme",
      "Webhook rebuilds",
    ],
    faq: [
      { q: "How do I source RankFlo content in 11ty?", a: "Create _data/posts.js that fetches from RankFlo via REST. 11ty will expose posts as a global." },
    ],
  },
  docusaurus: {
    slug: "docusaurus",
    name: "Docusaurus",
    category: "framework",
    tagline: "Blog extension for Docusaurus",
    description: "Docusaurus is great for docs. Use RankFlo for your marketing blog and pull it into the same site.",
    benefits: [
      "Blog + docs in one site",
      "REST API integration",
      "Shared navigation",
      "Webhook rebuilds",
      "Better SEO than Docusaurus blog",
    ],
    faq: [
      { q: "Why add RankFlo to a Docusaurus site?", a: "Docusaurus blog is basic. RankFlo adds AI content, SEO scoring, and a proper editor while keeping docs in Docusaurus." },
    ],
  },

  // === HOSTING ===
  vercel: {
    slug: "vercel",
    name: "Vercel",
    category: "hosting",
    tagline: "Deploy RankFlo-powered sites to Vercel",
    description: "RankFlo pairs perfectly with Vercel. Use our SDK in Next.js, benefit from ISR, and trigger revalidation via webhooks.",
    benefits: [
      "Zero-config Next.js deploys",
      "ISR with webhook revalidation",
      "Edge runtime compatible",
      "Vercel Deploy Hook integration",
      "Preview deployments for content branches",
    ],
    faq: [
      { q: "Does RankFlo work with Vercel?", a: "Yes — the Next.js SDK is optimized for Vercel's platform including ISR, edge runtime, and Deploy Hooks." },
    ],
  },
  netlify: {
    slug: "netlify",
    name: "Netlify",
    category: "hosting",
    tagline: "Deploy content sites to Netlify",
    description: "Build static or SSR sites with RankFlo content and host them on Netlify. Webhook integration for automatic rebuilds.",
    benefits: [
      "Build hook integration",
      "Works with Next.js, Astro, SvelteKit, Gatsby, 11ty, Hugo",
      "Image CDN",
      "Preview deployments",
      "Forms + functions for lead capture",
    ],
    faq: [
      { q: "How do I trigger Netlify rebuilds on content changes?", a: "Create a build hook in Netlify and configure a RankFlo webhook to POST to it on post.published/updated." },
    ],
  },
  cloudflare: {
    slug: "cloudflare",
    name: "Cloudflare Pages",
    category: "hosting",
    tagline: "Host RankFlo-powered sites on Cloudflare",
    description: "Deploy your Next.js or Astro site to Cloudflare Pages, serve RankFlo content from the edge worldwide.",
    benefits: [
      "Global edge deployment",
      "Cloudflare Workers compatible",
      "Free tier with 500 builds/month",
      "Build hook integration",
      "DDoS protection free",
    ],
    faq: [
      { q: "Can I deploy RankFlo itself to Cloudflare?", a: "RankFlo's self-hosted stack (Postgres, Node.js) runs on any Linux server. Pages is for the consumer site that uses our API." },
    ],
  },
  railway: {
    slug: "railway",
    name: "Railway",
    category: "hosting",
    tagline: "Deploy self-hosted RankFlo to Railway",
    description: "Railway makes deploying the full RankFlo stack (Postgres, Node, Redis) straightforward. One-click deploys coming soon.",
    benefits: [
      "Postgres + Redis managed",
      "Docker deployments",
      "Automatic HTTPS",
      "Preview environments",
      "Starts at $5/mo",
    ],
    faq: [
      { q: "How do I deploy RankFlo to Railway?", a: "Create a new Railway project, add Postgres + Redis services, and deploy the RankFlo Docker image. Connect your domain and you're live." },
    ],
  },
  fly: {
    slug: "fly",
    name: "Fly.io",
    category: "hosting",
    tagline: "Globally distributed RankFlo on Fly.io",
    description: "Fly.io runs Docker containers globally. Perfect for self-hosting RankFlo close to your users.",
    benefits: [
      "Global edge deployment",
      "Fly Postgres integration",
      "Docker-native",
      "Built-in load balancing",
      "Generous free tier",
    ],
    faq: [
      { q: "Is RankFlo good for multi-region?", a: "Yes — deploy the web tier globally on Fly.io, keep the Postgres primary near your team, use read replicas in other regions." },
    ],
  },
  render: {
    slug: "render",
    name: "Render",
    category: "hosting",
    tagline: "Deploy RankFlo to Render",
    description: "Render supports Docker deploys, managed Postgres, and auto-scaling. Good fit for self-hosted RankFlo.",
    benefits: [
      "Managed Postgres + Redis",
      "Auto-scaling containers",
      "GitOps deploys",
      "Free SSL",
      "DDoS protection",
    ],
    faq: [
      { q: "How much does RankFlo cost on Render?", a: "Starter plan: ~$7/mo for web + $7/mo for Postgres = ~$14/mo all-in for a small RankFlo instance." },
    ],
  },
  docker: {
    slug: "docker",
    name: "Docker",
    category: "hosting",
    tagline: "Self-host RankFlo with Docker",
    description: "RankFlo ships as a Docker Compose stack. Self-host in 5 minutes on any Linux server.",
    benefits: [
      "Single docker-compose.yml",
      "Postgres + Redis + web bundled",
      "5-minute setup",
      "Works with Hetzner, DigitalOcean, Linode, AWS",
      "MIT licensed",
    ],
    codeExample: `# docker-compose.yml
version: "3.8"
services:
  web:
    image: rankflo/web:latest
    environment:
      DATABASE_URL: postgres://...
      REDIS_URL: redis://...
    ports:
      - "3000:3000"
  postgres:
    image: postgres:16
  redis:
    image: redis:7`,
    codeLanguage: "yaml",
    faq: [
      { q: "How do I self-host RankFlo with Docker?", a: "Clone the repo, copy .env.example to .env, run docker compose up -d. Site is live at :3000." },
    ],
  },
  kubernetes: {
    slug: "kubernetes",
    name: "Kubernetes",
    category: "hosting",
    tagline: "Run RankFlo on Kubernetes",
    description: "For enterprise deployments, RankFlo runs on Kubernetes with Helm charts and official Postgres operators.",
    benefits: [
      "Helm chart (coming soon)",
      "Horizontal pod autoscaling",
      "Multi-region deploys",
      "Works with any K8s provider",
      "Production-proven at scale",
    ],
    faq: [
      { q: "Is there a Helm chart for RankFlo?", a: "Community-maintained charts exist; an official chart is on the roadmap. Use the Docker image with your existing K8s manifests." },
    ],
  },

  // === AUTOMATION ===
  zapier: {
    slug: "zapier",
    name: "Zapier",
    category: "automation",
    tagline: "Connect RankFlo to 7000+ apps via Zapier",
    description: "Use RankFlo webhooks with Zapier to automate publishing, notifications, and data sync.",
    benefits: [
      "Webhook triggers for post.published",
      "Works with 7000+ apps",
      "No-code automation",
      "Bi-directional sync",
      "Free tier available",
    ],
    faq: [
      { q: "What Zapier automations work with RankFlo?", a: "Post Slack on publish, sync to HubSpot, tweet new posts, email subscribers via Mailchimp — any webhook-based workflow." },
    ],
  },
  make: {
    slug: "make",
    name: "Make (Integromat)",
    category: "automation",
    tagline: "Automate RankFlo workflows with Make",
    description: "Make (formerly Integromat) lets you build visual workflows around RankFlo's REST API and webhooks.",
    benefits: [
      "Visual workflow builder",
      "REST API integration",
      "Webhook triggers",
      "More complex logic than Zapier",
      "Cheaper than Zapier at scale",
    ],
    faq: [
      { q: "Why Make vs Zapier?", a: "Make supports more complex logic (loops, branches, error handling) and is cheaper per operation at scale." },
    ],
  },
  n8n: {
    slug: "n8n",
    name: "n8n",
    category: "automation",
    tagline: "Self-hosted automation for RankFlo",
    description: "n8n is self-hostable automation. Pair it with self-hosted RankFlo for a fully open-source content pipeline.",
    benefits: [
      "Self-hostable (fair-code)",
      "Visual workflows",
      "HTTP + webhook support",
      "300+ integrations",
      "Free if self-hosted",
    ],
    faq: [
      { q: "Why self-host automation?", a: "For privacy, cost, and to keep data inside your infra. Pairs perfectly with self-hosted RankFlo." },
    ],
  },
  github: {
    slug: "github",
    name: "GitHub Actions",
    category: "automation",
    tagline: "CI/CD workflows for RankFlo-powered sites",
    description: "Use GitHub Actions with RankFlo webhooks to trigger rebuilds, run tests, and deploy on content changes.",
    benefits: [
      "Workflow on webhook",
      "Native git integration",
      "Generous free tier",
      "Matrix builds",
      "Secret management",
    ],
    faq: [
      { q: "How do I trigger a GitHub Action on post publish?", a: "Use the repository_dispatch webhook with a custom event type. Your Action listens and rebuilds/deploys." },
    ],
  },

  // === TOOLS ===
  stripe: {
    slug: "stripe",
    name: "Stripe",
    category: "tool",
    tagline: "Paid memberships with Stripe",
    description: "RankFlo's paid memberships run on Stripe. Charge for premium content, manage subscriptions, keep 100% of revenue (minus Stripe fees).",
    benefits: [
      "Native Stripe integration",
      "Subscription billing",
      "Checkout flows built-in",
      "Customer portal",
      "0% platform fee",
    ],
    faq: [
      { q: "What does RankFlo charge on paid memberships?", a: "0% platform fee. You pay only Stripe processing fees (typically 2.9% + 30¢)." },
    ],
  },
  slack: {
    slug: "slack",
    name: "Slack",
    category: "tool",
    tagline: "Post to Slack on content publish",
    description: "Webhook RankFlo to Slack. Notify your team when posts publish, updates go live, or new subscribers sign up.",
    benefits: [
      "Webhook to Slack channels",
      "Custom message formatting",
      "Team notifications",
      "Works with Slack workflow builder",
      "Free on any plan",
    ],
    faq: [
      { q: "How do I post to Slack when publishing?", a: "Create an incoming webhook in Slack, then configure a RankFlo webhook to POST to it on post.published." },
    ],
  },
  discord: {
    slug: "discord",
    name: "Discord",
    category: "tool",
    tagline: "Publish to Discord from RankFlo",
    description: "Use Discord webhooks with RankFlo to notify your community when new posts go live.",
    benefits: [
      "Discord webhook support",
      "Rich embed messages",
      "Role pings on publish",
      "Works with any server",
      "Free",
    ],
    faq: [
      { q: "Can I post to multiple Discord servers?", a: "Yes — create multiple RankFlo webhooks, each pointing to a different Discord channel." },
    ],
  },
  posthog: {
    slug: "posthog",
    name: "PostHog",
    category: "tool",
    tagline: "Advanced analytics with PostHog",
    description: "Use RankFlo's built-in analytics for basic metrics, add PostHog for deep product/funnel analysis.",
    benefits: [
      "Drop-in PostHog snippet",
      "Event tracking across site",
      "Funnel + session recording",
      "Self-hostable like RankFlo",
      "Free tier",
    ],
    faq: [
      { q: "Do I need PostHog if RankFlo has analytics?", a: "No for basic needs. Yes if you want funnels, session replay, A/B testing, or product-wide event tracking." },
    ],
  },
  plausible: {
    slug: "plausible",
    name: "Plausible",
    category: "tool",
    tagline: "Privacy-first analytics alongside RankFlo",
    description: "Use Plausible for EU-friendly, cookieless analytics. RankFlo has similar built-in — choose based on your stack preferences.",
    benefits: [
      "Cookieless, GDPR-safe",
      "Simple dashboard",
      "Self-hostable (GPLv3)",
      "Lightweight script (~1KB)",
      "Blog-focused metrics",
    ],
    faq: [
      { q: "Should I use Plausible or RankFlo analytics?", a: "RankFlo's built-in is cookieless too — use it for blog-specific metrics. Plausible if you need to aggregate analytics across multiple sites." },
    ],
  },
  google_analytics: {
    slug: "google-analytics",
    name: "Google Analytics",
    category: "tool",
    tagline: "GA4 alongside RankFlo",
    description: "RankFlo supports adding GA4 or any analytics snippet. Compare data with RankFlo's built-in cookieless analytics.",
    benefits: [
      "GA4 snippet integration",
      "RankFlo analytics as backup",
      "Works with Tag Manager",
      "Supports enhanced ecommerce events",
      "Compliant with consent modes",
    ],
    faq: [
      { q: "Does RankFlo work with GTM?", a: "Yes — add your GTM container ID in settings. Consent Mode v2 supported." },
    ],
  },
  mailchimp: {
    slug: "mailchimp",
    name: "Mailchimp",
    category: "tool",
    tagline: "Sync email subscribers with Mailchimp",
    description: "Capture emails on your RankFlo blog, sync them to Mailchimp for email campaigns.",
    benefits: [
      "Webhook to Mailchimp on email capture",
      "Tag segmentation",
      "Double opt-in",
      "Campaign builder in Mailchimp",
      "Works with all Mailchimp plans",
    ],
    faq: [
      { q: "How do I sync RankFlo emails to Mailchimp?", a: "Use Zapier or the REST webhook to POST new emails to Mailchimp's List API." },
    ],
  },

  // === MIGRATIONS ===
  wordpress_migration: {
    slug: "wordpress-migration",
    name: "WordPress Migration",
    category: "migration",
    tagline: "Import WordPress to RankFlo",
    description: "Migrate from WordPress to RankFlo in one click. We support the standard WXR export with images, categories, tags, and authors.",
    benefits: [
      "One-click WXR import",
      "Preserves images + media",
      "Categories → tags mapping",
      "Author preservation",
      "301 redirect generator",
    ],
    faq: [
      { q: "How long does a WordPress migration take?", a: "For most blogs, 5-15 minutes. Large sites (5000+ posts) may take 30-60 minutes. Run the import, then update DNS." },
    ],
  },
  ghost_migration: {
    slug: "ghost-migration",
    name: "Ghost Migration",
    category: "migration",
    tagline: "Import Ghost to RankFlo",
    description: "Migrate from Ghost to RankFlo using Ghost's JSON export. Posts, pages, tags, and members all transferred.",
    benefits: [
      "Ghost JSON export import",
      "Posts + pages",
      "Tags + authors",
      "Members list (optional)",
      "301 redirects",
    ],
    faq: [
      { q: "Can I migrate Ghost members to RankFlo?", a: "Yes — import members via CSV. Paid subscriptions require Stripe re-auth in RankFlo for compliance." },
    ],
  },
  medium_migration: {
    slug: "medium-migration",
    name: "Medium Migration",
    category: "migration",
    tagline: "Import from Medium to RankFlo",
    description: "Export your Medium posts as HTML, import to RankFlo. Preserves content, images, and metadata.",
    benefits: [
      "Medium HTML export import",
      "Image preservation",
      "Canonical URL handling",
      "Category mapping",
      "Series → tags",
    ],
    faq: [
      { q: "Should I canonical back to Medium after migrating?", a: "Usually no — canonical to your new RankFlo URL so Google treats your site as primary. Leave Medium as-is or delete." },
    ],
  },
  substack_migration: {
    slug: "substack-migration",
    name: "Substack Migration",
    category: "migration",
    tagline: "Import Substack to RankFlo",
    description: "Move your Substack posts, subscribers, and paid members to RankFlo. Save 10% on paid subs immediately.",
    benefits: [
      "Substack CSV export import",
      "Subscriber list migration",
      "Paid members transfer (via Stripe)",
      "Posts + images preserved",
      "Custom domain setup",
    ],
    faq: [
      { q: "Can I keep my Substack domain?", a: "Yes — Substack allows CNAME transfer to another platform. Update your DNS and keep your subscribers." },
    ],
  },
};

export const ALL_INTEGRATION_SLUGS = Object.keys(INTEGRATIONS);

export function getIntegration(slug: string): IntegrationData | undefined {
  return INTEGRATIONS[slug];
}
