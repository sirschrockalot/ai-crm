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

interface ImportRequest {
  buyers: Partial<Buyer>[];
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    defaultStatus?: boolean;
  };
}

interface ImportResponse {
  success: boolean;
  message: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors?: string[];
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
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImportResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { buyers, options = {} } = req.body as ImportRequest;
    
    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return res.status(400).json({ error: 'No buyers data provided' });
    }

    const {
      skipDuplicates = true,
      updateExisting = false,
      defaultStatus = true,
    } = options;

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const buyerData of buyers) {
      try {
        // Validate required fields
        if (!buyerData.companyName || !buyerData.contactName || !buyerData.email) {
          errors.push(`Missing required fields for buyer: ${buyerData.companyName || 'Unknown'}`);
          continue;
        }

        // Check for duplicates by email
        const existingBuyerIndex = mockBuyers.findIndex(b => 
          b.email.toLowerCase() === buyerData.email?.toLowerCase()
        );

        if (existingBuyerIndex !== -1) {
          if (skipDuplicates) {
            skippedCount++;
            continue;
          }
          
          if (updateExisting) {
            // Update existing buyer
            const updatedBuyer: Buyer = {
              ...mockBuyers[existingBuyerIndex],
              ...buyerData,
              id: mockBuyers[existingBuyerIndex].id, // Preserve original ID
              updatedAt: new Date().toISOString(),
            };
            
            // Validate and sanitize data
            if (updatedBuyer.buyerType && !['individual', 'company', 'investor'].includes(updatedBuyer.buyerType)) {
              updatedBuyer.buyerType = 'individual';
            }
            
            if (updatedBuyer.investmentRange && !['0-50k', '50k-100k', '100k-250k', '250k-500k', '500k+'].includes(updatedBuyer.investmentRange)) {
              updatedBuyer.investmentRange = '100k-250k';
            }

            mockBuyers[existingBuyerIndex] = updatedBuyer;
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Create new buyer
          const newBuyer: Buyer = {
            id: generateId(),
            companyName: buyerData.companyName!,
            contactName: buyerData.contactName!,
            email: buyerData.email!,
            phone: buyerData.phone || '',
            address: buyerData.address || '',
            city: buyerData.city || '',
            state: buyerData.state || '',
            zipCode: buyerData.zipCode || '',
            buyerType: (buyerData.buyerType as any) || 'individual',
            investmentRange: (buyerData.investmentRange as any) || '100k-250k',
            preferredPropertyTypes: buyerData.preferredPropertyTypes || ['single_family'],
            notes: buyerData.notes || '',
            isActive: buyerData.isActive !== undefined ? buyerData.isActive : defaultStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Validate and sanitize data
          if (!['individual', 'company', 'investor'].includes(newBuyer.buyerType)) {
            newBuyer.buyerType = 'individual';
          }
          
          if (!['0-50k', '50k-100k', '100k-250k', '250k-500k', '500k+'].includes(newBuyer.investmentRange)) {
            newBuyer.investmentRange = '100k-250k';
          }

          mockBuyers.push(newBuyer);
          importedCount++;
        }
      } catch (error) {
        errors.push(`Failed to process buyer ${buyerData.companyName || 'Unknown'}: ${error}`);
      }
    }

    return res.status(200).json({
      success: importedCount > 0 || updatedCount > 0,
      message: `Import completed: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`,
      importedCount,
      updatedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing buyers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
