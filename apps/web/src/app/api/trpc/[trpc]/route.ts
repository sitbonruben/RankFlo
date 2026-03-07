import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, type Context } from "@rankflo/api";
import { db } from "@rankflo/db";
import { validateSession } from "@rankflo/auth";
import { SESSION } from "@rankflo/core/constants";

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map((c) => {
      const [key, ...val] = c.split("=");
      return [key, val.join("=")] as [string, string];
    }),
  );
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies[SESSION.cookieName];
      const session = token ? await validateSession(token) : null;

      return {
        db,
        session,
        headers: new Headers(req.headers),
      };
    },
  });

export { handler as GET, handler as POST };
