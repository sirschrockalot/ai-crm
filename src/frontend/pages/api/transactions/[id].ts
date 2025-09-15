import { NextApiRequest, NextApiResponse } from 'next';

const TRANSACTIONS_SERVICE_API_URL = process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL || 'http://localhost:3003/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const API_URL = `${TRANSACTIONS_SERVICE_API_URL}/transactions/${id}`;

  try {
    if (req.method === 'GET') {
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else if (req.method === 'PATCH') {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else if (req.method === 'DELETE') {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
      });
      res.status(response.status).end();
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(`API route /api/transactions/${id} error:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
