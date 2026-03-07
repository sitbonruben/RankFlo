import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, orgProcedure, publicProcedure } from "../trpc";

// ─── Helpers ────────────────────────────────────────────────

function buildUtmUrl(
  baseUrl: string,
  source: string,
  medium: string,
  campaign: string,
  term?: string | null,
  content?: string | null,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  if (term) url.searchParams.set("utm_term", term);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

// ─── Router ─────────────────────────────────────────────────

export const utmRouter = router({
  /**
   * LIST — Paginated UTM links for the org.
   */
  list: orgProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      const where = {
        organizationId: ctx.organizationId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { utmCampaign: { contains: search, mode: "insensitive" as const } },
                { utmSource: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [links, total] = await Promise.all([
        ctx.db.utmLink.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        ctx.db.utmLink.count({ where }),
      ]);

      return {
        links: links.map((link) => ({
          ...link,
          fullUrl: buildUtmUrl(
            link.baseUrl,
            link.utmSource,
            link.utmMedium,
            link.utmCampaign,
            link.utmTerm,
            link.utmContent,
          ),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * CREATE — Create a new UTM link with auto-generated short code.
   */
  create: orgProcedure
    .input(
      z.object({
        name: z.string().min(1),
        baseUrl: z.string().url(),
        utmSource: z.string().min(1),
        utmMedium: z.string().min(1),
        utmCampaign: z.string().min(1),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        shortCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const shortCode = input.shortCode || crypto.randomUUID().slice(0, 8);

      // Ensure short code is unique
      const existing = await ctx.db.utmLink.findUnique({
        where: { shortCode },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Short code already in use",
        });
      }

      const link = await ctx.db.utmLink.create({
        data: {
          organizationId: ctx.organizationId,
          name: input.name,
          baseUrl: input.baseUrl,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmTerm: input.utmTerm,
          utmContent: input.utmContent,
          shortCode,
        },
      });

      const fullUrl = buildUtmUrl(
        link.baseUrl,
        link.utmSource,
        link.utmMedium,
        link.utmCampaign,
        link.utmTerm,
        link.utmContent,
      );

      return { ...link, fullUrl };
    }),

  /**
   * UPDATE — Update an existing UTM link.
   */
  update: orgProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        baseUrl: z.string().url().optional(),
        utmSource: z.string().min(1).optional(),
        utmMedium: z.string().min(1).optional(),
        utmCampaign: z.string().min(1).optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const link = await ctx.db.utmLink.findFirst({
        where: { id, organizationId: ctx.organizationId },
      });

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "UTM link not found" });
      }

      const updated = await ctx.db.utmLink.update({
        where: { id },
        data,
      });

      const fullUrl = buildUtmUrl(
        updated.baseUrl,
        updated.utmSource,
        updated.utmMedium,
        updated.utmCampaign,
        updated.utmTerm,
        updated.utmContent,
      );

      return { ...updated, fullUrl };
    }),

  /**
   * DELETE — Remove a UTM link.
   */
  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.utmLink.findFirst({
        where: { id: input.id, organizationId: ctx.organizationId },
      });

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "UTM link not found" });
      }

      await ctx.db.utmLink.delete({ where: { id: input.id } });

      return { success: true };
    }),

  /**
   * CLICK — Public endpoint for redirect tracking.
   * Increments click count and returns the full destination URL.
   */
  click: publicProcedure
    .input(z.object({ shortCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.utmLink.findUnique({
        where: { shortCode: input.shortCode },
      });

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      await ctx.db.utmLink.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } },
      });

      const destinationUrl = buildUtmUrl(
        link.baseUrl,
        link.utmSource,
        link.utmMedium,
        link.utmCampaign,
        link.utmTerm,
        link.utmContent,
      );

      return { destinationUrl };
    }),

  /**
   * STATS — Aggregated UTM link stats for the org.
   */
  stats: orgProcedure.query(async ({ ctx }) => {
    const links = await ctx.db.utmLink.findMany({
      where: { organizationId: ctx.organizationId },
      select: {
        id: true,
        name: true,
        utmCampaign: true,
        clicks: true,
      },
    });

    const totalLinks = links.length;
    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

    // Aggregate clicks by campaign
    const campaignMap = new Map<string, number>();
    for (const link of links) {
      const current = campaignMap.get(link.utmCampaign) ?? 0;
      campaignMap.set(link.utmCampaign, current + link.clicks);
    }

    const topCampaigns = Array.from(campaignMap.entries())
      .map(([campaign, clicks]) => ({ campaign, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return {
      totalLinks,
      totalClicks,
      topCampaigns,
    };
  }),
});
