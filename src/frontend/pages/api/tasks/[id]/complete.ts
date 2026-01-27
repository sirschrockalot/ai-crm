import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const leadsService = getLeadsServiceConfig();
    const baseUrl = leadsService.apiUrl.replace('/leads', '');
    const targetUrl = `${baseUrl}/tasks/${id}/complete`;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const response = await fetch(targetUrl, {
      method: 'PATCH',
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
        errorData = { error: errorText || 'Failed to complete task', status: response.status };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API route /api/tasks/[id]/complete error:', error);
    
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
