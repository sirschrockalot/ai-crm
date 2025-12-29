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
      // For now, return default preferences
      // In the future, this could fetch from a user preferences service
      return res.status(200).json({
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        dashboard: {
          layout: 'grid',
          defaultView: 'overview',
          refreshInterval: 30000,
        },
      });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      // For now, just return success
      // In the future, this could save to a user preferences service
      return res.status(200).json({
        ...req.body,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings preferences API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

