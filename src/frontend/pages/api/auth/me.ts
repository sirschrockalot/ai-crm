import { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Mock token validation - in a real app, this would verify the JWT
    if (token === 'mock-token' || token.length > 10) {
      // Return mock user data
      const mockUser: User = {
        id: '1',
        email: 'admin@dealcycle.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        tenantId: 'tenant-1',
      };
      
      return res.status(200).json(mockUser);
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
