import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Mock pending timesheets data
  const pendingTimesheets = [
    {
      _id: '1',
      userId: 'user1',
      userName: 'John Smith',
      weekEnding: '2024-01-14',
      totalHours: 38.5,
      billableHours: 35.0,
      status: 'pending',
      submittedAt: '2024-01-15T09:00:00Z',
      entries: [
        {
          date: '2024-01-08',
          project: 'Lead Management',
          hours: 8.0,
          billable: true,
        },
        {
          date: '2024-01-09',
          project: 'Client Communication',
          hours: 7.5,
          billable: true,
        },
        {
          date: '2024-01-10',
          project: 'Lead Management',
          hours: 8.0,
          billable: true,
        },
        {
          date: '2024-01-11',
          project: 'Documentation',
          hours: 7.0,
          billable: false,
        },
        {
          date: '2024-01-12',
          project: 'Lead Management',
          hours: 8.0,
          billable: true,
        },
      ],
    },
    {
      _id: '2',
      userId: 'user2',
      userName: 'Sarah Johnson',
      weekEnding: '2024-01-14',
      totalHours: 40.0,
      billableHours: 38.5,
      status: 'pending',
      submittedAt: '2024-01-15T08:30:00Z',
      entries: [
        {
          date: '2024-01-08',
          project: 'Lead Management',
          hours: 8.0,
          billable: true,
        },
        {
          date: '2024-01-09',
          project: 'Lead Management',
          hours: 8.0,
          billable: true,
        },
        {
          date: '2024-01-10',
          project: 'Client Communication',
          hours: 8.0,
          billable: true,
        },
        {
          date: '2024-01-11',
          project: 'Lead Management',
          hours: 8.0,
          billable: true,
        },
        {
          date: '2024-01-12',
          project: 'Training',
          hours: 8.0,
          billable: false,
        },
      ],
    },
  ];

  res.status(200).json(pendingTimesheets);
}
