import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const ADMIN_EMAILS = ["sitbon.ruben@gmail.com"];

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ADMIN_EMAILS.includes(ctx.session.user.email)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next();
});

export const adminRouter = router({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalOrgs,
      totalPosts,
      publishedPosts,
      totalEvents,
      totalMentions,
      positiveMentions,
      planBreakdown,
      recentUsersRaw,
      recentTransactionsRaw,
      creditAggregates,
      mentionsThisMonth,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.organization.count(),
      ctx.db.post.count({ where: { deletedAt: null } }),
      ctx.db.post.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      ctx.db.analyticsEvent.count(),
      ctx.db.llmMention.count(),
      ctx.db.llmMention.count({ where: { sentiment: "positive" } }),
      ctx.db.organization.groupBy({ by: ["plan"], _count: { plan: true } }),
      ctx.db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          memberships: {
            take: 1,
            select: {
              organization: {
                select: { plan: true, aiCreditsBalance: true, _count: { select: { posts: true } } },
              },
            },
          },
        },
      }),
      ctx.db.creditLedger.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          description: true,
          createdAt: true,
          organization: { select: { name: true } },
        },
      }),
      ctx.db.creditLedger.aggregate({
        _sum: { amount: true },
        where: { amount: { gt: 0 } },
      }),
      ctx.db.llmMention.count({
        where: { mentionedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      }),
    ]);

    // Calculate credits used (negative amounts)
    const usedResult = await ctx.db.creditLedger.aggregate({
      _sum: { amount: true },
      where: { amount: { lt: 0 } },
    });

    // Credit packs purchased
    const packPurchases = await ctx.db.creditLedger.findMany({
      where: { type: "PURCHASE" },
      select: { amount: true },
    });

    // Remaining credits across all orgs
    const creditsRemaining = await ctx.db.organization.aggregate({
      _sum: { aiCreditsBalance: true },
    });

    const plans = { free: 0, pro: 0, enterprise: 0 };
    for (const p of planBreakdown) {
      if (p.plan === "FREE") plans.free = p._count.plan;
      else if (p.plan === "PRO") plans.pro = p._count.plan;
      else if (p.plan === "ENTERPRISE") plans.enterprise = p._count.plan;
    }

    const recentUsers = recentUsersRaw.map((u) => {
      const membership = u.memberships[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
        plan: membership?.organization.plan ?? "FREE",
        credits: membership?.organization.aiCreditsBalance ?? 0,
        postCount: membership?.organization._count.posts ?? 0,
      };
    });

    const recentTransactions = recentTransactionsRaw.map((t) => ({
      id: t.id,
      orgName: t.organization.name,
      type: t.type,
      amount: t.amount,
      balance: t.balance,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    }));

    // Estimate credit pack revenue (each pack purchase has known amount → map to price)
    const packRevenue = packPurchases.reduce((sum, p) => {
      if (p.amount >= 500) return sum + 30;
      if (p.amount >= 200) return sum + 15;
      if (p.amount >= 60) return sum + 5;
      return sum;
    }, 0);

    return {
      totalUsers,
      totalOrgs,
      totalPosts,
      publishedPosts,
      totalEvents,
      totalCreditsIssued: creditAggregates._sum.amount ?? 0,
      totalCreditsUsed: Math.abs(usedResult._sum.amount ?? 0),
      totalCreditsRemaining: creditsRemaining._sum.aiCreditsBalance ?? 0,
      creditPacksPurchased: packPurchases.length,
      creditPackRevenue: packRevenue,
      planBreakdown: plans,
      totalMentions,
      positiveMentions,
      mentionsThisMonth,
      recentUsers,
      recentTransactions,
    };
  }),
});
