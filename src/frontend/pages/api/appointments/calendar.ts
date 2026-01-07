import { NextApiRequest, NextApiResponse } from 'next';
import { getTransactionsServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add explicit logging to confirm this route is being hit
  console.log('✅✅✅ CALENDAR ROUTE HANDLER CALLED! ✅✅✅', req.url);
  console.log('✅ Calendar route - Method:', req.method);
  console.log('✅ Calendar route - Query:', req.query);
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
  }

  try {
    const transactionsService = getTransactionsServiceConfig();
    // Ensure we're using the correct API URL format
    const baseUrl = transactionsService.apiUrl || (transactionsService.url + '/api/v1');
    const targetUrl = `${baseUrl}/appointments/calendar?startDate=${encodeURIComponent(startDate as string)}&endDate=${encodeURIComponent(endDate as string)}`;

    console.log('Calendar API - Target URL:', targetUrl); // Debug log
    console.log('Calendar API - Request headers:', Object.keys(req.headers)); // Debug log

    // Get auth header from request - check both authorization and Authorization
    // Next.js normalizes headers to lowercase, but check both to be safe
    const authHeader = req.headers.authorization || req.headers.Authorization || 
                      (req.headers as any).Authorization || (req.headers as any).authorization;
    
    console.log('Calendar API - Auth header present:', !!authHeader); // Debug log
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Always forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Calendar API - Forwarding auth header'); // Debug log
    } else {
      console.warn('Calendar API - No auth header found in request'); // Debug log
    }

    console.log('Calendar API - Final headers:', { ...headers, Authorization: authHeader ? 'Bearer ***' : 'none' }); // Debug log

    const response = await fetch(targetUrl, { headers });
    
    console.log('Calendar API - Response status:', response.status); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error from transactions service' }));
      console.error(`Proxy to Transactions Service (appointments/calendar) failed:`, response.status, errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Appointments Calendar API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred',
    });
  }
}

