import { NextApiRequest, NextApiResponse } from 'next';
import { getUserManagementServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userMgmt = getUserManagementServiceConfig();
    const qs = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${userMgmt.url}/api/v1/users${qs}`;

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
      return res.status(response.status).json(maybeJson);
    }

    return res.status(response.status).json(maybeJson);
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
