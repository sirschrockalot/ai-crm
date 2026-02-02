import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';
import { getBypassToken, isBypassAuthExpected } from '@/services/bypassToken';

// Query params allowed by Leads Service LeadQueryDto (forbidNonWhitelisted)
const ALLOWED_QUERY_KEYS = new Set([
  'search', 'status', 'source', 'priority', 'assignedTo', 'createdBy', 'tags',
  'minScore', 'maxScore', 'minEstimatedValue', 'maxEstimatedValue',
  'startDate', 'endDate', 'lastContactStartDate', 'lastContactEndDate',
  'nextFollowUpStartDate', 'nextFollowUpEndDate', 'isActive',
  'page', 'limit', 'sortBy', 'sortOrder',
]);

// Simple rate limiting (skipped in development to avoid 429 during local dev)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const now = Date.now();
  const record = requestCounts.get(ip);
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

function buildQueryString(query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (!ALLOWED_QUERY_KEYS.has(key)) return;
    if (value === undefined || value === null || value === '') return;
    params.append(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
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

    // GET/POST proxy to Leads Service /leads (purge uses POST /api/imports/leads/purge)
    const queryString = req.method === 'GET' ? buildQueryString((req.query || {}) as Record<string, unknown>) : '';
    const targetUrl = `${baseUrl}/leads${queryString}`;

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method !== 'GET' ? JSON.stringify(req.body ?? {}) : undefined,
      });
    } catch (fetchError: any) {
      const msg = fetchError?.message ?? String(fetchError);
      const isUnavailable =
        fetchError?.code === 'ECONNREFUSED' ||
        fetchError?.code === 'ENOTFOUND' ||
        msg.includes('fetch failed') ||
        msg.includes('ECONNREFUSED');
      console.error('[api/leads] Leads service request failed:', { targetUrl, error: msg });
      return res.status(isUnavailable ? 503 : 500).json({
        error: isUnavailable ? 'Leads service is not available' : 'Request to Leads service failed',
        details: msg,
      });
    }

    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Invalid response from Leads service' };
    }

    if (!response.ok) {
      console.error('[api/leads] Leads service returned error:', {
        targetUrl,
        status: response.status,
        body: text?.slice(0, 500),
      });
      if (response.status === 500 && typeof data === 'object' && data !== null) {
        console.error('[api/leads] Upstream 500 details:', JSON.stringify(data, null, 2).slice(0, 1000));
      }
    }
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('[api/leads] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error?.message ?? String(error),
    });
  }
}
