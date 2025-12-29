import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authServiceConfig = getAuthServiceConfig();
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      const response = await fetch(`${authServiceConfig.url}/api/auth/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token as string,
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch profile' });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const response = await fetch(`${authServiceConfig.url}/api/auth/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token as string,
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to update profile' });
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

