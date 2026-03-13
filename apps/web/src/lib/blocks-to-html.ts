/**
 * Server-safe block renderer — no browser APIs, no "use client".
 * Used by API routes to convert EditorDocument blocks → HTML.
 */

interface AnyBlock {
  id: string;
  type: string;
  props: Record<string, any>;
}

export function renderBlocksToHtml(blocks: AnyBlock[]): string {
  return blocks.map(renderBlock).join("\n");
}

export function renderBlocksToPlainText(blocks: AnyBlock[]): string {
  return blocks.map(blockToText).filter(Boolean).join("\n\n");
}

function renderBlock(block: AnyBlock): string {
  const p = block.props;
  switch (block.type) {
    case "hero":
      return `<header class="hero hero--${p.height ?? "medium"} hero--${p.alignment ?? "center"}"${
        p.backgroundImage ? ` style="background-image:url(${p.backgroundImage});background-size:cover;background-position:center"` : ""
      }><h1>${esc(p.title ?? "")}</h1>${p.subtitle ? `<p>${esc(p.subtitle)}</p>` : ""}</header>`;

    case "heading": {
      const tag = `h${p.level ?? 2}`;
      return `<${tag} style="text-align:${p.alignment ?? "left"}">${esc(p.text ?? "")}</${tag}>`;
    }

    case "text":
      // html prop may already contain full HTML (including images, bold, etc.)
      return `<div style="text-align:${p.alignment ?? "left"}">${p.html ?? ""}</div>`;

    case "image": {
      if (!p.src) return "";
      const img = `<img src="${esc(p.src)}" alt="${esc(p.alt ?? "")}"${p.rounded ? ' class="rounded"' : ""} style="max-width:100%" />`;
      return p.caption
        ? `<figure>${img}<figcaption>${esc(p.caption)}</figcaption></figure>`
        : img;
    }

    case "quote":
      return `<blockquote class="quote--${p.style ?? "bordered"}"><p>${esc(p.text ?? "")}</p>${p.author ? `<cite>${esc(p.author)}</cite>` : ""}</blockquote>`;

    case "code":
      return `<pre><code class="language-${esc(p.language ?? "text")}">${esc(p.code ?? "")}</code></pre>`;

    case "callout":
      return `<aside class="callout callout--${p.type ?? "info"}"><strong>${esc(p.title ?? "")}</strong><p>${esc(p.text ?? "")}</p></aside>`;

    case "divider":
      return "<hr />";

    case "two-column": {
      const left = renderBlocksToHtml(p.leftChildren ?? []);
      const right = renderBlocksToHtml(p.rightChildren ?? []);
      return `<div class="columns columns--${p.ratio ?? "50-50"}"><div>${left}</div><div>${right}</div></div>`;
    }

    case "list": {
      const tag = p.style === "number" ? "ol" : "ul";
      const items = (p.items ?? []).map((i: string) => `<li>${esc(i)}</li>`).join("");
      return `<${tag}>${items}</${tag}>`;
    }

    case "embed": {
      if (!p.url) return "";
      if (p.type === "youtube") {
        const vid = extractYouTubeId(p.url);
        return vid
          ? `<iframe src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9"></iframe>`
          : `<a href="${esc(p.url)}">${esc(p.url)}</a>`;
      }
      return `<a href="${esc(p.url)}">${esc(p.url)}</a>`;
    }

    case "table-of-contents":
      return `<nav class="toc"><p><em>Table of Contents</em></p></nav>`;

    case "newsletter-cta":
      return `<aside class="newsletter-cta"><h3>${esc(p.title ?? "")}</h3><p>${esc(p.description ?? "")}</p></aside>`;

    case "author-bio":
      return `<div class="author-bio">${p.avatar ? `<img src="${esc(p.avatar)}" alt="${esc(p.name ?? "")}" />` : ""}<strong>${esc(p.name ?? "")}</strong><p>${esc(p.bio ?? "")}</p></div>`;

    default:
      return "";
  }
}

function blockToText(block: AnyBlock): string {
  const p = block.props;
  switch (block.type) {
    case "hero":         return [p.title, p.subtitle].filter(Boolean).join("\n");
    case "heading":      return p.text ?? "";
    case "text":         return stripHtml(p.html ?? "");
    case "quote":        return p.author ? `"${p.text}" — ${p.author}` : (p.text ?? "");
    case "code":         return p.code ?? "";
    case "callout":      return `${p.title ?? ""}: ${p.text ?? ""}`;
    case "list":         return (p.items ?? []).join("\n");
    case "newsletter-cta": return `${p.title ?? ""}\n${p.description ?? ""}`;
    case "author-bio":   return `${p.name ?? ""}\n${p.bio ?? ""}`;
    default:             return "";
  }
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}
