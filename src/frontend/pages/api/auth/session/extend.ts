import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Since the auth service doesn't have a session extend endpoint,
    // we'll just verify the token is still valid by calling /me
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
        return res.status(401).json({ message: 'Session expired' });
      }
      throw new Error(`Auth service error: ${response.status}`);
    }

    // Token is valid, return success
    return res.status(200).json({ 
      message: 'Session extended successfully',
      success: true
    });
  } catch (error) {
    console.error('Session extend failed:', error);
    return res.status(500).json({ message: 'Failed to extend session' });
  }
}
