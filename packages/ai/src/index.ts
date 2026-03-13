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
    "You are RankFlo AI, a helpful writing assistant embedded in a blog content editor.",
    "You help with writing, editing, SEO optimization, and content strategy.",
    "Keep responses concise and actionable.",
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
- list:    {"id":"ID8","type":"list","props":{"items":["Item 1","Item 2"],"style":"bullet"}}
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
