// ─── Block Types ────────────────────────────────────────
export const BLOCK_TYPES = [
  "hero",
  "heading",
  "text",
  "image",
  "quote",
  "code",
  "callout",
  "divider",
  "two-column",
  "list",
  "embed",
  "table-of-contents",
  "newsletter-cta",
  "author-bio",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

// ─── Block Categories (for palette) ────────────────────
export const BLOCK_CATEGORIES = {
  content: ["heading", "text", "list", "quote", "code"],
  media: ["image", "embed"],
  layout: ["hero", "two-column", "divider", "table-of-contents"],
  engagement: ["callout", "newsletter-cta", "author-bio"],
} as const satisfies Record<string, readonly BlockType[]>;

export type BlockCategory = keyof typeof BLOCK_CATEGORIES;

// ─── Block-specific Props ──────────────────────────────
export interface HeroBlockProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  overlay: "none" | "light" | "dark" | "gradient";
  alignment: "left" | "center" | "right";
  height: "small" | "medium" | "large" | "full";
}

export interface HeadingBlockProps {
  text: string;
  level: 1 | 2 | 3 | 4;
  alignment: "left" | "center" | "right";
}

export interface TextBlockProps {
  html: string;
  alignment: "left" | "center" | "right";
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption: string;
  width: "small" | "medium" | "large" | "full";
  rounded: boolean;
  shadow: boolean;
}

export interface QuoteBlockProps {
  text: string;
  author: string;
  style: "minimal" | "bordered" | "highlighted";
}

export interface CodeBlockProps {
  code: string;
  language: string;
  filename: string;
  showLineNumbers: boolean;
}

export interface CalloutBlockProps {
  text: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
}

export interface DividerBlockProps {
  style: "line" | "dots" | "space";
  spacing: "small" | "medium" | "large";
}

export interface TwoColumnBlockProps {
  ratio: "50-50" | "60-40" | "40-60" | "70-30" | "30-70";
  gap: "small" | "medium" | "large";
  leftChildren: EditorBlock[];
  rightChildren: EditorBlock[];
}

export interface ListBlockProps {
  items: string[];
  style: "bullet" | "number" | "check";
}

export interface EmbedBlockProps {
  url: string;
  type: "youtube" | "twitter" | "generic";
  aspectRatio: "16:9" | "4:3" | "1:1";
}

export interface TableOfContentsBlockProps {
  style: "minimal" | "boxed";
  maxDepth: 2 | 3 | 4;
}

export interface NewsletterCtaBlockProps {
  title: string;
  description: string;
  buttonText: string;
  style: "minimal" | "card" | "banner";
  placeholder: string;
}

export interface AuthorBioBlockProps {
  name: string;
  avatar: string;
  bio: string;
  links: { label: string; url: string }[];
}

// ─── Block Props Union ─────────────────────────────────
export type BlockPropsMap = {
  hero: HeroBlockProps;
  heading: HeadingBlockProps;
  text: TextBlockProps;
  image: ImageBlockProps;
  quote: QuoteBlockProps;
  code: CodeBlockProps;
  callout: CalloutBlockProps;
  divider: DividerBlockProps;
  "two-column": TwoColumnBlockProps;
  list: ListBlockProps;
  embed: EmbedBlockProps;
  "table-of-contents": TableOfContentsBlockProps;
  "newsletter-cta": NewsletterCtaBlockProps;
  "author-bio": AuthorBioBlockProps;
};

// ─── Editor Block ──────────────────────────────────────
export interface EditorBlock<T extends BlockType = BlockType> {
  id: string;
  type: T;
  props: BlockPropsMap[T];
}

// ─── Editor Document ───────────────────────────────────
export interface EditorDocument {
  version: 1;
  blocks: EditorBlock[];
  metadata: {
    template?: string;
    theme?: string;
  };
}

// ─── Block Metadata (for palette display) ──────────────
export interface BlockMeta {
  type: BlockType;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  category: BlockCategory;
}

export const BLOCK_META: BlockMeta[] = [
  { type: "hero", label: "Hero", description: "Full-width header section", icon: "Sparkles", category: "layout" },
  { type: "heading", label: "Heading", description: "Section title (H1–H4)", icon: "Type", category: "content" },
  { type: "text", label: "Text", description: "Rich text paragraph", icon: "AlignLeft", category: "content" },
  { type: "image", label: "Image", description: "Image with caption", icon: "Image", category: "media" },
  { type: "quote", label: "Quote", description: "Blockquote with attribution", icon: "Quote", category: "content" },
  { type: "code", label: "Code", description: "Syntax-highlighted code", icon: "Code", category: "content" },
  { type: "callout", label: "Callout", description: "Tip, warning, or info box", icon: "AlertCircle", category: "engagement" },
  { type: "divider", label: "Divider", description: "Visual separator", icon: "Minus", category: "layout" },
  { type: "two-column", label: "Two Column", description: "Side-by-side layout", icon: "Columns", category: "layout" },
  { type: "list", label: "List", description: "Bullet, numbered, or checklist", icon: "List", category: "content" },
  { type: "embed", label: "Embed", description: "YouTube, Twitter, or URL", icon: "Play", category: "media" },
  { type: "table-of-contents", label: "Table of Contents", description: "Auto-generated from headings", icon: "BookOpen", category: "layout" },
  { type: "newsletter-cta", label: "Newsletter CTA", description: "Email signup form", icon: "Mail", category: "engagement" },
  { type: "author-bio", label: "Author Bio", description: "Author profile card", icon: "User", category: "engagement" },
];
