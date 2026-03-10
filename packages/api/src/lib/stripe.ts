import Stripe from "stripe";

// Lazy singleton — not initialized at import time to avoid build failures
// when STRIPE_SECRET_KEY is not set in the build environment.
let _stripe: Stripe | null = null;

/**
 * Get (or lazily create) the Stripe singleton.
 * Throws at runtime if STRIPE_SECRET_KEY is missing.
 */
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your environment variables.",
      );
    }
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia", typescript: true });
  }
  return _stripe;
}

/**
 * Stripe client proxy — access is deferred until first use.
 * Import this as `stripe` and call it normally; it will lazy-load on first call.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Require that STRIPE_SECRET_KEY is present at runtime.
 * Call at the top of any billing mutation/query to get a type-safe Stripe instance.
 */
export function requireStripe(): Stripe {
  return getStripe();
}
