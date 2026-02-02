import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthServiceConfig } from '../../../services/configService';

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
    tenantId?: string;
  };
  token: string;
  refreshToken?: string;
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
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Call the auth service
    const authServiceConfig = getAuthServiceConfig();
    const response = await fetch(`${authServiceConfig.url}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!response.ok) {
      let message = 'Login failed';
      try {
        const errorData = await response.json();
        message = errorData.message || errorData.error || message;
      } catch {
        // Auth service may return non-JSON
      }
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    
    // Transform the response to match frontend expectations
    const user = {
      id: data.user.id || data.user._id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: data.user.role,
      roles: Array.isArray(data.user.roles) ? data.user.roles : (data.user.role ? [data.user.role] : []),
      status: data.user.status,
      tenantId: data.user.tenantId,
    };

    const token = data.accessToken || data.token;

    return res.status(200).json({
      user,
      token,
      refreshToken: data.refreshToken,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
