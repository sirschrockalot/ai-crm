import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const authServiceConfig = getAuthServiceConfig();
    const response = await fetch(`${authServiceConfig.apiUrl}/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.message || 'Failed to fetch user' });
    }

    const user = await response.json();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
