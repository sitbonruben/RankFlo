import type { AIProviderClient } from "../providers";
import type { BrandVoice } from "../types";

/**
 * Analyzes content samples to extract and score brand voice profiles.
 *
 * Can analyze raw text samples or infer brand voice from a website URL.
 * Also scores how well generated content aligns with a given brand voice.
 */
export class BrandVoiceAnalyzer {
  private provider: AIProviderClient;

  constructor(provider: AIProviderClient) {
    this.provider = provider;
  }

  /**
   * Analyze existing content samples to extract a brand voice profile.
   * Provide 3-10 content samples for best results.
   */
  async analyze(samples: string[]): Promise<BrandVoice> {
    if (samples.length === 0) {
      throw new Error(
        "At least one content sample is required for brand voice analysis",
      );
    }

    const system = `You are a brand voice and content analysis expert. Your job is to analyze writing samples and extract a precise brand voice profile that can be used to generate consistent content.

ANALYSIS METHODOLOGY:
1. TONE: Identify the primary tones present across all samples (e.g., professional, friendly, authoritative, casual, witty, empathetic, bold). List 2-5 tone descriptors.
2. STYLE: Describe the overall writing style in one phrase (e.g., "conversational technical writing", "formal academic prose", "playful marketing copy").
3. VOCABULARY: Extract brand-specific terminology, jargon, and preferred phrasing used consistently across samples.
4. AVOID WORDS: Identify words, phrases, or patterns that the brand clearly avoids (e.g., excessive jargon, slang, passive voice patterns).
5. TARGET AUDIENCE: Infer the intended audience from the content's complexity, references, and assumed knowledge level.
6. INDUSTRY: Identify the industry or niche based on content themes and terminology.
7. EXAMPLES: Select 1-2 particularly representative sentences or short paragraphs that best exemplify the brand voice.

IMPORTANT: Be specific and actionable. Generic descriptors like "professional" alone are not helpful. Pair them with nuance: "professional but approachable, using first-person plural 'we' to create partnership feel".

Return a JSON object with this exact structure:
{
  "tone": ["tone1", "tone2", "tone3"],
  "style": "Brief but specific description of the writing style",
  "vocabulary": ["term1", "term2", "term3"],
  "avoidWords": ["word1", "word2", "word3"],
  "targetAudience": "Specific audience description",
  "industry": "Industry/niche",
  "examples": ["Example sentence or short paragraph 1", "Example sentence or short paragraph 2"]
}

Return ONLY the JSON object, no explanations.`;

    // Truncate samples to stay within reasonable token limits
    const truncatedSamples = samples.map((s, i) => {
      const maxLen = Math.floor(6000 / samples.length);
      const text = s.length > maxLen ? s.slice(0, maxLen) + "..." : s;
      return `--- SAMPLE ${i + 1} ---\n${text}`;
    });

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `Analyze these ${samples.length} content samples and extract the brand voice profile:\n\n${truncatedSamples.join("\n\n")}`,
        },
      ],
      maxTokens: 2048,
      temperature: 0.5,
    });

    return this.parseBrandVoice(response.content);
  }

  /**
   * Create a brand voice profile from a website URL's content description.
   * Since we cannot scrape websites, this uses AI knowledge of the brand.
   */
  async analyzeFromUrl(url: string): Promise<BrandVoice> {
    const system = `You are a brand voice and content analysis expert. Given a website URL, use your knowledge of the brand/company to create a brand voice profile.

If you recognize the brand, analyze their known content style. If you don't recognize the URL, infer what you can from the domain name and provide a reasonable default voice profile for that type of website.

Return a JSON object with this exact structure:
{
  "tone": ["tone1", "tone2", "tone3"],
  "style": "Brief but specific description of the writing style",
  "vocabulary": ["term1", "term2", "term3"],
  "avoidWords": ["word1", "word2", "word3"],
  "targetAudience": "Specific audience description",
  "industry": "Industry/niche",
  "examples": ["Example sentence showing the brand voice style"]
}

Return ONLY the JSON object, no explanations.`;

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `Analyze the brand voice for: ${url}\n\nCreate a comprehensive brand voice profile based on your knowledge of this brand/website.`,
        },
      ],
      maxTokens: 2048,
      temperature: 0.5,
    });

    return this.parseBrandVoice(response.content);
  }

  /**
   * Check if generated content matches the brand voice.
   * Returns a score 0-100 and specific, actionable feedback.
   */
  async scoreAlignment(
    content: string,
    voice: BrandVoice,
  ): Promise<{ score: number; feedback: string[] }> {
    const system = `You are a brand consistency auditor. Your job is to evaluate how well a piece of content matches a specific brand voice profile.

SCORING CRITERIA (each worth up to 20 points, total 100):

1. TONE ALIGNMENT (0-20): Does the content match the specified tones?
2. STYLE CONSISTENCY (0-20): Does the writing style match the brand style description?
3. VOCABULARY USAGE (0-20): Does it use brand-specific terms and avoid prohibited words?
4. AUDIENCE FIT (0-20): Is the content appropriate for the target audience in terms of complexity and relevance?
5. OVERALL FEEL (0-20): Would this content feel "on-brand" if published alongside the brand's existing content?

Return a JSON object:
{
  "score": 75,
  "feedback": [
    "Specific, actionable feedback point 1",
    "Specific, actionable feedback point 2",
    "Specific, actionable feedback point 3"
  ]
}

For each feedback point:
- Be specific: reference exact phrases or sentences from the content
- Be actionable: explain what should change and how
- Prioritize: list the most impactful changes first

Return ONLY the JSON object, no explanations.`;

    const voiceProfile = `BRAND VOICE PROFILE:
- Tone: ${voice.tone.join(", ")}
- Style: ${voice.style}
- Vocabulary to use: ${voice.vocabulary.join(", ")}
- Words to avoid: ${voice.avoidWords.join(", ")}
- Target audience: ${voice.targetAudience}
- Industry: ${voice.industry}
${voice.examples?.length ? `- Example content:\n${voice.examples.map((e) => `  "${e.slice(0, 200)}"`).join("\n")}` : ""}`;

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `${voiceProfile}\n\n---\n\nCONTENT TO EVALUATE:\n\n${content.slice(0, 5000)}`,
        },
      ],
      maxTokens: 1024,
      temperature: 0.3,
    });

    return this.parseAlignmentScore(response.content);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private parseBrandVoice(raw: string): BrandVoice {
    const parsed = this.extractJSON<Partial<BrandVoice>>(raw);

    return {
      tone: Array.isArray(parsed.tone) ? parsed.tone.map(String) : ["professional"],
      style: String(parsed.style ?? "clear and concise writing"),
      vocabulary: Array.isArray(parsed.vocabulary)
        ? parsed.vocabulary.map(String)
        : [],
      avoidWords: Array.isArray(parsed.avoidWords)
        ? parsed.avoidWords.map(String)
        : [],
      targetAudience: String(parsed.targetAudience ?? "general audience"),
      industry: String(parsed.industry ?? "general"),
      examples: Array.isArray(parsed.examples)
        ? parsed.examples.map(String)
        : undefined,
    };
  }

  private parseAlignmentScore(raw: string): {
    score: number;
    feedback: string[];
  } {
    const parsed = this.extractJSON<{ score: number; feedback: string[] }>(raw);

    const score = Math.max(
      0,
      Math.min(100, Math.round(Number(parsed.score ?? 50))),
    );
    const feedback = Array.isArray(parsed.feedback)
      ? parsed.feedback.map(String)
      : ["Unable to parse detailed feedback from analysis."];

    return { score, feedback };
  }

  private extractJSON<T>(raw: string): T {
    let cleaned = raw.trim();

    // Remove markdown code blocks if present
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch?.[1]) {
      cleaned = jsonBlockMatch[1].trim();
    }

    // Try to find a JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch?.[0]) {
      cleaned = jsonMatch[0];
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(
        `Failed to parse JSON from AI response: ${cleaned.slice(0, 200)}`,
      );
    }
  }
}
