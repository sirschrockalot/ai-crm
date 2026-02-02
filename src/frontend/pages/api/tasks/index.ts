import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';
import { getBypassToken, isBypassAuthExpected } from '@/services/bypassToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const leadsService = getLeadsServiceConfig();
    // Tasks endpoint is at /api/v1/tasks (not /api/v1/leads/tasks)
    const baseUrl = leadsService.apiUrl.replace('/leads', '');
    const targetUrl = `${baseUrl}/tasks`;

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const queryParams = new URLSearchParams();
    if (req.query.leadId) queryParams.append('leadId', req.query.leadId as string);
    if (req.query.status) queryParams.append('status', req.query.status as string);
    if (req.query.filter) queryParams.append('filter', req.query.filter as string);
    if (req.query.assignedToUserId) queryParams.append('assignedToUserId', req.query.assignedToUserId as string);

    const queryString = queryParams.toString();
    const url = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to fetch tasks', status: response.status };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API route /api/tasks error:', error);
    
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return res.status(503).json({ 
        error: 'Service Unavailable', 
        details: 'Leads service is not available.',
        message: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message,
      type: error.name || 'UnknownError'
    });
  }
}
