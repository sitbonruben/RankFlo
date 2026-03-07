import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'rankflo_auth_token';
const REFRESH_TOKEN_KEY = 'rankflo_refresh_token';

/**
 * Retrieve the stored authentication token.
 */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store an authentication token securely.
 */
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Remove the stored authentication token.
 */
export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Retrieve the stored refresh token.
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store a refresh token securely.
 */
export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/**
 * Remove the stored refresh token.
 */
export async function removeRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Check whether the user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null && token.length > 0;
}

/**
 * API base URL — override via environment or Expo constants.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface LoginParams {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

/**
 * Log in with email and password. Stores tokens on success.
 */
export async function login(params: LoginParams): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message ?? 'Login failed');
  }

  const data: AuthResponse = await response.json();

  await setToken(data.token);
  if (data.refreshToken) {
    await setRefreshToken(data.refreshToken);
  }

  return data;
}

/**
 * Log out the current user. Clears stored tokens.
 */
export async function logout(): Promise<void> {
  const token = await getToken();

  // Best-effort server-side logout
  if (token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Ignore network errors during logout
    }
  }

  await removeToken();
  await removeRefreshToken();
}

/**
 * OAuth login — opens the provider URL and expects a redirect back.
 */
export function getOAuthUrl(provider: 'google' | 'github'): string {
  return `${API_URL}/api/auth/${provider}?redirect=rankflo://auth/callback`;
}
