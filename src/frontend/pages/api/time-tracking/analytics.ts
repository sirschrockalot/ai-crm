import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Mock analytics data
  const analyticsData = {
    totalHours: 42.5,
    billableHours: 38.0,
    nonBillableHours: 4.5,
    averageHoursPerDay: 8.5,
    weeklyTrend: [
      { day: 'Monday', hours: 8.0, billable: 7.5 },
      { day: 'Tuesday', hours: 8.5, billable: 8.0 },
      { day: 'Wednesday', hours: 9.0, billable: 8.5 },
      { day: 'Thursday', hours: 8.0, billable: 7.5 },
      { day: 'Friday', hours: 9.0, billable: 6.5 },
    ],
    projectBreakdown: [
      { project: 'Lead Management', hours: 15.0, percentage: 35.3 },
      { project: 'Client Communication', hours: 12.5, percentage: 29.4 },
      { project: 'Documentation', hours: 8.0, percentage: 18.8 },
      { project: 'Training', hours: 4.5, percentage: 10.6 },
      { project: 'Admin Tasks', hours: 2.5, percentage: 5.9 },
    ],
  };

  res.status(200).json(analyticsData);
}
