import type { EditorBlock, BlockPropsMap } from "@rankflo/core/types";
import { blocksToPlainText } from "./editor-utils";

// ─── Slugify ───────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// ─── SEO Check Types ───────────────────────────────────
export interface SeoCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  message: string;
  weight: number;
}

export interface SeoResult {
  score: number; // 0-100
  checks: SeoCheck[];
}

// ─── Client-side SEO Audit ─────────────────────────────
export function computeSeoScore(opts: {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  ogImage: string;
  blocks: EditorBlock[];
}): SeoResult {
  const plainText = blocksToPlainText(opts.blocks);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const checks: SeoCheck[] = [
    checkMetaTitle(opts.metaTitle || opts.title),
    checkMetaDescription(opts.metaDescription || opts.excerpt),
    checkContentLength(wordCount),
    checkOgImage(opts.ogImage || opts.featuredImage),
    checkExcerpt(opts.excerpt),
    checkSlug(opts.slug),
    checkFeaturedImage(opts.featuredImage),
    checkHeadingStructure(opts.blocks),
    checkImageAlt(opts.blocks),
  ];

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => {
    if (c.status === "pass") return sum + c.weight;
    if (c.status === "warning") return sum + c.weight * 0.5;
    return sum;
  }, 0);

  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;

  return { score, checks };
}

// ─── Individual Checks ─────────────────────────────────
function checkMetaTitle(title: string): SeoCheck {
  const len = title.length;
  if (len >= 30 && len <= 60) {
    return { id: "metaTitle", label: "Meta Title", status: "pass", message: `${len} chars (ideal: 30-60)`, weight: 15 };
  }
  if (len > 0 && len < 30) {
    return { id: "metaTitle", label: "Meta Title", status: "warning", message: `${len} chars — too short (aim for 30-60)`, weight: 15 };
  }
  if (len > 60) {
    return { id: "metaTitle", label: "Meta Title", status: "warning", message: `${len} chars — too long (aim for 30-60)`, weight: 15 };
  }
  return { id: "metaTitle", label: "Meta Title", status: "fail", message: "Missing meta title", weight: 15 };
}

function checkMetaDescription(desc: string): SeoCheck {
  const len = desc.length;
  if (len >= 120 && len <= 160) {
    return { id: "metaDesc", label: "Meta Description", status: "pass", message: `${len} chars (ideal: 120-160)`, weight: 15 };
  }
  if (len > 0 && len < 120) {
    return { id: "metaDesc", label: "Meta Description", status: "warning", message: `${len} chars — too short (aim for 120-160)`, weight: 15 };
  }
  if (len > 160) {
    return { id: "metaDesc", label: "Meta Description", status: "warning", message: `${len} chars — may be truncated (aim for 120-160)`, weight: 15 };
  }
  return { id: "metaDesc", label: "Meta Description", status: "fail", message: "Missing meta description", weight: 15 };
}

function checkContentLength(wordCount: number): SeoCheck {
  if (wordCount >= 300) {
    return { id: "contentLength", label: "Content Length", status: "pass", message: `${wordCount} words (300+ recommended)`, weight: 20 };
  }
  if (wordCount >= 100) {
    return { id: "contentLength", label: "Content Length", status: "warning", message: `${wordCount} words — aim for 300+`, weight: 20 };
  }
  return { id: "contentLength", label: "Content Length", status: "fail", message: `${wordCount} words — too short for SEO`, weight: 20 };
}

function checkOgImage(url: string): SeoCheck {
  if (url) {
    return { id: "ogImage", label: "OG Image", status: "pass", message: "Open Graph image set", weight: 10 };
  }
  return { id: "ogImage", label: "OG Image", status: "fail", message: "No OG image — social shares will lack a preview", weight: 10 };
}

function checkExcerpt(excerpt: string): SeoCheck {
  if (excerpt.length >= 50) {
    return { id: "excerpt", label: "Excerpt", status: "pass", message: "Excerpt is well-written", weight: 5 };
  }
  if (excerpt.length > 0) {
    return { id: "excerpt", label: "Excerpt", status: "warning", message: "Excerpt is short — aim for 50+ chars", weight: 5 };
  }
  return { id: "excerpt", label: "Excerpt", status: "fail", message: "Missing excerpt", weight: 5 };
}

function checkSlug(slug: string): SeoCheck {
  if (!slug) {
    return { id: "slug", label: "URL Slug", status: "fail", message: "Missing slug", weight: 10 };
  }
  if (slug.length <= 60 && /^[a-z0-9-]+$/.test(slug)) {
    return { id: "slug", label: "URL Slug", status: "pass", message: "Clean, readable URL", weight: 10 };
  }
  return { id: "slug", label: "URL Slug", status: "warning", message: "Slug should be lowercase with hyphens only", weight: 10 };
}

function checkFeaturedImage(url: string): SeoCheck {
  if (url) {
    return { id: "featuredImage", label: "Featured Image", status: "pass", message: "Featured image set", weight: 10 };
  }
  return { id: "featuredImage", label: "Featured Image", status: "warning", message: "No featured image — recommended for visual appeal", weight: 10 };
}

function checkHeadingStructure(blocks: EditorBlock[]): SeoCheck {
  const headings = blocks.filter((b) => b.type === "heading");
  const hasH1 = headings.some((b) => (b.props as BlockPropsMap["heading"]).level === 1);
  if (headings.length > 0 && hasH1) {
    return { id: "headings", label: "Heading Structure", status: "pass", message: `${headings.length} headings with H1`, weight: 10 };
  }
  if (headings.length > 0) {
    return { id: "headings", label: "Heading Structure", status: "warning", message: "No H1 found — add one for better SEO", weight: 10 };
  }
  return { id: "headings", label: "Heading Structure", status: "fail", message: "No headings — use headings to structure content", weight: 10 };
}

function checkImageAlt(blocks: EditorBlock[]): SeoCheck {
  const images = blocks.filter((b) => b.type === "image");
  if (images.length === 0) {
    return { id: "imageAlt", label: "Image Alt Text", status: "pass", message: "No images to check", weight: 5 };
  }
  const withAlt = images.filter((b) => (b.props as BlockPropsMap["image"]).alt.length > 0);
  if (withAlt.length === images.length) {
    return { id: "imageAlt", label: "Image Alt Text", status: "pass", message: `All ${images.length} images have alt text`, weight: 5 };
  }
  return { id: "imageAlt", label: "Image Alt Text", status: "warning", message: `${withAlt.length}/${images.length} images have alt text`, weight: 5 };
}
