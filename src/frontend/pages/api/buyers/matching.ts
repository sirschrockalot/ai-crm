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

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'distressed';
  features: string[];
  description: string;
  isAvailable: boolean;
  createdAt: string;
}

interface MatchingCriteria {
  buyerId?: string;
  propertyType?: string;
  maxPrice?: number;
  minPrice?: number;
  city?: string;
  state?: string;
  condition?: string;
  bedrooms?: number;
  bathrooms?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
}

interface MatchResult {
  buyer: Buyer;
  property: Property;
  matchScore: number;
  matchReasons: string[];
  estimatedInterest: 'high' | 'medium' | 'low';
}

interface MatchingResponse {
  success: boolean;
  matches: MatchResult[];
  totalMatches: number;
  message?: string;
}

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
];

// Mock properties data
const mockProperties: Property[] = [
  {
    id: '1',
    address: '123 Oak Street',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    propertyType: 'single_family',
    price: 350000,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    condition: 'distressed',
    features: ['garage', 'basement', 'fireplace'],
    description: 'Distressed single-family home in need of renovation',
    isAvailable: true,
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    address: '456 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    propertyType: 'single_family',
    price: 180000,
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 1200,
    condition: 'good',
    features: ['deck', 'storage'],
    description: 'Well-maintained starter home, move-in ready',
    isAvailable: true,
    createdAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: '3',
    address: '789 Pine Street',
    city: 'Naperville',
    state: 'IL',
    zipCode: '60540',
    propertyType: 'multi_family',
    price: 750000,
    bedrooms: 8,
    bathrooms: 4,
    squareFootage: 3200,
    condition: 'excellent',
    features: ['parking', 'laundry', 'storage'],
    description: 'Beautiful duplex with rental potential',
    isAvailable: true,
    createdAt: '2024-01-25T00:00:00.000Z',
  },
  {
    id: '4',
    address: '321 Elm Court',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60602',
    propertyType: 'condo',
    price: 120000,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 800,
    condition: 'fair',
    features: ['elevator', 'doorman'],
    description: 'Affordable condo in downtown area',
    isAvailable: true,
    createdAt: '2024-01-30T00:00:00.000Z',
  },
  {
    id: '5',
    address: '654 Business Park',
    city: 'Rockford',
    state: 'IL',
    zipCode: '61101',
    propertyType: 'commercial',
    price: 1200000,
    bedrooms: 0,
    bathrooms: 2,
    squareFootage: 5000,
    condition: 'excellent',
    features: ['parking', 'loading dock', 'office space'],
    description: 'Prime commercial property with excellent location',
    isAvailable: true,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchingResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const criteria: MatchingCriteria = req.body;
    const matches = findMatches(criteria);
    
    return res.status(200).json({
      success: true,
      matches,
      totalMatches: matches.length,
      message: `Found ${matches.length} potential matches`,
    });
  } catch (error) {
    console.error('Error in buyer matching:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function findMatches(criteria: MatchingCriteria): MatchResult[] {
  let buyers = mockBuyers;
  let properties = mockProperties;

  // Filter by specific buyer if provided
  if (criteria.buyerId) {
    buyers = buyers.filter(b => b.id === criteria.buyerId);
  }

  // Filter properties by criteria
  if (criteria.propertyType) {
    properties = properties.filter(p => p.propertyType === criteria.propertyType);
  }
  
  if (criteria.maxPrice) {
    properties = properties.filter(p => p.price <= criteria.maxPrice!);
  }
  
  if (criteria.minPrice) {
    properties = properties.filter(p => p.price >= criteria.minPrice!);
  }
  
  if (criteria.city) {
    properties = properties.filter(p => 
      p.city.toLowerCase().includes(criteria.city!.toLowerCase())
    );
  }
  
  if (criteria.state) {
    properties = properties.filter(p => p.state.toLowerCase() === criteria.state!.toLowerCase());
  }
  
  if (criteria.condition) {
    properties = properties.filter(p => p.condition === criteria.condition);
  }
  
  if (criteria.bedrooms) {
    properties = properties.filter(p => p.bedrooms && p.bedrooms >= criteria.bedrooms!);
  }
  
  if (criteria.bathrooms) {
    properties = properties.filter(p => p.bathrooms && p.bathrooms >= criteria.bathrooms!);
  }
  
  if (criteria.minSquareFootage) {
    properties = properties.filter(p => p.squareFootage && p.squareFootage >= criteria.minSquareFootage!);
  }
  
  if (criteria.maxSquareFootage) {
    properties = properties.filter(p => p.squareFootage && p.squareFootage <= criteria.maxSquareFootage!);
  }

  // Generate matches
  const matches: MatchResult[] = [];
  
  buyers.forEach(buyer => {
    properties.forEach(property => {
      const matchScore = calculateMatchScore(buyer, property);
      const matchReasons = getMatchReasons(buyer, property);
      const estimatedInterest = getEstimatedInterest(matchScore);
      
      if (matchScore > 0.3) { // Only include reasonable matches
        matches.push({
          buyer,
          property,
          matchScore,
          matchReasons,
          estimatedInterest,
        });
      }
    });
  });

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return matches.slice(0, 20); // Limit to top 20 matches
}

function calculateMatchScore(buyer: Buyer, property: Property): number {
  let score = 0;
  
  // Property type preference (40% weight)
  if (buyer.preferredPropertyTypes.includes(property.propertyType)) {
    score += 0.4;
  }
  
  // Price range compatibility (30% weight)
  const priceRange = buyer.investmentRange;
  const propertyPrice = property.price;
  
  if (priceRange === '0-50k' && propertyPrice <= 50000) score += 0.3;
  else if (priceRange === '50k-100k' && propertyPrice <= 100000) score += 0.3;
  else if (priceRange === '100k-250k' && propertyPrice <= 250000) score += 0.3;
  else if (priceRange === '250k-500k' && propertyPrice <= 500000) score += 0.3;
  else if (priceRange === '500k+' && propertyPrice > 500000) score += 0.3;
  
  // Location preference (20% weight)
  if (buyer.city.toLowerCase() === property.city.toLowerCase()) {
    score += 0.2;
  } else if (buyer.state.toLowerCase() === property.state.toLowerCase()) {
    score += 0.1;
  }
  
  // Condition preference (10% weight)
  if (buyer.notes?.toLowerCase().includes('distressed') && property.condition === 'distressed') {
    score += 0.1;
  } else if (buyer.notes?.toLowerCase().includes('turnkey') && property.condition === 'excellent') {
    score += 0.1;
  }
  
  return Math.min(score, 1.0);
}

function getMatchReasons(buyer: Buyer, property: Property): string[] {
  const reasons: string[] = [];
  
  if (buyer.preferredPropertyTypes.includes(property.propertyType)) {
    reasons.push(`Matches preferred property type: ${property.propertyType}`);
  }
  
  if (buyer.city.toLowerCase() === property.city.toLowerCase()) {
    reasons.push(`Same city: ${property.city}`);
  } else if (buyer.state.toLowerCase() === property.state.toLowerCase()) {
    reasons.push(`Same state: ${property.state}`);
  }
  
  const priceRange = buyer.investmentRange;
  const propertyPrice = property.price;
  
  if (priceRange === '0-50k' && propertyPrice <= 50000) {
    reasons.push('Price within budget range');
  } else if (priceRange === '50k-100k' && propertyPrice <= 100000) {
    reasons.push('Price within budget range');
  } else if (priceRange === '100k-250k' && propertyPrice <= 250000) {
    reasons.push('Price within budget range');
  } else if (priceRange === '250k-500k' && propertyPrice <= 500000) {
    reasons.push('Price within budget range');
  } else if (priceRange === '500k+' && propertyPrice > 500000) {
    reasons.push('Price within budget range');
  }
  
  return reasons;
}

function getEstimatedInterest(matchScore: number): 'high' | 'medium' | 'low' {
  if (matchScore >= 0.7) return 'high';
  if (matchScore >= 0.4) return 'medium';
  return 'low';
}
