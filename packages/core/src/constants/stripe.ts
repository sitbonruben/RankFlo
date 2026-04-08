import type { Plan } from "./plans";

// ─── Stripe Price IDs ────────────────────────────────────────────────────────
// These are read from environment variables. Populate them via `pnpm stripe-setup`.

export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
  PACK_STARTER: process.env.STRIPE_PRICE_PACK_STARTER ?? "",
  PACK_GROWTH: process.env.STRIPE_PRICE_PACK_GROWTH ?? "",
  PACK_SCALE: process.env.STRIPE_PRICE_PACK_SCALE ?? "",
} as const;

// ─── Credit Pack Metadata ────────────────────────────────────────────────────

export interface CreditPackMeta {
  name: string;
  credits: number;
  price: number; // in dollars
  description: string;
  priceIdEnvKey: string;
}

export const CREDIT_PACKS: CreditPackMeta[] = [
  {
    name: "Starter",
    credits: 60,
    price: 5,
    description: "60 AI credits for quick boosts",
    priceIdEnvKey: "STRIPE_PRICE_PACK_STARTER",
  },
  {
    name: "Growth",
    credits: 200,
    price: 15,
    description: "200 AI credits — most popular",
    priceIdEnvKey: "STRIPE_PRICE_PACK_GROWTH",
  },
  {
    name: "Scale",
    credits: 500,
    price: 30,
    description: "500 AI credits for power users",
    priceIdEnvKey: "STRIPE_PRICE_PACK_SCALE",
  },
];

/** Map from Stripe price ID → credit amount (for credit packs). */
export function getCreditPackByPriceId(priceId: string): CreditPackMeta | undefined {
  const map: Record<string, CreditPackMeta> = {
    [STRIPE_PRICE_IDS.PACK_STARTER]: CREDIT_PACKS[0]!,
    [STRIPE_PRICE_IDS.PACK_GROWTH]: CREDIT_PACKS[1]!,
    [STRIPE_PRICE_IDS.PACK_SCALE]: CREDIT_PACKS[2]!,
  };
  return map[priceId];
}

// ─── AI Credit Costs per Feature ────────────────────────────────────────────
// These mirror the business model decided in the plan.

export const CREDIT_COSTS = {
  /** Full AI post generation */
  generateContent: 3,
  /** Growth quick-generate a post */
  quickGenerate: 3,
  /** Growth scan (brand voice + topics) */
  scan: 3,
  /** Content strategy creation */
  createStrategy: 2,
  /** Growth strategy */
  strategy: 2,
  /** Brand voice analysis */
  analyzeBrandVoice: 2,
  /** Content improvement */
  improveContent: 2,
  /** SEO audit (AI-assisted ranking insights) */
  audit: 2,
  /** Topic suggestions / research */
  suggestTopics: 1,
  /** Growth research */
  research: 1,
  /** AI chat message */
  chat: 1,
  /** Algorithmic SEO analysis — no AI cost */
  analyzeSEO: 0,
  /** Project overview — no AI cost */
  overview: 0,
} as const;

export type CreditCostFeature = keyof typeof CREDIT_COSTS;

// ─── Monthly Credit Grants per Plan ─────────────────────────────────────────

export const PLAN_MONTHLY_CREDITS: Record<Plan, number> = {
  FREE: 10,
  PRO: 200,
  // Enterprise gets unlimited — we never deduct (checked in middleware)
  ENTERPRISE: -1,
};

export const TRIAL_CREDIT_GRANT = 30; // credits given at trial start

// ─── Subscription Prices (display only) ─────────────────────────────────────

export const PLAN_PRICES = {
  PRO_MONTHLY: 5,
  PRO_ANNUAL: 49, // billed annually; equivalent to ~$4.08/mo — 20% savings
  PRO_ANNUAL_MONTHLY_RATE: 4.08,
} as const;

export const TRIAL_DAYS = 14;
