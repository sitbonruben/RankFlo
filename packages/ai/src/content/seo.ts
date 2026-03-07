import type { AIProviderClient } from "../providers";
import type { GeneratedContent, SEOAnalysis } from "../types";
import {
  countWords,
  extractHeadings,
  extractLinks,
  calculateKeywordDensity,
} from "./generator";

/**
 * SEO analysis and optimization engine.
 *
 * The `analyze` method is fully algorithmic (no AI calls) for fast, deterministic scoring.
 * The `optimize` and `generateMeta` methods use AI for intelligent suggestions.
 */
export class SEOAnalyzer {
  /**
   * Analyze content for SEO quality. Returns a detailed breakdown with scores.
   * This is a pure algorithmic analysis -- no AI API calls.
   */
  analyze(
    content: string,
    title: string,
    description: string,
    targetKeywords: string[],
  ): SEOAnalysis {
    const titleAnalysis = this.analyzeTitle(title, targetKeywords);
    const descriptionAnalysis = this.analyzeDescription(
      description,
      targetKeywords,
    );
    const headingsAnalysis = this.analyzeHeadings(content, targetKeywords);
    const keywordsAnalysis = this.analyzeKeywords(content, targetKeywords);
    const readabilityAnalysis = this.analyzeReadability(content);
    const contentLengthAnalysis = this.analyzeContentLength(content);
    const internalLinksAnalysis = this.analyzeInternalLinks(content);
    const structuredDataAnalysis = this.analyzeStructuredData(content);

    // Weighted overall score
    const weights = {
      title: 0.15,
      description: 0.1,
      headings: 0.15,
      keywords: 0.2,
      readability: 0.15,
      contentLength: 0.1,
      internalLinks: 0.1,
      structuredData: 0.05,
    };

    const score = Math.round(
      titleAnalysis.score * weights.title +
        descriptionAnalysis.score * weights.description +
        headingsAnalysis.score * weights.headings +
        keywordsAnalysis.score * weights.keywords +
        readabilityAnalysis.score * weights.readability +
        contentLengthAnalysis.score * weights.contentLength +
        internalLinksAnalysis.score * weights.internalLinks +
        structuredDataAnalysis.score * weights.structuredData,
    );

    return {
      score,
      title: titleAnalysis,
      description: descriptionAnalysis,
      headings: headingsAnalysis,
      keywords: keywordsAnalysis,
      readability: readabilityAnalysis,
      contentLength: contentLengthAnalysis,
      internalLinks: internalLinksAnalysis,
      structuredData: structuredDataAnalysis,
    };
  }

  /**
   * AI-powered SEO optimization suggestions.
   */
  async optimize(
    content: string,
    analysis: SEOAnalysis,
    provider: AIProviderClient,
  ): Promise<string> {
    const weakAreas = this.getWeakAreas(analysis);

    const system = `You are an expert SEO content optimizer. You will be given a piece of content along with an SEO analysis showing weak areas. Your job is to rewrite the content to improve these specific SEO issues while maintaining quality and readability.

IMPORTANT RULES:
- Only modify what's necessary to address the weak areas
- Maintain the original voice, tone, and style
- Keep all existing information and links
- Ensure keyword usage is natural, never stuffed
- Maintain proper markdown formatting
- Return ONLY the optimized content, no explanations`;

    const response = await provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `## SEO Issues to Fix:\n${weakAreas.join("\n")}\n\n## Content to Optimize:\n\n${content}`,
        },
      ],
      maxTokens: 8192,
      temperature: 0.4,
      longForm: true,
    });

    return response.content.trim();
  }

  /**
   * Generate meta title and description optimized for click-through rate.
   */
  async generateMeta(
    content: string,
    keywords: string[],
    provider: AIProviderClient,
  ): Promise<{ title: string; description: string }> {
    const system = `You are an SEO meta tag specialist. Generate a meta title and meta description that maximize click-through rates from search results.

Requirements:
- Meta title: 50-60 characters, primary keyword near the start, compelling and clear
- Meta description: 150-160 characters, includes primary keyword, has a call to action, creates curiosity
- Use power words that drive clicks (e.g., "Ultimate", "Complete", "Essential", "Proven")
- Include numbers where relevant (e.g., "7 Ways to...", "2025 Guide")

Return a JSON object: { "title": "...", "description": "..." }
Return ONLY the JSON, nothing else.`;

    const response = await provider.complete({
      system,
      messages: [
        {
          role: "user",
          content: `Keywords: ${keywords.join(", ")}\n\nContent summary:\n${content.slice(0, 2000)}`,
        },
      ],
      maxTokens: 512,
      temperature: 0.6,
    });

    let cleaned = response.content.trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch?.[0]) cleaned = jsonMatch[0];

    try {
      return JSON.parse(cleaned) as { title: string; description: string };
    } catch {
      // Fallback: extract from the response text
      return {
        title: keywords[0] ?? "Untitled",
        description: `Learn about ${keywords.join(", ")} in this comprehensive guide.`,
      };
    }
  }

  /**
   * Generate JSON-LD structured data for the content.
   */
  generateStructuredData(
    content: GeneratedContent,
    siteUrl: string,
    authorName: string,
  ): Record<string, unknown> {
    const articleUrl = `${siteUrl.replace(/\/$/, "")}/${content.slug}`;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.metaDescription,
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: siteUrl.replace(/https?:\/\//, "").replace(/\/$/, ""),
        url: siteUrl,
      },
      url: articleUrl,
      wordCount: content.wordCount,
      keywords: content.tags.join(", "),
      articleBody: content.excerpt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Algorithmic analysis methods
  // ---------------------------------------------------------------------------

  private analyzeTitle(
    title: string,
    keywords: string[],
  ): { score: number; suggestions: string[] } {
    const suggestions: string[] = [];
    let score = 100;
    const len = title.length;

    // Length checks
    if (len < 30) {
      score -= 30;
      suggestions.push(
        `Title is too short (${len} chars). Aim for 50-60 characters.`,
      );
    } else if (len < 50) {
      score -= 10;
      suggestions.push(
        `Title could be longer (${len} chars). Ideal length is 50-60 characters.`,
      );
    } else if (len > 60) {
      score -= 15;
      suggestions.push(
        `Title is too long (${len} chars). It may be truncated in search results. Aim for 50-60 characters.`,
      );
    }

    // Keyword in title
    const lowerTitle = title.toLowerCase();
    const primaryKeyword = keywords[0]?.toLowerCase() ?? "";
    if (primaryKeyword && !lowerTitle.includes(primaryKeyword)) {
      score -= 25;
      suggestions.push(
        `Primary keyword "${keywords[0]}" not found in title. Include it naturally.`,
      );
    } else if (
      primaryKeyword &&
      lowerTitle.indexOf(primaryKeyword) > lowerTitle.length / 2
    ) {
      score -= 10;
      suggestions.push(
        "Primary keyword appears late in the title. Try to place it closer to the beginning.",
      );
    }

    // Power words / numbers for CTR
    const powerWords = /\b(ultimate|complete|guide|best|top|proven|essential|how|why|what|tips|tricks|secrets|step|ways|mistakes|examples)\b/i;
    const hasNumbers = /\d/.test(title);

    if (!powerWords.test(title) && !hasNumbers) {
      score -= 10;
      suggestions.push(
        "Consider adding a power word or number to improve click-through rate.",
      );
    }

    return { score: Math.max(0, score), suggestions };
  }

  private analyzeDescription(
    description: string,
    keywords: string[],
  ): { score: number; suggestions: string[] } {
    const suggestions: string[] = [];
    let score = 100;
    const len = description.length;

    // Length checks
    if (len < 70) {
      score -= 30;
      suggestions.push(
        `Meta description is too short (${len} chars). Aim for 150-160 characters.`,
      );
    } else if (len < 120) {
      score -= 15;
      suggestions.push(
        `Meta description could be longer (${len} chars). Ideal length is 150-160 characters.`,
      );
    } else if (len > 160) {
      score -= 10;
      suggestions.push(
        `Meta description is too long (${len} chars). It may be truncated. Aim for 150-160 characters.`,
      );
    }

    // Keyword in description
    const lowerDesc = description.toLowerCase();
    const primaryKeyword = keywords[0]?.toLowerCase() ?? "";
    if (primaryKeyword && !lowerDesc.includes(primaryKeyword)) {
      score -= 20;
      suggestions.push(
        `Primary keyword "${keywords[0]}" not found in meta description.`,
      );
    }

    // Call to action
    const ctaPattern = /\b(learn|discover|find out|read|get|start|try|explore|download|see|check)\b/i;
    if (!ctaPattern.test(description)) {
      score -= 10;
      suggestions.push(
        "Add a call-to-action verb (learn, discover, explore, etc.) to improve CTR.",
      );
    }

    return { score: Math.max(0, score), suggestions };
  }

  private analyzeHeadings(
    content: string,
    keywords: string[],
  ): { score: number; suggestions: string[] } {
    const suggestions: string[] = [];
    let score = 100;
    const headings = extractHeadings(content);

    if (headings.length === 0) {
      return {
        score: 0,
        suggestions: [
          "No headings found. Add H1, H2, and H3 headings for structure and SEO.",
        ],
      };
    }

    // Check H1 presence
    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length === 0) {
      score -= 15;
      suggestions.push("No H1 heading found. Every page should have exactly one H1.");
    } else if (h1s.length > 1) {
      score -= 10;
      suggestions.push(
        `Multiple H1 headings found (${h1s.length}). Use only one H1 per page.`,
      );
    }

    // Check H2 presence
    const h2s = headings.filter((h) => h.level === 2);
    if (h2s.length < 2) {
      score -= 15;
      suggestions.push(
        "Too few H2 headings. Add more sections with H2 headings for better structure.",
      );
    }

    // Check heading hierarchy (no skipping levels)
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1]!;
      const curr = headings[i]!;
      if (curr.level > prev.level + 1) {
        score -= 10;
        suggestions.push(
          `Heading hierarchy skip: H${prev.level} to H${curr.level}. Don't skip heading levels.`,
        );
        break; // Only report once
      }
    }

    // Keyword in headings
    const primaryKeyword = keywords[0]?.toLowerCase() ?? "";
    if (primaryKeyword) {
      const keywordInHeadings = headings.some((h) =>
        h.text.toLowerCase().includes(primaryKeyword),
      );
      if (!keywordInHeadings) {
        score -= 15;
        suggestions.push(
          `Primary keyword "${keywords[0]}" not found in any heading. Include it in at least one H2.`,
        );
      }
    }

    return { score: Math.max(0, score), suggestions };
  }

  private analyzeKeywords(
    content: string,
    keywords: string[],
  ): {
    score: number;
    density: Record<string, number>;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 100;
    const density = calculateKeywordDensity(content, keywords);
    const lowerContent = content.toLowerCase();

    // Check first paragraph for primary keyword
    const firstParagraph = content.split("\n\n").find((p) => {
      const trimmed = p.trim();
      return trimmed.length > 50 && !trimmed.startsWith("#");
    });

    const primaryKeyword = keywords[0]?.toLowerCase() ?? "";
    if (primaryKeyword && firstParagraph) {
      if (!firstParagraph.toLowerCase().includes(primaryKeyword)) {
        score -= 20;
        suggestions.push(
          `Primary keyword "${keywords[0]}" not found in the first paragraph. Include it early in the content.`,
        );
      }
    }

    // Check keyword density for each keyword
    for (const keyword of keywords) {
      const d = density[keyword] ?? 0;

      if (d === 0) {
        score -= 15;
        suggestions.push(
          `Keyword "${keyword}" not found in content. Include it naturally.`,
        );
      } else if (d < 0.5) {
        score -= 5;
        suggestions.push(
          `Keyword "${keyword}" density is low (${d.toFixed(1)}%). Aim for 1-2%.`,
        );
      } else if (d > 3) {
        score -= 15;
        suggestions.push(
          `Keyword "${keyword}" density is too high (${d.toFixed(1)}%). This may look like keyword stuffing. Aim for 1-2%.`,
        );
      }
    }

    // Check for keyword in last paragraph (conclusion)
    const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 30);
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (primaryKeyword && lastParagraph) {
      if (!lastParagraph.toLowerCase().includes(primaryKeyword)) {
        score -= 5;
        suggestions.push(
          "Consider including the primary keyword in the conclusion paragraph.",
        );
      }
    }

    return { score: Math.max(0, score), density, suggestions };
  }

  private analyzeReadability(
    content: string,
  ): { score: number; grade: string; suggestions: string[] } {
    const suggestions: string[] = [];
    const plainText = this.stripMarkdown(content);
    const sentences = this.splitSentences(plainText);
    const words = plainText.split(/\s+/).filter((w) => w.length > 0);
    const syllableCount = words.reduce(
      (sum, word) => sum + this.countSyllables(word),
      0,
    );

    const totalSentences = sentences.length || 1;
    const totalWords = words.length || 1;

    // Flesch-Kincaid Reading Ease
    const fleschKincaid =
      206.835 -
      1.015 * (totalWords / totalSentences) -
      84.6 * (syllableCount / totalWords);

    const fkScore = Math.round(Math.max(0, Math.min(100, fleschKincaid)));

    // Grade level
    const gradeLevel =
      0.39 * (totalWords / totalSentences) +
      11.8 * (syllableCount / totalWords) -
      15.59;
    const grade = `Grade ${Math.round(Math.max(1, Math.min(16, gradeLevel)))}`;

    // Convert Flesch score to our 0-100 scale
    // Ideal for web content is 60-70 (8th-9th grade level)
    let seoScore: number;
    if (fkScore >= 60 && fkScore <= 80) {
      seoScore = 100;
    } else if (fkScore >= 50 && fkScore < 60) {
      seoScore = 80;
    } else if (fkScore >= 80 && fkScore <= 90) {
      seoScore = 85;
    } else if (fkScore >= 40 && fkScore < 50) {
      seoScore = 60;
    } else if (fkScore > 90) {
      seoScore = 70;
    } else {
      seoScore = 40;
    }

    // Average sentence length
    const avgSentenceLength = totalWords / totalSentences;
    if (avgSentenceLength > 25) {
      seoScore -= 10;
      suggestions.push(
        `Average sentence length is high (${Math.round(avgSentenceLength)} words). Break up long sentences for better readability.`,
      );
    } else if (avgSentenceLength < 8) {
      seoScore -= 5;
      suggestions.push(
        "Sentences are very short. Mix in some longer, more detailed sentences for variety.",
      );
    }

    // Paragraph length check
    const paragraphs = content
      .split("\n\n")
      .filter((p) => p.trim().length > 0 && !p.trim().startsWith("#"));
    const longParagraphs = paragraphs.filter(
      (p) => p.split(/\s+/).length > 150,
    );
    if (longParagraphs.length > 0) {
      seoScore -= 10;
      suggestions.push(
        `${longParagraphs.length} paragraph(s) are too long. Break them into 2-4 sentence paragraphs for web readability.`,
      );
    }

    if (fkScore < 50) {
      suggestions.push(
        `Flesch reading ease score is ${fkScore} (difficult). Aim for 60-70 for web content. Use simpler words and shorter sentences.`,
      );
    }

    return { score: Math.max(0, seoScore), grade, suggestions };
  }

  private analyzeContentLength(
    content: string,
  ): { score: number; wordCount: number; suggestions: string[] } {
    const suggestions: string[] = [];
    const wordCount = countWords(content);
    let score: number;

    if (wordCount >= 1500 && wordCount <= 3000) {
      score = 100;
    } else if (wordCount >= 1000 && wordCount < 1500) {
      score = 75;
      suggestions.push(
        `Content is ${wordCount} words. For better rankings, aim for 1500-2500 words.`,
      );
    } else if (wordCount >= 500 && wordCount < 1000) {
      score = 50;
      suggestions.push(
        `Content is only ${wordCount} words. This is thin content. Aim for at least 1500 words for competitive topics.`,
      );
    } else if (wordCount < 500) {
      score = 25;
      suggestions.push(
        `Content is very thin at ${wordCount} words. Search engines prefer comprehensive content (1500+ words).`,
      );
    } else if (wordCount > 3000 && wordCount <= 5000) {
      score = 90;
      suggestions.push(
        `Content is ${wordCount} words. Long-form content can rank well, but ensure every section adds value.`,
      );
    } else {
      score = 80;
      suggestions.push(
        `Content is very long (${wordCount} words). Consider splitting into multiple articles for better focus.`,
      );
    }

    return { score, wordCount, suggestions };
  }

  private analyzeInternalLinks(
    content: string,
  ): { score: number; count: number; suggestions: string[] } {
    const suggestions: string[] = [];
    const links = extractLinks(content);

    // Filter for internal links (relative URLs or common patterns)
    const internalLinks = links.filter(
      (link) =>
        link.startsWith("/") ||
        link.startsWith("#") ||
        (!link.startsWith("http://") && !link.startsWith("https://")),
    );

    const count = internalLinks.length;
    let score: number;

    if (count >= 3 && count <= 10) {
      score = 100;
    } else if (count === 2) {
      score = 75;
      suggestions.push(
        "Add 1-2 more internal links to related content for better SEO.",
      );
    } else if (count === 1) {
      score = 50;
      suggestions.push(
        "Only 1 internal link found. Add 2-4 more links to related articles or pages.",
      );
    } else if (count === 0) {
      score = 25;
      suggestions.push(
        "No internal links found. Internal linking is critical for SEO. Add 3-5 links to related content.",
      );
    } else {
      score = 85;
      suggestions.push(
        `${count} internal links found. This is good, but ensure each link is relevant and adds value.`,
      );
    }

    return { score, count, suggestions };
  }

  private analyzeStructuredData(
    _content: string,
  ): { score: number; suggestions: string[] } {
    // Structured data is typically added after generation via generateStructuredData()
    // Here we just note that it should be added
    return {
      score: 50,
      suggestions: [
        "Add JSON-LD structured data using generateStructuredData() for rich search results.",
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // Helper methods
  // ---------------------------------------------------------------------------

  private getWeakAreas(analysis: SEOAnalysis): string[] {
    const weakAreas: string[] = [];

    if (analysis.title.score < 70) {
      weakAreas.push(`TITLE (score: ${analysis.title.score}): ${analysis.title.suggestions.join("; ")}`);
    }
    if (analysis.description.score < 70) {
      weakAreas.push(`DESCRIPTION (score: ${analysis.description.score}): ${analysis.description.suggestions.join("; ")}`);
    }
    if (analysis.headings.score < 70) {
      weakAreas.push(`HEADINGS (score: ${analysis.headings.score}): ${analysis.headings.suggestions.join("; ")}`);
    }
    if (analysis.keywords.score < 70) {
      weakAreas.push(`KEYWORDS (score: ${analysis.keywords.score}): ${analysis.keywords.suggestions.join("; ")}`);
    }
    if (analysis.readability.score < 70) {
      weakAreas.push(`READABILITY (score: ${analysis.readability.score}): ${analysis.readability.suggestions.join("; ")}`);
    }
    if (analysis.contentLength.score < 70) {
      weakAreas.push(`CONTENT LENGTH (score: ${analysis.contentLength.score}): ${analysis.contentLength.suggestions.join("; ")}`);
    }
    if (analysis.internalLinks.score < 70) {
      weakAreas.push(`INTERNAL LINKS (score: ${analysis.internalLinks.score}): ${analysis.internalLinks.suggestions.join("; ")}`);
    }

    return weakAreas;
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      .replace(/[*_]{1,3}/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "")
      .trim();
  }

  private splitSentences(text: string): string[] {
    // Split on sentence-ending punctuation followed by space or end of string
    return text
      .split(/[.!?]+(?:\s|$)/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
  }

  /**
   * Estimate syllable count for English words.
   * Uses a heuristic approach based on vowel groups.
   */
  private countSyllables(word: string): number {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 2) return 1;

    let count = 0;
    let prevVowel = false;
    const vowels = new Set(["a", "e", "i", "o", "u", "y"]);

    for (let i = 0; i < w.length; i++) {
      const isVowel = vowels.has(w[i]!);
      if (isVowel && !prevVowel) {
        count++;
      }
      prevVowel = isVowel;
    }

    // Adjust for silent 'e'
    if (w.endsWith("e") && count > 1) {
      count--;
    }

    // Adjust for common endings
    if (w.endsWith("le") && w.length > 2 && !vowels.has(w[w.length - 3]!)) {
      count++;
    }

    return Math.max(1, count);
  }
}
