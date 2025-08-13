import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { limit = '10' } = req.query;
    
    // Mock time entries data
    const entries = [
      {
        _id: '1',
        date: '2024-01-15',
        project: 'Lead Management',
        task: 'Follow up with hot leads',
        hours: 2.5,
        billable: true,
        description: 'Called 15 leads, 3 showed interest',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
      {
        _id: '2',
        date: '2024-01-15',
        project: 'Client Communication',
        task: 'Email correspondence',
        hours: 1.0,
        billable: true,
        description: 'Responded to client inquiries',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
      {
        _id: '3',
        date: '2024-01-15',
        project: 'Documentation',
        task: 'Update lead tracking system',
        hours: 1.5,
        billable: false,
        description: 'Internal system maintenance',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
      {
        _id: '4',
        date: '2024-01-14',
        project: 'Lead Management',
        task: 'Cold calling campaign',
        hours: 4.0,
        billable: true,
        description: 'Called 50 prospects, 5 appointments set',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
      {
        _id: '5',
        date: '2024-01-14',
        project: 'Training',
        task: 'Sales technique workshop',
        hours: 2.0,
        billable: false,
        description: 'Attended sales training session',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
    ];

    const limitedEntries = entries.slice(0, parseInt(limit as string));
    res.status(200).json(limitedEntries);
  } else if (req.method === 'POST') {
    // Mock creating a new entry
    const newEntry = {
      _id: Date.now().toString(),
      ...req.body,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    res.status(201).json(newEntry);
  } else if (req.method === 'PUT') {
    // Mock updating an entry
    const updatedEntry = {
      ...req.body,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(updatedEntry);
  } else if (req.method === 'DELETE') {
    // Mock deleting an entry
    res.status(200).json({ message: 'Entry deleted successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
