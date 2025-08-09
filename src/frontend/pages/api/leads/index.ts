import { NextApiRequest, NextApiResponse } from 'next';

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

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyAddress?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single_family' | 'multi_family' | 'commercial' | 'land';
  estimatedValue: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  notes?: string;
  source?: string;
  company?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Lead[] | Lead | { error: string }>
) {
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (req.method === 'GET') {
    try {
      // Mock leads data
      const mockLeads: Lead[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          address: '123 Main St',
          propertyAddress: '456 Oak Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          propertyType: 'single_family',
          estimatedValue: 250000,
          status: 'new',
          assignedTo: 'admin@dealcycle.com',
          notes: 'Interested in selling quickly',
          source: 'Website',
          company: 'Smith Real Estate',
          score: 85,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 987-6543',
          address: '789 Elm St',
          propertyAddress: '321 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          propertyType: 'multi_family',
          estimatedValue: 450000,
          status: 'contacted',
          assignedTo: 'admin@dealcycle.com',
          notes: 'Looking for cash offer',
          source: 'Referral',
          company: 'Johnson Properties',
          score: 92,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-12'),
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Davis',
          email: 'mike.davis@email.com',
          phone: '(555) 456-7890',
          address: '456 Maple Dr',
          propertyAddress: '789 Cedar Ln',
          city: 'Peoria',
          state: 'IL',
          zipCode: '61601',
          propertyType: 'commercial',
          estimatedValue: 750000,
          status: 'qualified',
          assignedTo: 'admin@dealcycle.com',
          notes: 'Commercial property, needs renovation',
          source: 'Cold Call',
          company: 'Davis Investments',
          score: 78,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-08'),
        },
      ];

      return res.status(200).json(mockLeads);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const newLead = req.body as Lead;
      // Mock creating a new lead
      const createdLead: Lead = {
        ...newLead,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return res.status(201).json(createdLead);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
