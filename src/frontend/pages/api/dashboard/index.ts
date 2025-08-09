import { NextApiRequest, NextApiResponse } from 'next';

interface DashboardData {
  stats: {
    totalLeads: number;
    conversionRate: number;
    activeBuyers: number;
    revenue: number;
    leadGrowth: number;
    conversionGrowth: number;
    buyerGrowth: number;
    revenueGrowth: number;
  };
  leadPipelineData: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  monthlyGrowthData: Array<{
    name: string;
    value: number;
  }>;
  conversionTrendData: Array<{
    name: string;
    value: number;
  }>;
  revenueData: Array<{
    name: string;
    value: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'lead' | 'conversion' | 'workflow' | 'alert';
    message: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
  }>;
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    // Mock dashboard data
    const mockData: DashboardData = {
      stats: {
        totalLeads: 1234,
        conversionRate: 12.5,
        activeBuyers: 89,
        revenue: 45678,
        leadGrowth: 23.36,
        conversionGrowth: 5.2,
        buyerGrowth: -2.1,
        revenueGrowth: 18.7,
      },
      leadPipelineData: [
        { name: 'New Leads', value: 45, color: '#2196f3' },
        { name: 'Contacted', value: 32, color: '#ff9800' },
        { name: 'Qualified', value: 28, color: '#4caf50' },
        { name: 'Converted', value: 15, color: '#9c27b0' },
      ],
      monthlyGrowthData: [
        { name: 'Jan', value: 30 },
        { name: 'Feb', value: 45 },
        { name: 'Mar', value: 35 },
        { name: 'Apr', value: 60 },
        { name: 'May', value: 50 },
        { name: 'Jun', value: 75 },
      ],
      conversionTrendData: [
        { name: 'Jan', value: 8.5 },
        { name: 'Feb', value: 10.2 },
        { name: 'Mar', value: 12.1 },
        { name: 'Apr', value: 11.8 },
        { name: 'May', value: 13.5 },
        { name: 'Jun', value: 12.5 },
      ],
      revenueData: [
        { name: 'Jan', value: 25000 },
        { name: 'Feb', value: 32000 },
        { name: 'Mar', value: 28000 },
        { name: 'Apr', value: 45000 },
        { name: 'May', value: 38000 },
        { name: 'Jun', value: 52000 },
      ],
      recentActivity: [
        {
          id: '1',
          type: 'lead',
          message: 'New lead added: John Smith',
          timestamp: new Date(),
          priority: 'medium',
        },
        {
          id: '2',
          type: 'conversion',
          message: 'Lead converted: Sarah Johnson',
          timestamp: new Date(Date.now() - 3600000),
          priority: 'high',
        },
      ],
      alerts: [
        {
          id: '1',
          type: 'info',
          title: 'System Update',
          message: 'New features available in the dashboard',
          timestamp: new Date(),
          isRead: false,
        },
      ],
    };

    return res.status(200).json(mockData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
