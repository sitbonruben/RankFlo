/**
 * Converts Tiptap JSONB content to EditorDocument block format
 * for posts seeded with the old format.
 * Run: node scripts/convert-tiptap-to-blocks.mjs
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const db = new PrismaClient();

const PROJECT_IDS = [
  "cllr001rankfloproject00000",
  "cllh001leadsterhubproject",
  "cllm001mailpandaproject0",
];

function genId() {
  return randomBytes(5).toString("hex"); // 10-char hex ID like nanoid
}

/**
 * Collect inline text from Tiptap inline content array → plain string
 */
function inlineToText(content = []) {
  return content.map((n) => n.text ?? "").join("");
}

/**
 * Collect inline text from Tiptap inline content array → HTML string
 */
function inlineToHtml(content = []) {
  return content
    .map((n) => {
      let t = n.text ?? "";
      if (!t) return "";
      if (n.marks) {
        for (const mark of n.marks) {
          if (mark.type === "bold") t = `<strong>${t}</strong>`;
          else if (mark.type === "italic") t = `<em>${t}</em>`;
          else if (mark.type === "code") t = `<code>${t}</code>`;
          else if (mark.type === "link")
            t = `<a href="${mark.attrs?.href ?? "#"}">${t}</a>`;
        }
      }
      return t;
    })
    .join("");
}

/**
 * Convert a single Tiptap node to one or more EditorBlock objects.
 */
function tipTapNodeToBlocks(node) {
  if (!node || !node.type) return [];

  switch (node.type) {
    case "paragraph": {
      const html = `<p>${inlineToHtml(node.content)}</p>`;
      return [{ id: genId(), type: "text", props: { html, alignment: "left" } }];
    }
    case "heading": {
      const level = node.attrs?.level ?? 2;
      const text = inlineToText(node.content);
      return [{ id: genId(), type: "heading", props: { text, level, alignment: "left" } }];
    }
    case "bulletList": {
      const items = (node.content ?? []).map((li) => {
        const para = li.content?.[0];
        return inlineToText(para?.content);
      });
      return [{ id: genId(), type: "list", props: { items, style: "bullet" } }];
    }
    case "orderedList": {
      const items = (node.content ?? []).map((li) => {
        const para = li.content?.[0];
        return inlineToText(para?.content);
      });
      return [{ id: genId(), type: "list", props: { items, style: "number" } }];
    }
    case "blockquote": {
      const text = (node.content ?? [])
        .flatMap((n) => inlineToText(n.content))
        .join(" ");
      return [{ id: genId(), type: "quote", props: { text, author: "", style: "bordered" } }];
    }
    case "codeBlock": {
      const code = inlineToText(node.content);
      const language = node.attrs?.language ?? "text";
      return [{ id: genId(), type: "code", props: { code, language, filename: "", showLineNumbers: true } }];
    }
    case "horizontalRule":
      return [{ id: genId(), type: "divider", props: { style: "line", spacing: "medium" } }];
    case "image": {
      const src = node.attrs?.src ?? "";
      const alt = node.attrs?.alt ?? "";
      return [{ id: genId(), type: "image", props: { src, alt, caption: "", width: "large", rounded: true, shadow: false } }];
    }
    case "doc":
      return (node.content ?? []).flatMap(tipTapNodeToBlocks);
    default:
      return [];
  }
}

function convertContent(content) {
  if (!content || typeof content !== "object") return null;

  // Already EditorDocument format
  if (Array.isArray(content.blocks)) return null;

  // Tiptap doc format
  if (content.type === "doc") {
    const blocks = tipTapNodeToBlocks(content);
    // Remove empty text blocks
    const cleaned = blocks.filter((b) => {
      if (b.type === "text") return b.props.html !== "<p></p>" && b.props.html !== "<p></p>";
      return true;
    });
    return {
      version: 1,
      blocks: cleaned.length > 0 ? cleaned : [],
      metadata: {},
    };
  }

  return null;
}

async function main() {
  const posts = await db.post.findMany({
    where: { projectId: { in: PROJECT_IDS } },
    select: { id: true, title: true, content: true },
  });

  console.log(`Found ${posts.length} posts to check`);
  let updated = 0;

  for (const post of posts) {
    const converted = convertContent(post.content);
    if (!converted) {
      console.log(`  SKIP  ${post.id} — already EditorDocument or null`);
      continue;
    }

    await db.post.update({
      where: { id: post.id },
      data: { content: converted },
    });
    console.log(`  OK    ${post.id} — "${post.title.slice(0, 50)}" (${converted.blocks.length} blocks)`);
    updated++;
  }

  console.log(`\nDone. Updated ${updated}/${posts.length} posts.`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
