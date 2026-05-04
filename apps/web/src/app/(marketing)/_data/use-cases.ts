export interface UseCase {
  slug: string;
  role: string; // e.g. "Content Marketer"
  headline: string;
  intro: string;
  problems: string[]; // pain points this role faces
  features: { title: string; description: string }[]; // RankFlo features that help
  workflow: string[]; // typical workflow they'd run on RankFlo
  metrics: string[]; // outcomes/KPIs
  testimonial?: { quote: string; author: string; role: string };
}

const U = (u: Omit<UseCase, "slug">): [string, UseCase] => {
  const slug = u.role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [slug, { slug, ...u }];
};

export const USE_CASES: Record<string, UseCase> = Object.fromEntries([
  U({
    role: "Content Marketer",
    headline: "RankFlo for Content Marketers",
    intro: "Plan, write, optimize, and measure content from one platform. Built-in AI generation, real-time SEO scoring, and analytics replace half your tool stack.",
    problems: [
      "Juggling Notion (drafts) + WordPress (CMS) + Surfer (SEO) + GA4 (analytics) wastes hours per week",
      "AI tools like Jasper produce generic content that doesn't match brand voice",
      "Hard to measure which content drives real pipeline vs vanity traffic",
      "SEO scores from Surfer/Clearscope feel detached from the actual editor",
      "Multi-author teams need approvals, but most CMSes have weak workflow tools",
    ],
    features: [
      { title: "AI writing with brand voice", description: "Configure your brand voice once. Every AI draft matches it. Multi-step pipeline (research → outline → draft → optimize)." },
      { title: "Real-time SEO scoring in the editor", description: "Score updates as you type — keyword density, readability, internal links, meta quality. No copy-paste to a separate SEO tool." },
      { title: "Editorial calendar with approvals", description: "Plan months in advance, assign authors, route through reviewers, schedule for peak traffic windows." },
      { title: "Cookieless analytics", description: "See pageviews, conversions, traffic sources, and AI referrers without GDPR consent banners." },
      { title: "Auto JSON-LD + meta tags", description: "Every post ships with proper schema markup, Open Graph, Twitter cards. No manual SEO checklist." },
    ],
    workflow: [
      "Research keywords with the topic-cluster planner",
      "Generate AI drafts that match your brand voice",
      "Edit in the block editor with live SEO scoring",
      "Route through reviewers for approvals",
      "Schedule for peak traffic windows",
      "Track performance in built-in analytics",
      "Iterate on top performers using AI rewrite",
    ],
    metrics: [
      "Hours saved per post (typical: 4–6 hours → 1–2 hours)",
      "Posts shipped per month",
      "Average SEO score across published posts",
      "Organic traffic growth month-over-month",
      "Conversion rate from organic visitors",
      "AI citation count (mentions in ChatGPT/Perplexity/Claude)",
    ],
  }),
  U({
    role: "SEO Consultant",
    headline: "RankFlo for SEO Consultants",
    intro: "Manage multiple client blogs from one dashboard. Built-in SEO audits, structured data, and reporting — without forcing clients onto a complex CMS.",
    problems: [
      "Each client uses a different CMS — context switching kills focus",
      "WordPress clients need Yoast + Rank Math + Schema plugins to do basic SEO",
      "Clients ask for performance reports — you waste hours building them in Looker Studio",
      "Hard to scale: more clients = more chaos",
      "AI-search visibility (ChatGPT, Perplexity citations) is opaque without dedicated tools",
    ],
    features: [
      { title: "Multi-project workspace", description: "One organization, unlimited client projects. Switch context with one click. RBAC controls who sees what." },
      { title: "Real-time SEO score on every post", description: "9-point audit (meta, headings, keyword density, alt text, internal links, structured data) — same score across all clients." },
      { title: "JSON-LD generator + LLM visibility", description: "Auto-generate Article, FAQ, HowTo, Product schema. Track which queries cite your client's brand in AI answers." },
      { title: "Client-friendly editor", description: "Block editor with no plugin sprawl. Onboard non-technical clients in minutes." },
      { title: "Scheduled publishing + webhooks", description: "Publish on a calendar; webhooks fire to client's Next.js or Astro site to revalidate." },
    ],
    workflow: [
      "Onboard a client — create a project, give them an editor seat",
      "Run an SEO audit on existing content (bulk score)",
      "Plan content calendar with target keywords",
      "Generate or write posts; clients review and publish",
      "Monitor AI visibility tracker for brand mentions",
      "Send monthly performance report (auto-generated)",
    ],
    metrics: [
      "Clients managed simultaneously",
      "Average SEO score across all client posts",
      "Organic traffic growth per client",
      "AI citation count per client (LLM visibility)",
      "Hours billable per client (efficiency)",
    ],
  }),
  U({
    role: "Indie Hacker",
    headline: "RankFlo for Indie Hackers",
    intro: "Build in public, document your journey, attract users via SEO. Self-host for $0 or use the managed cloud for $5/mo. AI helps you ship more content while building.",
    problems: [
      "WordPress is overkill for a one-person side project",
      "Substack and Medium don't help your own product's SEO",
      "Writing slows you down — you'd rather be coding",
      "Hard to keep the blog fresh without dedicated time",
      "Need AI help but don't want to subscribe to 5 different tools",
    ],
    features: [
      { title: "Self-host on a $5 VPS", description: "Docker Compose stack runs on any server. Postgres + Redis + Next.js. Total cost: $5/mo + AI API key." },
      { title: "AI content generation (BYO key)", description: "Bring your OpenAI / Anthropic / Gemini key. Pay them directly. RankFlo charges $0 for AI usage." },
      { title: "Built-in changelog + product updates", description: "Use tags or projects to separate \"build in public\" updates from regular posts. Auto RSS for both." },
      { title: "Real analytics, no setup", description: "Cookieless tracker — one line of JS. See what content drives signups." },
      { title: "Headless API for any frontend", description: "Run your blog on the same Next.js stack as your product. One deploy, one design system." },
    ],
    workflow: [
      "Self-host RankFlo on a $5 Hetzner / DigitalOcean VPS",
      "Add the analytics tracker to your product site",
      "Write 1 \"build in public\" update per week with AI assist",
      "Publish 2 SEO posts per month targeting product keywords",
      "Watch organic signups grow from search",
    ],
    metrics: [
      "Hosting cost (typical: $5–10/mo total)",
      "Posts published per month",
      "Organic signups attributed to content",
      "Time spent on content vs product",
    ],
  }),
  U({
    role: "SaaS Founder",
    headline: "RankFlo for SaaS Founders",
    intro: "Content marketing is the highest-leverage channel for SaaS. RankFlo gives you AI writing, programmatic SEO pages, and conversion analytics — without the agency fees.",
    problems: [
      "Agencies charge $5k–20k/mo for content; output is generic",
      "Programmatic SEO (location pages, integration pages, comparison pages) is hard to scale on WordPress",
      "Founder writes the best content but doesn't have time",
      "Need to measure content → signup attribution, not just pageviews",
      "AI tools like Jasper produce content that hurts your brand",
    ],
    features: [
      { title: "Programmatic SEO pages out of the box", description: "Generate /alternatives/X, /compare/X-vs-Y, /for/Z, /integrations/W pages from data files. RankFlo's marketing site itself is built this way." },
      { title: "Brand-voice AI", description: "Configure tone, style, vocabulary. Every AI draft matches it. Founders can review/edit instead of starting from scratch." },
      { title: "Conversion tracking", description: "Track which posts drive signups via custom events. No GA4 setup hell." },
      { title: "LLM visibility tracking", description: "See when ChatGPT, Perplexity, Claude mention your brand — and your competitors. Optimize content to get cited." },
      { title: "Type-safe API for product integration", description: "Embed blog posts inside your product's docs/help center. One content source, multiple surfaces." },
    ],
    workflow: [
      "Set up brand voice + AI provider keys",
      "Generate programmatic pages for top integration / use-case keywords",
      "Founder writes 1–2 thought-leadership posts per month with AI assist",
      "Hire a part-time writer for filler content (much cheaper than an agency)",
      "Track content → signup conversion in built-in analytics",
      "Monitor LLM mentions to find new content opportunities",
    ],
    metrics: [
      "Organic signups per month",
      "Content cost per signup (vs paid ads CAC)",
      "Programmatic pages indexed",
      "AI citations per month",
      "Top-performing posts by signup conversion",
    ],
  }),
  U({
    role: "Agency Owner",
    headline: "RankFlo for Marketing Agencies",
    intro: "Run content for 10+ clients without burning out your team. Multi-tenant workspaces, white-label reports, and AI productivity make every client profitable.",
    problems: [
      "Each client has a different CMS — onboarding takes weeks",
      "Senior writers spend hours on rote SEO tasks instead of strategy",
      "Margin compression: clients want more output for the same retainer",
      "Reporting eats 20% of every billable hour",
      "Hard to differentiate from agencies using the same WordPress + Surfer stack",
    ],
    features: [
      { title: "Multi-organization billing", description: "One agency account, separate organization per client. Bill clients separately or absorb into a flat retainer." },
      { title: "AI assist for first drafts", description: "Junior writers can ship more first drafts; seniors focus on editing and strategy." },
      { title: "Real-time SEO scoring", description: "Stop relying on Surfer/Clearscope for every post. Live score in the editor." },
      { title: "Auto reporting", description: "Per-client dashboards with traffic, top posts, conversions. White-label optional." },
      { title: "Programmatic SEO at scale", description: "Build /alternatives, /compare, /for pages programmatically across clients. Faster wins than blog-only strategy." },
    ],
    workflow: [
      "Onboard new client — create org, project, invite team",
      "Audit existing content with bulk SEO scorer",
      "Plan 6-month content calendar per client",
      "Junior writers draft with AI; seniors edit",
      "Schedule, publish, track in unified dashboard",
      "Send monthly client report (auto-generated)",
    ],
    metrics: [
      "Clients per account manager (capacity)",
      "Average gross margin per client",
      "Posts shipped per writer per week",
      "Client retention rate",
      "Reporting hours saved per month",
    ],
  }),
  U({
    role: "Freelance Writer",
    headline: "RankFlo for Freelance Writers",
    intro: "Win more retainers with AI-augmented output. RankFlo handles the SEO, schema, and analytics work so you can charge more for strategy + writing.",
    problems: [
      "Clients want SEO-optimized content, but you're a writer not an SEO",
      "Switching between client CMSes (WordPress, Webflow, Notion) wastes time",
      "Hard to scale beyond 5–10 retainers without outsourcing",
      "AI tools either help or hurt your craft — finding the balance is hard",
    ],
    features: [
      { title: "Real-time SEO scoring", description: "You write naturally; the score guides edits. No need to learn keyword density tools." },
      { title: "AI brainstorm + outline mode", description: "Use AI for ideation and structure, write the prose yourself. Ship 2× faster without losing voice." },
      { title: "Block editor with focus mode", description: "Distraction-free writing UI. Same UX across all clients." },
      { title: "Client portal", description: "Each client gets a viewer/editor seat. They review and publish; you focus on writing." },
      { title: "Auto schema + meta tags", description: "Article, FAQ, HowTo schema generated automatically. You don't have to manually add them per client." },
    ],
    workflow: [
      "Pitch retainer with SEO-optimized content as the value prop",
      "Onboard client to a RankFlo project (5 min)",
      "Use AI to brainstorm topics from client's keyword list",
      "Write in block editor with live SEO score",
      "Client reviews and publishes",
      "Monthly performance report shows traffic from your content",
    ],
    metrics: [
      "Retainers held simultaneously",
      "Words shipped per week (with AI assist)",
      "Average SEO score across published posts",
      "Client renewal rate",
    ],
  }),
  U({
    role: "Growth Hacker",
    headline: "RankFlo for Growth Hackers",
    intro: "Run high-velocity content experiments. Programmatic SEO, A/B testable meta tags, conversion-tracked posts. Built for growth playbooks like the airbnb-style location pages.",
    problems: [
      "WordPress can't generate 1000+ programmatic pages without slowing to a crawl",
      "Setting up conversion tracking on top of content is fragile (GTM + GA4 + custom events)",
      "Hard to A/B test meta titles, headlines, or page templates",
      "Content velocity matters but quality matters more — most AI tools sacrifice quality",
    ],
    features: [
      { title: "Programmatic pages from data", description: "Define a data file (JSON / TS) → get N pages. RankFlo's own marketing site uses this for /alternatives, /compare, /integrations, /for, /glossary." },
      { title: "Conversion tracking built in", description: "window.rankflo.track('signup', { plan: 'pro' }) — no GTM. Custom events show up in analytics dashboard." },
      { title: "Bulk SEO scoring", description: "Score all your posts at once. Find winners and losers fast." },
      { title: "Webhook-driven CI/CD", description: "Publish event fires → revalidate Next.js cache → updated content live in seconds." },
      { title: "Headless = full design control", description: "Build any page template you want; RankFlo just serves data." },
    ],
    workflow: [
      "Define growth experiment (e.g. 100 \"alternatives to X\" pages)",
      "Build data file with all variants",
      "Generate programmatic pages",
      "Track conversion rate per page template",
      "Iterate on winners, kill losers",
    ],
    metrics: [
      "Programmatic pages live",
      "Conversion rate per page template",
      "Experiment velocity (experiments shipped per month)",
      "CAC from organic content",
    ],
  }),
  U({
    role: "DevRel",
    headline: "RankFlo for Developer Relations",
    intro: "Tutorials, changelogs, API docs, conference talk write-ups — all in one platform with great code blocks, syntax highlighting, and developer-friendly URLs.",
    problems: [
      "Tutorials need beautiful code blocks (Mintlify-quality) — most CMSes are weak here",
      "API reference, conceptual guides, and blog posts each need different layouts",
      "Hard to keep code samples in sync with shipped product",
      "Developers don't sign up via web forms — need different conversion patterns",
    ],
    features: [
      { title: "Syntax-highlighted code blocks", description: "Shiki / Prism rendering with copy buttons, line numbers, line highlighting, language tabs." },
      { title: "Multi-project for content types", description: "Separate projects for blog, docs, changelog. One organization, unified team." },
      { title: "MDX-style components in Tiptap", description: "Embed live demos, callouts, tabs, accordions, GitHub Gist links." },
      { title: "Developer-friendly URLs", description: "/blog/tutorial-name (no dates, no IDs, no /p/abc123). Clean, memorable, SEO-friendly." },
      { title: "API docs hosting", description: "Use the same platform for /docs/api-reference style content. JSON-LD APIDocumentation schema." },
    ],
    workflow: [
      "Write tutorials with syntax-highlighted code blocks",
      "Publish changelog as a tagged content type",
      "Use webhooks to auto-publish from internal docs repo",
      "Track which tutorials drive signups via custom events",
      "Repurpose conference talks as blog write-ups",
    ],
    metrics: [
      "Tutorials shipped per month",
      "Time-to-first-value for new developers",
      "GitHub stars driven by content",
      "Trial signups from tutorials",
      "Top tutorials by signup conversion",
    ],
  }),
  U({
    role: "Product Marketer",
    headline: "RankFlo for Product Marketers",
    intro: "Launch landing pages, write category-defining thought leadership, and run /compare and /alternatives plays — all from one platform. AI helps with first drafts; analytics close the loop.",
    problems: [
      "Marketing-eng tickets pile up for every new landing page",
      "Need /vs-competitor and /alternatives pages but can't build them at scale",
      "Hard to A/B test landing page copy without dev time",
      "Product positioning shifts faster than the website can keep up",
    ],
    features: [
      { title: "Marketing landing pages without engineers", description: "Build /pricing, /features, /vs-X pages with the block editor. No PR needed for copy changes." },
      { title: "Programmatic /compare and /alternatives", description: "Define competitors in a data file → get 50+ comparison pages. Update one row, update all." },
      { title: "AI for first drafts", description: "Generate landing page copy from a brief. Edit and ship in hours, not weeks." },
      { title: "Conversion tracking on every CTA", description: "Track which positioning drives signups, demos, free trials." },
      { title: "Real-time SEO scoring", description: "Make sure your /vs-competitor pages actually rank — score them before publishing." },
    ],
    workflow: [
      "Define competitor list in a TS file",
      "Generate /compare/[us-vs-them] pages programmatically",
      "Write thought-leadership posts on category positioning",
      "A/B test headlines via simple template variants",
      "Track conversion per page in analytics",
    ],
    metrics: [
      "Pages live per quarter",
      "Conversion rate per landing page",
      "Organic traffic to /compare and /alternatives",
      "Demo requests attributed to content",
    ],
  }),
  U({
    role: "Technical Writer",
    headline: "RankFlo for Technical Writers",
    intro: "Beautiful documentation, tutorials, and reference content. Code blocks with syntax highlighting, callouts, tables, and a clean information architecture out of the box.",
    problems: [
      "Markdown-only static site generators (Hugo, Jekyll) limit collaboration",
      "Confluence and Notion aren't built for public docs",
      "Need versioning, scheduled publishing, and team review",
      "Code blocks need to look as good as Stripe's docs",
    ],
    features: [
      { title: "Block editor with technical primitives", description: "Code blocks, tables, callouts, accordions, tabs — everything you need to write Stripe-quality docs." },
      { title: "Multi-project for doc spaces", description: "Separate projects for product docs, API reference, tutorials, changelog." },
      { title: "Version history per page", description: "See every change, revert to any version. Comments inline." },
      { title: "Scheduled publishing", description: "Plan launches: schedule new doc pages to publish alongside the feature." },
      { title: "Team approvals", description: "Require sign-off from a senior writer or engineer before publish." },
    ],
    workflow: [
      "Outline a new doc section",
      "Draft with AI assist for boilerplate (intro, prereqs)",
      "Have engineering review for technical accuracy",
      "Schedule publish for product launch day",
      "Track which docs reduce support tickets",
    ],
    metrics: [
      "Docs shipped per quarter",
      "Time-to-publish for new feature docs",
      "Support ticket deflection from docs",
      "Doc readership (top pages by traffic)",
    ],
  }),
  U({
    role: "E-commerce Manager",
    headline: "RankFlo for E-commerce Content",
    intro: "Run a content engine alongside Shopify / WooCommerce. Buyer guides, comparison content, and SEO-optimized category pages drive organic traffic that converts.",
    problems: [
      "Shopify Blogs are weak for SEO (URL structure, schema, performance)",
      "Need buyer guides and comparison content — the storefront alone won't rank",
      "Limited flexibility on product detail pages",
      "Content tools that sit on top of Shopify (Hubspot CMS, Webflow) are expensive",
    ],
    features: [
      { title: "Headless content alongside Shopify", description: "Run RankFlo as the content layer; pull blog content into your Shopify storefront via API." },
      { title: "Buyer guides + comparison pages", description: "Create /best-X-for-Y guides, /alternatives/X, /compare/X-vs-Y pages programmatically. Strong conversion intent." },
      { title: "Product schema markup", description: "Auto-generate Product, Review, FAQ schema for content that sits next to product pages." },
      { title: "AI content for SKU descriptions", description: "Generate variant-specific buyer guides for each product line." },
      { title: "Real conversion tracking", description: "Track content → product page → checkout in your analytics dashboard." },
    ],
    workflow: [
      "Identify high-volume buyer-intent keywords",
      "Generate /best-X-for-Y, /best-X-under-Y guides",
      "Cross-link from guides to product pages",
      "A/B test product schema variants",
      "Measure content → cart conversion",
    ],
    metrics: [
      "Organic traffic to content vs product pages",
      "Conversion rate from content visitors",
      "Revenue attributed to content (vs paid ads)",
      "Top guides by revenue",
    ],
  }),
  U({
    role: "Blogger",
    headline: "RankFlo for Bloggers",
    intro: "Run a serious blog without managing a CMS. Bring AI for first drafts, get SEO scoring out of the box, and keep your audience on your domain (not Medium's).",
    problems: [
      "WordPress is overkill — too much maintenance, too many plugin choices",
      "Medium and Substack don't help YOUR domain rank",
      "AI tools like Jasper produce templated content",
      "Hard to monetize without managing ads, sponsorships, and email separately",
    ],
    features: [
      { title: "Beautiful editor", description: "Block-based, distraction-free. Faster than WordPress, more powerful than Medium." },
      { title: "AI brainstorming", description: "Use AI to ideate topics and outlines, then write in your own voice. Best of both worlds." },
      { title: "Custom domain + your SEO", description: "Your content, your domain, your SEO equity. Not Medium's." },
      { title: "Analytics built in", description: "See what readers love. Cookieless, no GDPR banner." },
      { title: "Newsletter integration", description: "Pair with Resend, Buttondown, or Mailchimp via webhooks. Auto-send on publish." },
    ],
    workflow: [
      "Pick a niche and target keywords",
      "Use AI to brainstorm topics, write in your voice",
      "Publish on a consistent schedule",
      "Auto-send to subscribers via webhook",
      "Track top posts; double down on what works",
    ],
    metrics: [
      "Posts published per month",
      "Subscriber growth",
      "Organic traffic month-over-month",
      "Engagement (avg time on page, scroll depth)",
    ],
  }),
]);

export const ALL_USE_CASE_SLUGS = Object.keys(USE_CASES);

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES[slug];
}
