/**
 * Provider pricing per 1M tokens (in USD).
 * Used to estimate actual API cost from token usage.
 */
export const PROVIDER_COSTS: Record<string, Record<string, { input: number; output: number }>> = {
  google: {
    "gemini-2.0-flash": { input: 0.10, output: 0.40 },
    "gemini-1.5-flash": { input: 0.075, output: 0.30 },
    "gemini-2.5-flash": { input: 0.15, output: 0.60 },
  },
  openai: {
    "gpt-4o": { input: 5.0, output: 15.0 },
    "gpt-4o-mini": { input: 0.15, output: 0.60 },
    "gpt-5.4-mini": { input: 0.15, output: 0.60 },
  },
  anthropic: {
    "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
    "claude-haiku-3-20240307": { input: 0.25, output: 1.25 },
  },
  kie: {
    "gemini-2.5-flash": { input: 0.09, output: 0.75 },
  },
  ollama: {
    // Local models — no cost
    default: { input: 0, output: 0 },
  },
};

/** Default cost if model not found in pricing table */
const DEFAULT_COST = { input: 1.0, output: 5.0 }; // $1/$5 per 1M tokens

/**
 * Estimate the USD cost of an AI API call from token counts.
 */
export function estimateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const providerCosts = PROVIDER_COSTS[provider];
  const costs = providerCosts?.[model] ?? providerCosts?.default ?? DEFAULT_COST;
  return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
}
