import { NextApiRequest, NextApiResponse } from 'next';
import { getUserManagementServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    const userManagementConfig = getUserManagementServiceConfig();
    
    // Forward the request to the user management service
    const response = await fetch(`${userManagementConfig.url}/api/v1/roles/${id}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      ...(req.method !== 'GET' && { body: JSON.stringify(req.body) }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Roles API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
