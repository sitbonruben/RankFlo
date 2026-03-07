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
  },
): Promise<TopicSuggestion[]> {
  const provider = new AIProviderClient(config);
  const researcher = new TopicResearcher(provider);
  return researcher.suggestTopics({
    industry: context.industry ?? "General",
    targetAudience: context.audience ?? "General audience",
    existingTopics: context.existingTopics,
    count: context.count,
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
