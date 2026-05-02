import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io";

export interface ToolSeo {
  slug: string;
  name: string;
  title: string;
  description: string;
  keywords: string[];
  faq: Array<{ q: string; a: string }>;
}

export const TOOLS: Record<string, ToolSeo> = {
  "blog-title-generator": {
    slug: "blog-title-generator",
    name: "Blog Title Generator",
    title: "Free Blog Title Generator — Create SEO-Optimized Headlines",
    description:
      "Generate catchy, SEO-friendly blog titles that drive clicks. Free tool — no signup, unlimited titles from proven copywriting formulas. Try it now.",
    keywords: [
      "blog title generator",
      "headline generator",
      "SEO title generator",
      "blog post title ideas",
      "catchy blog titles",
    ],
    faq: [
      {
        q: "What makes a good blog title for SEO?",
        a: "A good SEO blog title is under 60 characters, includes your primary keyword near the beginning, triggers curiosity or promises a benefit, and matches search intent. Titles with numbers, brackets, or power words (ultimate, proven, complete) tend to get higher CTR.",
      },
      {
        q: "How long should a blog title be?",
        a: "Keep blog titles between 50-60 characters so they don't get truncated in Google search results. Mobile SERPs cut off around 55 characters. The title tag in your HTML can be slightly different from the H1 heading.",
      },
      {
        q: "Is this blog title generator free?",
        a: "Yes, this tool is 100% free, with no signup required and no usage limits. Generate as many titles as you need.",
      },
    ],
  },
  "meta-description-generator": {
    slug: "meta-description-generator",
    name: "Meta Description Generator",
    title: "Free Meta Description Generator — SERP-Optimized Snippets",
    description:
      "Write compelling meta descriptions that boost click-through rates. Free tool generates 155-character snippets optimized for Google search results.",
    keywords: [
      "meta description generator",
      "SEO meta description",
      "SERP snippet generator",
      "meta description tool",
    ],
    faq: [
      {
        q: "What is a meta description?",
        a: "A meta description is a short HTML tag (around 155 characters) that summarizes a page's content. It appears under the page title in Google search results and directly impacts click-through rate, though it's not a direct ranking factor.",
      },
      {
        q: "How long should a meta description be?",
        a: "Keep meta descriptions between 150-160 characters. Google truncates longer descriptions with an ellipsis. On mobile, limits can be even shorter (around 120 characters).",
      },
      {
        q: "Does Google always use my meta description?",
        a: "No. Google rewrites about 70% of meta descriptions to better match search intent. A well-crafted meta description that matches popular queries is more likely to be shown as-is.",
      },
    ],
  },
  "reading-time-calculator": {
    slug: "reading-time-calculator",
    name: "Reading Time Calculator",
    title: "Reading Time Calculator — Estimate Article Length",
    description:
      "Calculate accurate reading time for blog posts and articles. Free tool uses average reading speeds to estimate how long your content takes to read.",
    keywords: [
      "reading time calculator",
      "estimate reading time",
      "blog reading time",
      "word to time converter",
    ],
    faq: [
      {
        q: "How is reading time calculated?",
        a: "Reading time is based on the average adult reading speed of 238 words per minute (WPM) for non-fiction content. We count the words in your text and divide by this rate to estimate reading time.",
      },
      {
        q: "Why show reading time on blog posts?",
        a: "Displaying reading time improves user experience and increases engagement. Studies show it reduces bounce rate by setting reader expectations. It's also a UX signal that can indirectly help SEO.",
      },
    ],
  },
  "schema-generator": {
    slug: "schema-generator",
    name: "Schema Markup Generator",
    title: "Free Schema Markup Generator — JSON-LD Structured Data",
    description:
      "Generate schema.org JSON-LD markup for Article, FAQ, Product, Organization, and more. Free tool to get rich results in Google search.",
    keywords: [
      "schema generator",
      "JSON-LD generator",
      "structured data generator",
      "schema markup tool",
      "rich results schema",
    ],
    faq: [
      {
        q: "What is schema markup?",
        a: "Schema markup (schema.org) is structured data that helps search engines understand your content. When added via JSON-LD, it enables rich results like star ratings, FAQs, recipes, and more in Google search — dramatically boosting CTR.",
      },
      {
        q: "Does schema markup improve SEO?",
        a: "Schema isn't a direct ranking factor, but rich results increase click-through rate by 20-40%. That higher engagement indirectly improves rankings. It also makes your content eligible for AI overviews and voice search.",
      },
      {
        q: "Where do I add the generated schema?",
        a: "Paste the JSON-LD inside a <script type=\"application/ld+json\"> tag in your page's <head>. Most CMSs have SEO plugins that let you add custom schema.",
      },
    ],
  },
  "og-preview": {
    slug: "og-preview",
    name: "Open Graph Preview",
    title: "Open Graph Preview — Test Social Share Cards",
    description:
      "Preview how your links appear on Facebook, Twitter, LinkedIn, and Slack. Free OG tag tester — see your social cards before sharing.",
    keywords: [
      "open graph preview",
      "OG tag tester",
      "social share preview",
      "Twitter card preview",
      "Facebook link preview",
    ],
    faq: [
      {
        q: "What are Open Graph tags?",
        a: "Open Graph (OG) tags are HTML meta tags that control how your URLs appear when shared on social media. They define the title, description, and image shown in the preview card on Facebook, LinkedIn, Slack, WhatsApp, and similar platforms.",
      },
      {
        q: "What's the ideal OG image size?",
        a: "1200×630 pixels is the recommended size for Open Graph images. This works well across all major platforms. Twitter supports summary_large_image cards at the same dimensions.",
      },
    ],
  },
  "robots-txt-generator": {
    slug: "robots-txt-generator",
    name: "robots.txt Generator",
    title: "Free robots.txt Generator — Control Search Crawlers",
    description:
      "Create a robots.txt file to tell Google, Bing, and AI crawlers what to index. Free generator with presets for WordPress, Shopify, Next.js, and more.",
    keywords: [
      "robots.txt generator",
      "robots.txt creator",
      "crawl control",
      "block crawlers",
      "AI bot blocking",
    ],
    faq: [
      {
        q: "What is robots.txt?",
        a: "robots.txt is a plain text file at the root of your domain that tells search engine crawlers which pages they can or cannot access. It's the first file Googlebot reads when crawling your site.",
      },
      {
        q: "Should I block AI crawlers like GPTBot?",
        a: "It depends on your content strategy. Blocking GPTBot, Claude-Web, and others prevents LLMs from training on your content, but also prevents them from citing you in AI answers. Many publishers allow them for visibility, then use licensing agreements for compensation.",
      },
    ],
  },
  "heading-checker": {
    slug: "heading-checker",
    name: "Heading Structure Checker",
    title: "Heading Structure Checker — Audit H1-H6 Hierarchy",
    description:
      "Check your page's heading hierarchy (H1, H2, H3) for SEO and accessibility. Free tool audits structure, detects missing levels, and multiple H1s.",
    keywords: [
      "heading checker",
      "H1 checker",
      "heading hierarchy",
      "SEO heading audit",
      "accessibility checker",
    ],
    faq: [
      {
        q: "Should I have only one H1 per page?",
        a: "Yes. Best practice is one H1 per page that describes the main topic. Multiple H1s can confuse search engines about which heading is most important, though modern Google handles it better than before.",
      },
      {
        q: "Why does heading structure matter for SEO?",
        a: "Headings create a content outline that helps Google understand your page structure and relevance. They also improve accessibility for screen readers. A logical H1 → H2 → H3 hierarchy signals well-organized content.",
      },
    ],
  },
  "word-counter": {
    slug: "word-counter",
    name: "Word Counter",
    title: "Free Word Counter — Count Words, Characters & Paragraphs",
    description:
      "Count words, characters, sentences, and paragraphs instantly. Free online word counter with reading time estimate. No signup required.",
    keywords: [
      "word counter",
      "character counter",
      "word count tool",
      "text counter",
      "paragraph counter",
    ],
    faq: [
      {
        q: "How long should a blog post be for SEO?",
        a: "The sweet spot for most SEO content is 1,500-2,500 words. In-depth guides and pillar pages can run 3,000-5,000+ words. Quality and keyword coverage matter more than raw word count — don't pad for length.",
      },
      {
        q: "Does word count affect Google rankings?",
        a: "Not directly. Google ranks content based on relevance, authority, and user intent. But longer content tends to cover topics more thoroughly, earning more backlinks and time-on-page signals, which correlate with better rankings.",
      },
    ],
  },
  "slug-generator": {
    slug: "slug-generator",
    name: "URL Slug Generator",
    title: "Free URL Slug Generator — SEO-Friendly Permalinks",
    description:
      "Generate clean, SEO-friendly URL slugs from any title. Free tool handles special characters, accents, and languages. Instant slug creation.",
    keywords: [
      "slug generator",
      "URL slug",
      "permalink generator",
      "SEO URL",
      "slugify",
    ],
    faq: [
      {
        q: "What makes a good URL slug?",
        a: "A good SEO slug is short (3-5 words), lowercase, uses hyphens (not underscores), includes your target keyword, and omits filler words like 'the' and 'and'. Avoid dates unless the content is time-sensitive.",
      },
      {
        q: "Should I change existing slugs?",
        a: "Generally no. Changing a slug breaks any backlinks pointing to the old URL. If you must change one, always set up a 301 redirect from old to new to preserve SEO value.",
      },
    ],
  },
  "markdown-to-html": {
    slug: "markdown-to-html",
    name: "Markdown to HTML Converter",
    title: "Free Markdown to HTML Converter — Instant Conversion",
    description:
      "Convert Markdown to clean HTML instantly. Supports GitHub Flavored Markdown, code blocks, tables, and more. Free online converter — no signup.",
    keywords: [
      "markdown to html",
      "markdown converter",
      "md to html",
      "markdown tool",
      "GFM converter",
    ],
    faq: [
      {
        q: "What is Markdown?",
        a: "Markdown is a lightweight markup language that converts plain-text formatting into HTML. It's widely used for README files, blog posts, and documentation. Symbols like # for headings and ** for bold make it readable even in raw form.",
      },
      {
        q: "Does the converter support GitHub Flavored Markdown?",
        a: "Yes — including tables, task lists, strikethrough, fenced code blocks with syntax highlighting, and automatic URL linking.",
      },
    ],
  },
  "hreflang-generator": {
    slug: "hreflang-generator",
    name: "Hreflang Tag Generator",
    title: "Free Hreflang Tag Generator — Multi-Language SEO",
    description:
      "Generate hreflang tags for multi-language and multi-region websites. Free tool creates valid rel=alternate tags to avoid duplicate content issues.",
    keywords: [
      "hreflang generator",
      "hreflang tags",
      "multi-language SEO",
      "international SEO",
      "rel alternate",
    ],
    faq: [
      {
        q: "What does hreflang do?",
        a: "Hreflang tells Google which language version of a page to serve to users in different regions. Without it, Google might show your English page to French searchers, or treat multiple language versions as duplicate content.",
      },
      {
        q: "Do I need x-default hreflang?",
        a: "Yes, recommended. The x-default tag specifies the fallback page when no language matches the user's browser. Usually this points to your English version or a language selector page.",
      },
    ],
  },
  "keyword-density-checker": {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    title: "Free Keyword Density Checker — Analyze Content SEO",
    description:
      "Check keyword density and frequency in any text. Free SEO tool identifies over-optimization, keyword stuffing, and optimal keyword distribution.",
    keywords: [
      "keyword density checker",
      "keyword frequency",
      "SEO keyword tool",
      "keyword analysis",
      "keyword counter",
    ],
    faq: [
      {
        q: "What is keyword density?",
        a: "Keyword density is the percentage of times a keyword appears in your content relative to total word count. E.g., 10 instances in a 1,000-word article = 1% density. It's a rough signal of topic focus — not a strict rule.",
      },
      {
        q: "What's the ideal keyword density?",
        a: "Aim for 1-2% for your primary keyword. Above 3% risks keyword stuffing, which can trigger Google penalties. Focus on semantic variations and natural phrasing rather than hitting exact numbers.",
      },
    ],
  },
  "sitemap-generator": {
    slug: "sitemap-generator",
    name: "XML Sitemap Generator",
    title: "Free XML Sitemap Generator — Crawl-Ready Sitemaps",
    description:
      "Generate XML sitemaps for Google Search Console. Free tool creates valid sitemap.xml files with priority, lastmod, and changefreq tags.",
    keywords: [
      "sitemap generator",
      "XML sitemap",
      "sitemap.xml creator",
      "Google sitemap",
      "SEO sitemap",
    ],
    faq: [
      {
        q: "What is an XML sitemap?",
        a: "An XML sitemap is a file that lists all the pages on your site you want search engines to crawl. Submit it to Google Search Console to speed up indexing, especially for new sites or pages without many internal links.",
      },
      {
        q: "Where should I put sitemap.xml?",
        a: "Place sitemap.xml at the root of your domain (yoursite.com/sitemap.xml) and reference it in robots.txt with 'Sitemap: https://yoursite.com/sitemap.xml'. Submit it in Google Search Console under Sitemaps.",
      },
    ],
  },
};

export function buildToolMetadata(slug: string): Metadata {
  const tool = TOOLS[slug];
  if (!tool) return {};
  const url = `${BASE_URL}/tools/${slug}`;
  const ogImage = `${BASE_URL}/api/og?title=${encodeURIComponent(tool.name)}`;
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: tool.title,
      description: tool.description,
      siteName: "RankFlo",
      images: [{ url: ogImage, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.description,
      images: [ogImage],
    },
  };
}

export function buildToolJsonLd(slug: string) {
  const tool = TOOLS[slug];
  if (!tool) return null;
  const url = `${BASE_URL}/tools/${slug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "RankFlo",
      url: BASE_URL,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Free Tools", item: `${BASE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: url },
    ],
  };

  return { faqSchema, softwareSchema, breadcrumbSchema };
}
