import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Since the auth service doesn't have a session timeout endpoint,
    // we'll verify the token by calling the /me endpoint
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const response = await fetch(`${authServiceUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ 
          message: 'Session expired',
          timeRemaining: 0,
          isExpiringSoon: false
        });
      }
      throw new Error(`Auth service error: ${response.status}`);
    }

    // Token is valid, return a default session timeout response
    // In a real implementation, you'd calculate this based on token expiration
    const data = await response.json();
    return res.status(200).json({
      timeRemaining: 3600, // 1 hour in seconds
      isExpiringSoon: false,
      user: data.data
    });
  } catch (error) {
    console.error('Session timeout check failed:', error);
    return res.status(500).json({ 
      message: 'Failed to check session timeout',
      timeRemaining: 0,
      isExpiringSoon: false
    });
  }
}
