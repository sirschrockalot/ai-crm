import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';
import { getBypassToken, isBypassAuthExpected } from '@/services/bypassToken';

/**
 * GET /api/leads/counts - Proxies to Leads Service GET /leads/counts.
 * Returns DB-based counts: totalLeads, newLeadsThisMonth, callBack, offerMade, contractOut, transaction.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leadsService = getLeadsServiceConfig();
    const baseUrl = leadsService.apiUrl.replace(/\/leads\/?$/, '');
    let authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const bypassToken = await getBypassToken();
      if (bypassToken) authHeader = `Bearer ${bypassToken}`;
    }
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && isBypassAuthExpected()) {
      return res.status(503).json({
        error: 'Bypass token unavailable. Ensure Auth Service is running and DEV_ADMIN_PASSWORD (or ADMIN_PASSWORD) is set for admin@dealcycle.com.',
        code: 'bypass_token_unavailable',
      });
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader && authHeader.startsWith('Bearer ')) headers['Authorization'] = authHeader;

    const targetUrl = `${baseUrl}/leads/counts`;
    const response = await fetch(targetUrl, { headers });

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Invalid response' };
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const isUnavailable =
      (error as NodeJS.ErrnoException)?.code === 'ECONNREFUSED' ||
      msg.includes('fetch failed') ||
      msg.includes('ECONNREFUSED');
    return res.status(isUnavailable ? 503 : 500).json({
      error: isUnavailable ? 'Leads service is not available' : 'Request failed',
      details: msg,
    });
  }
}
