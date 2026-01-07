import { NextApiRequest, NextApiResponse } from 'next';
import { getTransactionsServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const transactionsService = getTransactionsServiceConfig();
    const targetUrl = `${transactionsService.apiUrl}/tasks/today`;

    const authHeader = req.headers.authorization;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
    };

    const response = await fetch(targetUrl, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error from transactions service' }));
      console.error(`Proxy to Transactions Service (tasks/today) failed:`, response.status, errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Tasks Today API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred',
    });
  }
}

