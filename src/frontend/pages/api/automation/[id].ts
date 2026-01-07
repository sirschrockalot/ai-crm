import { NextApiRequest, NextApiResponse } from 'next';
import { getTransactionsServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const transactionsService = getTransactionsServiceConfig();
  const targetUrl = `${transactionsService.apiUrl}/automation/${id}`;

  // Ensure authentication token is present
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    };

    let response;
    if (req.method === 'GET') {
      response = await fetch(targetUrl, { headers });
    } else if (req.method === 'PATCH') {
      response = await fetch(targetUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req.body),
      });
    } else if (req.method === 'DELETE') {
      response = await fetch(targetUrl, {
        method: 'DELETE',
        headers,
      });
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error from transactions service' }));
      console.error(`Proxy to Transactions Service (automation) failed for ${req.method} ${targetUrl}:`, response.status, errorData);
      return res.status(response.status).json({ error: errorData.message || 'Transactions service error', details: errorData });
    }

    if (response.status === 204) {
      return res.status(204).end();
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error(`API route /api/automation/${id} error:`, error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

