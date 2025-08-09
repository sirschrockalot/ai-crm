import { NextApiRequest, NextApiResponse } from 'next';

interface RefreshResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefreshResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Mock token refresh - return new token
    const newToken = 'mock-jwt-token-refreshed-' + Date.now();
    
    const mockUser = {
      id: '1',
      email: 'admin@dealcycle.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      tenantId: 'tenant-1',
    };
    
    return res.status(200).json({
      token: newToken,
      user: mockUser,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
