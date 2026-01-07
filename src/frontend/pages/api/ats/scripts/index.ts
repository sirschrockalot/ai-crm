import { NextApiRequest, NextApiResponse } from 'next';
import { getAtsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const atsService = getAtsServiceConfig();
    const targetUrl = `${atsService.apiUrl}/scripts`;

    const authHeader = req.headers.authorization;
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    
    if (!bypassAuth && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (req.method === 'GET') {
      const queryParams = new URLSearchParams();
      if (req.query.search) queryParams.append('search', req.query.search as string);
      if (req.query.jobRole) queryParams.append('jobRole', req.query.jobRole as string);
      if (req.query.tag) queryParams.append('tag', req.query.tag as string);
      if (req.query.isTemplate) queryParams.append('isTemplate', req.query.isTemplate as string);
      if (req.query.page) queryParams.append('page', req.query.page as string);
      if (req.query.limit) queryParams.append('limit', req.query.limit as string);

      const queryString = queryParams.toString();
      const url = queryString ? `${targetUrl}?${queryString}` : targetUrl;

      const response = await fetch(url, { headers });
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (req.method === 'POST') {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API route /api/ats/scripts error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

