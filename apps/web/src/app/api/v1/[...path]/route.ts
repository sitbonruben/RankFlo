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
          where: { hashedKey, revokedAt: null },
          include: {
            organization: true,
          },
        });

        if (apiKey) {
          // Update last used timestamp
          await db.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
          });

          // Create a synthetic session for API key auth
          session = {
            userId: apiKey.userId,
            organizationId: apiKey.organizationId,
            role: "ADMIN" as const,
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
