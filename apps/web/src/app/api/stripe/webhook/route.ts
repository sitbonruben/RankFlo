import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@rankflo/db";
import { PLAN_MONTHLY_CREDITS, TRIAL_CREDIT_GRANT } from "@rankflo/core/constants";

// Lazy-initialize Stripe to avoid build-time errors when STRIPE_SECRET_KEY is not set.
// The constructor is NOT called at module load time.
function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia", typescript: true });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe/webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    await handleEvent(stripe, event);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe/webhook] Error handling event ${event.type}: ${message}`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Event Router ─────────────────────────────────────────────────────────────

async function handleEvent(stripe: Stripe, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(stripe, event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(stripe, event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(stripe, event.data.object);
      break;
    default:
      break;
  }
}

// ─── checkout.session.completed ──────────────────────────────────────────────

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId;
  if (!organizationId) {
    console.warn("[stripe/webhook] checkout.session.completed: missing organizationId metadata");
    return;
  }

  if (session.mode === "subscription") {
    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    await upsertSubscription(organizationId, stripeCustomerId, sub);

    await db.organization.update({
      where: { id: organizationId },
      data: { plan: "PRO", stripeCustomerId },
    });

    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { aiCreditsBalance: true },
    });
    const newBalance = (org?.aiCreditsBalance ?? 0) + TRIAL_CREDIT_GRANT;

    await db.organization.update({
      where: { id: organizationId },
      data: { aiCreditsBalance: newBalance },
    });

    await db.creditLedger.create({
      data: {
        organizationId,
        type: "TRIAL_GRANT",
        amount: TRIAL_CREDIT_GRANT,
        balance: newBalance,
        description: `Trial grant of ${TRIAL_CREDIT_GRANT} AI credits`,
        metadata: { stripeSubscriptionId },
      },
    });
  } else if (session.mode === "payment") {
    const packCreditsStr = session.metadata?.packCredits;
    const packName = session.metadata?.packName;
    const packCredits = packCreditsStr ? parseInt(packCreditsStr, 10) : 0;

    if (!packCredits || isNaN(packCredits)) {
      console.warn("[stripe/webhook] checkout.session.completed: payment mode but no packCredits metadata");
      return;
    }

    const stripeCustomerId = session.customer as string;
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { aiCreditsBalance: true },
    });
    const newBalance = (org?.aiCreditsBalance ?? 0) + packCredits;

    await db.organization.update({
      where: { id: organizationId },
      data: { aiCreditsBalance: newBalance, stripeCustomerId },
    });

    await db.creditLedger.create({
      data: {
        organizationId,
        type: "PURCHASE",
        amount: packCredits,
        balance: newBalance,
        description: `Purchased ${packCredits} AI credits (${packName ?? "Credit Pack"})`,
        metadata: { packName, packCredits, checkoutSessionId: session.id },
      },
    });
  }
}

// ─── customer.subscription.created / updated ─────────────────────────────────

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const organizationId = sub.metadata?.organizationId;
  if (!organizationId) {
    const org = await db.organization.findFirst({
      where: { stripeCustomerId: sub.customer as string },
      select: { id: true },
    });
    if (!org) {
      console.warn("[stripe/webhook] subscription.updated: cannot find org for customer", sub.customer);
      return;
    }
    await upsertSubscription(org.id, sub.customer as string, sub);
    if (sub.status === "active") {
      await db.organization.update({ where: { id: org.id }, data: { plan: "PRO" } });
    }
    return;
  }

  await upsertSubscription(organizationId, sub.customer as string, sub);
  if (sub.status === "active") {
    await db.organization.update({ where: { id: organizationId }, data: { plan: "PRO" } });
  }
}

// ─── customer.subscription.deleted ───────────────────────────────────────────

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const organizationId = sub.metadata?.organizationId;
  let orgId = organizationId;

  if (!orgId) {
    const org = await db.organization.findFirst({
      where: { stripeCustomerId: sub.customer as string },
      select: { id: true },
    });
    orgId = org?.id;
  }

  if (!orgId) {
    console.warn("[stripe/webhook] subscription.deleted: cannot find org for customer", sub.customer);
    return;
  }

  await db.organization.update({ where: { id: orgId }, data: { plan: "FREE" } });
  await db.subscription.updateMany({ where: { organizationId: orgId }, data: { status: "CANCELED" } });
}

// ─── invoice.payment_succeeded ────────────────────────────────────────────────

async function handleInvoicePaymentSucceeded(stripe: Stripe, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const organizationId = sub.metadata?.organizationId;

  let orgId = organizationId;
  if (!orgId) {
    const org = await db.organization.findFirst({
      where: { stripeCustomerId: sub.customer as string },
      select: { id: true },
    });
    orgId = org?.id;
  }

  if (!orgId) {
    console.warn("[stripe/webhook] invoice.payment_succeeded: cannot find org");
    return;
  }

  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  });

  const monthlyGrant = PLAN_MONTHLY_CREDITS[(org?.plan as keyof typeof PLAN_MONTHLY_CREDITS) ?? "FREE"];
  if (!monthlyGrant || monthlyGrant < 0) return;

  await db.organization.update({ where: { id: orgId }, data: { aiCreditsBalance: monthlyGrant, plan: "PRO" } });
  await db.creditLedger.create({
    data: {
      organizationId: orgId,
      type: "MONTHLY_GRANT",
      amount: monthlyGrant,
      balance: monthlyGrant,
      description: `Monthly credit refresh: ${monthlyGrant} AI credits`,
      metadata: { invoiceId: invoice.id, subscriptionId: invoice.subscription },
    },
  });

  await upsertSubscription(orgId, sub.customer as string, sub);
}

// ─── invoice.payment_failed ───────────────────────────────────────────────────

async function handleInvoicePaymentFailed(stripe: Stripe, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const org = await db.organization.findFirst({
    where: { stripeCustomerId: sub.customer as string },
    select: { id: true },
  });

  if (!org) return;

  await db.subscription.updateMany({ where: { organizationId: org.id }, data: { status: "PAST_DUE" } });
  console.warn(`[stripe/webhook] Payment failed for org ${org.id}. Invoice: ${invoice.id}`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertSubscription(
  organizationId: string,
  stripeCustomerId: string,
  sub: Stripe.Subscription,
) {
  const priceId = sub.items.data[0]?.price.id ?? null;
  const interval: "MONTHLY" | "ANNUAL" =
    sub.items.data[0]?.price.recurring?.interval === "year" ? "ANNUAL" : "MONTHLY";
  const status = mapStripeStatus(sub.status);

  await db.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      stripeCustomerId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status,
      interval,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status,
      interval,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

function mapStripeStatus(status: Stripe.Subscription.Status):
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "PAUSED" {
  const map: Record<Stripe.Subscription.Status, string> = {
    trialing: "TRIALING",
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
    incomplete: "INCOMPLETE",
    incomplete_expired: "INCOMPLETE_EXPIRED",
    paused: "PAUSED",
  };
  return (map[status] ?? "ACTIVE") as ReturnType<typeof mapStripeStatus>;
}
