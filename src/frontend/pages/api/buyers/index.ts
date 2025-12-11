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
  buyBox?: {
    zipCodes: string[];
    states: string[];
    cities: string[];
  };
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buyer[] | Buyer | { error: string }>
) {
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (req.method === 'GET') {
    try {
      // Mock buyers data
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
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
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
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
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
          createdAt: new Date('2024-01-25'),
          updatedAt: new Date('2024-01-25'),
        },
      ];

      // Apply filters if provided
      let filteredBuyers = mockBuyers;
      const { buyerType, investmentRange, city, state, isActive, search } = req.query;

      if (buyerType && buyerType !== 'all') {
        filteredBuyers = filteredBuyers.filter(buyer => buyer.buyerType === buyerType);
      }

      if (investmentRange && investmentRange !== 'all') {
        filteredBuyers = filteredBuyers.filter(buyer => buyer.investmentRange === investmentRange);
      }

      if (city) {
        filteredBuyers = filteredBuyers.filter(buyer => 
          buyer.city.toLowerCase().includes(city.toString().toLowerCase())
        );
      }

      if (state) {
        filteredBuyers = filteredBuyers.filter(buyer => 
          buyer.state.toLowerCase().includes(state.toString().toLowerCase())
        );
      }

      if (isActive !== undefined && isActive !== 'all') {
        const activeFilter = isActive === 'true';
        filteredBuyers = filteredBuyers.filter(buyer => buyer.isActive === activeFilter);
      }

      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredBuyers = filteredBuyers.filter(buyer =>
          buyer.companyName.toLowerCase().includes(searchTerm) ||
          buyer.contactName.toLowerCase().includes(searchTerm) ||
          buyer.email.toLowerCase().includes(searchTerm) ||
          buyer.phone.includes(searchTerm)
        );
      }

      return res.status(200).json(filteredBuyers);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const buyerData = req.body;
      
      // Validate required fields
      if (!buyerData.companyName || !buyerData.contactName || !buyerData.email || !buyerData.phone) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create new buyer
      const newBuyer: Buyer = {
        id: Date.now().toString(),
        ...buyerData,
        isActive: buyerData.isActive !== undefined ? buyerData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return res.status(201).json(newBuyer);
    } catch (error) {
      console.error('Error creating buyer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
