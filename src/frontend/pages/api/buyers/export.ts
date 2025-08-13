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
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { format = 'csv', filters } = req.query;
    
    // Parse filters if provided
    let filteredBuyers = [...mockBuyers];
    
    if (filters && typeof filters === 'string') {
      try {
        const parsedFilters = JSON.parse(filters);
        
        // Apply filters
        if (parsedFilters.buyerType) {
          filteredBuyers = filteredBuyers.filter(b => b.buyerType === parsedFilters.buyerType);
        }
        if (parsedFilters.investmentRange) {
          filteredBuyers = filteredBuyers.filter(b => b.investmentRange === parsedFilters.investmentRange);
        }
        if (parsedFilters.city) {
          filteredBuyers = filteredBuyers.filter(b => b.city.toLowerCase().includes(parsedFilters.city.toLowerCase()));
        }
        if (parsedFilters.state) {
          filteredBuyers = filteredBuyers.filter(b => b.state.toLowerCase() === parsedFilters.state.toLowerCase());
        }
        if (parsedFilters.isActive !== undefined) {
          filteredBuyers = filteredBuyers.filter(b => b.isActive === parsedFilters.isActive);
        }
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Company Name',
        'Contact Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'ZIP Code',
        'Buyer Type',
        'Investment Range',
        'Preferred Property Types',
        'Notes',
        'Status',
        'Created Date',
        'Updated Date'
      ];

      const csvRows = filteredBuyers.map(buyer => [
        buyer.id,
        buyer.companyName,
        buyer.contactName,
        buyer.email,
        buyer.phone,
        buyer.address,
        buyer.city,
        buyer.state,
        buyer.zipCode,
        buyer.buyerType,
        buyer.investmentRange,
        buyer.preferredPropertyTypes.join('; '),
        buyer.notes || '',
        buyer.isActive ? 'Active' : 'Inactive',
        new Date(buyer.createdAt).toLocaleDateString(),
        new Date(buyer.updatedAt).toLocaleDateString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="buyers-export.csv"');
      return res.status(200).send(csvContent);
    }

    if (format === 'json') {
      // Generate JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="buyers-export.json"');
      return res.status(200).json({
        exportDate: new Date().toISOString(),
        totalBuyers: filteredBuyers.length,
        buyers: filteredBuyers
      });
    }

    if (format === 'xlsx') {
      // For XLSX format, we would need a library like xlsx
      // For now, return CSV as fallback
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="buyers-export.csv"');
      
      const csvHeaders = [
        'ID',
        'Company Name',
        'Contact Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'ZIP Code',
        'Buyer Type',
        'Investment Range',
        'Preferred Property Types',
        'Notes',
        'Status',
        'Created Date',
        'Updated Date'
      ];

      const csvRows = filteredBuyers.map(buyer => [
        buyer.id,
        buyer.companyName,
        buyer.contactName,
        buyer.email,
        buyer.phone,
        buyer.address,
        buyer.city,
        buyer.state,
        buyer.zipCode,
        buyer.buyerType,
        buyer.investmentRange,
        buyer.preferredPropertyTypes.join('; '),
        buyer.notes || '',
        buyer.isActive ? 'Active' : 'Inactive',
        new Date(buyer.createdAt).toLocaleDateString(),
        new Date(buyer.updatedAt).toLocaleDateString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return res.status(200).send(csvContent);
    }

    return res.status(400).json({ error: 'Unsupported export format. Use csv, json, or xlsx.' });
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
