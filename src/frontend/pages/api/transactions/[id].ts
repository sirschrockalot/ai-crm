import { NextApiRequest, NextApiResponse } from 'next';

const TRANSACTIONS_SERVICE_API_URL = process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL || 'http://localhost:3003/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const API_URL = `${TRANSACTIONS_SERVICE_API_URL}/transactions/${id}`;

  try {
    if (req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const response = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      
      return res.status(response.status).json(data);
    } else if (req.method === 'PATCH') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      
      return res.status(response.status).json(data);
    } else if (req.method === 'DELETE') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
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
