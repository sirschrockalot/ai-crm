import { NextApiRequest, NextApiResponse } from 'next';
import { getTransactionsServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const transactionsService = getTransactionsServiceConfig();
    const queryString = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${transactionsService.apiUrl}/tasks${queryString}`;

    const hasBody = req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
      },
      ...(hasBody ? { body: JSON.stringify(req.body) } : {}),
    });

    if (response.status === 204) {
      return res.status(204).end();
    }

    const raw = await response.text();
    let maybeJson: any = {};
    if (raw) {
      try {
        maybeJson = JSON.parse(raw);
      } catch {
        maybeJson = { message: raw };
      }
    }

    if (!response.ok) {
      console.error(`Proxy to Transactions Service (tasks) failed for ${req.method} ${targetUrl}:`, response.status, maybeJson);
      return res.status(response.status).json(maybeJson);
    }

    return res.status(response.status).json(maybeJson);
  } catch (error: any) {
    console.error('Tasks API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

