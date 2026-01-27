import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const leadsService = getLeadsServiceConfig();
    const baseUrl = leadsService.apiUrl.replace('/leads', '');
    const targetUrl = `${baseUrl}/reports/pipeline`;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const queryParams = new URLSearchParams();
    if (req.query.from) queryParams.append('from', req.query.from as string);
    if (req.query.to) queryParams.append('to', req.query.to as string);

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
        errorData = { error: errorText || 'Failed to fetch pipeline report', status: response.status };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API route /api/reports/pipeline error:', error);
    
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
