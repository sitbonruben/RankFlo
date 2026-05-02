import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/docs-code";
import { Callout } from "@/components/marketing/docs-callout";

export const metadata: Metadata = {
  title: "LLM Visibility — RankFlo Docs",
  description: "Track when AI assistants mention your brand, monitor competitors, and optimize your content for AI search visibility.",
  alternates: { canonical: "/docs/llm-visibility" },
};

export default function LlmVisibilityPage() {
  return (
    <div>
      <h1>LLM Visibility</h1>
      <p>Track when AI assistants like ChatGPT, Perplexity, and Claude mention your brand. Monitor competitors, log citations, and optimize your content to appear in AI-generated answers.</p>

      <hr />

      <h2 id="overview">How it works</h2>
      <p>RankFlo tracks LLM visibility in two ways:</p>
      <ol>
        <li><strong>AI referrer tracking</strong> — automatically detects when visitors arrive from AI platforms (built into <Link href="/docs/analytics-setup">analytics</Link>)</li>
        <li><strong>Mention tracking</strong> — tests prompts against AI models and logs when your brand is mentioned in responses</li>
      </ol>

      <hr />

      <h2 id="connect-ai">Step 1: Connect your AI provider</h2>
      <p>LLM visibility tracking requires API keys to query AI models. Go to <strong>Settings → AI</strong> and connect at least one provider:</p>

      <table>
        <thead><tr><th>Provider</th><th>What it enables</th><th>Get your key</th></tr></thead>
        <tbody>
          <tr><td><strong>OpenAI</strong></td><td>Test ChatGPT responses for brand mentions</td><td><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a></td></tr>
          <tr><td><strong>Anthropic</strong></td><td>Test Claude responses for brand mentions</td><td><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></td></tr>
          <tr><td><strong>Google AI</strong></td><td>Test Gemini responses for brand mentions</td><td><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com</a></td></tr>
        </tbody>
      </table>

      <Callout type="info">
        <p>Your API keys are stored encrypted in your organization settings. They are used server-side only — never exposed in the browser. RankFlo uses the cheapest models (GPT-4o-mini, Claude Haiku) for mention tracking to minimize API costs.</p>
      </Callout>

      <h3>How to connect</h3>
      <ol>
        <li>Go to <strong>Settings → AI</strong> in your dashboard</li>
        <li>Select your preferred provider (OpenAI, Anthropic, or Google)</li>
        <li>Paste your API key</li>
        <li>Click <strong>Save settings</strong></li>
      </ol>
      <p>Once connected, your key is used for both AI writing features AND LLM visibility tracking.</p>

      <hr />

      <h2 id="auto-tracking">Step 2: Enable automated tracking</h2>
      <p>RankFlo includes a cron endpoint that automatically tests prompts against AI models and logs mentions. Set up a daily cron job:</p>

      <CodeBlock language="bash" code={`# Call this daily (e.g., via cron-job.org, GitHub Actions, or crontab)
curl -X POST https://app.rankflo.io/api/cron/llm-track \\
  -H "Authorization: Bearer YOUR_CRON_SECRET" \\
  -H "Content-Type: application/json"`} />

      <Callout type="tip">
        <p>Set <code>CRON_SECRET</code> in your environment variables to secure the endpoint. Without it, anyone could trigger the tracker.</p>
      </Callout>

      <h3>What it does on each run</h3>
      <ol>
        <li>Picks 2 random prompts from a built-in library of SEO-related queries</li>
        <li>Sends each prompt to ChatGPT, Claude, and Perplexity (if keys are configured)</li>
        <li>Scans responses for your brand name and competitor names</li>
        <li>Logs mentions with sentiment analysis (positive, neutral, negative)</li>
        <li>Extracts the relevant snippet for context</li>
      </ol>

      <h3>Built-in test prompts</h3>
      <p>The tracker tests prompts like:</p>
      <ul>
        <li>&quot;What is the best headless CMS for startups?&quot;</li>
        <li>&quot;Recommend an open source blog platform with SEO tools&quot;</li>
        <li>&quot;What are the best WordPress alternatives for developers?&quot;</li>
        <li>&quot;How to optimize content for AI search engines&quot;</li>
        <li>&quot;Best CMS with built-in analytics&quot;</li>
      </ul>

      <h3>Setting up the cron job</h3>

      <p><strong>Option A: cron-job.org (free)</strong></p>
      <ol>
        <li>Sign up at <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer">cron-job.org</a></li>
        <li>Create a new job pointing to <code>https://your-domain.com/api/cron/llm-track</code></li>
        <li>Set method to POST</li>
        <li>Add header: <code>Authorization: Bearer YOUR_CRON_SECRET</code></li>
        <li>Schedule: once daily (e.g., 6:00 AM)</li>
      </ol>

      <p><strong>Option B: GitHub Actions</strong></p>
      <CodeBlock language="yaml" code={`# .github/workflows/llm-track.yml
name: LLM Visibility Tracker
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
jobs:
  track:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://your-domain.com/api/cron/llm-track \\
            -H "Authorization: Bearer \${{ secrets.CRON_SECRET }}"`} />

      <p><strong>Option C: Server crontab</strong></p>
      <CodeBlock language="bash" code={`# Add to crontab -e
0 6 * * * curl -s -X POST https://your-domain.com/api/cron/llm-track -H "Authorization: Bearer YOUR_SECRET"`} />

      <hr />

      <h2 id="dashboard">Step 3: View your LLM dashboard</h2>
      <p>Switch to <strong>LLM Search</strong> mode in the top nav bar. The dashboard shows:</p>

      <h3>Mention stats</h3>
      <ul>
        <li><strong>Total mentions</strong> — how many times AI assistants referenced your brand</li>
        <li><strong>Trend</strong> — period-over-period change</li>
        <li><strong>By platform</strong> — breakdown across ChatGPT, Perplexity, Claude, Gemini</li>
        <li><strong>Sentiment</strong> — positive, neutral, and negative mention ratio</li>
      </ul>

      <h3>Visibility score</h3>
      <p>A 0-100 score calculated from five components:</p>
      <table>
        <thead><tr><th>Component</th><th>Weight</th><th>What it measures</th></tr></thead>
        <tbody>
          <tr><td>Mention volume</td><td>30 pts</td><td>How often AI mentions your brand (log scale)</td></tr>
          <tr><td>Sentiment</td><td>25 pts</td><td>Ratio of positive to negative mentions</td></tr>
          <tr><td>Content citations</td><td>25 pts</td><td>How many of your posts are directly cited</td></tr>
          <tr><td>Topic coverage</td><td>10 pts</td><td>Comprehensive content across your key topics</td></tr>
          <tr><td>Prompt testing</td><td>10 pts</td><td>Are you actively monitoring prompts?</td></tr>
        </tbody>
      </table>

      <h3>Share of Voice</h3>
      <p>See how your brand compares to competitors in AI recommendations. The tracker automatically logs competitor mentions (Contentful, Strapi, Ghost, etc.) alongside your own.</p>

      <h3>Mention list</h3>
      <p>Every logged mention shows: platform, query prompt, response snippet, sentiment, and date. Filter by platform or sentiment.</p>

      <hr />

      <h2 id="manual-tracking">Manual mention logging</h2>
      <p>You can also log mentions manually when you spot them. In the LLM Search dashboard, click <strong>Log mention</strong> and fill in:</p>
      <ul>
        <li><strong>Platform</strong> — which AI assistant (ChatGPT, Perplexity, Claude, etc.)</li>
        <li><strong>Query</strong> — what the user asked</li>
        <li><strong>Snippet</strong> — the relevant part of the AI response</li>
        <li><strong>URL</strong> — if the AI linked to your content</li>
        <li><strong>Sentiment</strong> — positive, neutral, or negative</li>
      </ul>

      <Callout type="tip">
        <p>Combine automated tracking with manual logging for the most complete picture. The auto-tracker catches systematic patterns; manual logging captures one-off discoveries.</p>
      </Callout>

      <hr />

      <h2 id="optimize">How to improve your LLM visibility</h2>
      <ol>
        <li><strong>Add an llms.txt file</strong> — RankFlo generates this automatically at <code>/llms.txt</code> for every project. It tells AI crawlers about your content.</li>
        <li><strong>Write clear, factual content</strong> — AI models prefer content that states facts directly with specific numbers.</li>
        <li><strong>Use structured data</strong> — JSON-LD schema markup helps AI understand your content. RankFlo adds this automatically.</li>
        <li><strong>Build topical authority</strong> — Publish 10-20 posts around each core topic. Depth signals expertise to AI models.</li>
        <li><strong>Get cited by third parties</strong> — Guest posts, press mentions, and backlinks from authoritative sites increase AI citation likelihood.</li>
        <li><strong>Keep content fresh</strong> — Update key articles quarterly. AI with web access prefers recent sources.</li>
      </ol>

      <p>See the <Link href="/blog/llm-visibility-guide-ai-search-optimization">complete LLM visibility guide</Link> for more strategies.</p>

      <hr />

      <h2 id="prompt-library">Prompt testing library</h2>
      <p>The LLM dashboard includes a <strong>prompt library</strong> where you can save prompts to test regularly:</p>
      <ol>
        <li>Go to <strong>LLM Search → Prompts</strong></li>
        <li>Add prompts your target customers might ask AI assistants</li>
        <li>Mark prompts as &quot;tested&quot; after checking the results</li>
        <li>Track which prompts return mentions over time</li>
      </ol>

      <Callout type="info">
        <p>The automated tracker uses a built-in set of prompts. Your custom prompt library is for manual testing and tracking — run the prompts yourself across ChatGPT, Perplexity, and Claude to see if your brand appears.</p>
      </Callout>
    </div>
  );
}
