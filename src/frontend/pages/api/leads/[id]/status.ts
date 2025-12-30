import { NextApiRequest, NextApiResponse } from 'next';
import { StatusChangeHistory, LeadStatus } from '../../../../types';

// In-memory store for status change history (in production, this would be a database)
const statusHistoryStore: Map<string, StatusChangeHistory[]> = new Map();

// Initialize with some mock history for existing leads
const initializeMockStatusHistory = () => {
  if (statusHistoryStore.size === 0) {
    // Mock status history for lead ID '1'
    statusHistoryStore.set('1', [
      {
        id: 'status-1-1',
        leadId: '1',
        oldStatus: 'new',
        newStatus: 'contacted',
        reason: 'Initial contact made via phone call. Owner expressed interest in selling.',
        changedBy: 'Sarah Johnson',
        changedById: 'user-1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: 'status-1-2',
        leadId: '1',
        oldStatus: 'contacted',
        newStatus: 'qualified',
        reason: 'Property meets our criteria. Owner is motivated and timeline aligns with our needs.',
        changedBy: 'Mike Rodriguez',
        changedById: 'user-2',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ]);
  }
};

initializeMockStatusHistory();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusChangeHistory[] | StatusChangeHistory | { error: string }>
) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  // Basic authentication check, with bypass for development
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  if (!bypassAuth) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  switch (req.method) {
    case 'GET':
      // Get all status change history for a lead
      const history = statusHistoryStore.get(leadId) || [];
      // Sort by createdAt descending (newest first)
      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return res.status(200).json(sortedHistory);

    case 'POST':
      // Create a new status change
      const { oldStatus, newStatus, reason, changedBy, changedById } = req.body;

      if (!oldStatus || !newStatus) {
        return res.status(400).json({ error: 'Old status and new status are required' });
      }

      if (!reason || !reason.trim()) {
        return res.status(400).json({ error: 'Reason for status change is required' });
      }

      if (!changedBy) {
        return res.status(400).json({ error: 'Changed by is required' });
      }

      const newStatusChange: StatusChangeHistory = {
        id: `status-${leadId}-${Date.now()}`,
        leadId,
        oldStatus: oldStatus as LeadStatus,
        newStatus: newStatus as LeadStatus,
        reason: reason.trim(),
        changedBy: changedBy || 'Unknown User',
        changedById: changedById || 'unknown',
        createdAt: new Date(),
      };

      const existingHistory = statusHistoryStore.get(leadId) || [];
      existingHistory.push(newStatusChange);
      statusHistoryStore.set(leadId, existingHistory);

      return res.status(201).json(newStatusChange);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

