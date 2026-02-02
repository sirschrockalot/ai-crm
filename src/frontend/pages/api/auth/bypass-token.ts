import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthServiceConfig } from '../../../services/configService';

const DEV_ADMIN_EMAIL = 'admin@dealcycle.com';

/**
 * When auth bypass is enabled (NEXT_PUBLIC_BYPASS_AUTH=true) and a dev admin
 * password is configured, returns a real JWT for admin@dealcycle.com so that
 * API calls to Leads Service etc. succeed. Only available in development.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ token: string } | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  const isDev = process.env.NODE_ENV !== 'production';
  const devPassword =
    process.env.DEV_ADMIN_PASSWORD ??
    process.env.AUTH_DEV_ADMIN_PASSWORD ??
    process.env.ADMIN_PASSWORD ??
    process.env.AUTH_ADMIN_PASSWORD;

  if (!bypassAuth || !isDev || !devPassword) {
    return res.status(403).json({
      error: 'Bypass token only available when NEXT_PUBLIC_BYPASS_AUTH=true, NODE_ENV !== production, and a dev admin password is set (DEV_ADMIN_PASSWORD, AUTH_DEV_ADMIN_PASSWORD, ADMIN_PASSWORD, or AUTH_ADMIN_PASSWORD in Doppler / .env)',
    });
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
      const err = await response.json().catch(() => ({}));
      const authMessage = (err as { message?: string }).message ?? (err as { error?: string }).error;
      console.warn('[bypass-token] Auth service login failed:', response.status, authMessage ?? err);
      const isNetwork = response.status === 0 || response.status >= 502;
      const message = isNetwork
        ? 'Auth Service unreachable. Start it (e.g. port 3001) and ensure NEXT_PUBLIC_AUTH_SERVICE_URL is correct.'
        : authMessage
          ? `Auth Service: ${authMessage}`
          : 'Bypass login failed. Ensure admin@dealcycle.com exists in Auth Service DB and password matches DEV_ADMIN_PASSWORD (or ADMIN_PASSWORD / AUTH_ADMIN_PASSWORD in Doppler). Use POST .../api/auth/bootstrap-admin to create or reset the admin user.';
      // Return 503 so the UI shows a clear message instead of "401 Unauthorized"
      return res.status(503).json({
        error: message,
        code: isNetwork ? 'auth_unreachable' : 'bypass_login_failed',
      });
    }

    const data = await response.json();
    const token = data.accessToken ?? data.token;
    if (!token) {
      return res.status(500).json({ error: 'Auth service did not return a token' });
    }

    return res.status(200).json({ token });
  } catch (error: any) {
    console.error('[bypass-token] Error:', error?.message ?? error);
    return res.status(500).json({
      error: error?.message ?? 'Failed to obtain bypass token',
    });
  }
}
