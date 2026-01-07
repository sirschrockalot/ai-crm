import { NextApiRequest, NextApiResponse } from 'next';
import { getAtsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const atsService = getAtsServiceConfig();
    const queryParams = new URLSearchParams();
    if (req.query.interviewerId) queryParams.append('interviewerId', req.query.interviewerId as string);
    if (req.query.limit) queryParams.append('limit', req.query.limit as string);

    const queryString = queryParams.toString();
    const targetUrl = `${atsService.apiUrl}/interviews/upcoming${queryString ? `?${queryString}` : ''}`;

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

    const response = await fetch(targetUrl, { headers });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('API route /api/ats/interviews/upcoming error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
