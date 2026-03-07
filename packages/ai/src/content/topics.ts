import type { AIProviderClient } from "../providers";
import type { ContentStrategy, TopicSuggestion } from "../types";

/**
 * AI-powered topic and keyword research engine.
 *
 * Generates topic suggestions, content strategies, and competitor analysis
 * using LLM intelligence rather than traditional keyword research APIs.
 */
export class TopicResearcher {
  private provider: AIProviderClient;

  constructor(provider: AIProviderClient) {
    this.provider = provider;
  }

  /**
   * Generate topic suggestions based on industry, audience, and existing content.
   */
  async suggestTopics(params: {
    industry: string;
    targetAudience: string;
    existingTopics?: string[];
    competitors?: string[];
    count?: number;
  }): Promise<TopicSuggestion[]> {
    const count = params.count ?? 10;

    const system = `You are an expert SEO content strategist with deep knowledge of search trends, content marketing, and organic traffic growth. Your job is to suggest high-impact blog topics that will drive organic traffic.

TOPIC SELECTION CRITERIA:
1. SEARCH INTENT: Each topic must address a clear search intent (informational, navigational, commercial, or transactional)
2. LONG-TAIL FOCUS: Prefer specific, long-tail topics over broad, competitive head terms
3. AUDIENCE RELEVANCE: Every topic must directly serve the target audience's needs, questions, or pain points
4. TRAFFIC POTENTIAL: Prioritize topics with realistic ranking potential and search volume
5. CONTENT GAP: If existing topics are provided, suggest complementary topics that fill gaps
6. FRESHNESS: Include some timely/trending topics alongside evergreen ones
7. DIVERSITY: Mix content types (how-to, comparison, listicle, case study) for a well-rounded strategy

Return a JSON array of exactly ${count} topic suggestions. Each suggestion must follow this schema:
{
  "topic": "Full topic title as it would appear as a blog post title",
  "keywords": ["primary keyword", "secondary keyword 1", "secondary keyword 2"],
  "searchVolume": "high" | "medium" | "low",
  "difficulty": "easy" | "medium" | "hard",
  "contentType": "blog-post" | "tutorial" | "comparison" | "listicle" | "how-to" | "case-study",
  "rationale": "2-3 sentences explaining why this topic would drive traffic",
  "estimatedImpact": "Expected traffic/conversion impact"
}

Return ONLY the JSON array, no explanations or markdown code blocks.`;

    const userMessage = this.buildTopicRequestMessage(params);

    const response = await this.provider.complete({
      system,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 4096,
      temperature: 0.8,
    });

    return this.parseTopicSuggestions(response.content);
  }

  /**
   * Generate a full content strategy (4-12 week plan).
   */
  async createStrategy(params: {
    industry: string;
    targetAudience: string;
    businessGoals: string[];
    existingContent?: string[];
    competitors?: string[];
    weeksAhead?: number;
  }): Promise<ContentStrategy> {
    const weeks = params.weeksAhead ?? 8;

    const system = `You are a senior content strategist building a comprehensive content marketing plan. You combine SEO expertise with business acumen to create strategies that drive both traffic and conversions.

STRATEGY REQUIREMENTS:
1. CONTENT PILLARS: Identify 3-5 content pillars (core themes) that align with the business goals
2. TOPIC CLUSTERING: Group topics under pillars using a hub-and-spoke model for topical authority
3. CONTENT CALENDAR: Plan ${weeks} weeks of content with specific topics, publication frequency, and focus areas
4. QUICK WINS: Identify 3-5 low-competition topics that can rank quickly
5. COMPETITOR GAPS: Analyze mentioned competitors and find content opportunities they're missing
6. PUBLICATION CADENCE: Recommend a realistic publishing schedule (2-4 posts per week for aggressive, 1-2 for moderate)

Return a JSON object with this exact structure:
{
  "overview": "3-5 sentence strategic overview",
  "targetAudience": "Detailed audience description",
  "pillars": [
    {
      "name": "Pillar name",
      "description": "Why this pillar matters and how it connects to business goals",
      "topics": [{ "topic": "...", "keywords": [...], "searchVolume": "...", "difficulty": "...", "contentType": "...", "rationale": "...", "estimatedImpact": "..." }]
    }
  ],
  "contentCalendar": [
    {
      "week": 1,
      "topics": [{ "topic": "...", "keywords": [...], "searchVolume": "...", "difficulty": "...", "contentType": "...", "rationale": "...", "estimatedImpact": "..." }],
      "focus": "Week focus/theme description"
    }
  ],
  "competitorGaps": ["Gap 1", "Gap 2"],
  "quickWins": [{ "topic": "...", "keywords": [...], "searchVolume": "...", "difficulty": "easy", "contentType": "...", "rationale": "...", "estimatedImpact": "..." }]
}

Return ONLY the JSON object, no explanations.`;

    const userMessage = `Create a ${weeks}-week content strategy for the following:

INDUSTRY: ${params.industry}
TARGET AUDIENCE: ${params.targetAudience}
BUSINESS GOALS:
${params.businessGoals.map((g) => `- ${g}`).join("\n")}
${params.existingContent?.length ? `\nEXISTING CONTENT:\n${params.existingContent.map((c) => `- ${c}`).join("\n")}` : ""}
${params.competitors?.length ? `\nCOMPETITORS:\n${params.competitors.map((c) => `- ${c}`).join("\n")}` : ""}`;

    const response = await this.provider.complete({
      system,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 8192,
      temperature: 0.7,
      longForm: true,
    });

    return this.parseStrategy(response.content);
  }

  /**
   * Analyze a competitor URL and find content gaps.
   * Note: This uses AI reasoning about the competitor based on the URL/brand,
   * not actual web scraping.
   */
  async analyzeCompetitor(
    url: string,
    existingTopics: string[],
  ): Promise<{
    theirTopics: string[];
    gaps: string[];
    opportunities: TopicSuggestion[];
  }> {
    const system = `You are a competitive content analysis expert. Given a competitor's website URL, use your knowledge of their brand, industry, and typical content strategy to identify:

1. Topics they likely cover well
2. Content gaps where they are weak or absent
3. Specific content opportunities for the user to capitalize on

Your analysis should be based on your knowledge of the brand/company and industry best practices.

Return a JSON object:
{
  "theirTopics": ["List of topics the competitor likely covers well"],
  "gaps": ["Content areas where the competitor is weak or absent"],
  "opportunities": [
    {
      "topic": "Specific topic title",
      "keywords": ["keyword1", "keyword2"],
      "searchVolume": "high" | "medium" | "low",
      "difficulty": "easy" | "medium" | "hard",
      "contentType": "blog-post" | "tutorial" | "comparison" | "listicle" | "how-to",
      "rationale": "Why this is an opportunity given the competitive landscape",
      "estimatedImpact": "Expected impact"
    }
  ]
}

Return ONLY the JSON object, no explanations.`;

    const userMessage = `Analyze competitor: ${url}

Our existing content topics:
${existingTopics.map((t) => `- ${t}`).join("\n")}

Identify content gaps and opportunities where we can outperform them.`;

    const response = await this.provider.complete({
      system,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 4096,
      temperature: 0.7,
    });

    return this.parseCompetitorAnalysis(response.content);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildTopicRequestMessage(params: {
    industry: string;
    targetAudience: string;
    existingTopics?: string[];
    competitors?: string[];
    count?: number;
  }): string {
    let message = `Suggest ${params.count ?? 10} high-impact content topics for:

INDUSTRY: ${params.industry}
TARGET AUDIENCE: ${params.targetAudience}`;

    if (params.existingTopics?.length) {
      message += `\n\nEXISTING CONTENT (avoid repeating, suggest complementary topics):
${params.existingTopics.map((t) => `- ${t}`).join("\n")}`;
    }

    if (params.competitors?.length) {
      message += `\n\nCOMPETITORS TO DIFFERENTIATE FROM:
${params.competitors.map((c) => `- ${c}`).join("\n")}`;
    }

    return message;
  }

  private parseTopicSuggestions(raw: string): TopicSuggestion[] {
    const parsed = this.extractJSON<TopicSuggestion[]>(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Expected an array of topic suggestions from AI response");
    }

    return parsed.map((item) => ({
      topic: String(item.topic ?? ""),
      keywords: Array.isArray(item.keywords) ? item.keywords.map(String) : [],
      searchVolume: this.validateEnum(
        item.searchVolume,
        ["high", "medium", "low"],
        "medium",
      ),
      difficulty: this.validateEnum(
        item.difficulty,
        ["easy", "medium", "hard"],
        "medium",
      ),
      contentType: String(item.contentType ?? "blog-post"),
      rationale: String(item.rationale ?? ""),
      estimatedImpact: String(item.estimatedImpact ?? ""),
    }));
  }

  private parseStrategy(raw: string): ContentStrategy {
    const parsed = this.extractJSON<ContentStrategy>(raw);

    return {
      overview: String(parsed.overview ?? ""),
      targetAudience: String(parsed.targetAudience ?? ""),
      pillars: Array.isArray(parsed.pillars)
        ? parsed.pillars.map((p) => ({
            name: String(p.name ?? ""),
            description: String(p.description ?? ""),
            topics: Array.isArray(p.topics)
              ? p.topics.map((t) => this.normalizeTopicSuggestion(t))
              : [],
          }))
        : [],
      contentCalendar: Array.isArray(parsed.contentCalendar)
        ? parsed.contentCalendar.map((w) => ({
            week: Number(w.week ?? 0),
            topics: Array.isArray(w.topics)
              ? w.topics.map((t) => this.normalizeTopicSuggestion(t))
              : [],
            focus: String(w.focus ?? ""),
          }))
        : [],
      competitorGaps: Array.isArray(parsed.competitorGaps)
        ? parsed.competitorGaps.map(String)
        : [],
      quickWins: Array.isArray(parsed.quickWins)
        ? parsed.quickWins.map((t) => this.normalizeTopicSuggestion(t))
        : [],
    };
  }

  private parseCompetitorAnalysis(raw: string): {
    theirTopics: string[];
    gaps: string[];
    opportunities: TopicSuggestion[];
  } {
    const parsed = this.extractJSON<{
      theirTopics: string[];
      gaps: string[];
      opportunities: TopicSuggestion[];
    }>(raw);

    return {
      theirTopics: Array.isArray(parsed.theirTopics)
        ? parsed.theirTopics.map(String)
        : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String) : [],
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities.map((t) => this.normalizeTopicSuggestion(t))
        : [],
    };
  }

  private normalizeTopicSuggestion(item: Partial<TopicSuggestion>): TopicSuggestion {
    return {
      topic: String(item.topic ?? ""),
      keywords: Array.isArray(item.keywords) ? item.keywords.map(String) : [],
      searchVolume: this.validateEnum(
        item.searchVolume,
        ["high", "medium", "low"],
        "medium",
      ),
      difficulty: this.validateEnum(
        item.difficulty,
        ["easy", "medium", "hard"],
        "medium",
      ),
      contentType: String(item.contentType ?? "blog-post"),
      rationale: String(item.rationale ?? ""),
      estimatedImpact: String(item.estimatedImpact ?? ""),
    };
  }

  private extractJSON<T>(raw: string): T {
    let cleaned = raw.trim();

    // Remove markdown code blocks if present
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch?.[1]) {
      cleaned = jsonBlockMatch[1].trim();
    }

    // Try to find JSON array or object
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);

    const jsonStr = arrayMatch?.[0] ?? objectMatch?.[0] ?? cleaned;

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      throw new Error(
        `Failed to parse JSON from AI response: ${jsonStr.slice(0, 200)}`,
      );
    }
  }

  private validateEnum<T extends string>(
    value: unknown,
    allowed: T[],
    fallback: T,
  ): T {
    if (typeof value === "string" && allowed.includes(value as T)) {
      return value as T;
    }
    return fallback;
  }
}
