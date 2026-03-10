import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, type Context } from "@rankflo/api";
import { db } from "@rankflo/db";

/**
 * REST API v1 — powered by tRPC fetch adapter.
 * Authenticates via Bearer token (API key) in the Authorization header.
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/v1",
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      const authHeader = req.headers.get("authorization");
      let session = null;

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);

        // Look up hashed API key
        const { createHash } = await import("node:crypto");
        const hashedKey = createHash("sha256").update(token).digest("hex");

        const apiKey = await db.apiKey.findFirst({
          where: { keyHash: hashedKey, revokedAt: null },
          include: {
            user: { select: { id: true, email: true, name: true, avatarUrl: true, locale: true } },
            organization: { select: { id: true, name: true, slug: true, plan: true } },
          },
        });

        if (apiKey && (!apiKey.expiresAt || apiKey.expiresAt > new Date())) {
          // Update last used timestamp
          await db.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
          });

          // Get membership for this user+org
          const membership = await db.membership.findFirst({
            where: { userId: apiKey.userId, organizationId: apiKey.organizationId },
            select: { id: true, role: true },
          });

          // Build a SessionData-compatible synthetic session
          session = {
            id: `apikey_${apiKey.id}`,
            userId: apiKey.userId,
            user: apiKey.user,
            membership: membership
              ? {
                  id: membership.id,
                  organizationId: apiKey.organizationId,
                  role: membership.role as "ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER",
                  organization: apiKey.organization,
                }
              : null,
          };
        }
      }

      return {
        db,
        session,
        headers: new Headers(req.headers),
      };
    },
    onError: ({ error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("REST API error:", error.message);
      }
    },
  });

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
