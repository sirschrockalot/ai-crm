import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { format = 'csv', startDate, endDate } = req.query;

  // Mock export data
  const exportData = {
    format,
    startDate: startDate || '2024-01-01',
    endDate: endDate || '2024-01-31',
    totalRecords: 150,
    downloadUrl: `/api/time-tracking/export/download?format=${format}&startDate=${startDate}&endDate=${endDate}`,
    generatedAt: new Date().toISOString(),
    summary: {
      totalHours: 320.5,
      billableHours: 285.0,
      nonBillableHours: 35.5,
      totalProjects: 8,
      totalUsers: 5,
    },
  };

  res.status(200).json(exportData);
}
