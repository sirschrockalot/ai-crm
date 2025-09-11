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

interface BulkUpdateRequest {
  buyerIds: string[];
  updates: Partial<Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>>;
}

interface BulkDeleteRequest {
  buyerIds: string[];
}

interface BulkStatusRequest {
  buyerIds: string[];
  isActive: boolean;
}

interface BulkOperationResponse {
  success: boolean;
  message: string;
  updatedCount?: number;
  deletedCount?: number;
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
  res: NextApiResponse<BulkOperationResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { operation, data } = req.body;

    if (!operation || !data) {
      return res.status(400).json({ error: 'Missing operation or data' });
    }

    switch (operation) {
      case 'bulkUpdate':
        return handleBulkUpdate(data as BulkUpdateRequest, res);
      
      case 'bulkDelete':
        return handleBulkDelete(data as BulkDeleteRequest, res);
      
      case 'bulkStatus':
        return handleBulkStatus(data as BulkStatusRequest, res);
      
      default:
        return res.status(400).json({ error: 'Unsupported operation' });
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function handleBulkUpdate(
  data: BulkUpdateRequest,
  res: NextApiResponse<BulkOperationResponse>
) {
  const { buyerIds, updates } = data;
  
  if (!buyerIds || !Array.isArray(buyerIds) || buyerIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid buyer IDs' });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No updates provided' });
  }

  let updatedCount = 0;
  const errors: string[] = [];

  buyerIds.forEach(buyerId => {
    const buyerIndex = mockBuyers.findIndex(b => b.id === buyerId);
    
    if (buyerIndex === -1) {
      errors.push(`Buyer with ID ${buyerId} not found`);
      return;
    }

    try {
      // Update the buyer
      Object.assign(mockBuyers[buyerIndex], {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      updatedCount++;
    } catch (error) {
      errors.push(`Failed to update buyer ${buyerId}: ${error}`);
    }
  });

  return res.status(200).json({
    success: updatedCount > 0,
    message: `Successfully updated ${updatedCount} buyers`,
    updatedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}

function handleBulkDelete(
  data: BulkDeleteRequest,
  res: NextApiResponse<BulkOperationResponse>
) {
  const { buyerIds } = data;
  
  if (!buyerIds || !Array.isArray(buyerIds) || buyerIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid buyer IDs' });
  }

  let deletedCount = 0;
  const errors: string[] = [];

  buyerIds.forEach(buyerId => {
    const buyerIndex = mockBuyers.findIndex(b => b.id === buyerId);
    
    if (buyerIndex === -1) {
      errors.push(`Buyer with ID ${buyerId} not found`);
      return;
    }

    try {
      // Remove the buyer
      mockBuyers.splice(buyerIndex, 1);
      deletedCount++;
    } catch (error) {
      errors.push(`Failed to delete buyer ${buyerId}: ${error}`);
    }
  });

  return res.status(200).json({
    success: deletedCount > 0,
    message: `Successfully deleted ${deletedCount} buyers`,
    deletedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}

function handleBulkStatus(
  data: BulkStatusRequest,
  res: NextApiResponse<BulkOperationResponse>
) {
  const { buyerIds, isActive } = data;
  
  if (!buyerIds || !Array.isArray(buyerIds) || buyerIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid buyer IDs' });
  }

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  let updatedCount = 0;
  const errors: string[] = [];

  buyerIds.forEach(buyerId => {
    const buyerIndex = mockBuyers.findIndex(b => b.id === buyerId);
    
    if (buyerIndex === -1) {
      errors.push(`Buyer with ID ${buyerId} not found`);
      return;
    }

    try {
      // Update the buyer status
      mockBuyers[buyerIndex].isActive = isActive;
      mockBuyers[buyerIndex].updatedAt = new Date().toISOString();
      updatedCount++;
    } catch (error) {
      errors.push(`Failed to update status for buyer ${buyerId}: ${error}`);
    }
  });

  return res.status(200).json({
    success: updatedCount > 0,
    message: `Successfully updated status for ${updatedCount} buyers`,
    updatedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}
