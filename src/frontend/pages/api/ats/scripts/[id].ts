import { NextApiRequest, NextApiResponse } from 'next';
import { getAtsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const atsService = getAtsServiceConfig();
    const targetUrl = `${atsService.apiUrl}/scripts/${id}`;

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
      const response = await fetch(targetUrl, { headers });
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (req.method === 'PATCH') {
      const response = await fetch(targetUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (req.method === 'DELETE') {
      const response = await fetch(targetUrl, {
        method: 'DELETE',
        headers,
      });
      if (response.status === 204) {
        return res.status(204).end();
      }
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(`API route /api/ats/scripts/[id] error:`, error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

