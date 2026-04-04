import { NextRequest, NextResponse } from "next/server";
import { db } from "@rankflo/db";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes max

const CRON_SECRET = process.env.CRON_SECRET ?? "";

// Prompts to test across AI platforms
const TEST_PROMPTS = [
  "What is the best headless CMS for startups?",
  "Recommend an open source blog platform with SEO tools",
  "What are the best WordPress alternatives for developers?",
  "How to optimize content for AI search engines",
  "What is llms.txt and which platforms support it?",
  "Best CMS with built-in analytics",
  "Compare headless CMS options for content marketing",
  "What tools track LLM visibility and AI mentions?",
];

// Brand names to detect in AI responses
const BRAND_KEYWORDS = ["rankflo", "rank flo", "rankflo.io"];
const COMPETITOR_KEYWORDS: Record<string, string> = {
  contentful: "Contentful",
  strapi: "Strapi",
  ghost: "Ghost",
  sanity: "Sanity",
  "payload cms": "Payload",
  wordpress: "WordPress",
  webflow: "Webflow",
  hashnode: "Hashnode",
  medium: "Medium",
  hygraph: "Hygraph",
  directus: "Directus",
  "butter cms": "Butter CMS",
};

async function queryPerplexity(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function queryGoogle(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500 },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

async function queryOpenAI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function queryAnthropic(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

function detectMentions(
  response: string,
  prompt: string,
  platform: string,
  orgId: string,
): Array<{
  organizationId: string;
  platform: string;
  query: string;
  snippet: string;
  brandName: string;
  sentiment: "positive" | "neutral" | "negative";
  mentionedAt: Date;
}> {
  const mentions: Array<{
    organizationId: string;
    platform: string;
    query: string;
    snippet: string;
    brandName: string;
    sentiment: "positive" | "neutral" | "negative";
    mentionedAt: Date;
  }> = [];
  const lower = response.toLowerCase();

  // Check for RankFlo mention
  const mentioned = BRAND_KEYWORDS.some((kw) => lower.includes(kw));
  if (mentioned) {
    // Extract the sentence containing the mention
    const sentences = response.split(/[.!?]+/);
    const relevantSentence = sentences.find((s) =>
      BRAND_KEYWORDS.some((kw) => s.toLowerCase().includes(kw)),
    );
    const snippet = relevantSentence?.trim().slice(0, 300) ?? "";

    // Determine sentiment from context
    const positiveWords = ["best", "recommend", "great", "excellent", "top", "powerful", "standout", "notable", "strong", "ideal"];
    const negativeWords = ["limited", "lacking", "weak", "downside", "drawback", "issue", "problem"];
    const sentenceWords = (relevantSentence ?? "").toLowerCase();
    const posCount = positiveWords.filter((w) => sentenceWords.includes(w)).length;
    const negCount = negativeWords.filter((w) => sentenceWords.includes(w)).length;
    const sentiment = posCount > negCount ? "positive" : negCount > posCount ? "negative" : "neutral";

    mentions.push({
      organizationId: orgId,
      platform,
      query: prompt,
      snippet,
      brandName: "",
      sentiment,
      mentionedAt: new Date(),
    });
  }

  // Check for competitor mentions
  for (const [keyword, brandName] of Object.entries(COMPETITOR_KEYWORDS)) {
    if (lower.includes(keyword)) {
      mentions.push({
        organizationId: orgId,
        platform,
        query: prompt,
        snippet: "",
        brandName,
        sentiment: "neutral",
        mentionedAt: new Date(),
      });
    }
  }

  return mentions;
}

export async function POST(req: NextRequest) {
  // Auth check
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Get all orgs with AI keys configured
  const orgs = await db.organization.findMany({
    select: { id: true, settings: true },
  });

  let totalMentions = 0;
  let totalPrompts = 0;
  const errors: string[] = [];

  for (const org of orgs) {
    const settings = (org.settings as Record<string, unknown>) ?? {};
    const aiApiKey = settings.aiApiKey as string | undefined;
    const aiProvider = settings.aiProvider as string | undefined;

    // Also check env-level keys
    const openaiKey = aiProvider === "openai" && aiApiKey ? aiApiKey : process.env.OPENAI_API_KEY;
    const anthropicKey = aiProvider === "anthropic" && aiApiKey ? aiApiKey : process.env.ANTHROPIC_API_KEY;
    const googleKey = aiProvider === "google" && aiApiKey ? aiApiKey : process.env.GOOGLE_AI_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;

    // Pick 2 random prompts to test (avoid burning too many API credits)
    const shuffled = [...TEST_PROMPTS].sort(() => Math.random() - 0.5);
    const promptsToTest = shuffled.slice(0, 2);

    for (const prompt of promptsToTest) {
      totalPrompts++;

      // Test OpenAI/ChatGPT
      if (openaiKey) {
        try {
          const response = await queryOpenAI(prompt, openaiKey);
          if (response) {
            const mentions = detectMentions(response, prompt, "chatgpt", org.id);
            for (const m of mentions) {
              await db.llmMention.create({ data: m });
              totalMentions++;
            }
          }
        } catch (e) {
          errors.push(`OpenAI error for org ${org.id}: ${e}`);
        }
      }

      // Test Anthropic/Claude
      if (anthropicKey) {
        try {
          const response = await queryAnthropic(prompt, anthropicKey);
          if (response) {
            const mentions = detectMentions(response, prompt, "claude", org.id);
            for (const m of mentions) {
              await db.llmMention.create({ data: m });
              totalMentions++;
            }
          }
        } catch (e) {
          errors.push(`Anthropic error for org ${org.id}: ${e}`);
        }
      }

      // Test Perplexity
      if (perplexityKey) {
        try {
          const response = await queryPerplexity(prompt, perplexityKey);
          if (response) {
            const mentions = detectMentions(response, prompt, "perplexity", org.id);
            for (const m of mentions) {
              await db.llmMention.create({ data: m });
              totalMentions++;
            }
          }
        } catch (e) {
          errors.push(`Perplexity error for org ${org.id}: ${e}`);
        }
      }

      // Test Google/Gemini (cheapest — use for high-volume tracking)
      if (googleKey) {
        try {
          const response = await queryGoogle(prompt, googleKey);
          if (response) {
            const mentions = detectMentions(response, prompt, "gemini", org.id);
            for (const m of mentions) {
              await db.llmMention.create({ data: m });
              totalMentions++;
            }
          }
        } catch (e) {
          errors.push(`Google error for org ${org.id}: ${e}`);
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    promptsTested: totalPrompts,
    mentionsFound: totalMentions,
    errors: errors.length > 0 ? errors : undefined,
  });
}
