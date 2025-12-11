import { NextApiRequest, NextApiResponse } from 'next';

// Leads service configuration
const leadsServiceConfig = {
  url: process.env.NEXT_PUBLIC_LEADS_SERVICE_URL || 'http://localhost:3002',
  apiUrl: process.env.NEXT_PUBLIC_LEADS_SERVICE_API_URL || 'http://localhost:3002/api/v1',
};

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Get authorization header from request
    const authHeader = req.headers.authorization;
    
    // Build the target URL
    const targetUrl = `${leadsServiceConfig.apiUrl}/leads`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the leads service
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    // Forward the response status and data
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Leads API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
