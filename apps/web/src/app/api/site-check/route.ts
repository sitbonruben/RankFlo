import { NextRequest, NextResponse } from "next/server";

const TIMEOUT_MS = 8000;

// SSRF protection — block private/loopback ranges
function isPrivateUrl(url: URL): boolean {
  const h = url.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
  const parts = h.split(".").map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  return false;
}

function between(html: string, open: string, close: string): string | null {
  const start = html.indexOf(open);
  if (start === -1) return null;
  const end = html.indexOf(close, start + open.length);
  if (end === -1) return null;
  return html.slice(start + open.length, end).trim();
}

function metaContent(html: string, nameOrProp: string): string | null {
  const lc = html.toLowerCase();
  const patterns = [
    `name="${nameOrProp}"`,
    `name='${nameOrProp}'`,
    `property="${nameOrProp}"`,
    `property='${nameOrProp}'`,
  ];
  for (const pat of patterns) {
    const idx = lc.indexOf(pat);
    if (idx === -1) continue;
    // look for content= on the same tag (within 300 chars)
    const tagChunk = html.slice(Math.max(0, idx - 50), idx + 300);
    const m = tagChunk.match(/content=["']([^"']*)/i);
    if (m) return m[1];
  }
  return null;
}

export interface SiteCheckResult {
  url: string;
  score: number;
  checks: Array<{
    id: string;
    label: string;
    detail: string;
    status: "good" | "warn" | "bad";
  }>;
  error?: string;
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "Only http/https allowed" }, { status: 400 });
  }

  if (isPrivateUrl(parsed)) {
    return NextResponse.json({ error: "Private URLs not allowed" }, { status: 400 });
  }

  let html = "";
  try {
    const res = await fetch(parsed.toString(), {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent": "RankFlo-SiteCheck/1.0 (site analysis bot; +https://rankflo.io)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    return NextResponse.json(
      { error: `Could not reach ${parsed.hostname}. Make sure the URL is public.` },
      { status: 422 },
    );
  }

  const lc = html.toLowerCase();
  const checks: SiteCheckResult["checks"] = [];

  // 1. Title tag
  const title = between(html, "<title", "</title>")?.replace(/^[^>]*>/, "").trim() ?? null;
  if (!title) {
    checks.push({ id: "title", label: "Title tag missing", detail: "Pages with no title get 0% click-through from search.", status: "bad" });
  } else if (title.length < 20 || title.length > 70) {
    checks.push({ id: "title", label: `Title too ${title.length < 20 ? "short" : "long"} (${title.length} chars)`, detail: "Optimal title length is 40–65 characters for search results.", status: "warn" });
  } else {
    checks.push({ id: "title", label: "Title tag looks good", detail: `"${title.slice(0, 50)}${title.length > 50 ? "…" : ""}"`, status: "good" });
  }

  // 2. Meta description
  const metaDesc = metaContent(html, "description");
  if (!metaDesc) {
    checks.push({ id: "meta", label: "Meta description missing", detail: "Google generates its own snippets — usually worse than yours. Add one.", status: "bad" });
  } else if (metaDesc.length < 50 || metaDesc.length > 165) {
    checks.push({ id: "meta", label: `Meta description ${metaDesc.length < 50 ? "too short" : "too long"} (${metaDesc.length} chars)`, detail: "Sweet spot is 120–155 characters for full display in SERPs.", status: "warn" });
  } else {
    checks.push({ id: "meta", label: "Meta description is set", detail: `${metaDesc.length} characters — good length.`, status: "good" });
  }

  // 3. Blog / content section
  const hasBlogLink = /href=["'][^"']*\/(blog|posts|news|articles|updates|insights|resources)[/"']/.test(lc);
  const hasBlogInContent = /(\/blog|\/posts|\/news|\/articles)/.test(lc);
  if (!hasBlogLink && !hasBlogInContent) {
    checks.push({ id: "blog", label: "No blog detected", detail: "Sites with a blog get 55% more organic visitors. This is your biggest content gap.", status: "bad" });
  } else {
    checks.push({ id: "blog", label: "Blog section found", detail: "Great — content drives 3–5× more traffic than pages alone.", status: "good" });
  }

  // 4. Structured data (JSON-LD)
  const hasJsonLd = lc.includes('type="application/ld+json"') || lc.includes("type='application/ld+json'");
  if (!hasJsonLd) {
    checks.push({ id: "schema", label: "No structured data (JSON-LD)", detail: "Structured data unlocks rich results in Google — star ratings, FAQs, breadcrumbs.", status: "bad" });
  } else {
    checks.push({ id: "schema", label: "Structured data detected", detail: "Eligible for rich results in Google search.", status: "good" });
  }

  // 5. Open Graph
  const ogTitle = metaContent(html, "og:title");
  const ogImage = metaContent(html, "og:image");
  if (!ogTitle || !ogImage) {
    checks.push({ id: "og", label: "Open Graph tags incomplete", detail: "Social shares without OG tags look plain and get fewer clicks.", status: "warn" });
  } else {
    checks.push({ id: "og", label: "Open Graph tags set", detail: "Social shares will show a rich preview with image.", status: "good" });
  }

  // 6. LLM visibility signal — look for llms.txt or AI-optimized content
  let hasLlmsTxt = false;
  try {
    const r = await fetch(`${parsed.origin}/llms.txt`, { signal: AbortSignal.timeout(3000) });
    hasLlmsTxt = r.ok;
  } catch { /* ignore */ }
  if (!hasLlmsTxt) {
    checks.push({ id: "llm", label: "Not optimized for AI search", detail: "ChatGPT, Perplexity, and Claude can't easily cite you. Add an llms.txt and structured content.", status: "bad" });
  } else {
    checks.push({ id: "llm", label: "llms.txt detected", detail: "AI assistants can discover and cite your content.", status: "good" });
  }

  const good = checks.filter((c) => c.status === "good").length;
  const score = Math.round((good / checks.length) * 100);

  const result: SiteCheckResult = {
    url: parsed.origin,
    score,
    checks,
  };

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
