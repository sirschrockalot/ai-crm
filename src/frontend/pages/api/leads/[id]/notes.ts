import { NextApiRequest, NextApiResponse } from 'next';
import { getLeadsServiceConfig } from '@/services/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (req.method === 'GET') {
    // Frontend fetches notes list; Leads Service has no GET notes endpoint, return empty array so page loads
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (!bypassAuth) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }
    if (!leadId) {
      return res.status(400).json({ error: 'Lead ID is required' });
    }
    try {
      const leadsService = getLeadsServiceConfig();
      const targetUrl = `${leadsService.apiUrl}/${leadId}/notes`;
      const authHeader = req.headers.authorization;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && authHeader.startsWith('Bearer ') ? { Authorization: authHeader } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(Array.isArray(data) ? data : []);
      }
      // Leads Service may not implement GET /leads/:id/notes; return empty list so UI can load
      return res.status(200).json([]);
    } catch {
      return res.status(200).json([]);
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  try {
    const leadsService = getLeadsServiceConfig();
    const targetUrl = `${leadsService.apiUrl}/${leadId}/notes`;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Failed to add note', status: response.status };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('API route /api/leads/[id]/notes error:', error);
    
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
