import { NextApiRequest, NextApiResponse } from 'next';
import { Buyer } from '../../../types';

interface LocationSearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
}

interface LocationSearchResponse {
  buyers: Buyer[];
  total: number;
  searchParams: LocationSearchParams;
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
    buyBox: {
      zipCodes: ['60601', '60602', '60603'],
      states: ['IL'],
      cities: ['Chicago'],
    },
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
    buyBox: {
      zipCodes: ['62701', '62702'],
      states: ['IL', 'MO'],
      cities: ['Springfield', 'St. Louis'],
    },
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
    buyBox: {
      zipCodes: ['60540', '60541', '60542'],
      states: ['IL', 'WI'],
      cities: ['Naperville', 'Aurora', 'Milwaukee'],
    },
    notes: 'Experienced investor, looking for portfolio expansion',
    isActive: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

/**
 * Check if a buyer's buy box matches the search criteria
 */
function matchesBuyBox(
  buyer: Buyer,
  searchCity?: string,
  searchState?: string,
  searchZip?: string
): boolean {
  if (!buyer.buyBox) {
    // If buyer has no buy box, check their primary location
    if (searchCity && buyer.city.toLowerCase() !== searchCity.toLowerCase()) {
      return false;
    }
    if (searchState && buyer.state.toUpperCase() !== searchState.toUpperCase()) {
      return false;
    }
    if (searchZip && buyer.zipCode !== searchZip) {
      return false;
    }
    return true;
  }

  const { zipCodes, states, cities } = buyer.buyBox;

  // Check zip code match
  if (searchZip) {
    const normalizedSearchZip = searchZip.replace(/\D/g, '').substring(0, 5);
    const zipMatch = zipCodes.some(zip => {
      const normalizedZip = zip.replace(/\D/g, '').substring(0, 5);
      return normalizedZip === normalizedSearchZip;
    });
    if (!zipMatch) {
      return false;
    }
  }

  // Check state match
  if (searchState) {
    const normalizedSearchState = searchState.toUpperCase().substring(0, 2);
    const stateMatch = states.some(state => {
      const normalizedState = state.toUpperCase().substring(0, 2);
      return normalizedState === normalizedSearchState;
    });
    if (!stateMatch) {
      return false;
    }
  }

  // Check city match
  if (searchCity) {
    const normalizedSearchCity = searchCity.toLowerCase().trim();
    const cityMatch = cities.some(city => {
      const normalizedCity = city.toLowerCase().trim();
      return normalizedCity === normalizedSearchCity ||
             normalizedCity.includes(normalizedSearchCity) ||
             normalizedSearchCity.includes(normalizedCity);
    });
    if (!cityMatch) {
      return false;
    }
  }

  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationSearchResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, state, zipCode, address } = req.query;

    let searchCity: string | undefined;
    let searchState: string | undefined;
    let searchZip: string | undefined;

    // If address is provided, try to parse it
    if (address && typeof address === 'string') {
      // Simple address parsing (in production, use a geocoding service)
      const addressParts = address.split(',').map(p => p.trim());
      
      // Try to extract zip (usually last part with numbers)
      const zipMatch = address.match(/\b(\d{5}(?:-\d{4})?)\b/);
      if (zipMatch) {
        searchZip = zipMatch[1].replace(/\D/g, '').substring(0, 5);
      }

      // Try to extract state (2-letter code or full name)
      for (let i = addressParts.length - 1; i >= 0; i--) {
        const part = addressParts[i];
        if (/^[A-Z]{2}$/i.test(part)) {
          searchState = part.toUpperCase();
          if (i > 0) {
            searchCity = addressParts[i - 1];
          }
          break;
        }
      }
    }

    // Override with explicit parameters if provided
    if (city && typeof city === 'string') {
      searchCity = city.trim();
    }
    if (state && typeof state === 'string') {
      searchState = state.toUpperCase().substring(0, 2);
    }
    if (zipCode && typeof zipCode === 'string') {
      searchZip = zipCode.replace(/\D/g, '').substring(0, 5);
    }

    // Filter buyers based on buy box criteria
    const matchingBuyers = mockBuyers.filter(buyer => {
      // Only include active buyers
      if (!buyer.isActive) {
        return false;
      }

      return matchesBuyBox(buyer, searchCity, searchState, searchZip);
    });

    return res.status(200).json({
      buyers: matchingBuyers,
      total: matchingBuyers.length,
      searchParams: {
        city: searchCity,
        state: searchState,
        zipCode: searchZip,
        address: address as string | undefined,
      },
    });
  } catch (error) {
    console.error('Error searching buyers by location:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

