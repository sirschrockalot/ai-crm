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

interface SearchFilters {
  query?: string;
  buyerType?: string;
  investmentRange?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  preferredPropertyTypes?: string[];
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
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ buyers: Buyer[]; total: number; page: number; limit: number } | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      query = '',
      buyerType,
      investmentRange,
      city,
      state,
      isActive,
      preferredPropertyTypes,
      page = '1',
      limit = '20',
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Apply filters
    let filteredBuyers = mockBuyers.filter(buyer => {
      // Text search
      if (query && typeof query === 'string') {
        const searchQuery = query.toLowerCase();
        const matchesSearch = 
          buyer.companyName.toLowerCase().includes(searchQuery) ||
          buyer.contactName.toLowerCase().includes(searchQuery) ||
          buyer.email.toLowerCase().includes(searchQuery) ||
          buyer.city.toLowerCase().includes(searchQuery) ||
          buyer.state.toLowerCase().includes(searchQuery) ||
          buyer.notes?.toLowerCase().includes(searchQuery);
        
        if (!matchesSearch) return false;
      }

      // Buyer type filter
      if (buyerType && buyer.buyerType !== buyerType) {
        return false;
      }

      // Investment range filter
      if (investmentRange && buyer.investmentRange !== investmentRange) {
        return false;
      }

      // City filter
      if (city && buyer.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }

      // State filter
      if (state && buyer.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }

      // Active status filter
      if (isActive !== undefined) {
        const isActiveBool = isActive === 'true';
        if (buyer.isActive !== isActiveBool) {
          return false;
        }
      }

      // Preferred property types filter
      if (preferredPropertyTypes && Array.isArray(preferredPropertyTypes)) {
        const hasMatchingPropertyType = preferredPropertyTypes.some(type => 
          buyer.preferredPropertyTypes.includes(type)
        );
        if (!hasMatchingPropertyType) {
          return false;
        }
      }

      return true;
    });

    // Sort by company name
    filteredBuyers.sort((a, b) => a.companyName.localeCompare(b.companyName));

    // Apply pagination
    const total = filteredBuyers.length;
    const paginatedBuyers = filteredBuyers.slice(offset, offset + limitNum);

    return res.status(200).json({
      buyers: paginatedBuyers,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error('Error searching buyers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
