import { NextApiRequest, NextApiResponse } from 'next';

const TRANSACTIONS_SERVICE_API_URL =
  process.env.TRANSACTIONS_SERVICE_API_URL ||
  process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL ||
  'http://localhost:3003/api/v1';

const TRANSACTIONS_SERVICE_JWT_TOKEN =
  process.env.TRANSACTIONS_SERVICE_JWT_TOKEN || process.env.NEXT_PUBLIC_TRANSACTIONS_JWT_TOKEN;

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

function getAuthorizationHeader(req: NextApiRequest): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader) return authHeader;
  if (BYPASS_AUTH) return undefined;
  if (TRANSACTIONS_SERVICE_JWT_TOKEN) return `Bearer ${TRANSACTIONS_SERVICE_JWT_TOKEN}`;
  return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const API_URL = `${TRANSACTIONS_SERVICE_API_URL}/transactions/${id}`;

  try {
    if (req.method === 'GET') {
      const authHeader = getAuthorizationHeader(req);
      if (!authHeader && !BYPASS_AUTH) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      
      return res.status(response.status).json(data);
    } else if (req.method === 'PATCH') {
      const authHeader = getAuthorizationHeader(req);
      if (!authHeader && !BYPASS_AUTH) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      
      return res.status(response.status).json(data);
    } else if (req.method === 'DELETE') {
      const authHeader = getAuthorizationHeader(req);
      if (!authHeader && !BYPASS_AUTH) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
      });
      
      if (response.status === 204) {
        return res.status(204).end();
      }
      
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(`API route /api/transactions/${id} error:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
