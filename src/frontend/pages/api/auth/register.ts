import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthServiceConfig } from '../../../services/configService';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role?: string;
  adminAutoActivate?: boolean;
  provisionKey?: string;
}

interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    tenantId?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, companyName, role, adminAutoActivate, provisionKey } = req.body as RegisterRequest;
    
    if (!email || !password || !firstName || !lastName || !companyName) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Call the auth service
    const authServiceConfig = getAuthServiceConfig();
    const response = await fetch(`${authServiceConfig.url}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        companyName,
        role: role || 'user',
        adminAutoActivate,
        provisionKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      return res.status(response.status).json({ error: errorData.message || 'Registration failed' });
    }

    const data = await response.json();
    
    // Transform the response to match frontend expectations
    const result: RegisterResponse = {
      message: data.message || 'User registered successfully',
    };

    if (data.user) {
      result.user = {
        id: data.user.id || data.user._id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        status: data.user.status,
        tenantId: data.user.tenantId,
      };
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Register API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

