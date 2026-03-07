import type { AIProviderClient } from "../providers";
import type { BrandVoice, ContentStrategy, TopicSuggestion } from "../types";

/**
 * AI-powered content strategy planner.
 *
 * Analyzes a business context and creates comprehensive content plans
 * designed to drive organic traffic growth over time.
 */
export class ContentPlanner {
  private provider: AIProviderClient;

  constructor(provider: AIProviderClient) {
    this.provider = provider;
  }

  /**
   * Analyze a business/website and create a comprehensive content plan
   * that will drive organic traffic growth.
   */
  async createPlan(params: {
    websiteUrl?: string;
    industry: string;
    targetAudience: string;
    businessGoals: string[];
    currentMonthlyTraffic?: number;
    brandVoice?: BrandVoice;
    existingContent?: { title: string; url: string; traffic?: number }[];
    budget?: "bootstrap" | "moderate" | "aggressive";
  }): Promise<ContentStrategy> {
    const budget = params.budget ?? "moderate";

    const publishingCadence = {
      bootstrap: "1-2 articles per week",
      moderate: "3-4 articles per week",
      aggressive: "5-7 articles per week (daily)",
    };

    const system = `You are an elite content strategist who has driven organic growth for hundreds of businesses. You create data-informed content strategies that build topical authority, capture search demand, and drive conversions.

YOUR STRATEGIC FRAMEWORK:

1. TOPICAL AUTHORITY: Build comprehensive coverage of core topics through pillar pages and supporting cluster content. Google rewards sites that demonstrate expertise across related topics.

2. FUNNEL ALIGNMENT: Map content to buyer journey stages:
   - Top of funnel (TOFU): Informational, educational, broad reach
   - Middle of funnel (MOFU): Comparison, evaluation, consideration
   - Bottom of funnel (BOFU): Product-focused, case studies, decision-making

3. COMPETITIVE POSITIONING: Find topics where the competition is weak but search demand exists. Target featured snippets and "People Also Ask" boxes.

4. CONTENT VELOCITY: Publishing cadence for this plan is ${publishingCadence[budget]}.

5. QUICK WIN STRATEGY: Start with low-competition, long-tail keywords that can rank in weeks rather than months. Build domain authority before targeting competitive head terms.

6. INTERNAL LINKING: Design content clusters that naturally link to each other, creating a web of topical relevance.

PLAN REQUIREMENTS:
- 3-5 content pillars aligned with business goals
- Each pillar should have 5-8 supporting topics
- Content calendar with specific weekly assignments
- Mix of content types (blog posts, tutorials, comparisons, listicles, case studies)
- Quick wins section with topics likely to rank within 30 days
- Competitor gap analysis
${params.currentMonthlyTraffic ? `- Current traffic: ${params.currentMonthlyTraffic} monthly visits. Set realistic growth targets.` : ""}

Return a JSON object:
{
  "overview": "3-5 sentence strategic overview explaining the approach and expected outcomes",
  "targetAudience": "Detailed description of the ideal content consumer",
  "pillars": [
    {
      "name": "Pillar name",
      "description": "Strategic rationale for this pillar and how it drives business goals",
      "topics": [
        {
          "topic": "Full article title",
          "keywords": ["primary keyword", "secondary keyword"],
          "searchVolume": "high" | "medium" | "low",
          "difficulty": "easy" | "medium" | "hard",
          "contentType": "blog-post" | "tutorial" | "comparison" | "listicle" | "how-to" | "case-study",
          "rationale": "Why this specific topic and how it fits the strategy",
          "estimatedImpact": "Expected traffic and business impact"
        }
      ]
    }
  ],
  "contentCalendar": [
    {
      "week": 1,
      "topics": [{ ...topic objects... }],
      "focus": "Week theme and strategic reasoning"
    }
  ],
  "competitorGaps": ["Specific content gap description 1", "Gap 2"],
  "quickWins": [{ ...topic objects with difficulty: "easy"... }]
}

Return ONLY the JSON object, no explanations.`;

    const userMessage = this.buildPlanRequest(params);

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
   * Given existing analytics data, suggest which content to create next
   * for maximum traffic impact.
   */
  async suggestNextContent(params: {
    topPerformingContent: {
      title: string;
      views: number;
      keywords: string[];
    }[];
    recentContent: {
      title: string;
      views: number;
      publishedAt: Date;
    }[];
    industry: string;
    brandVoice?: BrandVoice;
  }): Promise<TopicSuggestion[]> {
    const system = `You are a data-driven content strategist. Based on content performance analytics, suggest the next pieces of content that will maximize organic traffic growth.

ANALYSIS APPROACH:
1. DOUBLE DOWN ON WINNERS: Identify patterns in top-performing content and suggest similar topics
2. EXPAND TOPIC CLUSTERS: Find related topics that can benefit from the authority of existing high-performing content
3. UPDATE OPPORTUNITIES: Identify recent content that underperformed and suggest complementary content that could boost it via internal linking
4. KEYWORD EXPANSION: Use keywords from top content to find adjacent, lower-competition opportunities
5. CONTENT GAPS: Identify topic gaps based on what's performing well vs. what's missing
6. RECENCY BIAS: Factor in seasonal trends and content freshness

Return a JSON array of 5-10 topic suggestions ordered by expected impact:
[
  {
    "topic": "Full article title",
    "keywords": ["primary keyword", "secondary keyword"],
    "searchVolume": "high" | "medium" | "low",
    "difficulty": "easy" | "medium" | "hard",
    "contentType": "blog-post" | "tutorial" | "comparison" | "listicle" | "how-to" | "case-study",
    "rationale": "Data-backed reasoning for why this topic should be next. Reference specific performing content.",
    "estimatedImpact": "Expected traffic impact based on similar content performance"
  }
]

Return ONLY the JSON array, no explanations.`;

    const topContent = params.topPerformingContent
      .sort((a, b) => b.views - a.views)
      .slice(0, 20)
      .map((c) => `- "${c.title}" (${c.views} views, keywords: ${c.keywords.join(", ")})`)
      .join("\n");

    const recentContent = params.recentContent
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 15)
      .map(
        (c) =>
          `- "${c.title}" (${c.views} views, published: ${c.publishedAt.toISOString().split("T")[0]})`,
      )
      .join("\n");

    const userMessage = `Based on the following analytics data, suggest the next content pieces for maximum traffic impact.

INDUSTRY: ${params.industry}
${params.brandVoice ? `BRAND VOICE: ${params.brandVoice.tone.join(", ")} | ${params.brandVoice.style}` : ""}

TOP PERFORMING CONTENT:
${topContent}

RECENT CONTENT:
${recentContent}`;

    const response = await this.provider.complete({
      system,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 4096,
      temperature: 0.7,
    });

    return this.parseTopicSuggestions(response.content);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildPlanRequest(params: {
    websiteUrl?: string;
    industry: string;
    targetAudience: string;
    businessGoals: string[];
    currentMonthlyTraffic?: number;
    brandVoice?: BrandVoice;
    existingContent?: { title: string; url: string; traffic?: number }[];
    budget?: "bootstrap" | "moderate" | "aggressive";
  }): string {
    let message = `Create a comprehensive content strategy for organic traffic growth.

${params.websiteUrl ? `WEBSITE: ${params.websiteUrl}` : ""}
INDUSTRY: ${params.industry}
TARGET AUDIENCE: ${params.targetAudience}
BUDGET LEVEL: ${params.budget ?? "moderate"}
${params.currentMonthlyTraffic ? `CURRENT MONTHLY TRAFFIC: ${params.currentMonthlyTraffic} visits` : ""}

BUSINESS GOALS:
${params.businessGoals.map((g) => `- ${g}`).join("\n")}`;

    if (params.brandVoice) {
      message += `\n\nBRAND VOICE:
- Tone: ${params.brandVoice.tone.join(", ")}
- Style: ${params.brandVoice.style}
- Audience: ${params.brandVoice.targetAudience}
- Industry: ${params.brandVoice.industry}`;
    }

    if (params.existingContent?.length) {
      const contentList = params.existingContent
        .slice(0, 30)
        .map((c) => {
          let entry = `- "${c.title}" (${c.url})`;
          if (c.traffic !== undefined) entry += ` [${c.traffic} monthly views]`;
          return entry;
        })
        .join("\n");
      message += `\n\nEXISTING CONTENT (${params.existingContent.length} total, showing top 30):\n${contentList}`;
    }

    return message;
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

  private parseTopicSuggestions(raw: string): TopicSuggestion[] {
    const parsed = this.extractJSON<TopicSuggestion[]>(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Expected an array of topic suggestions");
    }

    return parsed.map((item) => this.normalizeTopicSuggestion(item));
  }

  private normalizeTopicSuggestion(
    item: Partial<TopicSuggestion>,
  ): TopicSuggestion {
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

    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch?.[1]) {
      cleaned = jsonBlockMatch[1].trim();
    }

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
