export interface TopicData {
  title: string;
  headline: string;
  description: string;
  features: string[];
  useCases: string[];
  // Optional hero paragraphs for more content-rich pages
  intro?: string;
  whyItMatters?: string[];
}

export const TOPIC_DATA: Record<string, TopicData> = {
  // === ORIGINAL 10 TOPICS ===
  "blog-platform": {
    title: "Blog Platform",
    headline: "The modern blog platform for teams and creators",
    description: "RankFlo is an open-source blog platform with AI content generation, built-in analytics, SEO scoring, and a headless CMS API. Start free or self-host.",
    features: ["AI-powered content generation", "Built-in analytics dashboard", "Real-time SEO scoring", "Headless CMS API", "Full-text search", "Team collaboration with RBAC"],
    useCases: ["Company blogs", "Personal blogs", "Developer documentation", "Product updates", "Content marketing"],
  },
  "headless-cms": {
    title: "Headless CMS",
    headline: "A headless CMS that developers actually love",
    description: "RankFlo provides type-safe tRPC and REST APIs, a TypeScript SDK, webhooks, and full self-hosting support. Build anything on top of your content.",
    features: ["Type-safe tRPC API", "REST + OpenAPI endpoints", "TypeScript SDK", "Webhook system", "GraphQL support", "Content versioning"],
    useCases: ["Next.js sites", "React applications", "Static site generators", "Mobile apps", "E-commerce storefronts"],
  },
  "content-management": {
    title: "Content Management System",
    headline: "Content management that scales with your team",
    description: "RankFlo offers a rich block editor, team collaboration with granular roles, scheduled publishing, and media management. All open source.",
    features: ["14+ block types", "Drag-and-drop editor", "Version history", "Scheduled publishing", "Media optimization", "Multi-language support"],
    useCases: ["Marketing teams", "Editorial workflows", "Multi-author blogs", "Content agencies", "Enterprise publishing"],
  },
  "seo-tools": {
    title: "SEO Tools for Bloggers",
    headline: "Built-in SEO tools that rank your content higher",
    description: "Real-time SEO scoring, meta optimization, structured data generation, keyword analysis, and internal linking suggestions. All built into your editor.",
    features: ["Real-time SEO score", "Meta tag optimization", "JSON-LD structured data", "Keyword density analysis", "Internal linking suggestions", "Search analytics"],
    useCases: ["Content marketers", "SEO professionals", "Growth teams", "Bloggers", "Affiliate marketers"],
  },
  "ai-content-generation": {
    title: "AI Content Generation",
    headline: "AI that writes content matching your brand voice",
    description: "Generate SEO-optimized blog posts with RankFlo's AI pipeline. Research, outline, draft, and optimize — all automated while maintaining your unique voice.",
    features: ["Brand voice matching", "Multi-step AI pipeline", "Keyword targeting", "Readability optimization", "Topic research", "Content calendar generation"],
    useCases: ["Content scaling", "Idea generation", "First drafts", "SEO content", "Product descriptions"],
  },
  "self-hosted-blog": {
    title: "Self-Hosted Blog Platform",
    headline: "Self-host your blog. Own your data completely.",
    description: "Deploy RankFlo on your own infrastructure with Docker in under 5 minutes. PostgreSQL, Redis, and optional Meilisearch. MIT licensed, forever free.",
    features: ["Docker Compose setup", "PostgreSQL + Redis", "Optional Meilisearch", "MIT License", "Full data ownership", "No vendor lock-in"],
    useCases: ["Privacy-conscious teams", "Enterprise deployments", "Developer blogs", "On-premise requirements", "Data sovereignty"],
  },
  "blogging-software": {
    title: "Blogging Software",
    headline: "Modern blogging software for the AI era",
    description: "RankFlo combines a powerful editor, AI content generation, built-in analytics, and developer-friendly APIs into one open-source platform.",
    features: ["Rich text editor", "AI writing assistant", "Built-in analytics", "SEO optimization", "Custom domains", "API access"],
    useCases: ["Professional bloggers", "Tech companies", "Content creators", "Developer advocates", "Thought leaders"],
  },
  "content-marketing": {
    title: "Content Marketing Platform",
    headline: "The content marketing engine that drives organic growth",
    description: "Plan, create, optimize, and measure your content marketing with RankFlo. AI topic research, content calendars, SEO scoring, and traffic analytics.",
    features: ["AI topic research", "Content calendar", "Competitor analysis", "Traffic analytics", "Conversion tracking", "Team workflows"],
    useCases: ["B2B marketing", "SaaS companies", "E-commerce brands", "Agencies", "Startups"],
  },
  "technical-writing": {
    title: "Technical Writing Platform",
    headline: "Technical writing made beautiful and discoverable",
    description: "Code blocks with syntax highlighting, API documentation, version control, and SEO optimization. Built for developers who write.",
    features: ["Syntax highlighting", "Code block support", "API documentation", "Version history", "Full-text search", "Custom domains"],
    useCases: ["Engineering blogs", "API documentation", "Tutorials", "Changelogs", "Knowledge bases"],
  },
  "developer-blog": {
    title: "Developer Blog Platform",
    headline: "The blog platform built by developers, for developers",
    description: "Type-safe APIs, self-hosting, open source, and a modern stack. RankFlo is the developer blog platform that respects your workflow.",
    features: ["TypeScript-first", "Open source (MIT)", "Self-hostable", "tRPC + REST API", "CLI tools", "Git integration"],
    useCases: ["Personal dev blogs", "Company engineering blogs", "Open source projects", "Developer portfolios", "Tech newsletters"],
  },

  // === INDUSTRY × USE CASE MATRIX — 40+ NEW TOPICS ===
  "saas-blog": {
    title: "SaaS Blog Platform",
    headline: "The blog platform SaaS companies use to drive MRR",
    description: "RankFlo is the content engine built for SaaS companies — SEO-optimized blog, product changelog, and case studies, all connected to your marketing funnel.",
    features: ["Multi-site (blog + changelog + docs)", "Conversion tracking to signup", "Integrations with Stripe, PostHog", "SEO built for competitive queries", "Team authoring with RBAC", "Custom CTAs per post"],
    useCases: ["SaaS product blogs", "Changelog sites", "Case study hubs", "Help documentation", "Marketing landing pages"],
    intro: "Every SaaS needs a blog that actually converts. RankFlo is built to turn organic traffic into trial signups and paid customers.",
  },
  "agency-blog": {
    title: "Agency Blog Platform",
    headline: "One platform for your agency and every client",
    description: "Manage multiple client blogs from a single RankFlo workspace. White-label, custom domains per client, team permissions, and unified billing.",
    features: ["Multi-tenant workspaces", "Custom domains per client", "White-label publishing", "Client access controls", "Unified team billing", "Client reporting dashboards"],
    useCases: ["Content marketing agencies", "SEO agencies", "Freelancer networks", "PR agencies", "Digital consultancies"],
  },
  "ecommerce-blog": {
    title: "Ecommerce Blog Platform",
    headline: "Content marketing for ecommerce brands",
    description: "Drive organic traffic to your store with SEO-optimized content, product reviews, and buyer guides — all connected to your commerce stack.",
    features: ["Product schema generation", "Shopify/Woo integration", "Buyer guide templates", "Review/rating schema", "Affiliate link management", "Cross-sell content blocks"],
    useCases: ["DTC brands", "Shopify stores", "Amazon FBA businesses", "Affiliate sites", "Marketplace vendors"],
  },
  "startup-blog": {
    title: "Startup Blog Platform",
    headline: "Launch your startup blog in 5 minutes",
    description: "Every startup needs a blog. RankFlo gets you from zero to publishing in 5 minutes with AI content, SEO scoring, and a modern editor — free tier included.",
    features: ["5-minute setup", "AI content generation", "Free tier", "Team invites", "Custom domain on free", "Investor update templates"],
    useCases: ["Pre-seed founders", "YC batch companies", "Product Hunt launches", "Angel-funded startups", "Solo founders"],
  },
  "indie-hacker-blog": {
    title: "Indie Hacker Blog Platform",
    headline: "Build in public with a blog you own",
    description: "Indie hackers share their journey on a blog they control. RankFlo ships with MRR widgets, build-in-public templates, and a newsletter for your followers.",
    features: ["MRR widget blocks", "Build-in-public templates", "Newsletter + email capture", "Revenue graph embeds", "Twitter/X cross-posting", "Substack import"],
    useCases: ["Solo developers", "Microsaas founders", "Bootstrapped companies", "Building in public", "Maker journeys"],
  },
  "nonprofit-blog": {
    title: "Nonprofit Blog Platform",
    headline: "Tell your mission story. Grow your donor base.",
    description: "Nonprofits use RankFlo to publish mission updates, donor stories, and impact reports — with SEO tools to reach more supporters organically.",
    features: ["Donation CTA blocks", "Impact report templates", "Multi-language publishing", "Event schema", "Nonprofit pricing", "Volunteer signup integration"],
    useCases: ["Charities", "Advocacy groups", "Community organizations", "Faith-based nonprofits", "Educational nonprofits"],
  },
  "media-company-blog": {
    title: "Media Company Publishing Platform",
    headline: "Scale editorial operations across dozens of authors",
    description: "RankFlo's editorial workflows, RBAC, scheduled publishing, and multi-language support make it the platform for modern media companies.",
    features: ["Editorial workflows (draft → review → publish)", "Granular RBAC", "Multi-author profiles", "Category/tag taxonomies", "Multi-language translations", "AdSense integration"],
    useCases: ["Online magazines", "News sites", "Niche publications", "Podcasts with blogs", "Multi-brand publishers"],
  },
  "consultant-blog": {
    title: "Consultant Blog Platform",
    headline: "Showcase expertise. Generate leads.",
    description: "Independent consultants use RankFlo to publish thought leadership, case studies, and lead magnets — with SEO that ranks for commercial queries.",
    features: ["Case study templates", "Lead magnet gates", "Calendly integration", "Newsletter capture", "Proposal link tracking", "SEO for \"[industry] consultant\""],
    useCases: ["Management consultants", "Marketing consultants", "SaaS advisors", "Executive coaches", "Independent experts"],
  },
  "coach-blog": {
    title: "Coach Blog Platform",
    headline: "Turn content into coaching clients",
    description: "Life and business coaches use RankFlo's content + capture flow to convert readers into discovery calls and paid clients.",
    features: ["Discovery call booking", "Lead magnets", "Email sequences", "Testimonial schema", "Course integration", "Membership gating"],
    useCases: ["Life coaches", "Business coaches", "Health coaches", "Career coaches", "Relationship coaches"],
  },
  "newsletter-blog": {
    title: "Newsletter + Blog Platform",
    headline: "One platform for email and web",
    description: "Publish once, distribute everywhere. RankFlo's newsletter engine sends your posts by email AND indexes them on your blog for SEO.",
    features: ["Email delivery included", "Subscriber management", "SEO-indexed archive", "Paid subscriptions (Stripe)", "Free-to-paid conversion", "Import from Substack/Beehiiv"],
    useCases: ["Paid newsletters", "Indie newsletters", "Company newsletters", "Creator economy", "Niche communities"],
  },
  "podcast-blog": {
    title: "Podcast Blog Platform",
    headline: "Your podcast's show notes and archive",
    description: "RankFlo powers podcast show notes, transcripts, and episode pages — with SEO-optimized transcripts that rank your podcast higher in search.",
    features: ["Episode schema", "Transcript hosting", "Audio player embeds", "Guest profile pages", "Subscribe widgets", "RSS podcast feed"],
    useCases: ["Independent podcasts", "Company podcasts", "Educational podcasts", "Interview shows", "Narrative podcasts"],
  },

  // === USE CASE - CENTRIC TOPICS ===
  "changelog-platform": {
    title: "Changelog Platform",
    headline: "Ship updates. Tell your users.",
    description: "A beautiful public changelog is how modern SaaS builds trust. RankFlo gives you versioned release notes, RSS feed, and in-product changelog widgets.",
    features: ["Release note templates", "Version tagging", "RSS feed for subscribers", "In-product widget embed", "Email notifications", "Categorized updates (feature/fix/improvement)"],
    useCases: ["Product updates", "SaaS release notes", "API versioning", "Internal team updates", "Open source projects"],
  },
  "release-notes": {
    title: "Release Notes Software",
    headline: "Release notes your users actually read",
    description: "Publish release notes with screenshots, GIFs, and changelogs. RankFlo's release notes feature includes an in-app widget, RSS feed, and email digest.",
    features: ["Screenshot + GIF support", "In-app notification widget", "Email digest", "Version tagging", "Commit link attachments", "Subscriber list"],
    useCases: ["SaaS products", "Mobile apps", "API platforms", "Developer tools", "Enterprise software"],
  },
  "documentation-platform": {
    title: "Documentation Platform",
    headline: "Publish docs that users (and AI) actually find",
    description: "RankFlo's docs platform includes syntax highlighting, versioning, search, and llms.txt for AI visibility — everything your product needs.",
    features: ["Syntax highlighting", "Version management", "Full-text search", "OpenAPI import", "llms.txt for AI", "Algolia-style search"],
    useCases: ["API docs", "Product docs", "Developer guides", "Knowledge bases", "Internal wikis"],
  },
  "knowledge-base": {
    title: "Knowledge Base Software",
    headline: "Self-serve support that reduces tickets",
    description: "Cut support ticket volume with a searchable knowledge base. RankFlo's KB includes article ratings, search analytics, and in-app widgets.",
    features: ["Article ratings", "Search analytics", "In-app widget", "Category organization", "Support agent authoring", "Related articles"],
    useCases: ["Customer support", "Internal IT", "Employee onboarding", "Partner enablement", "Self-serve SaaS"],
  },
  "help-center": {
    title: "Help Center Software",
    headline: "The help center your users bookmark",
    description: "Build a beautiful help center with search, categories, and article feedback. Intercom-style UX without Intercom pricing.",
    features: ["Search-first design", "Category organization", "Article feedback", "Video embed support", "Contact us fallback", "Multi-language"],
    useCases: ["Product help centers", "FAQ hubs", "Customer service", "Self-serve support", "Enterprise support"],
  },
  "tutorial-site": {
    title: "Tutorial Site Platform",
    headline: "Publish tutorials that rank on page 1",
    description: "RankFlo's tutorial templates include step-by-step blocks, code snippets, and HowTo schema — everything Google needs to rank you for \"how to X\" queries.",
    features: ["Step-by-step blocks", "HowTo schema", "Code playgrounds", "Video embed support", "Progress tracking", "Difficulty badges"],
    useCases: ["Coding tutorials", "DIY tutorials", "Recipe sites", "Craft tutorials", "Education content"],
  },
  "case-study-site": {
    title: "Case Study Site Platform",
    headline: "Case studies that close enterprise deals",
    description: "Build a case study library that showcases real customer results. ROI widgets, industry filters, and gated long-form content — all included.",
    features: ["ROI widget blocks", "Industry/use case filters", "Gated PDF export", "Logo wall integration", "Testimonial schema", "Outcome metrics"],
    useCases: ["B2B SaaS", "Enterprise sales", "Agency portfolios", "Consulting firms", "Solution vendors"],
  },
  "api-documentation": {
    title: "API Documentation Platform",
    headline: "API docs developers don't complain about",
    description: "OpenAPI-powered API docs with interactive playgrounds, code samples in 10+ languages, and version history. Built on RankFlo's content stack.",
    features: ["OpenAPI 3.0 import", "Interactive API playground", "10+ language code samples", "Authentication flows", "Version history", "Webhooks documentation"],
    useCases: ["API-first products", "Developer tools", "Public APIs", "Internal APIs", "SDK documentation"],
  },
  "landing-page-builder": {
    title: "Landing Page Builder",
    headline: "SEO landing pages that convert",
    description: "RankFlo's landing page blocks include hero sections, feature grids, pricing tables, and FAQ schema. SEO-optimized out of the box.",
    features: ["Hero section blocks", "Feature grid blocks", "Pricing table blocks", "FAQ schema", "A/B test variants", "Conversion tracking"],
    useCases: ["Product launches", "Campaign landing pages", "Lead gen pages", "Sign-up pages", "Ad landing pages"],
  },

  // === MORE BUYER-INTENT TOPICS ===
  "wordpress-alternative": {
    title: "WordPress Alternative",
    headline: "The modern WordPress alternative",
    description: "Tired of WordPress plugins, security patches, and slow pages? RankFlo is the modern, AI-powered alternative — Docker-simple, MIT-licensed, and built for speed.",
    features: ["No plugin bloat", "No security patches", "Fast by default (Next.js)", "AI built-in", "Docker setup in 5 minutes", "MIT license"],
    useCases: ["Migrating from WP", "Starting fresh", "Agency WordPress replacement", "Enterprise WordPress replacement", "Performance-first sites"],
  },
  "ghost-alternative": {
    title: "Ghost Alternative",
    headline: "A more flexible Ghost alternative",
    description: "Love Ghost but need AI content, headless APIs, or more extensibility? RankFlo gives you the Ghost UX with a modern stack and more features.",
    features: ["AI content built-in", "tRPC + REST API", "Team RBAC", "i18n support", "Webhooks with HMAC", "Unlimited newsletters"],
    useCases: ["Migrating from Ghost", "Scaling Ghost blogs", "Adding AI to publishing", "Multi-author Ghost replacement", "Enterprise publishing"],
  },
  "substack-alternative": {
    title: "Substack Alternative",
    headline: "The Substack alternative with better SEO",
    description: "Substack's SEO is weak, and they take 10% of your paid subs. RankFlo gives you full SEO control, a blog archive that ranks, and just 0% platform fees.",
    features: ["Better SEO than Substack", "0% platform fee (just Stripe)", "Full custom domain", "Searchable archive", "Multi-language newsletters", "Data ownership"],
    useCases: ["Substack migration", "Paid newsletters", "Indie writers", "Substack + blog combos", "Community newsletters"],
  },
  "medium-alternative": {
    title: "Medium Alternative",
    headline: "Stop renting your audience on Medium",
    description: "Medium owns your readers, limits your SEO, and paywalls your content. RankFlo gives you full ownership, custom domain, and a modern editor.",
    features: ["Full data ownership", "No paywall gating your content", "Free custom domain", "SEO-first publishing", "Medium import tool", "AI writing assistant"],
    useCases: ["Medium migration", "Writer-owned publishing", "SEO-focused blogs", "Thought leadership", "Independent journalism"],
  },
  "notion-blog-alternative": {
    title: "Notion Blog Alternative",
    headline: "A real blog platform — not a Notion hack",
    description: "Notion is great for notes, not blogs. RankFlo gives you proper SEO, fast page loads, custom domains, and a blog-first editor — without the Notion workarounds.",
    features: ["Fast page loads", "Full SEO control", "Free custom domain", "Purpose-built editor", "No third-party proxies needed", "Import from Notion"],
    useCases: ["Notion blog migration", "Faster than Super/Potion", "Custom domain setup", "Real SEO", "Content team scaling"],
  },
  "webflow-blog-alternative": {
    title: "Webflow Blog Alternative",
    headline: "Webflow-quality design, blog-first workflow",
    description: "Webflow's CMS limits and per-item pricing make scaling a blog expensive. RankFlo gives you unlimited posts, AI content, and a blog-first editor.",
    features: ["Unlimited CMS items", "Blog-first editor", "AI content", "Transparent pricing", "Headless API", "Fast page loads"],
    useCases: ["Webflow blog migration", "Scaling content on Webflow", "Reducing Webflow costs", "Adding blog to marketing site", "Multi-author Webflow replacement"],
  },
  "contentful-alternative": {
    title: "Contentful Alternative",
    headline: "Contentful for blogs — without the enterprise price",
    description: "Contentful starts at $300/mo. RankFlo gives you blog-first headless CMS with better DX for $0-5/mo. Open source, self-hostable, AI-powered.",
    features: ["Blog-first (vs general CMS)", "AI content generation", "$0-5/mo vs $300/mo", "Open source (MIT)", "Self-hostable", "Faster to set up"],
    useCases: ["Contentful migration", "Blog + marketing site", "Small team CMS", "Indie/startup CMS", "Contentful cost reduction"],
  },
  "strapi-alternative": {
    title: "Strapi Alternative",
    headline: "Strapi's open source DNA, blog-first features",
    description: "Strapi is powerful but generic. RankFlo is blog-optimized out of the box: AI content, SEO scoring, and analytics — all included, no plugins.",
    features: ["Blog-first content types", "AI content generation", "SEO scoring", "Analytics included", "Simpler setup", "MIT license"],
    useCases: ["Strapi migration", "Blog-first headless CMS", "Content team scaling", "SEO-focused teams", "Self-hosted blog"],
  },

  // === FRAMEWORK-SPECIFIC TOPICS ===
  "nextjs-cms": {
    title: "Next.js CMS",
    headline: "The Next.js-native headless CMS",
    description: "Built for Next.js App Router. RankFlo ships with TypeScript SDK, incremental static regeneration, and examples for Next.js 15.",
    features: ["Next.js 15 App Router", "ISR support", "TypeScript SDK", "React Server Components", "Edge runtime support", "Vercel + self-hosted"],
    useCases: ["Next.js blogs", "Next.js marketing sites", "Next.js docs", "Next.js landing pages", "Next.js portfolios"],
  },
  "astro-cms": {
    title: "Astro CMS",
    headline: "A content API for Astro sites",
    description: "Astro ships zero JS, RankFlo ships the content. Use our content API with Astro's content collections for a blazing-fast content stack.",
    features: ["REST API for Astro", "Content collection adapters", "Image optimization", "OpenAPI spec", "Webhooks for rebuilds", "Markdown-compatible"],
    useCases: ["Astro blogs", "Astro marketing sites", "Astro docs", "Astro portfolios", "Static + dynamic hybrid"],
  },
  "react-cms": {
    title: "React Headless CMS",
    headline: "A CMS React developers actually want",
    description: "TypeScript SDK, React hooks, and Next.js/Remix examples. RankFlo is the React-first headless CMS.",
    features: ["React hooks (useContent, usePost)", "TypeScript SDK", "Next.js + Remix adapters", "React Server Components", "Suspense support", "Streaming"],
    useCases: ["React apps", "Next.js projects", "Remix projects", "Gatsby migrations", "Create React App blogs"],
  },
};

export const ALL_TOPIC_SLUGS = Object.keys(TOPIC_DATA);

export function getTopic(slug: string): TopicData | undefined {
  return TOPIC_DATA[slug];
}
