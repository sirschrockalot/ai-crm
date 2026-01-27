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
const API_URL = `${TRANSACTIONS_SERVICE_API_URL}/transactions`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const authorization = getAuthorizationHeader(req);
      const response = await fetch(`${API_URL}?${new URLSearchParams(req.query as Record<string, string>)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authorization && { Authorization: authorization }),
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else if (req.method === 'POST') {
      const authorization = getAuthorizationHeader(req);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorization && { Authorization: authorization }),
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API route /api/transactions error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
