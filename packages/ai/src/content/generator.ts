import type { AIProviderClient } from "../providers";
import type {
  BrandVoice,
  ContentBrief,
  GeneratedContent,
  StreamCallback,
} from "../types";
import { SEOAnalyzer } from "./seo";

/**
 * Multi-step content generation pipeline.
 *
 * The pipeline works as follows:
 *   1. Generate a structured outline from the brief
 *   2. Generate each section individually for quality
 *   3. Assemble sections into a cohesive piece with smooth transitions
 *   4. Generate SEO metadata (title, description, tags, structured data)
 *   5. Compute analytics (word count, readability, keyword density, SEO score)
 */
export class ContentGenerator {
  private provider: AIProviderClient;
  private brandVoice?: BrandVoice;
  private seoAnalyzer: SEOAnalyzer;

  constructor(provider: AIProviderClient, brandVoice?: BrandVoice) {
    this.provider = provider;
    this.brandVoice = brandVoice;
    this.seoAnalyzer = new SEOAnalyzer();
  }

  /**
   * Generate a full blog post from a content brief.
   * Multi-step pipeline: outline -> sections -> assemble -> optimize
   */
  async generate(
    brief: ContentBrief,
    onProgress?: StreamCallback,
  ): Promise<GeneratedContent> {
    onProgress?.("Generating outline...");
    const outline = await this.generateOutline(brief);

    onProgress?.("Writing content sections...");
    const sections = await this.generateSections(outline, brief);

    onProgress?.("Assembling and polishing content...");
    const content = await this.assembleContent(sections, brief);

    onProgress?.("Generating SEO metadata...");
    const seo = await this.generateSEO(content, brief);

    onProgress?.("Finalizing...");
    return this.finalize(content, seo, brief);
  }

  /**
   * Generate a structured outline for the content piece.
   */
  async generateOutline(brief: ContentBrief): Promise<string[]> {
    if (brief.outline && brief.outline.length > 0) {
      return brief.outline;
    }

    const system = this.buildOutlineSystemPrompt(brief);
    const userMessage = this.buildOutlineUserPrompt(brief);

    const response = await this.provider.complete({
      system,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 2048,
      temperature: 0.7,
    });

    return this.parseOutline(response.content);
  }

  /**
   * Rewrite a specific section of content with instructions.
   */
  async rewriteSection(
    content: string,
    instructions: string,
  ): Promise<string> {
    const system = `You are an expert content editor. You will rewrite the provided content section according to the given instructions while maintaining quality, flow, and SEO optimization.${this.getBrandVoiceDirective()}

Rules:
- Maintain the same general topic and key information
- Apply the requested changes precisely
- Keep the markdown formatting intact
- Preserve any internal links
- Return ONLY the rewritten content, no explanations or preamble`;

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `## Content to rewrite:\n\n${content}\n\n## Instructions:\n\n${instructions}`,
        },
      ],
      maxTokens: 4096,
      temperature: 0.6,
    });

    return response.content.trim();
  }

  /**
   * Improve existing content based on feedback.
   */
  async improveContent(content: string, feedback: string): Promise<string> {
    const system = `You are an expert content editor and SEO specialist. Improve the provided content based on the feedback given.${this.getBrandVoiceDirective()}

Guidelines:
- Address every piece of feedback provided
- Maintain the original structure unless the feedback specifically asks for restructuring
- Improve readability and flow
- Strengthen SEO signals where possible
- Keep all existing internal links and add new ones if appropriate
- Maintain markdown formatting
- Return ONLY the improved content, no explanations`;

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `## Current content:\n\n${content}\n\n## Feedback to address:\n\n${feedback}`,
        },
      ],
      maxTokens: 8192,
      temperature: 0.5,
      longForm: true,
    });

    return response.content.trim();
  }

  // ---------------------------------------------------------------------------
  // Pipeline steps (private)
  // ---------------------------------------------------------------------------

  private async generateSections(
    outline: string[],
    brief: ContentBrief,
  ): Promise<string[]> {
    const sections: string[] = [];

    for (let i = 0; i < outline.length; i++) {
      const heading = outline[i]!;
      const previousContext =
        sections.length > 0
          ? sections.slice(-1).join("\n\n").slice(-800)
          : "";

      const system = this.buildSectionSystemPrompt(brief, i === 0);
      const userMessage = this.buildSectionUserPrompt(
        heading,
        outline,
        brief,
        previousContext,
        i,
      );

      const response = await this.provider.complete({
        system,
        messages: [{ role: "user", content: userMessage }],
        maxTokens: 4096,
        temperature: 0.7,
        longForm: true,
      });

      sections.push(response.content.trim());
    }

    return sections;
  }

  private async assembleContent(
    sections: string[],
    brief: ContentBrief,
  ): Promise<string> {
    const rawContent = sections.join("\n\n");

    const system = `You are a world-class content editor. Your job is to take individually written sections of a ${brief.contentType} and assemble them into one polished, cohesive piece.${this.getBrandVoiceDirective()}

Your responsibilities:
1. SMOOTH TRANSITIONS: Ensure each section flows naturally into the next. Add transition sentences where needed.
2. CONSISTENCY: Make sure the tone, style, and terminology are consistent throughout.
3. ELIMINATE REDUNDANCY: Remove any repeated points or phrases across sections.
4. STRENGTHEN THE OPENING: The intro must hook the reader within the first two sentences. Use a compelling statistic, question, or bold statement.
5. POWERFUL CONCLUSION: End with a strong conclusion that summarizes key takeaways and includes a clear call to action.
6. INTERNAL LINKS: Naturally incorporate any internal links provided.
7. FORMATTING: Use proper markdown formatting with clear heading hierarchy.
8. READABILITY: Vary sentence length. Mix short punchy sentences with longer explanatory ones. Use bullet points and numbered lists where appropriate.

${brief.callToAction ? `Call to Action: ${brief.callToAction}` : ""}
${brief.internalLinks ? `Internal links to include:\n${brief.internalLinks.map((l) => `- [${l.title}](${l.url})`).join("\n")}` : ""}

Target word count: ${brief.wordCount ?? this.getDefaultWordCount(brief.contentType)}

CRITICAL: Return ONLY the final content in markdown. No preamble, no "here is the content", no explanations. Start directly with the content.`;

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `Assemble and polish this ${brief.contentType} about "${brief.topic}".\n\nTarget keywords: ${brief.targetKeywords.join(", ")}\n${brief.secondaryKeywords ? `Secondary keywords: ${brief.secondaryKeywords.join(", ")}` : ""}\n\n---\n\n${rawContent}`,
        },
      ],
      maxTokens: 8192,
      temperature: 0.5,
      longForm: true,
    });

    return response.content.trim();
  }

  private async generateSEO(
    content: string,
    brief: ContentBrief,
  ): Promise<{
    title: string;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    tags: string[];
    featuredImagePrompt: string;
  }> {
    const system = `You are an SEO specialist and content strategist. Generate optimized metadata for the given content.

You must return a valid JSON object with exactly these fields:
{
  "title": "The main H1 title for the page (compelling, includes primary keyword, 50-70 chars)",
  "metaTitle": "SEO meta title for search results (50-60 chars, includes primary keyword near the start, compelling for CTR)",
  "metaDescription": "SEO meta description (150-160 chars, includes primary keyword, has a call to action, entices clicks)",
  "excerpt": "A 1-2 sentence summary of the content for previews and social sharing (120-200 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "featuredImagePrompt": "A detailed prompt for AI image generation that would create a relevant, professional featured image for this content"
}

Rules:
- The title should be different from metaTitle (title is for the page, metaTitle is for search results)
- Primary keyword: ${brief.targetKeywords[0]}
- All keywords: ${brief.targetKeywords.join(", ")}
- Content type: ${brief.contentType}
- Tags should be relevant categories/topics (5-8 tags)
- Return ONLY the JSON object, nothing else`;

    const response = await this.provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `Generate SEO metadata for this ${brief.contentType} about "${brief.topic}":\n\n${content.slice(0, 3000)}`,
        },
      ],
      maxTokens: 1024,
      temperature: 0.4,
    });

    return this.parseJSON(response.content);
  }

  private finalize(
    content: string,
    seo: {
      title: string;
      metaTitle: string;
      metaDescription: string;
      excerpt: string;
      tags: string[];
      featuredImagePrompt: string;
    },
    brief: ContentBrief,
  ): GeneratedContent {
    const contentHtml = markdownToHtml(content);
    const wordCount = countWords(content);
    const headings = extractHeadings(content);
    const internalLinks = extractLinks(content);
    const keywordDensity = calculateKeywordDensity(
      content,
      brief.targetKeywords,
    );

    const seoAnalysis = this.seoAnalyzer.analyze(
      content,
      seo.title,
      seo.metaDescription,
      brief.targetKeywords,
    );

    const slug = slugify(seo.title);
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 238));

    return {
      title: seo.title,
      slug,
      content,
      contentHtml,
      excerpt: seo.excerpt,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      tags: seo.tags,
      featuredImagePrompt: seo.featuredImagePrompt,
      estimatedReadTime,
      wordCount,
      seoScore: seoAnalysis.score,
      keywordDensity,
      headings,
      internalLinks,
      structuredData: {},
    };
  }

  // ---------------------------------------------------------------------------
  // System prompts
  // ---------------------------------------------------------------------------

  private buildOutlineSystemPrompt(brief: ContentBrief): string {
    return `You are a senior content strategist and SEO expert. Your job is to create a detailed, well-structured outline for a ${brief.contentType}.${this.getBrandVoiceDirective()}

OUTLINE REQUIREMENTS:
1. Start with a compelling introduction section that hooks the reader
2. Organize main points logically with clear H2 headings
3. Include H3 subheadings under complex H2 sections where appropriate
4. Each section heading should be descriptive and, where natural, include target keywords
5. End with a conclusion/summary section
6. For listicles, number the items
7. For how-to guides, use step-by-step format
8. For comparisons, ensure balanced coverage of alternatives

SEO CONSIDERATIONS:
- Primary keyword should appear in at least 2 headings naturally
- Structure should support featured snippet eligibility (clear answers, lists, steps)
- Include sections that answer common "People Also Ask" questions related to the topic

FORMAT: Return each heading on its own line, prefixed with its markdown heading level:
## Introduction: [hook description]
## [Main Section 1]
### [Subsection 1a]
### [Subsection 1b]
## [Main Section 2]
...
## Conclusion

Return ONLY the outline headings, nothing else.`;
  }

  private buildOutlineUserPrompt(brief: ContentBrief): string {
    let prompt = `Create a detailed outline for a ${brief.contentType} about: "${brief.topic}"

Primary keywords: ${brief.targetKeywords.join(", ")}`;

    if (brief.secondaryKeywords?.length) {
      prompt += `\nSecondary keywords: ${brief.secondaryKeywords.join(", ")}`;
    }
    if (brief.targetAudience ?? this.brandVoice?.targetAudience) {
      prompt += `\nTarget audience: ${brief.targetAudience ?? this.brandVoice?.targetAudience}`;
    }
    if (brief.wordCount) {
      prompt += `\nTarget length: ~${brief.wordCount} words (plan section count accordingly)`;
    }
    if (brief.callToAction) {
      prompt += `\nDesired CTA: ${brief.callToAction}`;
    }

    return prompt;
  }

  private buildSectionSystemPrompt(
    brief: ContentBrief,
    isIntro: boolean,
  ): string {
    const voiceDirective = this.getBrandVoiceDirective();
    const audienceDesc =
      brief.targetAudience ??
      this.brandVoice?.targetAudience ??
      "general readers";

    return `You are an expert content writer specializing in ${this.brandVoice?.industry ?? "digital content"}. You write for ${audienceDesc}.${voiceDirective}

WRITING GUIDELINES:

1. ENGAGING STYLE:
   - Write like a knowledgeable human, not a robot
   - Use active voice predominantly (80%+ of sentences)
   - Vary sentence length: mix short punchy sentences (5-10 words) with medium (15-20 words) and occasional longer ones (25-30 words)
   - Start paragraphs with different structures (don't always start with "The" or "It")
   - Use rhetorical questions sparingly to engage the reader
   - Include specific examples, data points, or anecdotes where relevant

2. SEO BEST PRACTICES:
   - Include the target keyword naturally in the first 100 words of the section
   - Use keyword variations and synonyms throughout
   - Write for humans first, search engines second
   - Keyword density should be 1-2% (natural, not stuffed)
   - Use the exact target keyword phrase at least once per major section

3. FORMATTING:
   - Use markdown formatting throughout
   - Include bullet points or numbered lists where content warrants it
   - Bold **key terms** and important phrases
   - Keep paragraphs to 2-4 sentences for easy scanning
   - Use subheadings (H3) to break up long sections

4. CONTENT QUALITY:
   - Every sentence must add value; eliminate filler
   - Support claims with reasoning or examples
   - Address the reader directly with "you" language
   - Anticipate and answer follow-up questions
   - Include actionable takeaways where appropriate

${isIntro ? `5. INTRODUCTION REQUIREMENTS:
   - Hook the reader in the very first sentence with a surprising fact, bold claim, question, or relatable scenario
   - Clearly state what the reader will learn or gain
   - Establish credibility and relevance
   - Keep it concise (150-250 words for the intro section)
   - Include the primary keyword within the first two sentences` : ""}

CRITICAL: Write ONLY the section content. Do NOT include explanations, preambles like "Here is the section", or meta-commentary. Start directly with the content.`;
  }

  private buildSectionUserPrompt(
    heading: string,
    fullOutline: string[],
    brief: ContentBrief,
    previousContext: string,
    sectionIndex: number,
  ): string {
    let prompt = `Write the following section of a ${brief.contentType} about "${brief.topic}":

SECTION TO WRITE:
${heading}

FULL OUTLINE (for context on overall structure):
${fullOutline.map((h, i) => `${i === sectionIndex ? ">>> " : "    "}${h}`).join("\n")}

TARGET KEYWORDS: ${brief.targetKeywords.join(", ")}`;

    if (brief.secondaryKeywords?.length) {
      prompt += `\nSECONDARY KEYWORDS: ${brief.secondaryKeywords.join(", ")}`;
    }

    if (previousContext) {
      prompt += `\n\nPREVIOUS SECTION ENDING (maintain flow):\n...${previousContext}`;
    }

    if (brief.internalLinks?.length) {
      prompt += `\n\nINTERNAL LINKS TO NATURALLY INCLUDE:\n${brief.internalLinks.map((l) => `- [${l.title}](${l.url})`).join("\n")}`;
    }

    return prompt;
  }

  private getBrandVoiceDirective(): string {
    if (!this.brandVoice) return "";

    return `

BRAND VOICE PROFILE:
- Tone: ${this.brandVoice.tone.join(", ")}
- Style: ${this.brandVoice.style}
- Target audience: ${this.brandVoice.targetAudience}
- Industry: ${this.brandVoice.industry}
${this.brandVoice.vocabulary.length > 0 ? `- Use these brand terms naturally: ${this.brandVoice.vocabulary.join(", ")}` : ""}
${this.brandVoice.avoidWords.length > 0 ? `- AVOID these words/phrases: ${this.brandVoice.avoidWords.join(", ")}` : ""}
${this.brandVoice.examples?.length ? `- Reference style examples:\n${this.brandVoice.examples.map((e) => `  "${e.slice(0, 200)}"`).join("\n")}` : ""}

CRITICAL: Match this brand voice consistently throughout. The content should sound like it was written by this specific brand, not a generic AI.`;
  }

  private getDefaultWordCount(
    contentType: ContentBrief["contentType"],
  ): number {
    const defaults: Record<ContentBrief["contentType"], number> = {
      "blog-post": 1500,
      "landing-page": 800,
      "product-description": 500,
      tutorial: 2000,
      comparison: 2500,
      listicle: 1800,
      "how-to": 1800,
      "case-study": 1500,
      news: 800,
    };
    return defaults[contentType] ?? 1500;
  }

  // ---------------------------------------------------------------------------
  // Parsing helpers
  // ---------------------------------------------------------------------------

  private parseOutline(raw: string): string[] {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("#"));
  }

  private parseJSON<T>(raw: string): T {
    // Try to extract JSON from the response (may be wrapped in markdown code blocks)
    let cleaned = raw.trim();

    // Remove markdown code blocks if present
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch?.[1]) {
      cleaned = jsonBlockMatch[1].trim();
    }

    // Try to find a JSON object in the response
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

// =============================================================================
// Utility functions
// =============================================================================

/**
 * Simple but functional markdown-to-HTML converter.
 * Handles: headings, paragraphs, bold, italic, code, links, lists, blockquotes, hr.
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Normalize line endings
  html = html.replace(/\r\n/g, "\n");

  // Escape HTML entities in text (but preserve markdown syntax)
  // We'll do this selectively to avoid breaking markdown syntax
  html = html.replace(/&/g, "&amp;");
  // Do NOT escape < and > here as we need them for our HTML output later

  // Code blocks (fenced) -- process first to avoid other transformations inside
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_match, lang: string, code: string) => {
      const escaped = code
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const langAttr = lang ? ` class="language-${lang}"` : "";
      return `<pre><code${langAttr}>${escaped.trim()}</code></pre>`;
    },
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    (_match, code: string) =>
      `<code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`,
  );

  // Headings (h1-h6)
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  // Merge adjacent blockquotes
  html = html.replace(
    /<\/blockquote>\n<blockquote>/g,
    "\n",
  );

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1">',
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );

  // Bold and italic (order matters: bold+italic first)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Unordered lists
  html = html.replace(
    /^(?:[-*+]\s+.+\n?)+/gm,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((line) => `<li>${line.replace(/^[-*+]\s+/, "")}</li>`)
        .join("\n");
      return `<ul>\n${items}\n</ul>`;
    },
  );

  // Ordered lists
  html = html.replace(
    /^(?:\d+\.\s+.+\n?)+/gm,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .map((line) => `<li>${line.replace(/^\d+\.\s+/, "")}</li>`)
        .join("\n");
      return `<ol>\n${items}\n</ol>`;
    },
  );

  // Paragraphs: wrap remaining standalone lines that aren't already HTML
  const lines = html.split("\n\n");
  html = lines
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<img")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n\n");

  return html;
}

/**
 * Count words in text, ignoring markdown syntax.
 */
export function countWords(text: string): number {
  const cleaned = text
    // Remove markdown headings
    .replace(/^#{1,6}\s+/gm, "")
    // Remove markdown links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    // Remove bold/italic markers
    .replace(/[*_]{1,3}/g, "")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`[^`]+`/g, "")
    // Remove horizontal rules
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "")
    // Remove list markers
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "");

  const words = cleaned
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return words.length;
}

/**
 * Extract all headings from markdown content.
 */
export function extractHeadings(
  content: string,
): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1]!.length,
      text: match[2]!.trim(),
    });
  }

  return headings;
}

/**
 * Extract all links from markdown content.
 */
export function extractLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // Skip image links
    if (content[match.index! - 1] === "!") continue;
    links.push(match[2]!);
  }

  return [...new Set(links)];
}

/**
 * Calculate keyword density as a percentage of total words.
 */
export function calculateKeywordDensity(
  content: string,
  keywords: string[],
): Record<string, number> {
  const totalWords = countWords(content);
  if (totalWords === 0) return {};

  const lowerContent = content.toLowerCase();
  const density: Record<string, number> = {};

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    let count = 0;
    let pos = 0;

    while ((pos = lowerContent.indexOf(lowerKeyword, pos)) !== -1) {
      count++;
      pos += lowerKeyword.length;
    }

    // Keyword density = (keyword occurrences * words in keyword) / total words * 100
    const keywordWordCount = lowerKeyword.split(/\s+/).length;
    density[keyword] =
      Math.round(((count * keywordWordCount) / totalWords) * 10000) / 100;
  }

  return density;
}

/**
 * Generate a URL-friendly slug from a title.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
