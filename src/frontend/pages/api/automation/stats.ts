import type { NextApiRequest, NextApiResponse } from 'next';
import { mockAutomationService } from '../../../features/automation/services/mockAutomationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timeRangeParam = (req.query.timeRange as string) || 'week';
    const timeRange =
      timeRangeParam === 'today' ||
      timeRangeParam === 'week' ||
      timeRangeParam === 'month' ||
      timeRangeParam === 'year'
        ? timeRangeParam
        : 'week';

    const stats = await mockAutomationService.getAutomationStats(timeRange);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Automation stats API error:', error);
    return res.status(500).json({ error: 'Failed to load automation stats' });
  }
}


