import { NextApiRequest, NextApiResponse } from 'next';
import { getUserManagementServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const userMgmt = getUserManagementServiceConfig();
    const targetUrl = `${userMgmt.url}/api/v1/users/stats`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error from user management service' }));
      console.error(`Proxy to User Management Service failed for GET ${targetUrl}:`, response.status, errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Users Stats API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

