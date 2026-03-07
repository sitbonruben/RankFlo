import { db } from "@rankflo/db";

import { createSession, type SessionData } from "./session";

export interface OAuthProfile {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export async function handleOAuthCallback(
  profile: OAuthProfile,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ token: string; session: SessionData; isNewUser: boolean }> {
  let isNewUser = false;

  // Check for existing OAuth account
  const existingOAuth = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  let userId: string;

  if (existingOAuth) {
    userId = existingOAuth.userId;

    // Update tokens
    await db.oAuthAccount.update({
      where: { id: existingOAuth.id },
      data: {
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.expiresAt,
      },
    });
  } else {
    // Check if user exists with this email
    const existingUser = await db.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const newUser = await db.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: new Date(),
        },
      });
      userId = newUser.id;
      isNewUser = true;
    }

    // Link OAuth account
    await db.oAuthAccount.create({
      data: {
        userId,
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.expiresAt,
      },
    });
  }

  const { token, session } = await createSession(userId, ipAddress, userAgent);
  return { token, session, isNewUser };
}

// Google OAuth helpers
export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } },
  );

  const user = (await userRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  return {
    provider: "google",
    providerAccountId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.picture,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : undefined,
  };
}

// GitHub OAuth helpers
export function getGitHubAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    scope: "user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(
  code: string,
): Promise<OAuthProfile> {
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID ?? "",
        client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
        code,
      }),
    },
  );

  const tokens = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const user = (await userRes.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    email: string | null;
  };

  // Fetch email if not public
  let email = user.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? "";
  }

  return {
    provider: "github",
    providerAccountId: String(user.id),
    email,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    accessToken: tokens.access_token,
  };
}
