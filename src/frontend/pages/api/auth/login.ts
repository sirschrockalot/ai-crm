import { NextApiRequest, NextApiResponse } from 'next';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body as LoginRequest;
    
    // Mock validation - accept any valid email/password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!email.includes('@') || password.length < 3) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return mock user and token
    const mockUser = {
      id: '1',
      email: email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      tenantId: 'tenant-1',
    };

    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return res.status(200).json({
      user: mockUser,
      token: mockToken,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
