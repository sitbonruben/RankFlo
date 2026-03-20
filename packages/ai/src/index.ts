// ─── Image generation ─────────────────────────────────────────
export { generateImageWithKie } from "./image-gen";

// ─── Type exports ─────────────────────────────────────────────
export type {
  AIProvider,
  AIConfig,
  BrandVoice,
  ContentBrief,
  GeneratedContent,
  TopicSuggestion,
  ContentStrategy,
  SEOAnalysis,
  StreamCallback,
} from "./types";

export type { LLMRequest, LLMResponse } from "./providers";

// ─── Class exports (for advanced usage) ──────────────────────
export { AIProviderClient } from "./providers";
export { ContentGenerator } from "./content/generator";
export { SEOAnalyzer } from "./content/seo";
export { TopicResearcher } from "./content/topics";
export { BrandVoiceAnalyzer } from "./brand/voice";
export { ContentPlanner } from "./strategy/planner";
export {
  markdownToHtml,
  countWords,
  extractHeadings,
  extractLinks,
  calculateKeywordDensity,
  slugify,
} from "./content/generator";

// ─── Function-based API (used by tRPC routers) ──────────────
import type {
  AIConfig,
  BrandVoice,
  ContentBrief,
  GeneratedContent,
  TopicSuggestion,
  ContentStrategy,
  SEOAnalysis,
} from "./types";
import { AIProviderClient } from "./providers";
import { ContentGenerator } from "./content/generator";
import { SEOAnalyzer } from "./content/seo";
import { TopicResearcher } from "./content/topics";
import { BrandVoiceAnalyzer } from "./brand/voice";
import { ContentPlanner } from "./strategy/planner";

/**
 * Resolve AI configuration from environment variables.
 * Returns null if no API key is set.
 */
export function resolveAIConfig(): AIConfig | null {
  const explicitProvider = process.env.AI_PROVIDER as
    | "openai"
    | "anthropic"
    | "google"
    | "kie"
    | undefined;
  const explicitModel = process.env.AI_MODEL || undefined;

  // Check each provider key in priority order
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: explicitProvider ?? "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: explicitModel,
    };
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: explicitProvider ?? "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: explicitModel,
    };
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    return {
      provider: explicitProvider ?? "google",
      apiKey: process.env.GOOGLE_AI_API_KEY,
      model: explicitModel,
    };
  }

  if (process.env.KIE_API_KEY) {
    return {
      provider: explicitProvider ?? "kie",
      apiKey: process.env.KIE_API_KEY,
      model: explicitModel,
    };
  }

  return null;
}

/**
 * Generate a full blog post from a content brief.
 */
export async function generateContent(
  config: AIConfig,
  brief: ContentBrief,
  brandVoice?: BrandVoice,
): Promise<GeneratedContent> {
  const provider = new AIProviderClient(config);
  const generator = new ContentGenerator(provider, brandVoice);
  return generator.generate(brief);
}

/**
 * Suggest topics for a project.
 */
export async function suggestTopics(
  config: AIConfig,
  context: {
    projectName: string;
    industry?: string;
    audience?: string;
    existingTopics?: string[];
    count?: number;
    contentScope?: string;
  },
): Promise<TopicSuggestion[]> {
  const provider = new AIProviderClient(config);
  const researcher = new TopicResearcher(provider);
  return researcher.suggestTopics({
    industry: context.industry ?? "General",
    targetAudience: context.audience ?? "General audience",
    existingTopics: context.existingTopics,
    count: context.count,
    contentScope: context.contentScope,
  });
}

/**
 * Create a content strategy.
 */
export async function createContentStrategy(
  config: AIConfig,
  context: {
    projectName: string;
    industry?: string;
    audience?: string;
    businessGoals: string[];
    weeksAhead?: number;
  },
): Promise<ContentStrategy> {
  const provider = new AIProviderClient(config);
  const planner = new ContentPlanner(provider);
  return planner.createPlan({
    industry: context.industry ?? "General",
    targetAudience: context.audience ?? "General audience",
    businessGoals: context.businessGoals,
  });
}

/**
 * Analyze content for SEO (pure algorithmic, no AI call).
 */
export function analyzeSEO(input: {
  content: string;
  title: string;
  description: string;
  targetKeywords: string[];
}): SEOAnalysis {
  const analyzer = new SEOAnalyzer();
  return analyzer.analyze(
    input.content,
    input.title,
    input.description,
    input.targetKeywords,
  );
}

/**
 * Analyze brand voice from samples or URL.
 */
export async function analyzeBrandVoice(
  config: AIConfig,
  input: {
    samples?: string[];
    websiteUrl?: string;
  },
): Promise<BrandVoice> {
  const provider = new AIProviderClient(config);
  const analyzer = new BrandVoiceAnalyzer(provider);

  if (input.samples && input.samples.length > 0) {
    return analyzer.analyze(input.samples);
  }

  if (input.websiteUrl) {
    return analyzer.analyzeFromUrl(input.websiteUrl);
  }

  throw new Error("Provide content samples or a website URL");
}

/**
 * Improve existing content with instructions.
 */
export async function improveContent(
  config: AIConfig,
  input: {
    content: string;
    instructions: string;
    brandVoice?: BrandVoice;
  },
): Promise<{ content: string; changes: string[] }> {
  const provider = new AIProviderClient(config);
  const generator = new ContentGenerator(provider, input.brandVoice);
  const improved = await generator.improveContent(
    input.content,
    input.instructions,
  );
  return {
    content: improved,
    changes: [`Applied improvements: ${input.instructions}`],
  };
}

/**
 * AI chat for the editor panel.
 */
export async function chat(
  config: AIConfig,
  input: {
    message: string;
    context?: string;
    brandVoice?: BrandVoice;
    projectDescription?: string;
    existingPostTitles?: string[];
  },
): Promise<{ reply: string }> {
  const provider = new AIProviderClient(config);

  const systemParts = [
    "You are RankFlo AI, an intelligent editor assistant embedded in a blog content editor.",
    "You CONTROL the editor directly — when the user asks you to write or edit content, you write it into the editor canvas (not into the chat).",
    "In the chat you: ask clarifying questions, confirm what you're about to do, report what you just wrote, and answer questions about writing strategy or SEO.",
    "Keep chat replies SHORT (1-3 sentences). Never write long blog content in the chat — that goes to the editor.",
    "When asked to create a blog post, ask for: topic (required), target audience (optional), specific angle or keywords (optional).",
    "Blog types you can create: how-to guide, listicle, tutorial, comparison, case study, opinion piece, news roundup, standard blog post.",
  ];

  if (input.brandVoice) {
    systemParts.push(
      `\nBrand voice context:\n- Tone: ${input.brandVoice.tone.join(", ")}\n- Style: ${input.brandVoice.style}\n- Audience: ${input.brandVoice.targetAudience}\n- Industry: ${input.brandVoice.industry}`,
    );
  }

  if (input.projectDescription) {
    systemParts.push(`\nProject description: ${input.projectDescription}`);
  }

  if (input.existingPostTitles?.length) {
    systemParts.push(
      `\nExisting posts in this project (do NOT suggest or create content that duplicates these):\n${input.existingPostTitles.slice(0, 30).map((t) => `- ${t}`).join("\n")}`,
    );
  }

  const messages: { role: "user" | "assistant"; content: string }[] = [];

  if (input.context) {
    messages.push({
      role: "user",
      content: `Here is the current editor content for context:\n\n${input.context.slice(0, 3000)}`,
    });
    messages.push({
      role: "assistant",
      content:
        "Thanks, I can see the content. How can I help?",
    });
  }

  messages.push({ role: "user", content: input.message });

  const response = await provider.complete({
    system: systemParts.join("\n"),
    messages,
    maxTokens: 1024,
    temperature: 0.7,
  });

  return { reply: response.content };
}

/**
 * Build a complete blog post as structured editor blocks from scratch.
 * Used by the AI chat panel to write directly into the editor.
 */
export async function buildEditorBlocks(
  config: AIConfig,
  input: {
    topic: string;
    contentType: string;
    keywords?: string[];
    audience?: string;
    tone?: string;
    projectDescription?: string;
    brandVoice?: BrandVoice;
  },
): Promise<{
  title: string;
  blocks: unknown[];
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  featuredImage: string;
  ogImage: string;
  tags: string[];
}> {
  const provider = new AIProviderClient(config);

  const TYPE_GUIDES: Record<string, string> = {
    "how-to": "Clear numbered steps as H2 headings, each followed by a text block. Add pro-tip callouts. Start with a brief intro, end with a conclusion.",
    "listicle": "Numbered list format: intro, then N items each as H2 + text paragraph. Add a summary callout at the end.",
    "tutorial": "Step-by-step guide: intro with 'What You'll Learn' callout, prerequisites list block, numbered H2 steps with detail, conclusion.",
    "comparison": "Compare options: intro, H2 section per option with text + pros list, a recommendation callout, conclusion.",
    "case-study": "Narrative structure: overview, challenge H2, solution H2 with detail, results H2 with metrics in a list, key takeaways callout.",
    "opinion": "Thought leadership: hook intro paragraph, thesis, H2 supporting arguments with text, counterargument H2, strong conclusion.",
    "roundup": "Curated list: intro, numbered H2 items each with description text + optional quote, wrap-up callout.",
    "blog-post": "Engaging content: hook intro, 4-6 H2 content sections, callouts for key insights, a divider before conclusion, strong conclusion.",
  };

  const guide = TYPE_GUIDES[input.contentType] ?? TYPE_GUIDES["blog-post"];

  const brandCtx = input.brandVoice
    ? `Brand voice — tone: ${input.brandVoice.tone.join(", ")}, style: ${input.brandVoice.style}, audience: ${input.brandVoice.targetAudience}.`
    : "";
  const keywordCtx = input.keywords?.length
    ? `Target keywords (use naturally): ${input.keywords.join(", ")}.`
    : "";
  const audienceCtx = input.audience ? `Target audience: ${input.audience}.` : "";
  const toneCtx = input.tone ? `Tone: ${input.tone}.` : "";
  const projCtx = input.projectDescription
    ? `Project context: ${input.projectDescription}.`
    : "";

  const system = `You are an expert SEO content writer. Generate a complete, high-quality blog post as structured JSON editor blocks.

POST TYPE: ${input.contentType}
STRUCTURE: ${guide}

${[brandCtx, keywordCtx, audienceCtx, toneCtx, projCtx].filter(Boolean).join("\n")}

AVAILABLE BLOCK TYPES (strict JSON format):
- heading: {"id":"a1b2c3d4","type":"heading","props":{"text":"Section Title","level":2,"alignment":"left"}}
- text:    {"id":"a1b2c3d4","type":"text","props":{"html":"<p>Body text with <strong>bold</strong> and <em>emphasis</em>.</p>","alignment":"left"}}
- image:   {"id":"a1b2c3d4","type":"image","props":{"src":"https://images.unsplash.com/photo-PHOTO_ID?w=1200&auto=format&fit=crop&q=80","alt":"Descriptive alt text","caption":"Caption text"}}
- quote:   {"id":"a1b2c3d4","type":"quote","props":{"text":"Memorable quote","author":"Attribution","style":"highlighted"}}
- callout: {"id":"a1b2c3d4","type":"callout","props":{"type":"info","title":"Pro Tip","text":"Callout body text."}}
- list:    {"id":"a1b2c3d4","type":"list","props":{"items":["Plain text item one","Plain text item two"],"style":"bullet"}}
  ⚠ list items are PLAIN TEXT ONLY — absolutely no HTML tags inside items. Use a text block if you need rich formatting.
- divider: {"id":"a1b2c3d4","type":"divider","props":{"style":"line","spacing":"normal"}}

RULES:
- IDs: exactly 8 alphanumeric chars — generate unique ones (e.g. "a3b7c1d9")
- Generate 12-20 blocks for a thorough post
- Use heading level 2 for main H2s, level 3 for sub-sections
- Include at least 1 image block (pick a relevant real Unsplash photo ID), 1 callout, 1 list
- html in text blocks: valid HTML with proper formatting, escape special chars
- Write genuinely useful, specific content — not generic filler
- Optimize naturally for target keywords
- Use varied block types to break up text visually

Return ONLY a valid JSON object (no markdown fences, no explanation):
{
  "title": "SEO-optimized Post Title (50-60 chars)",
  "slug": "url-safe-slug-from-title",
  "excerpt": "2-3 sentence post summary for search snippets (150-200 chars)",
  "metaTitle": "Meta title for Google (30-60 chars, include primary keyword)",
  "metaDescription": "Meta description for Google (120-160 chars, compelling, include keyword)",
  "featuredImage": "https://images.unsplash.com/photo-REAL_PHOTO_ID?w=1200&auto=format&fit=crop&q=80",
  "ogImage": "https://images.unsplash.com/photo-REAL_PHOTO_ID?w=1200&auto=format&fit=crop&q=80",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "blocks": [...array of blocks...]
}`;

  const response = await provider.complete({
    system,
    messages: [
      {
        role: "user",
        content: `Write a complete ${input.contentType} post about: ${input.topic}\n\nGenerate the full post as a JSON object with title and blocks array.`,
      },
    ],
    maxTokens: 8000,
    temperature: 0.7,
  });

  const raw = response.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid format — expected JSON object");

  let result: {
    title: string;
    slug: string;
    excerpt: string;
    metaTitle: string;
    metaDescription: string;
    featuredImage: string;
    ogImage: string;
    tags: string[];
    blocks: unknown[];
  };
  try {
    result = JSON.parse(jsonMatch[0]) as typeof result;
  } catch {
    throw new Error("AI returned malformed JSON");
  }

  if (typeof result.title !== "string" || !Array.isArray(result.blocks)) {
    throw new Error("AI response missing title or blocks");
  }

  // Derive slug from title if AI didn't provide a clean one
  const rawSlug = (result.slug ?? result.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    title: result.title,
    blocks: result.blocks,
    excerpt: result.excerpt ?? "",
    metaTitle: result.metaTitle ?? result.title,
    metaDescription: result.metaDescription ?? result.excerpt ?? "",
    slug: rawSlug,
    featuredImage: result.featuredImage ?? "",
    ogImage: result.ogImage ?? result.featuredImage ?? "",
    tags: Array.isArray(result.tags) ? result.tags : [],
  };
}

/**
 * Edit a post's blocks based on a natural-language instruction.
 * Returns the updated blocks array.
 */
export async function editDocument(
  config: AIConfig,
  input: {
    instruction: string;
    currentBlocks: unknown[];
    postTitle?: string;
  },
): Promise<{ blocks: unknown[] }> {
  const provider = new AIProviderClient(config);

  const system = `You are a blog post block editor. Edit the provided blocks based on the instruction.

BLOCK TYPES (JSON format):
- heading: {"id":"ID8","type":"heading","props":{"text":"Title","level":2,"alignment":"left"}}
- text:    {"id":"ID8","type":"text","props":{"html":"<p>Text with <strong>bold</strong></p>","alignment":"left"}}
- image:   {"id":"ID8","type":"image","props":{"src":"https://images.unsplash.com/photo-ID?w=1200&auto=format&fit=crop&q=80","alt":"Alt text","caption":"Caption"}}
- quote:   {"id":"ID8","type":"quote","props":{"text":"Quote","author":"Author","style":"highlighted"}}
- callout: {"id":"ID8","type":"callout","props":{"type":"info","title":"Pro Tip","text":"Callout body."}}
- list:    {"id":"ID8","type":"list","props":{"items":["Plain text item 1","Plain text item 2"],"style":"bullet"}}
  ⚠ list items are PLAIN TEXT ONLY — no HTML tags inside items ever.
- divider: {"id":"ID8","type":"divider","props":{"style":"line","spacing":"normal"}}

RULES:
- IDs: exactly 8 alphanumeric chars (e.g. "a3b7c1d9") — generate new ones for new blocks
- html props: valid HTML, escape single quotes as &#39;
- For "improve writing": improve flow and word choice, keep structure
- For "add section": append new heading + text blocks
- For "make shorter": condense content
- For "add image": insert a relevant Unsplash image block (pick a real photo ID)
- For "add callout": insert an info/tip/warning callout
- Return ONLY a valid JSON array of blocks — no markdown fences, no explanation`;

  const currentContent = JSON.stringify(input.currentBlocks).slice(0, 5000);

  const response = await provider.complete({
    system,
    messages: [
      {
        role: "user",
        content: `Post title: ${input.postTitle ?? "(untitled)"}\n\nCurrent blocks:\n${currentContent}\n\nInstruction: ${input.instruction}\n\nReturn the complete updated blocks array as JSON.`,
      },
    ],
    maxTokens: 6000,
    temperature: 0.7,
  });

  const content = response.content.trim();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("AI returned invalid format — expected a JSON array");

  let blocks: unknown[];
  try {
    blocks = JSON.parse(jsonMatch[0]) as unknown[];
  } catch {
    throw new Error("AI returned malformed JSON");
  }

  if (!Array.isArray(blocks)) throw new Error("AI response was not an array");
  return { blocks };
}
