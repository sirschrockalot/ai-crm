import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query;
    const { action, comment, approverId } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Timesheet ID is required' });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Valid action is required (approve or reject)' });
    }

    // Mock approval/rejection response
    const result = {
      timesheetId: id,
      action,
      status: action === 'approve' ? 'approved' : 'rejected',
      approvedAt: new Date().toISOString(),
      approvedBy: approverId || 'manager1',
      comment: comment || '',
      message: `Timesheet ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    };

    res.status(200).json(result);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
