import { NextApiRequest, NextApiResponse } from 'next';

const TRANSACTIONS_SERVICE_API_URL = process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL || 'http://localhost:3003/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const API_URL = `${TRANSACTIONS_SERVICE_API_URL}/transactions/${id}/activities`;

  try {
    if (req.method === 'POST') {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(`API route /api/transactions/${id}/activities error:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

