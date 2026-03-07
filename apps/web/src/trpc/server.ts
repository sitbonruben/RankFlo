import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { createCallerFactory, type Context } from "@rankflo/api";
import { appRouter } from "@rankflo/api";
import { db } from "@rankflo/db";
import { validateSession } from "@rankflo/auth";
import { SESSION } from "@rankflo/core/constants";

const createContext = cache(async (): Promise<Context> => {
  const heads = await headers();
  const cookieHeader = heads.get("cookie") ?? "";

  // Extract session token from cookies
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...val] = c.split("=");
      return [key, val.join("=")];
    }),
  );

  const token = cookies[SESSION.cookieName];
  const session = token ? await validateSession(token) : null;

  return {
    db,
    session,
    headers: heads,
  };
});

const createCaller = createCallerFactory(appRouter);

export const api = cache(async () => {
  const ctx = await createContext();
  return createCaller(ctx);
});
