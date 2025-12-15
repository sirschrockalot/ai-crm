import { NextApiRequest, NextApiResponse } from 'next';

interface CommunicationStats {
  totalSms: number;
  totalVoice: number;
  totalCost: number;
  successRate: number;
}

// Mock communication data (in a real app, this would come from a database)
const mockCommunications = [
  {
    id: '1',
    type: 'sms' as const,
    status: 'sent' as const,
    cost: 0.0075,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'sms' as const,
    status: 'delivered' as const,
    cost: 0.0075,
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    type: 'voice' as const,
    status: 'sent' as const,
    cost: 0.013,
    createdAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    type: 'sms' as const,
    status: 'failed' as const,
    cost: 0,
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    type: 'voice' as const,
    status: 'sent' as const,
    cost: 0.013,
    createdAt: new Date('2024-01-19'),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CommunicationStats | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Calculate stats from mock data
    // In production, this would query the database
    const smsCommunications = mockCommunications.filter(c => c.type === 'sms');
    const voiceCommunications = mockCommunications.filter(c => c.type === 'voice');
    
    const totalSms = smsCommunications.length;
    const totalVoice = voiceCommunications.length;
    
    const totalCost = mockCommunications.reduce((sum, c) => sum + (c.cost || 0), 0);
    
    const successful = mockCommunications.filter(
      c => c.status === 'sent' || c.status === 'delivered'
    ).length;
    const successRate = mockCommunications.length > 0 
      ? (successful / mockCommunications.length) * 100 
      : 0;

    const stats: CommunicationStats = {
      totalSms,
      totalVoice,
      totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

