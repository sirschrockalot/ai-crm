import { NextApiRequest, NextApiResponse } from 'next';

interface TestLoginRequest {
  userId: string;
  email: string;
  role: string;
}

interface TestLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    status: string;
    tenantId: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestLoginResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, role }: TestLoginRequest = req.body;

    if (!userId || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a mock JWT token for test mode
    const mockToken = `test-token-${userId}-${Date.now()}`;

    // Map role to roles array for consistency
    const roles = role.toLowerCase() === 'admin' ? ['admin'] : [role.toLowerCase()];

    const user = {
      id: userId,
      email,
      firstName: role.split(' ')[0] || 'Test',
      lastName: role.split(' ').slice(1).join(' ') || 'User',
      roles,
      status: 'active',
      tenantId: 'tenant-1',
    };

    // In a real implementation, you would:
    // 1. Validate the user exists
    // 2. Generate a proper JWT token
    // 3. Store session information
    // 4. Return proper authentication data

    res.status(200).json({
      token: mockToken,
      user,
    });
  } catch (error) {
    console.error('Test mode login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
