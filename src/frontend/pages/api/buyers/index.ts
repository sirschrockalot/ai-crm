import { NextApiRequest, NextApiResponse } from 'next';

// Buyers Service configuration
const BUYERS_SERVICE_API_URL =
  process.env.BUYERS_SERVICE_API_URL ||
  process.env.NEXT_PUBLIC_BUYERS_SERVICE_API_URL ||
  'http://localhost:3006/api/buyers';

// Simple rate limiting (disabled in development)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 1000; // requests per minute (increased for development)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  // Disable rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
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
  // Rate limiting (only in production)
  if (process.env.NODE_ENV !== 'development') {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp as string)) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  }

  if (req.method === 'GET') {
    try {
      // Build query string for Buyers Service
      const url = new URL(BUYERS_SERVICE_API_URL);
      const { buyerType, investmentRange, city, state, isActive, search } = req.query;

      if (buyerType && buyerType !== 'all') url.searchParams.set('buyerType', String(buyerType));
      if (investmentRange && investmentRange !== 'all') url.searchParams.set('investmentRange', String(investmentRange));
      if (city) url.searchParams.set('city', String(city));
      if (state) url.searchParams.set('state', String(state));
      if (isActive !== undefined && isActive !== 'all') url.searchParams.set('isActive', String(isActive));
      if (search) url.searchParams.set('search', String(search));

      try {
        // Try to fetch buyers from Buyers Service first
        const serviceResponse = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers.authorization && { Authorization: req.headers.authorization as string }),
          },
        });

        if (serviceResponse.ok) {
          const serviceBuyers = await serviceResponse.json();

          // Map Buyers Service schema into frontend Buyer shape
          const mapped: Buyer[] = (serviceBuyers || []).map((b: any): Buyer => ({
            id: b.id || b._id || '',
            companyName: b.company || b.name || '',
            contactName: b.name || b.company || '',
            email: b.email || '',
            phone: b.phone || '',
            address: b.address || '',
            city: b.city || '',
            state: b.state || '',
            zipCode: b.zipCode || b.postalCode || '',
            buyerType: (b.buyerType || 'investor') as Buyer['buyerType'],
            investmentRange: (b.investmentRange || '100k-250k') as Buyer['investmentRange'],
            preferredPropertyTypes: b.property_types || b.preferredPropertyTypes || ['single_family'],
            buyBox: b.buyBox || undefined,
            notes: b.notes || '',
            isActive: b.is_active ?? b.isActive ?? true,
            createdAt: b.created_at ? new Date(b.created_at) : new Date(),
            updatedAt: b.updated_at ? new Date(b.updated_at) : new Date(),
          }));

          return res.status(200).json(mapped);
        } else {
          console.warn('Buyers Service returned non-OK status, falling back to mock buyers:', serviceResponse.status);
        }
      } catch (serviceError) {
        console.warn('Buyers Service unavailable, falling back to mock buyers:', serviceError);
      }

      // Fallback: in-memory mock buyers if service/DB is not available
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
