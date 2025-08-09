import { NextApiRequest, NextApiResponse } from 'next';

interface MockLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  estimatedValue: number;
  status: string;
  assignedTo: string;
  notes: string;
  source: string;
  company: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MockStage {
  id: string;
  name: string;
  order: number;
  color: string;
  leads: MockLead[];
}

// Mock pipeline data
const mockStages: MockStage[] = [
  {
    id: 'stage-1',
    name: 'New',
    order: 1,
    color: 'blue',
    leads: [],
  },
  {
    id: 'stage-2',
    name: 'Contacted',
    order: 2,
    color: 'yellow',
    leads: [],
  },
  {
    id: 'stage-3',
    name: 'Qualified',
    order: 3,
    color: 'orange',
    leads: [],
  },
  {
    id: 'stage-4',
    name: 'Converted',
    order: 4,
    color: 'green',
    leads: [],
  },
  {
    id: 'stage-5',
    name: 'Lost',
    order: 5,
    color: 'red',
    leads: [],
  },
];

const mockLeads: MockLead[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St',
    propertyAddress: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    propertyType: 'single_family',
    estimatedValue: 450000,
    status: 'new',
    assignedTo: 'agent-1',
    notes: 'Interested in quick sale',
    source: 'website',
    company: 'ABC Realty',
    score: 85,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave',
    propertyAddress: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    propertyType: 'multi_family',
    estimatedValue: 750000,
    status: 'contacted',
    assignedTo: 'agent-2',
    notes: 'Follow up scheduled',
    source: 'referral',
    company: 'XYZ Properties',
    score: 72,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '(555) 456-7890',
    address: '789 Pine St',
    propertyAddress: '789 Pine St',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    propertyType: 'commercial',
    estimatedValue: 1200000,
    status: 'qualified',
    assignedTo: 'agent-1',
    notes: 'High priority lead',
    source: 'cold_call',
    company: 'Commercial Real Estate LLC',
    score: 95,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
  },
];

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
  res: NextApiResponse
) {
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (req.method === 'GET') {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.status(200).json({
        stages: mockStages,
        leads: mockLeads,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch pipeline data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
