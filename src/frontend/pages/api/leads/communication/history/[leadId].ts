import { NextApiRequest, NextApiResponse } from 'next';

interface CommunicationLog {
  id: string;
  leadId?: string;
  userId: string;
  tenantId: string;
  type: 'sms' | 'voice' | 'email';
  direction: 'outbound' | 'inbound';
  to: string;
  from: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  messageId?: string;
  cost?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock communication history (in a real app, this would come from a database)
const mockHistory: CommunicationLog[] = [
  {
    id: '1',
    leadId: 'lead-1',
    userId: 'user-1',
    tenantId: 'default',
    type: 'sms',
    direction: 'outbound',
    to: '+15551234567',
    from: '+15559876543',
    content: 'Hi, we are interested in your property. Please call us back.',
    status: 'delivered',
    messageId: 'msg-123',
    cost: 0.0075,
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:05'),
  },
  {
    id: '2',
    leadId: 'lead-1',
    userId: 'user-1',
    tenantId: 'default',
    type: 'voice',
    direction: 'outbound',
    to: '+15551234567',
    from: '+15559876543',
    content: 'Voice call - 5 minutes',
    status: 'sent',
    messageId: 'call-456',
    cost: 0.013,
    createdAt: new Date('2024-01-16T14:20:00'),
    updatedAt: new Date('2024-01-16T14:25:00'),
  },
  {
    id: '3',
    leadId: 'lead-1',
    userId: 'user-1',
    tenantId: 'default',
    type: 'sms',
    direction: 'inbound',
    to: '+15559876543',
    from: '+15551234567',
    content: 'Thanks for reaching out. When can we schedule a viewing?',
    status: 'delivered',
    messageId: 'msg-789',
    cost: 0,
    createdAt: new Date('2024-01-17T09:15:00'),
    updatedAt: new Date('2024-01-17T09:15:02'),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommunicationLog[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadId } = req.query;

    if (!leadId || typeof leadId !== 'string') {
      return res.status(400).json({ error: 'Lead ID is required' });
    }

    // Filter history by leadId
    // In production, this would query the database
    const history = mockHistory.filter(log => log.leadId === leadId);

    // Sort by most recent first
    history.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching communication history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

