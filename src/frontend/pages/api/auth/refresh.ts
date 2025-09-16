import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ token: string; user?: any } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const refreshToken = req.body?.refreshToken as string | undefined;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' });
    }

    const authServiceConfig = getAuthServiceConfig();
    const response = await fetch(`${authServiceConfig.apiUrl}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.message || 'Token refresh failed' });
    }

    const data = await response.json();
    return res.status(200).json({ token: data.accessToken || data.token, user: data.user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
