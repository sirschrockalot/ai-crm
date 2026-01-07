import { NextApiRequest, NextApiResponse } from 'next';
import { getTransactionsServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  // Handle special routes that should not be treated as IDs
  // IMPORTANT: These routes have their own handlers (calendar.ts, upcoming.ts)
  // If we're here, Next.js incorrectly routed to [id].ts instead of the static route
  if (id === 'calendar' || id === 'upcoming') {
    console.error(`❌ Next.js incorrectly routed /api/appointments/${id} to [id].ts instead of ${id}.ts`);
    console.error('This suggests a Next.js routing cache issue. Try restarting the dev server.');
    // Return 404 to indicate this route should be handled by the static route file
    return res.status(404).json({ 
      error: `Route /api/appointments/${id} should be handled by ${id}.ts, not [id].ts`,
      hint: 'This may be a Next.js routing cache issue. Try restarting the dev server.'
    });
  }
  
  const transactionsService = getTransactionsServiceConfig();
  const targetUrl = `${transactionsService.apiUrl}/appointments/${id}`;

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
      console.error(`Proxy to Transactions Service (appointments) failed for ${req.method} ${targetUrl}:`, response.status, errorData);
      return res.status(response.status).json({ error: errorData.message || 'Transactions service error', details: errorData });
    }

    if (response.status === 204) {
      return res.status(204).end();
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error(`API route /api/appointments/${id} error:`, error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

