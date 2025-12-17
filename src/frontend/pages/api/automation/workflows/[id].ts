import type { NextApiRequest, NextApiResponse } from 'next';
import { mockAutomationService } from '../../../../features/automation/services/mockAutomationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid workflow id' });
  }

  try {
    if (req.method === 'GET') {
      const workflow = await mockAutomationService.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      return res.status(200).json(workflow);
    }

    if (req.method === 'PUT') {
      const updates = req.body || {};
      const updated = await mockAutomationService.updateWorkflow(id, updates);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await mockAutomationService.deleteWorkflow(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Automation workflow detail API error:', error);
    return res.status(500).json({ error: 'Failed to handle workflow request' });
  }
}


