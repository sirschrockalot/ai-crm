import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Mock team analytics data
  const teamAnalytics = {
    totalTeamHours: 165.5,
    averageHoursPerPerson: 8.3,
    billableHoursPercentage: 87.2,
    topPerformers: [
      {
        userId: 'user1',
        userName: 'John Smith',
        totalHours: 42.5,
        billableHours: 38.0,
        efficiency: 89.4,
      },
      {
        userId: 'user2',
        userName: 'Sarah Johnson',
        totalHours: 40.0,
        billableHours: 36.5,
        efficiency: 91.3,
      },
      {
        userId: 'user3',
        userName: 'Mike Davis',
        totalHours: 38.0,
        billableHours: 34.5,
        efficiency: 90.8,
      },
    ],
    projectBreakdown: [
      {
        project: 'Lead Management',
        totalHours: 65.0,
        billableHours: 62.0,
        teamMembers: 3,
        efficiency: 95.4,
      },
      {
        project: 'Client Communication',
        totalHours: 45.5,
        billableHours: 42.0,
        teamMembers: 2,
        efficiency: 92.3,
      },
      {
        project: 'Documentation',
        totalHours: 25.0,
        billableHours: 20.0,
        teamMembers: 2,
        efficiency: 80.0,
      },
      {
        project: 'Training',
        totalHours: 30.0,
        billableHours: 0.0,
        teamMembers: 3,
        efficiency: 0.0,
      },
    ],
    weeklyTrend: [
      {
        week: '2024-01-01',
        totalHours: 82.5,
        billableHours: 72.0,
        teamSize: 3,
      },
      {
        week: '2024-01-08',
        totalHours: 83.0,
        billableHours: 73.5,
        teamSize: 3,
      },
    ],
  };

  res.status(200).json(teamAnalytics);
}
