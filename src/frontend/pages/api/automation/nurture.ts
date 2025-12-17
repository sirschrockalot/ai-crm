import type { NextApiRequest, NextApiResponse } from 'next';
import { getNurtureConfig, updateNurtureConfig } from '../../../features/automation/services/nurtureMockStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // All nurture API calls require authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const config = getNurtureConfig();
    return res.status(200).json(config);
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    try {
      const body = req.body || {};
      const updated = updateNurtureConfig(body);
      return res.status(200).json(updated);
    } catch (error) {
      console.error('Failed to update nurture config:', error);
      return res.status(500).json({ error: 'Failed to update nurture config' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


