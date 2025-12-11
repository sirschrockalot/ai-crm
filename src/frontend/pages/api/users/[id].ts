import { NextApiRequest, NextApiResponse } from 'next';
import { getUserManagementServiceConfig } from '../../../services/configService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'User id is required' });

  try {
    const userMgmt = getUserManagementServiceConfig();
    const targetUrl = `${userMgmt.url}/api/v1/users/${id}`;

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

    // For DELETE, don't attempt to JSON-parse; just pass through
    if (req.method === 'DELETE') {
      if (!response.ok) {
        return res.status(response.status).send(raw);
      }
      return res.status(response.status).end();
    }
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
    console.error('User API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
