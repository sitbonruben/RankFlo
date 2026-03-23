export type AIProvider = "openai" | "anthropic" | "google" | "kie" | "ollama";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface BrandVoice {
  tone: string[];
  style: string;
  vocabulary: string[];
  avoidWords: string[];
  targetAudience: string;
  industry: string;
  examples?: string[];
}

export interface ContentBrief {
  topic: string;
  targetKeywords: string[];
  secondaryKeywords?: string[];
  contentType:
    | "blog-post"
    | "landing-page"
    | "product-description"
    | "tutorial"
    | "comparison"
    | "listicle"
    | "how-to"
    | "case-study"
    | "news";
  wordCount?: number;
  tone?: string;
  outline?: string[];
  competitors?: string[];
  internalLinks?: { title: string; url: string }[];
  callToAction?: string;
  targetAudience?: string;
}

export interface GeneratedContent {
  title: string;
  slug: string;
  content: string;
  contentHtml: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  featuredImagePrompt: string;
  estimatedReadTime: number;
  wordCount: number;
  seoScore: number;
  keywordDensity: Record<string, number>;
  headings: { level: number; text: string }[];
  internalLinks: string[];
  structuredData: Record<string, unknown>;
}

export interface TopicSuggestion {
  topic: string;
  keywords: string[];
  searchVolume: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  contentType: string;
  rationale: string;
  estimatedImpact: string;
}

export interface ContentStrategy {
  overview: string;
  targetAudience: string;
  pillars: {
    name: string;
    description: string;
    topics: TopicSuggestion[];
  }[];
  contentCalendar: {
    week: number;
    topics: TopicSuggestion[];
    focus: string;
  }[];
  competitorGaps: string[];
  quickWins: TopicSuggestion[];
}

export interface SEOAnalysis {
  score: number;
  title: { score: number; suggestions: string[] };
  description: { score: number; suggestions: string[] };
  headings: { score: number; suggestions: string[] };
  keywords: {
    score: number;
    density: Record<string, number>;
    suggestions: string[];
  };
  readability: { score: number; grade: string; suggestions: string[] };
  contentLength: { score: number; wordCount: number; suggestions: string[] };
  internalLinks: { score: number; count: number; suggestions: string[] };
  structuredData: { score: number; suggestions: string[] };
}

export type StreamCallback = (chunk: string) => void;
