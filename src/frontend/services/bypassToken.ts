import { getAuthServiceConfig } from './configService';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DEV_ADMIN_EMAIL = 'admin@dealcycle.com';
const CACHE_TTL_MS = 4 * 60 * 1000; // 4 minutes (JWTs often 5m+)
const FAILURE_BACKOFF_MS = 5 * 1000; // 5s after auth failure, then retry (avoids 401s on next request)

let cached: { token: string; expiresAt: number } | null = null;
let lastFailureAt = 0;

/** Dev-only: path for persisting bypass token across Next.js recompiles (hot reload). */
function getBypassTokenFilePath(): string | null {
  if (process.env.NODE_ENV === 'production') return null;
  try {
    return join(process.cwd(), '.next', '.bypass-token.json');
  } catch {
    return null;
  }
}

/** Try to load a valid token from disk (dev only). Survives hot reload. Returns token and expiresAt when valid. */
async function loadPersistedToken(): Promise<{ token: string; expiresAt: number } | null> {
  const filePath = getBypassTokenFilePath();
  if (!filePath) return null;
  try {
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as { token?: string; expiresAt?: number };
    const now = Date.now();
    if (data.token && data.expiresAt && data.expiresAt > now) {
      return { token: data.token, expiresAt: data.expiresAt };
    }
  } catch {
    // file missing or invalid
  }
  return null;
}

/** Persist token to disk (dev only). */
async function persistToken(token: string, expiresAt: number): Promise<void> {
  const filePath = getBypassTokenFilePath();
  if (!filePath) return;
  try {
    const dir = join(process.cwd(), '.next');
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, JSON.stringify({ token, expiresAt }), 'utf-8');
  } catch {
    // non-fatal
  }
}

/**
 * When auth bypass is enabled and dev admin password is set, returns a JWT for
 * admin@dealcycle.com. Used by API routes to forward authenticated requests to
 * backend services when the client hasn't sent a token yet (e.g. leads list
 * loads before bypass token is in localStorage). Server-side only. Cached in
 * memory and (in dev) on disk so hot reloads don't clear the token.
 * After a failed attempt, skips calling Auth Service for FAILURE_BACKOFF_MS to avoid console errors.
 */
export async function getBypassToken(): Promise<string | null> {
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  const isDev = process.env.NODE_ENV !== 'production';
  const devPassword =
    process.env.DEV_ADMIN_PASSWORD ??
    process.env.AUTH_DEV_ADMIN_PASSWORD ??
    process.env.ADMIN_PASSWORD ??
    process.env.AUTH_ADMIN_PASSWORD;

  if (!bypassAuth || !isDev || !devPassword) {
    return null;
  }

  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.token;
  }
  const persisted = await loadPersistedToken();
  if (persisted) {
    cached = { token: persisted.token, expiresAt: persisted.expiresAt };
    return persisted.token;
  }
  if (lastFailureAt > 0 && now - lastFailureAt < FAILURE_BACKOFF_MS) {
    return null;
  }

  try {
    const authServiceConfig = getAuthServiceConfig();
    const response = await fetch(`${authServiceConfig.url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: DEV_ADMIN_EMAIL,
        password: devPassword,
      }),
    });

    if (!response.ok) {
      lastFailureAt = Date.now();
      return null;
    }
    const data = await response.json();
    const token = data.accessToken ?? data.token;
    if (token) {
      const expiresAt = now + CACHE_TTL_MS;
      cached = { token, expiresAt };
      lastFailureAt = 0;
      await persistToken(token, expiresAt);
      return token;
    }
    lastFailureAt = Date.now();
    return null;
  } catch {
    lastFailureAt = Date.now();
    return null;
  }
}

/**
 * True when bypass auth is enabled (dev only). Use in API routes to return 503 with a
 * clear message instead of forwarding without a token and getting 401 from backend.
 */
export function isBypassAuthExpected(): boolean {
  return (
    process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}
