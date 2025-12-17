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
    const category = (req.query.category as string) || undefined;
    const templates = await mockAutomationService.getWorkflowTemplates(category);
    return res.status(200).json(templates);
  } catch (error) {
    console.error('Automation templates API error:', error);
    return res.status(500).json({ error: 'Failed to load automation templates' });
  }
}


