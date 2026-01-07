import { NextApiRequest, NextApiResponse } from 'next';
import { getAtsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const atsService = getAtsServiceConfig();
    const targetUrl = `${atsService.apiUrl}/applications`;

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
      if (req.query.candidateId) queryParams.append('candidateId', req.query.candidateId as string);
      if (req.query.jobPostingId) queryParams.append('jobPostingId', req.query.jobPostingId as string);
      if (req.query.source) queryParams.append('source', req.query.source as string);
      if (req.query.status) queryParams.append('status', req.query.status as string);
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
    console.error('API route /api/ats/applications error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

