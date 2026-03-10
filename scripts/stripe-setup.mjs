#!/usr/bin/env node
/**
 * RankFlo — Stripe Product/Price Setup Script
 *
 * Run once to create all Stripe products and prices.
 * Outputs the env vars you need to add to .env.local / .env.production.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌  STRIPE_SECRET_KEY is not set.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });

async function createOrFindProduct(name, description) {
  const list = await stripe.products.list({ limit: 100 });
  const existing = list.data.find((p) => p.name === name);
  if (existing) {
    console.log(`  ↩  Product already exists: ${name} (${existing.id})`);
    return existing;
  }
  const product = await stripe.products.create({ name, description });
  console.log(`  ✓  Created product: ${name} (${product.id})`);
  return product;
}

async function createOrFindPrice(productId, unitAmount, currency, recurring, nickname) {
  const list = await stripe.prices.list({ product: productId, limit: 100 });
  const existing = list.data.find((p) => p.nickname === nickname && p.active);
  if (existing) {
    console.log(`  ↩  Price already exists: ${nickname} (${existing.id})`);
    return existing;
  }
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    ...(recurring ? { recurring } : {}),
    nickname,
  });
  console.log(`  ✓  Created price: ${nickname} (${price.id})`);
  return price;
}

async function main() {
  console.log("\n🚀 RankFlo — Stripe Setup\n");

  // ── Pro Subscription ──────────────────────────────────────────────────────
  console.log("Creating Pro subscription product...");
  const proProd = await createOrFindProduct(
    "RankFlo Pro",
    "Full access to all RankFlo features including 200 AI credits/month.",
  );

  console.log("Creating Pro Monthly price...");
  const proMonthly = await createOrFindPrice(
    proProd.id,
    1900, // $19.00
    "usd",
    { interval: "month" },
    "pro-monthly",
  );

  console.log("Creating Pro Annual price...");
  const proAnnual = await createOrFindPrice(
    proProd.id,
    19000, // $190.00
    "usd",
    { interval: "year" },
    "pro-annual",
  );

  // ── Credit Packs ──────────────────────────────────────────────────────────
  console.log("\nCreating Credit Pack products...");

  const starterProd = await createOrFindProduct(
    "RankFlo AI Credits — Starter Pack",
    "60 AI credits for RankFlo. One-time purchase.",
  );
  const starterPrice = await createOrFindPrice(
    starterProd.id,
    500, // $5.00
    "usd",
    null,
    "pack-starter",
  );

  const growthProd = await createOrFindProduct(
    "RankFlo AI Credits — Growth Pack",
    "200 AI credits for RankFlo. One-time purchase.",
  );
  const growthPrice = await createOrFindPrice(
    growthProd.id,
    1500, // $15.00
    "usd",
    null,
    "pack-growth",
  );

  const scaleProd = await createOrFindProduct(
    "RankFlo AI Credits — Scale Pack",
    "500 AI credits for RankFlo. One-time purchase.",
  );
  const scalePrice = await createOrFindPrice(
    scaleProd.id,
    3000, // $30.00
    "usd",
    null,
    "pack-scale",
  );

  // ── Output env vars ───────────────────────────────────────────────────────
  console.log("\n✅  Done! Add these to your .env.local / .env.production:\n");
  console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthly.id}`);
  console.log(`STRIPE_PRICE_PRO_ANNUAL=${proAnnual.id}`);
  console.log(`STRIPE_PRICE_PACK_STARTER=${starterPrice.id}`);
  console.log(`STRIPE_PRICE_PACK_GROWTH=${growthPrice.id}`);
  console.log(`STRIPE_PRICE_PACK_SCALE=${scalePrice.id}`);
  console.log("");
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
