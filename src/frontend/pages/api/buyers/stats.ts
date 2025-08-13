import { NextApiRequest, NextApiResponse } from 'next';

interface Buyer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  buyerType: 'individual' | 'company' | 'investor';
  investmentRange: '0-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k+';
  preferredPropertyTypes: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BuyerStats {
  totalBuyers: number;
  activeBuyers: number;
  inactiveBuyers: number;
  buyerTypeDistribution: {
    individual: number;
    company: number;
    investor: number;
  };
  investmentRangeDistribution: {
    '0-50k': number;
    '50k-100k': number;
    '100k-250k': number;
    '250k-500k': number;
    '500k+': number;
  };
  topCities: Array<{
    city: string;
    state: string;
    count: number;
  }>;
  topStates: Array<{
    state: string;
    count: number;
  }>;
  preferredPropertyTypes: Array<{
    type: string;
    count: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    count: number;
  }>;
  averageBuyerValue: number;
  recentActivity: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
}

// Mock buyers data (in a real app, this would come from a database)
const mockBuyers: Buyer[] = [
  {
    id: '1',
    companyName: 'ABC Investment Group',
    contactName: 'Michael Johnson',
    email: 'michael.johnson@abcgroup.com',
    phone: '(555) 123-4567',
    address: '123 Business Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    buyerType: 'company',
    investmentRange: '250k-500k',
    preferredPropertyTypes: ['single_family', 'multi_family'],
    notes: 'Looking for distressed properties in Chicago area',
    isActive: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    companyName: 'Individual Investor',
    contactName: 'Sarah Williams',
    email: 'sarah.williams@email.com',
    phone: '(555) 987-6543',
    address: '456 Personal St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    buyerType: 'individual',
    investmentRange: '100k-250k',
    preferredPropertyTypes: ['single_family'],
    notes: 'First-time investor, prefers turnkey properties',
    isActive: true,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: '3',
    companyName: 'Real Estate Partners LLC',
    contactName: 'David Chen',
    email: 'david.chen@repartners.com',
    phone: '(555) 456-7890',
    address: '789 Corporate Blvd',
    city: 'Naperville',
    state: 'IL',
    zipCode: '60540',
    buyerType: 'investor',
    investmentRange: '500k+',
    preferredPropertyTypes: ['multi_family', 'commercial'],
    notes: 'Experienced investor, looking for portfolio expansion',
    isActive: true,
    createdAt: '2024-01-25T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z',
  },
  {
    id: '4',
    companyName: 'First Time Home Buyers Inc',
    contactName: 'Jennifer Martinez',
    email: 'jennifer.martinez@fthb.com',
    phone: '(555) 234-5678',
    address: '321 Starter Lane',
    city: 'Peoria',
    state: 'IL',
    zipCode: '61601',
    buyerType: 'individual',
    investmentRange: '0-50k',
    preferredPropertyTypes: ['single_family', 'condo'],
    notes: 'Looking for starter homes in good condition',
    isActive: true,
    createdAt: '2024-01-30T00:00:00.000Z',
    updatedAt: '2024-01-30T00:00:00.000Z',
  },
  {
    id: '5',
    companyName: 'Commercial Properties LLC',
    contactName: 'Robert Thompson',
    email: 'robert.thompson@commercial.com',
    phone: '(555) 345-6789',
    address: '654 Business Park',
    city: 'Rockford',
    state: 'IL',
    zipCode: '61101',
    buyerType: 'company',
    investmentRange: '500k+',
    preferredPropertyTypes: ['commercial', 'industrial'],
    notes: 'Focusing on commercial and industrial properties',
    isActive: true,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: '6',
    companyName: 'Retirement Investors Group',
    contactName: 'Patricia Brown',
    email: 'patricia.brown@retirement.com',
    phone: '(555) 567-8901',
    address: '987 Senior Circle',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60602',
    buyerType: 'individual',
    investmentRange: '100k-250k',
    preferredPropertyTypes: ['single_family', 'condo'],
    notes: 'Retirement planning, looking for stable investments',
    isActive: false,
    createdAt: '2024-02-05T00:00:00.000Z',
    updatedAt: '2024-02-05T00:00:00.000Z',
  },
  {
    id: '7',
    companyName: 'Student Housing LLC',
    contactName: 'Mark Davis',
    email: 'mark.davis@studenthousing.com',
    phone: '(555) 678-9012',
    address: '456 Campus Drive',
    city: 'Champaign',
    state: 'IL',
    zipCode: '61820',
    buyerType: 'company',
    investmentRange: '250k-500k',
    preferredPropertyTypes: ['multi_family', 'student_housing'],
    notes: 'Specializing in student housing near universities',
    isActive: true,
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2024-02-10T00:00:00.000Z',
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BuyerStats | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = calculateBuyerStats(mockBuyers);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error calculating buyer stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function calculateBuyerStats(buyers: Buyer[]): BuyerStats {
  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter(b => b.isActive).length;
  const inactiveBuyers = totalBuyers - activeBuyers;

  // Buyer type distribution
  const buyerTypeDistribution = {
    individual: buyers.filter(b => b.buyerType === 'individual').length,
    company: buyers.filter(b => b.buyerType === 'company').length,
    investor: buyers.filter(b => b.buyerType === 'investor').length,
  };

  // Investment range distribution
  const investmentRangeDistribution = {
    '0-50k': buyers.filter(b => b.investmentRange === '0-50k').length,
    '50k-100k': buyers.filter(b => b.investmentRange === '50k-100k').length,
    '100k-250k': buyers.filter(b => b.investmentRange === '100k-250k').length,
    '250k-500k': buyers.filter(b => b.investmentRange === '250k-500k').length,
    '500k+': buyers.filter(b => b.investmentRange === '500k+').length,
  };

  // Top cities
  const cityCounts: { [key: string]: number } = {};
  buyers.forEach(buyer => {
    const cityKey = `${buyer.city}, ${buyer.state}`;
    cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1;
  });

  const topCities = Object.entries(cityCounts)
    .map(([city, count]) => {
      const [cityName, state] = city.split(', ');
      return { city: cityName, state, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top states
  const stateCounts: { [key: string]: number } = {};
  buyers.forEach(buyer => {
    stateCounts[buyer.state] = (stateCounts[buyer.state] || 0) + 1;
  });

  const topStates = Object.entries(stateCounts)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Preferred property types
  const propertyTypeCounts: { [key: string]: number } = {};
  buyers.forEach(buyer => {
    buyer.preferredPropertyTypes.forEach(type => {
      propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
    });
  });

  const preferredPropertyTypes = Object.entries(propertyTypeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Monthly growth (mock data for demonstration)
  const monthlyGrowth = [
    { month: 'Jan 2024', count: 2 },
    { month: 'Feb 2024', count: 5 },
    { month: 'Mar 2024', count: 7 },
  ];

  // Average buyer value (mock calculation)
  const averageBuyerValue = 250000; // Mock average investment amount

  // Recent activity
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const recentActivity = {
    last7Days: buyers.filter(b => new Date(b.createdAt) >= last7Days).length,
    last30Days: buyers.filter(b => new Date(b.createdAt) >= last30Days).length,
    last90Days: buyers.filter(b => new Date(b.createdAt) >= last90Days).length,
  };

  return {
    totalBuyers,
    activeBuyers,
    inactiveBuyers,
    buyerTypeDistribution,
    investmentRangeDistribution,
    topCities,
    topStates,
    preferredPropertyTypes,
    monthlyGrowth,
    averageBuyerValue,
    recentActivity,
  };
}
