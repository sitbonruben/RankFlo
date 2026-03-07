import { randomBytes, createHash } from "crypto";

import { db } from "@rankflo/db";
import { SESSION } from "@rankflo/core/constants";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionData {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    locale: string;
  };
  membership: {
    id: string;
    organizationId: string;
    role: "ADMIN" | "EDITOR" | "AUTHOR" | "VIEWER";
    organization: {
      id: string;
      name: string;
      slug: string;
      plan: "FREE" | "PRO" | "ENTERPRISE";
    };
  } | null;
}

export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ token: string; session: SessionData }> {
  const token = generateSessionToken();
  const hashedToken = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION.maxAgeDays * 24 * 60 * 60 * 1000,
  );

  const session = await db.session.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
      ipAddress,
      userAgent,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          locale: true,
          memberships: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  plan: true,
                },
              },
            },
            take: 1,
          },
        },
      },
    },
  });

  const membership = session.user.memberships[0] ?? null;

  return {
    token,
    session: {
      id: session.id,
      userId: session.userId,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
        locale: session.user.locale,
      },
      membership: membership
        ? {
            id: membership.id,
            organizationId: membership.organizationId,
            role: membership.role,
            organization: membership.organization,
          }
        : null,
    },
  };
}

export async function validateSession(
  token: string,
): Promise<SessionData | null> {
  const hashedToken = hashSessionToken(token);

  const session = await db.session.findUnique({
    where: { token: hashedToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          locale: true,
          deletedAt: true,
          memberships: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  plan: true,
                },
              },
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }
  if (session.user.deletedAt) return null;

  // Refresh session if past half-life
  const halfLife =
    Date.now() +
    (SESSION.refreshAfterDays * 24 * 60 * 60 * 1000);
  if (session.expiresAt.getTime() < halfLife) {
    await db.session.update({
      where: { id: session.id },
      data: {
        expiresAt: new Date(
          Date.now() + SESSION.maxAgeDays * 24 * 60 * 60 * 1000,
        ),
      },
    });
  }

  const membership = session.user.memberships[0] ?? null;

  return {
    id: session.id,
    userId: session.userId,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
      locale: session.user.locale,
    },
    membership: membership
      ? {
          id: membership.id,
          organizationId: membership.organizationId,
          role: membership.role,
          organization: membership.organization,
        }
      : null,
  };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}
