import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure } from "../trpc";
import { stripe, requireStripe } from "../lib/stripe";
import {
  STRIPE_PRICE_IDS,
  PLAN_MONTHLY_CREDITS,
  TRIAL_DAYS,
  TRIAL_CREDIT_GRANT,
  CREDIT_PACKS,
  getCreditPackByPriceId,
} from "@rankflo/core/constants";

// ─── Router ──────────────────────────────────────────────────────────────────

export const billingRouter = router({
  /**
   * Get the current subscription state for the organization.
   */
  getSubscription: orgProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: {
        plan: true,
        aiCreditsBalance: true,
        stripeCustomerId: true,
        subscription: true,
      },
    });

    if (!org) throw new TRPCError({ code: "NOT_FOUND" });

    const sub = org.subscription;

    return {
      plan: org.plan,
      stripeCustomerId: org.stripeCustomerId,
      subscription: sub
        ? {
            id: sub.id,
            status: sub.status,
            interval: sub.interval,
            trialEnd: sub.trialEnd,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          }
        : null,
    };
  }),

  /**
   * Get AI credits balance and recent transaction history.
   */
  getCredits: orgProcedure.query(async ({ ctx }) => {
    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { plan: true, aiCreditsBalance: true },
    });

    if (!org) throw new TRPCError({ code: "NOT_FOUND" });

    const monthlyGrant = PLAN_MONTHLY_CREDITS[org.plan as keyof typeof PLAN_MONTHLY_CREDITS] ?? 10;

    // Last 20 ledger entries
    const transactions = await ctx.db.creditLedger.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        description: true,
        createdAt: true,
        metadata: true,
      },
    });

    // Usage this billing cycle (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageThisCycle = await ctx.db.creditLedger.aggregate({
      where: {
        organizationId: ctx.organizationId,
        type: "USAGE",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    const usedThisCycle = Math.abs(usageThisCycle._sum.amount ?? 0);

    return {
      balance: org.aiCreditsBalance,
      monthlyGrant,
      usedThisCycle,
      isEnterprise: org.plan === "ENTERPRISE",
      transactions,
    };
  }),

  /**
   * Create a Stripe Checkout Session for a subscription (Pro monthly or annual).
   * Includes a 7-day free trial.
   */
  createCheckoutSession: orgProcedure
    .input(
      z.object({
        priceId: z.string().min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireStripe();

      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { stripeCustomerId: true, subscription: true },
      });

      if (!org) throw new TRPCError({ code: "NOT_FOUND" });

      // Build or reuse Stripe customer
      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { email: true, name: true },
        });

        const customer = await stripe.customers.create({
          email: user?.email ?? undefined,
          name: user?.name ?? undefined,
          metadata: { organizationId: ctx.organizationId },
        });
        customerId = customer.id;

        await ctx.db.organization.update({
          where: { id: ctx.organizationId },
          data: { stripeCustomerId: customerId },
        });
      }

      // If already on an active subscription, send them to the portal instead
      if (org.subscription?.stripeSubscriptionId) {
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: input.successUrl,
        });
        return { url: session.url, type: "portal" as const };
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: input.priceId, quantity: 1 }],
        subscription_data: {
          trial_period_days: TRIAL_DAYS,
          metadata: { organizationId: ctx.organizationId },
        },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: { organizationId: ctx.organizationId },
        allow_promotion_codes: true,
      });

      return { url: session.url!, type: "checkout" as const };
    }),

  /**
   * Create a Stripe Checkout Session for a one-time credit pack purchase.
   */
  createCreditCheckout: orgProcedure
    .input(
      z.object({
        packPriceId: z.string().min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireStripe();

      // Validate that this is a known pack price ID
      const pack = getCreditPackByPriceId(input.packPriceId);
      if (!pack) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid credit pack price ID.",
        });
      }

      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { stripeCustomerId: true },
      });

      if (!org) throw new TRPCError({ code: "NOT_FOUND" });

      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { email: true, name: true },
        });

        const customer = await stripe.customers.create({
          email: user?.email ?? undefined,
          name: user?.name ?? undefined,
          metadata: { organizationId: ctx.organizationId },
        });
        customerId = customer.id;

        await ctx.db.organization.update({
          where: { id: ctx.organizationId },
          data: { stripeCustomerId: customerId },
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [{ price: input.packPriceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          organizationId: ctx.organizationId,
          packCredits: String(pack.credits),
          packName: pack.name,
        },
      });

      return { url: session.url! };
    }),

  /**
   * Create a Stripe Customer Portal session for managing subscriptions/invoices.
   */
  createPortalSession: orgProcedure
    .input(z.object({ returnUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      requireStripe();

      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.organizationId },
        select: { stripeCustomerId: true },
      });

      if (!org?.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No billing account found. Subscribe to a plan first.",
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: org.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return { url: session.url };
    }),

  /**
   * Cancel the current subscription at period end.
   */
  cancelSubscription: orgProcedure.mutation(async ({ ctx }) => {
    requireStripe();

    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { subscription: true },
    });

    if (!org?.subscription?.stripeSubscriptionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active subscription found.",
      });
    }

    await stripe.subscriptions.update(org.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await ctx.db.subscription.update({
      where: { organizationId: ctx.organizationId },
      data: { cancelAtPeriodEnd: true },
    });

    return { success: true };
  }),

  /**
   * Resume a subscription that was set to cancel at period end.
   */
  resumeSubscription: orgProcedure.mutation(async ({ ctx }) => {
    requireStripe();

    const org = await ctx.db.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { subscription: true },
    });

    if (!org?.subscription?.stripeSubscriptionId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No subscription found." });
    }

    await stripe.subscriptions.update(org.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await ctx.db.subscription.update({
      where: { organizationId: ctx.organizationId },
      data: { cancelAtPeriodEnd: false },
    });

    return { success: true };
  }),

  /**
   * Get available credit packs for display.
   */
  getCreditPacks: orgProcedure.query(() => {
    return CREDIT_PACKS.map((pack) => ({
      ...pack,
      priceId:
        pack.name === "Starter"
          ? STRIPE_PRICE_IDS.PACK_STARTER
          : pack.name === "Growth"
            ? STRIPE_PRICE_IDS.PACK_GROWTH
            : STRIPE_PRICE_IDS.PACK_SCALE,
    }));
  }),
});
