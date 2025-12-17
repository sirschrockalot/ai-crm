import type { NextApiRequest, NextApiResponse } from 'next';
import { mockAutomationService } from '../../../features/automation/services/mockAutomationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      // Optional filters: status, category, search
      const { status, category, search } = req.query;
      const filters: any = {};
      if (typeof status === 'string') filters.status = status;
      if (typeof category === 'string') filters.category = category;
      if (typeof search === 'string') filters.search = search;

      const workflows = await mockAutomationService.getWorkflows(
        Object.keys(filters).length ? filters : undefined,
      );
      return res.status(200).json(workflows);
    }

    if (req.method === 'POST') {
      const workflow = req.body;
      const created = await mockAutomationService.createWorkflow(workflow);
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Automation workflows API error:', error);
    return res.status(500).json({ error: 'Failed to handle workflows request' });
  }
}


