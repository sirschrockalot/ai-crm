import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';
import { getBypassToken, isBypassAuthExpected } from '@/services/bypassToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

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

  try {
    const leadsService = getLeadsServiceConfig();
    const baseUrl = leadsService.apiUrl.replace(/\/leads\/?$/, '');
    const targetUrl = `${baseUrl}/leads/${leadId}`;

    if (req.method === 'GET') {
      const response = await fetch(targetUrl, { headers });
      const text = await response.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || 'Invalid response' };
      }
      return res.status(response.status).json(data);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: JSON.stringify(req.body ?? {}),
      });
      const text = await response.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || 'Invalid response' };
      }
      return res.status(response.status).json(data);
    }

    if (req.method === 'DELETE') {
      const response = await fetch(targetUrl, { method: 'DELETE', headers });
      if (response.status === 204 || response.status === 200) {
        return res.status(response.status).end();
      }
      const text = await response.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || 'Invalid response' };
      }
      return res.status(response.status).json(data);
    }

    res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    const msg = error?.message ?? String(error);
    const isUnavailable =
      error?.code === 'ECONNREFUSED' ||
      msg.includes('fetch failed') ||
      msg.includes('ECONNREFUSED');
    return res.status(isUnavailable ? 503 : 500).json({
      error: isUnavailable ? 'Leads service is not available' : 'Request failed',
      details: msg,
    });
  }
}
