import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Mock timesheets data
    const timesheets = [
      {
        _id: '1',
        userId: 'user1',
        userName: 'John Smith',
        weekEnding: '2024-01-07',
        totalHours: 40.0,
        billableHours: 36.0,
        status: 'approved',
        approvedAt: '2024-01-08T10:00:00Z',
        approvedBy: 'manager1',
        entries: [
          {
            date: '2024-01-01',
            project: 'Lead Management',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-02',
            project: 'Lead Management',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-03',
            project: 'Client Communication',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-04',
            project: 'Lead Management',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-05',
            project: 'Training',
            hours: 8.0,
            billable: false,
          },
        ],
      },
      {
        _id: '2',
        userId: 'user2',
        userName: 'Sarah Johnson',
        weekEnding: '2024-01-07',
        totalHours: 38.5,
        billableHours: 35.5,
        status: 'approved',
        approvedAt: '2024-01-08T09:30:00Z',
        approvedBy: 'manager1',
        entries: [
          {
            date: '2024-01-01',
            project: 'Lead Management',
            hours: 7.5,
            billable: true,
          },
          {
            date: '2024-01-02',
            project: 'Lead Management',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-03',
            project: 'Client Communication',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-04',
            project: 'Lead Management',
            hours: 8.0,
            billable: true,
          },
          {
            date: '2024-01-05',
            project: 'Documentation',
            hours: 7.0,
            billable: false,
          },
        ],
      },
    ];

    res.status(200).json(timesheets);
  } else if (req.method === 'POST') {
    // Mock creating a new timesheet
    const newTimesheet = {
      _id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    res.status(201).json(newTimesheet);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
