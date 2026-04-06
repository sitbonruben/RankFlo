import { nanoid } from "nanoid";
import type {
  BlockType,
  EditorBlock,
  EditorDocument,
  BlockPropsMap,
} from "@rankflo/core/types";

// ─── ID Generation ─────────────────────────────────────
export function generateBlockId(): string {
  return nanoid(10);
}

// ─── Create Empty Document ─────────────────────────────
export function createEmptyDocument(): EditorDocument {
  return {
    version: 1,
    blocks: [],
    metadata: {},
  };
}

// ─── Default Block Props ───────────────────────────────
export function createBlockDefaults<T extends BlockType>(
  type: T,
): BlockPropsMap[T] {
  const defaults: Record<BlockType, unknown> = {
    hero: {
      title: "Your Blog Title",
      subtitle: "A compelling subtitle that hooks your reader",
      backgroundImage: "",
      overlay: "dark",
      alignment: "center",
      height: "medium",
    },
    heading: {
      text: "Section Heading",
      level: 2,
      alignment: "left",
    },
    text: {
      html: "<p>Start writing your content here...</p>",
      alignment: "left",
    },
    image: {
      src: "",
      alt: "",
      caption: "",
      width: "large",
      rounded: true,
      shadow: false,
    },
    quote: {
      text: "Add an inspiring quote here",
      author: "",
      style: "bordered",
    },
    code: {
      code: "// Your code here",
      language: "typescript",
      filename: "",
      showLineNumbers: true,
    },
    callout: {
      text: "Add a helpful tip or important note here.",
      type: "info",
      title: "Note",
    },
    divider: {
      style: "line",
      spacing: "medium",
    },
    "two-column": {
      ratio: "50-50",
      gap: "medium",
      leftChildren: [],
      rightChildren: [],
    },
    list: {
      items: ["First item", "Second item", "Third item"],
      style: "bullet",
    },
    embed: {
      url: "",
      type: "generic",
      aspectRatio: "16:9",
    },
    "table-of-contents": {
      style: "minimal",
      maxDepth: 3,
    },
    "newsletter-cta": {
      title: "Stay Updated",
      description: "Get the latest posts delivered to your inbox.",
      buttonText: "Subscribe",
      style: "card",
      placeholder: "your@email.com",
    },
    "author-bio": {
      name: "",
      avatar: "",
      bio: "",
      links: [],
    },
  };

  return defaults[type] as BlockPropsMap[T];
}

// ─── Create Block ──────────────────────────────────────
export function createBlock<T extends BlockType>(
  type: T,
  overrides?: Partial<BlockPropsMap[T]>,
): EditorBlock<T> {
  return {
    id: generateBlockId(),
    type,
    props: { ...createBlockDefaults(type), ...overrides } as BlockPropsMap[T],
  };
}

// ─── Blocks → HTML ─────────────────────────────────────
export function blocksToHtml(blocks: EditorBlock[]): string {
  return blocks.map(blockToHtml).join("\n");
}

function blockToHtml(block: EditorBlock): string {
  switch (block.type) {
    case "hero": {
      const p = block.props as BlockPropsMap["hero"];
      const bgStyle = p.backgroundImage
        ? ` style="background-image:url(${p.backgroundImage});background-size:cover;background-position:center"`
        : "";
      return `<header class="hero hero--${p.height} hero--${p.alignment}"${bgStyle}><h1>${esc(p.title)}</h1>${p.subtitle ? `<p>${esc(p.subtitle)}</p>` : ""}</header>`;
    }
    case "heading": {
      const p = block.props as BlockPropsMap["heading"];
      const tag = `h${p.level}`;
      return `<${tag} style="text-align:${p.alignment}">${esc(p.text)}</${tag}>`;
    }
    case "text": {
      const p = block.props as BlockPropsMap["text"];
      return `<div style="text-align:${p.alignment}">${p.html}</div>`;
    }
    case "image": {
      const p = block.props as BlockPropsMap["image"];
      const img = `<img src="${esc(p.src)}" alt="${esc(p.alt)}"${p.rounded ? ' class="rounded"' : ""} />`;
      return p.caption
        ? `<figure>${img}<figcaption>${esc(p.caption)}</figcaption></figure>`
        : img;
    }
    case "quote": {
      const p = block.props as BlockPropsMap["quote"];
      return `<blockquote class="quote--${p.style}"><p>${esc(p.text)}</p>${p.author ? `<cite>${esc(p.author)}</cite>` : ""}</blockquote>`;
    }
    case "code": {
      const p = block.props as BlockPropsMap["code"];
      return `<pre><code class="language-${esc(p.language)}">${esc(p.code)}</code></pre>`;
    }
    case "callout": {
      const p = block.props as BlockPropsMap["callout"];
      return `<aside class="callout callout--${p.type}"><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></aside>`;
    }
    case "divider":
      return "<hr />";
    case "two-column": {
      const p = block.props as BlockPropsMap["two-column"];
      return `<div class="columns columns--${p.ratio}"><div>${blocksToHtml(p.leftChildren)}</div><div>${blocksToHtml(p.rightChildren)}</div></div>`;
    }
    case "list": {
      const p = block.props as BlockPropsMap["list"];
      const tag = p.style === "number" ? "ol" : "ul";
      const items = p.items.map((i) => `<li>${esc(i)}</li>`).join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "embed": {
      const p = block.props as BlockPropsMap["embed"];
      if (p.type === "youtube") {
        const vid = extractYouTubeId(p.url);
        return vid
          ? `<iframe src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>`
          : `<a href="${esc(p.url)}">${esc(p.url)}</a>`;
      }
      return `<a href="${esc(p.url)}">${esc(p.url)}</a>`;
    }
    case "table-of-contents":
      return `<nav class="toc"><p><em>Table of Contents</em></p></nav>`;
    case "newsletter-cta": {
      const p = block.props as BlockPropsMap["newsletter-cta"];
      const formId = `rf-sub-${block.id}`;
      return `<aside class="newsletter-cta" style="background:#111;border:1px solid #222;border-radius:12px;padding:32px;text-align:center;margin:24px 0;">
  <h3 style="color:#fff;margin:0 0 8px;">${esc(p.title)}</h3>
  <p style="color:#999;margin:0 0 16px;font-size:14px;">${esc(p.description)}</p>
  <form id="${formId}" data-rankflo-subscribe style="display:flex;gap:8px;max-width:400px;margin:0 auto;" onsubmit="return(async function(e){e.preventDefault();var f=e.target,em=f.querySelector('input[type=email]'),btn=f.querySelector('button'),pk=document.querySelector('meta[name=rankflo-project-key]');if(!pk||!pk.content){btn.textContent='Missing project key';return false}btn.disabled=true;btn.textContent='Subscribing...';try{var r=await fetch('https://rankflo.io/api/v1/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em.value,project_key:pk.content,source:'newsletter-cta'})});if(r.ok){f.innerHTML='<p style=\\'color:#39FF14;font-size:14px;\\'>✓ Subscribed!</p>'}else{var d=await r.json();btn.textContent=d.error||'Error';btn.disabled=false}}catch(x){btn.textContent='Error';btn.disabled=false}return false})(event)">
    <input type="email" required placeholder="${esc(p.placeholder)}" style="flex:1;padding:10px 14px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:14px;" />
    <button type="submit" style="padding:10px 20px;border-radius:8px;border:none;background:#39FF14;color:#000;font-weight:600;font-size:14px;cursor:pointer;">${esc(p.buttonText)}</button>
  </form>
</aside>`;
    }
    case "author-bio": {
      const p = block.props as BlockPropsMap["author-bio"];
      return `<div class="author-bio"><strong>${esc(p.name)}</strong><p>${esc(p.bio)}</p></div>`;
    }
    default:
      return "";
  }
}

// ─── Blocks → Plain Text ───────────────────────────────
export function blocksToPlainText(blocks: EditorBlock[]): string {
  return blocks.map(blockToPlainText).filter(Boolean).join("\n\n");
}

function blockToPlainText(block: EditorBlock): string {
  switch (block.type) {
    case "hero": {
      const p = block.props as BlockPropsMap["hero"];
      return [p.title, p.subtitle].filter(Boolean).join("\n");
    }
    case "heading":
      return (block.props as BlockPropsMap["heading"]).text;
    case "text":
      return stripHtml((block.props as BlockPropsMap["text"]).html);
    case "quote": {
      const p = block.props as BlockPropsMap["quote"];
      return p.author ? `"${p.text}" — ${p.author}` : p.text;
    }
    case "code":
      return (block.props as BlockPropsMap["code"]).code;
    case "callout": {
      const p = block.props as BlockPropsMap["callout"];
      return `${p.title}: ${p.text}`;
    }
    case "list":
      return (block.props as BlockPropsMap["list"]).items.join("\n");
    case "two-column": {
      const p = block.props as BlockPropsMap["two-column"];
      return [
        blocksToPlainText(p.leftChildren),
        blocksToPlainText(p.rightChildren),
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case "newsletter-cta": {
      const p = block.props as BlockPropsMap["newsletter-cta"];
      return `${p.title}\n${p.description}`;
    }
    case "author-bio": {
      const p = block.props as BlockPropsMap["author-bio"];
      return `${p.name}\n${p.bio}`;
    }
    default:
      return "";
  }
}

// ─── Helpers ───────────────────────────────────────────
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
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}
