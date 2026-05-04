export interface MigrationGuide {
  slug: string;
  fromName: string;
  fromTagline: string;
  whyMigrate: string[];
  challenges: { title: string; description: string }[];
  steps: { title: string; description: string; estimatedTime?: string }[];
  exportFormat: string; // What format the source platform exports
  postMigration: string[]; // Things to do after the import
  ctaTitle?: string;
  ctaCopy?: string;
}

const M = (g: Omit<MigrationGuide, "slug">): [string, MigrationGuide] => {
  const slug = g.fromName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [slug, { slug, ...g }];
};

const STANDARD_POST_MIGRATION: string[] = [
  "Set up 301 redirects from old URLs to new RankFlo URLs",
  "Submit your new sitemap to Google Search Console",
  "Verify all internal links resolved correctly",
  "Re-add SEO meta titles and descriptions where missing",
  "Configure your custom domain and HTTPS",
  "Run a crawler (Screaming Frog) against the new site to catch broken links",
];

export const MIGRATIONS: Record<string, MigrationGuide> = Object.fromEntries([
  M({
    fromName: "WordPress",
    fromTagline: "Move from WordPress to a modern, headless platform — no more plugin sprawl.",
    whyMigrate: [
      "No more security patches every few weeks (WordPress + plugin CVEs are constant)",
      "10× faster page loads — RankFlo serves static HTML, no PHP rendering on every request",
      "AI content generation, real-time SEO scoring, and analytics built in (no plugins)",
      "Type-safe API for any frontend — Next.js, Astro, Remix, or stay headless",
      "Cookieless analytics, no GDPR consent banner needed",
      "Self-host with Docker if you want full control, or use the managed cloud",
    ],
    challenges: [
      { title: "Plugin-specific shortcodes", description: "WordPress posts often contain [shortcodes] from plugins (Yoast, Gravity Forms, page builders). These don't translate. Our importer strips known shortcodes; the rest you'll need to clean manually or rebuild as RankFlo blocks." },
      { title: "Custom post types", description: "If you used CPTs (custom post types) heavily — events, products, etc. — map them to RankFlo projects or treat them as separate Tag taxonomies." },
      { title: "Page builders (Elementor, Divi)", description: "Page-builder layouts don't survive WXR export cleanly. Plan to rebuild key landing pages as RankFlo pages with the block editor — usually faster than wrestling with broken shortcode dumps." },
      { title: "Featured images", description: "Image URLs need to be re-hosted. Our importer will fetch and re-upload featured images during migration." },
    ],
    steps: [
      { title: "Export from WordPress", description: "In WP admin: Tools → Export → All content. Save the .xml file (WXR format).", estimatedTime: "5 min" },
      { title: "Create your RankFlo project", description: "Sign up, create a project, copy your project API key (blg_...).", estimatedTime: "2 min" },
      { title: "Run the WordPress importer", description: "Settings → Import → WordPress (WXR). Upload the .xml file. The importer parses posts, pages, categories, tags, authors, and media URLs.", estimatedTime: "10–30 min depending on post count" },
      { title: "Map authors to RankFlo users", description: "After import, you'll see a mapping screen — match each WP author to a RankFlo team member or create new ones.", estimatedTime: "5 min" },
      { title: "Review imported content", description: "Posts come in as drafts so you can review before publishing. Spot-check a sample for shortcodes, broken images, or formatting issues.", estimatedTime: "30–60 min" },
      { title: "Update your frontend", description: "Point your blog at RankFlo's REST API or use the TypeScript SDK. Examples in our docs cover Next.js, Astro, and plain HTML.", estimatedTime: "1–4 hours" },
      { title: "Set up redirects", description: "WordPress permalink structure (e.g. /year/month/slug/) needs to redirect to RankFlo's structure (e.g. /blog/slug/). Use Cloudflare Page Rules, nginx, or your reverse proxy.", estimatedTime: "30 min" },
    ],
    exportFormat: "WXR (.xml) — WordPress's native export format",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Ghost",
    fromTagline: "Move from Ghost to RankFlo — keep the editor speed, gain AI and analytics.",
    whyMigrate: [
      "Built-in AI content generation (Ghost has none)",
      "Real-time SEO scoring inside the editor",
      "Cookieless analytics built in (vs Ghost's basic email metrics)",
      "LLM visibility tracking — see when ChatGPT and Perplexity cite you",
      "Open source and self-hostable like Ghost, but with a modern type-safe API",
      "Native team workflows: roles, approvals, scheduled publishing",
    ],
    challenges: [
      { title: "Ghost's Mobiledoc → Tiptap", description: "Ghost stores posts as Mobiledoc JSON. Our importer converts Mobiledoc cards (markdown, image, html, embed) to RankFlo blocks. Custom Ghost cards become HTML blocks." },
      { title: "Members & subscriptions", description: "If you used Ghost Members for paid subscriptions, those don't transfer (different billing system). Plan a separate migration to Stripe or another billing provider." },
      { title: "Newsletter sends", description: "Ghost sends emails on publish. RankFlo focuses on the content side — pair with a separate newsletter tool (Resend, Buttondown) and use a webhook." },
    ],
    steps: [
      { title: "Export from Ghost", description: "Ghost Admin → Settings → Labs → Export your content. Downloads a .json file.", estimatedTime: "2 min" },
      { title: "Create your RankFlo project", description: "Sign up and create a project for the migrated content." },
      { title: "Run the Ghost importer", description: "Settings → Import → Ghost (JSON). Upload the .json file. Posts, pages, tags, and authors are parsed.", estimatedTime: "5–15 min" },
      { title: "Review posts as drafts", description: "Imported content lands as drafts. Spot-check formatting — especially HTML cards, code blocks, and image alignment." },
      { title: "Re-upload featured images", description: "Ghost's image URLs point to your old Ghost host. Use our \"refresh media\" action to fetch and self-host images on RankFlo's S3-compatible storage." },
      { title: "Update your frontend or use rankflo.io", description: "Ghost users typically have a custom theme. Either rewrite as a Next.js/Astro frontend hitting RankFlo's API, or host content on RankFlo's domain." },
      { title: "Redirect old Ghost URLs", description: "Ghost typically uses /blog/slug. RankFlo uses the same. If you keep the structure, redirects can be a single CNAME swap." },
    ],
    exportFormat: "JSON — Ghost's native export format",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Medium",
    fromTagline: "Own your content, own your traffic — leave Medium's paywall behind.",
    whyMigrate: [
      "Stop sending readers to Medium's paywall — own your audience",
      "Get the SEO credit for your work (Medium owns the canonical)",
      "No more arbitrary Medium algorithm changes throttling your reach",
      "Use AI to repurpose old Medium posts into new content",
      "Custom domain, custom design, no Medium branding",
      "Built-in analytics — see exactly who's reading and from where",
    ],
    challenges: [
      { title: "Medium export is incomplete", description: "Medium's export gives you HTML files per post, but no metadata (categories, tags, draft state, claps). Plan to manually tag posts after import." },
      { title: "Embedded Medium widgets", description: "Posts containing Medium-only embeds (clap counters, follow buttons) need cleanup. Our importer strips these." },
      { title: "Canonical loss", description: "Posts on Medium have built-up SEO equity at medium.com URLs. After migrating, set canonical=your-new-url AND ask Medium to redirect (in Story settings → \"Story removed\")." },
    ],
    steps: [
      { title: "Request export from Medium", description: "Settings → Account → Download your information. Medium emails you a .zip within 24 hours.", estimatedTime: "instant request, 24h wait" },
      { title: "Unzip and locate posts/", description: "Inside the export, your stories are in posts/ as HTML files. Drafts are in drafts/." },
      { title: "Run the Medium importer", description: "Settings → Import → Medium (zip). Upload the .zip — we parse the HTML files, strip Medium widgets, and convert to clean blocks.", estimatedTime: "10–30 min" },
      { title: "Add tags and categories manually", description: "Medium's export doesn't include tags. Bulk-tag posts in the dashboard using saved filters." },
      { title: "Set canonical tags", description: "For each migrated post, set canonical to your new URL. RankFlo does this by default once you publish." },
      { title: "Update Medium posts to point to new URLs", description: "Open each Medium story → add a link \"This post has moved to [your-domain.com/blog/slug]\". Medium will eventually deprioritize the old version." },
    ],
    exportFormat: "ZIP archive of HTML files",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Substack",
    fromTagline: "Move newsletter content to RankFlo — keep the writing, ditch the lock-in.",
    whyMigrate: [
      "Own your audience email list — no Substack lock-in",
      "No 10% Substack fee on paid subscriptions (use Stripe directly)",
      "Better SEO — Substack newsletter URLs barely rank",
      "Pair RankFlo content with any newsletter tool (Resend, Buttondown, Mailchimp)",
      "Built-in analytics, AI writing, and SEO tools",
      "Custom domain without paying Substack's $50/mo \"custom domain\" fee",
    ],
    challenges: [
      { title: "Subscriber list export", description: "Export your subscribers from Substack (Settings → Email → Export). Import into your new newsletter tool — those subscribers are yours." },
      { title: "Paid subscriptions", description: "Substack handles billing. Migrating paid subscribers to a new system (Stripe + Resend, or Beehiiv, or Ghost) is a separate workstream — plan for it." },
      { title: "Past newsletter editions", description: "Substack lets you export posts as a single .zip. Each post becomes a blog post in RankFlo. Newsletters and blog posts unify under one content system." },
    ],
    steps: [
      { title: "Export Substack posts", description: "Substack → Settings → Exports → Create new export. Downloads a .zip with HTML files.", estimatedTime: "5 min" },
      { title: "Export subscribers separately", description: "Settings → Email → Export subscribers. Save the CSV." },
      { title: "Run the Substack importer", description: "Settings → Import → Substack (zip). RankFlo parses the HTML files into blog posts.", estimatedTime: "10 min" },
      { title: "Pick a newsletter tool", description: "RankFlo doesn't send emails. Connect Resend, Buttondown, or Mailchimp. Use webhooks to fire emails when posts publish." },
      { title: "Import subscribers to your newsletter tool", description: "Upload the CSV from step 2 to your new newsletter platform." },
      { title: "Set up paid subscriptions (if applicable)", description: "Configure Stripe and gate premium content via your newsletter tool. RankFlo's API supports auth-gated content fetching." },
      { title: "Migrate Substack URLs", description: "Substack URLs are subdomain.substack.com/p/slug. After moving to your custom domain, set Substack to redirect (or just leave the old archive)." },
    ],
    exportFormat: "ZIP archive of HTML files",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Webflow",
    fromTagline: "Take your CMS content out of Webflow — keep your design, gain a real API.",
    whyMigrate: [
      "Webflow's CMS limits get expensive fast (10k items, $40/mo+ tiers)",
      "RankFlo's API is type-safe and free — no per-item billing",
      "AI content generation built in",
      "Pair RankFlo with any frontend (Next.js, Astro) — keep your Webflow-built marketing site, or rebuild it",
      "Real version history, scheduled publishing, team workflows",
      "Self-hostable — Webflow content lives on Webflow's servers",
    ],
    challenges: [
      { title: "Webflow's collection structure", description: "Webflow CMS uses Collections with custom fields. Map each Collection to a RankFlo project. Custom fields become metadata or tags." },
      { title: "Reference fields", description: "If your Webflow content uses cross-references (e.g. a post links to an author collection), the migration script preserves them via tags." },
      { title: "Rich text fields", description: "Webflow's rich text → RankFlo blocks conversion preserves headings, links, embedded images, and callouts." },
    ],
    steps: [
      { title: "Export Webflow CMS items", description: "Webflow Designer → CMS → click any Collection → Export CSV. Repeat for each collection.", estimatedTime: "5–15 min" },
      { title: "Identify your fields", description: "Make a list of Webflow fields (Title, Slug, Body, Author, Tags, etc.) and how each maps to RankFlo (post, slug, content, author, tags)." },
      { title: "Run the Webflow CSV importer", description: "Settings → Import → Webflow CSV. Upload the CSV and confirm field mapping.", estimatedTime: "5 min per Collection" },
      { title: "Re-host images", description: "Webflow images live at uploads-ssl.webflow.com. The importer fetches and uploads them to RankFlo's storage." },
      { title: "Update your frontend", description: "If you built your Webflow site with the Webflow Designer, you can keep the design and just swap the CMS data source — fetch from RankFlo's API on the server side." },
    ],
    exportFormat: "CSV — one per Collection",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Notion",
    fromTagline: "Move your Notion-as-CMS workflow to a real CMS without losing the workflow.",
    whyMigrate: [
      "Real publishing pipeline — drafts, scheduled publishing, approvals",
      "Real SEO — Notion's public pages don't rank",
      "Custom domain without Super.so / Potion / Feather subscriptions",
      "Type-safe API for any frontend",
      "Real analytics, not just Notion's basic page views",
      "Team roles and permissions actually work",
    ],
    challenges: [
      { title: "Notion's blocks → Tiptap blocks", description: "Notion's block model is rich (toggles, callouts, databases, embeds). Our importer maps the common ones; databases inside posts need manual handling." },
      { title: "Embedded databases", description: "If a post embeds a Notion database (e.g. a related-posts list), the database content doesn't transfer as live data — it becomes a snapshot. Recreate as RankFlo tags." },
      { title: "Image references", description: "Notion images are hosted at signed S3 URLs that expire. The importer fetches and re-uploads images during migration." },
    ],
    steps: [
      { title: "Export Notion content", description: "Notion → ⋯ menu → Export → Markdown & CSV. Download the .zip.", estimatedTime: "10 min for large workspaces" },
      { title: "Pick which pages are blog posts", description: "Notion exports everything. Filter to just the pages that are blog content." },
      { title: "Run the Notion importer", description: "Settings → Import → Notion (Markdown). Upload the .zip. Markdown is converted to RankFlo blocks.", estimatedTime: "5–15 min" },
      { title: "Map Notion properties to RankFlo metadata", description: "Properties like \"Status\", \"Author\", \"Tags\" need mapping to RankFlo fields. The importer prompts you." },
      { title: "Spot-check formatting", description: "Notion-specific blocks (toggles, columns, callouts) may need review. Toggle blocks become collapsible HTML; columns are flattened." },
    ],
    exportFormat: "Markdown + CSV (.zip)",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Hashnode",
    fromTagline: "Move from Hashnode to a self-hostable platform with full control.",
    whyMigrate: [
      "Self-host on your own infrastructure (Hashnode is SaaS-only)",
      "Custom domain without Hashnode's free-tier limitations",
      "AI content generation and real-time SEO scoring",
      "Open source — extend or fork as you wish",
      "Type-safe API for any frontend — Hashnode's API is GraphQL, often slower",
      "Better team workflows: roles, approvals, multi-author projects",
    ],
    challenges: [
      { title: "Hashnode's blocks → RankFlo blocks", description: "Hashnode posts are in markdown with embedded GraphQL fragments for custom blocks. The importer parses markdown directly; custom blocks fall back to HTML." },
      { title: "Series & multi-author publications", description: "Hashnode has \"Series\" (collections of posts) and multi-author publications. These map to RankFlo tags + projects respectively." },
    ],
    steps: [
      { title: "Export Hashnode content via API", description: "Hashnode doesn't have a UI export. Use their GraphQL API to fetch all posts: query Publication { posts { ... } }. RankFlo provides a CLI to do this in one command." },
      { title: "Run the Hashnode importer", description: "Settings → Import → Hashnode. Provide your Hashnode API token; we fetch posts directly via their GraphQL API.", estimatedTime: "5–10 min" },
      { title: "Review series structure", description: "If you used Hashnode Series, those become tags. Verify the tag mapping." },
      { title: "Update your frontend", description: "Either keep Hashnode as the public-facing site and use RankFlo as a backend, or migrate the frontend to a custom Next.js / Astro setup." },
    ],
    exportFormat: "GraphQL API (no UI export)",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Contentful",
    fromTagline: "Cut your Contentful bill by 90%+ — same headless flexibility, none of the lock-in.",
    whyMigrate: [
      "Contentful Pro starts at $489/mo. RankFlo is free to self-host or $5/mo managed.",
      "Open source — no vendor lock-in",
      "Built-in AI content generation, real-time SEO scoring, and analytics",
      "Type-safe tRPC API alongside REST — Contentful is REST-only",
      "Generous rate limits — Contentful throttles aggressively at lower tiers",
      "No per-API-call billing — RankFlo doesn't charge per request",
    ],
    challenges: [
      { title: "Content models & rich text", description: "Contentful uses content models (similar to schemas). Map each model to a RankFlo project. Contentful's rich text format converts cleanly to RankFlo blocks." },
      { title: "References between entries", description: "Contentful supports linked entries (e.g., a blog post → an author entry). The importer preserves these as relations using tags." },
      { title: "Multiple environments", description: "If you use Contentful's Master + Preview environments, plan one RankFlo project per environment, or use the draft/published distinction RankFlo provides natively." },
    ],
    steps: [
      { title: "Install Contentful CLI", description: "npm install -g contentful-cli. Then run contentful login.", estimatedTime: "5 min" },
      { title: "Export your space", description: "contentful space export --space-id YOUR_SPACE_ID. Outputs a contentful-export-*.json file.", estimatedTime: "5–30 min depending on space size" },
      { title: "Run the Contentful importer", description: "Settings → Import → Contentful (JSON). Upload the export file. We map content types to projects and entries to posts.", estimatedTime: "10 min" },
      { title: "Re-host assets", description: "Contentful assets are hosted at images.ctfassets.net. The importer fetches and re-uploads to RankFlo's storage." },
      { title: "Update your frontend", description: "Replace Contentful Delivery API calls with RankFlo's REST endpoints. The shape is similar — fields like fields.title, fields.body translate directly." },
    ],
    exportFormat: "JSON via Contentful CLI",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Strapi",
    fromTagline: "Self-host with less config — RankFlo gives you out-of-the-box SEO, AI, and analytics.",
    whyMigrate: [
      "Out-of-the-box: AI writing, SEO scoring, analytics — Strapi requires plugins for everything",
      "Modern Next.js + Tiptap stack — Strapi's admin UI is older",
      "Type-safe tRPC API alongside REST",
      "Built-in cookieless analytics, no separate Plausible/Umami install",
      "Same self-host story (Docker Compose) but with batteries included",
      "Native scheduled publishing, team roles, and approvals",
    ],
    challenges: [
      { title: "Custom content types", description: "Strapi lets you define any content type. Map each to a RankFlo project (or use tags for finer-grained categorization)." },
      { title: "Plugins", description: "Strapi plugins (i18n, SEO, GraphQL, etc.) translate to RankFlo's built-in features in most cases. Check our feature matrix in the migration tool." },
    ],
    steps: [
      { title: "Export Strapi data via API", description: "Hit Strapi's REST API: GET /api/articles?populate=*. Save as JSON. Or use Strapi's import-export plugin if installed.", estimatedTime: "10 min" },
      { title: "Run the Strapi importer", description: "Settings → Import → Strapi (JSON). Map fields and run import.", estimatedTime: "5–15 min" },
      { title: "Re-host assets", description: "Strapi uploads live in your own /uploads folder or S3. The importer fetches by URL and re-uploads to RankFlo." },
      { title: "Update API consumers", description: "Replace /api/articles calls with RankFlo's /api/v1/content. Field shapes are similar; titles, slugs, and body content map directly." },
    ],
    exportFormat: "JSON via Strapi REST API or import-export plugin",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Sanity",
    fromTagline: "Move off Sanity Studio — keep the structured-content workflow, lose the per-API-call billing.",
    whyMigrate: [
      "No per-API-call billing — Sanity charges per request after free tier",
      "Open source and self-hostable — Sanity Studio is open source but the backend is SaaS",
      "Built-in AI writing and SEO tools — Sanity needs custom plugins",
      "Native cookieless analytics",
      "Type-safe API for any frontend",
      "Cheaper at scale — RankFlo Pro is $5/mo flat, no usage tier",
    ],
    challenges: [
      { title: "GROQ → REST/tRPC", description: "Sanity uses GROQ as its query language. RankFlo uses standard REST + tRPC. Translate your GROQ queries to RankFlo API calls." },
      { title: "Portable Text → Tiptap", description: "Sanity's Portable Text format (block content) maps cleanly to Tiptap blocks. Custom block types may need manual conversion." },
      { title: "References between documents", description: "Sanity references (cross-document links) become tag-based relations or post-to-post links in RankFlo." },
    ],
    steps: [
      { title: "Export Sanity dataset", description: "sanity dataset export production output.tar.gz. Outputs a tar archive of all documents and assets.", estimatedTime: "5–15 min" },
      { title: "Run the Sanity importer", description: "Settings → Import → Sanity (tar). Upload the archive. We parse documents, convert Portable Text to blocks, and re-upload assets." },
      { title: "Translate GROQ queries", description: "Update your frontend code to use RankFlo's REST endpoints. Common GROQ patterns (like *[_type == \"post\"]) become /api/v1/content?type=post." },
    ],
    exportFormat: "tar.gz via Sanity CLI",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Wix",
    fromTagline: "Take your Wix Blog content somewhere it can actually rank.",
    whyMigrate: [
      "Wix Blog has notoriously weak SEO — page speed and structure are problems",
      "Real headless API for any frontend",
      "Custom domain without Wix's premium plan upcharges",
      "AI content generation and real-time SEO scoring",
      "Cookieless analytics",
      "Self-hostable if you want full control",
    ],
    challenges: [
      { title: "Wix Blog export is RSS-only", description: "Wix doesn't offer a true content export. Best path: RSS feed + manual scraping. Our importer does both." },
      { title: "Image hosting", description: "Wix images are hosted on their CDN. The importer fetches each image during migration." },
    ],
    steps: [
      { title: "Find your Wix RSS feed", description: "Wix Blog RSS lives at yoursite.com/blog-feed.xml or similar. Save the URL." },
      { title: "Run the Wix importer", description: "Settings → Import → Wix RSS. Provide your RSS URL. We crawl posts via the feed and scrape any missing fields directly from the live pages.", estimatedTime: "20–60 min" },
      { title: "Add metadata manually", description: "RSS doesn't include all metadata (categories, custom fields). Spot-check imported posts and add tags as needed." },
      { title: "Set up redirects", description: "Wix uses /post/slug or /blog/slug. Use Cloudflare redirects to forward old URLs to your new RankFlo URLs." },
    ],
    exportFormat: "RSS feed (Wix has no proper export)",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Squarespace",
    fromTagline: "Move from Squarespace's all-in-one to a flexible headless setup.",
    whyMigrate: [
      "Real API for any frontend (Squarespace's Developer Platform is limited)",
      "AI content generation built in",
      "Better SEO controls — Squarespace's URL structure is rigid",
      "Custom domain without their premium plan",
      "Open source and self-hostable",
      "Type-safe API for headless commerce, SSR, or static generation",
    ],
    challenges: [
      { title: "Squarespace export is WXR (WordPress format)", description: "Squarespace exports in WordPress's WXR XML format. We parse it the same way as WordPress imports." },
      { title: "Page-builder content", description: "Squarespace's blocks (image gallery, embed, summary block) translate to RankFlo blocks where possible. Some custom Squarespace blocks become HTML." },
    ],
    steps: [
      { title: "Export from Squarespace", description: "Settings → Advanced → Import / Export → Export → choose WordPress format. Download the .xml file.", estimatedTime: "5 min" },
      { title: "Run the WordPress (WXR) importer", description: "Same importer as for WordPress migrations — Settings → Import → WordPress (WXR). Upload the .xml.", estimatedTime: "10–30 min" },
      { title: "Review imported content", description: "Squarespace blocks may render slightly differently. Spot-check formatting." },
      { title: "Set up redirects", description: "Squarespace blog URLs are /blog/year/month/slug or similar. Map to your new RankFlo /blog/slug structure." },
    ],
    exportFormat: "WXR (WordPress format)",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Blogger",
    fromTagline: "Move off Google's old blogging platform to something modern and SEO-friendly.",
    whyMigrate: [
      "Modern editor — Blogger's editor hasn't been updated in years",
      "AI content generation and real-time SEO scoring",
      "Custom domain without Google's clunky DNS setup",
      "Real analytics (Blogger relies on basic Google Analytics)",
      "Self-hostable, open source",
      "Type-safe API for headless setups",
    ],
    challenges: [
      { title: "Blogger's old XML format", description: "Blogger exports as Atom XML. The importer parses it; older posts may have basic HTML formatting." },
      { title: "Comments", description: "Blogger comments don't transfer (different system). If you have an active comment community, plan to add a comments tool (Disqus, Hyvor) on RankFlo." },
    ],
    steps: [
      { title: "Export from Blogger", description: "Blogger Settings → Other → Back up content. Downloads an .xml (Atom) file.", estimatedTime: "5 min" },
      { title: "Run the Blogger importer", description: "Settings → Import → Blogger (Atom XML). Upload the file.", estimatedTime: "10 min" },
      { title: "Set up redirects", description: "Blogger URLs are like yoursite.blogspot.com/year/month/slug.html. Use Cloudflare or your reverse proxy to redirect to RankFlo's /blog/slug." },
    ],
    exportFormat: "Atom XML",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "Tumblr",
    fromTagline: "Move your Tumblr posts to a real platform with SEO and a custom domain.",
    whyMigrate: [
      "Real SEO — Tumblr's structure isn't built for ranking",
      "Custom domain without Tumblr's branding",
      "AI content generation and analytics built in",
      "Real archive structure with tags, categories, and search",
      "Self-hostable if you want full ownership",
    ],
    challenges: [
      { title: "Tumblr's post types (text, photo, quote, link, audio, video)", description: "Tumblr has multiple post types. We map text and photo posts to standard blog posts; quote/link/audio/video posts become specialized blocks." },
    ],
    steps: [
      { title: "Export Tumblr blog", description: "Tumblr account settings → Export. Downloads a .zip with HTML files and media." },
      { title: "Run the Tumblr importer", description: "Settings → Import → Tumblr (zip). Upload the .zip; we parse posts and re-host media." },
      { title: "Set up redirects from yourname.tumblr.com to your new domain", description: "Use a custom Tumblr theme that injects a 301 to your new URL, or move on entirely." },
    ],
    exportFormat: "ZIP archive (HTML + media)",
    postMigration: STANDARD_POST_MIGRATION,
  }),
  M({
    fromName: "HubSpot",
    fromTagline: "Pull your blog out of HubSpot's marketing suite — no need for the full stack.",
    whyMigrate: [
      "HubSpot's CMS Hub is expensive ($300+/mo); RankFlo is $5/mo or free self-hosted",
      "Built-in AI content generation",
      "Real-time SEO scoring",
      "Type-safe API — HubSpot's API works but is complex",
      "Pair RankFlo with any frontend — keep HubSpot CRM for sales/marketing while moving content",
      "Faster page loads than HubSpot CMS",
    ],
    challenges: [
      { title: "HubSpot's design templates", description: "HubSpot blog templates use HubL (HubSpot Language). Don't try to migrate templates — rebuild with a modern frontend (Next.js / Astro) hitting RankFlo's API." },
      { title: "Smart content (personalization)", description: "If you used HubSpot's smart content (different copy per persona), this is a frontend feature. Implement on your new frontend with the same persona logic." },
    ],
    steps: [
      { title: "Export blog posts via HubSpot API", description: "HubSpot's CMS API: GET /cms/v3/blogs/posts. Iterate through all posts (paginated). Or use HubSpot's UI export if available on your plan." },
      { title: "Run the HubSpot importer", description: "Settings → Import → HubSpot (JSON). Provide your HubSpot API key; we fetch posts directly.", estimatedTime: "10–30 min" },
      { title: "Re-host featured images", description: "HubSpot images live at hubspot.net CDN. The importer fetches each image." },
      { title: "Migrate frontend", description: "Build a new frontend (Next.js / Astro / your existing site) that fetches from RankFlo's REST API. Keep HubSpot for forms, CRM, and marketing automation." },
    ],
    exportFormat: "JSON via HubSpot CMS API",
    postMigration: STANDARD_POST_MIGRATION,
  }),
]);

export const ALL_MIGRATION_SLUGS = Object.keys(MIGRATIONS);

export function getMigration(slug: string): MigrationGuide | undefined {
  return MIGRATIONS[slug];
}
