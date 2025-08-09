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

interface BulkUpdateRequest {
  ids: string[];
  updates: Partial<MockLead>;
}

interface BulkDeleteRequest {
  ids: string[];
}

// Mock leads data (shared with other endpoints)
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
    notes: 'Looking for investment property',
    source: 'referral',
    company: 'XYZ Properties',
    score: 92,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; message: string; updated?: number; deleted?: number } | { error: string }>
) {
  switch (req.method) {
    case 'PUT':
      try {
        const { ids, updates }: BulkUpdateRequest = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: 'IDs array is required' });
        }

        if (!updates || Object.keys(updates).length === 0) {
          return res.status(400).json({ error: 'Updates object is required' });
        }

        let updatedCount = 0;
        const updatedLeads: MockLead[] = [];

        for (const id of ids) {
          const leadIndex = mockLeads.findIndex(lead => lead.id === id);
          if (leadIndex !== -1) {
            mockLeads[leadIndex] = {
              ...mockLeads[leadIndex],
              ...updates,
              id, // Ensure ID doesn't change
              updatedAt: new Date(),
            };
            updatedLeads.push(mockLeads[leadIndex]);
            updatedCount++;
          }
        }

        return res.status(200).json({
          success: true,
          message: `Successfully updated ${updatedCount} leads`,
          updated: updatedCount,
        });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to bulk update leads' });
      }

    case 'DELETE':
      try {
        const { ids }: BulkDeleteRequest = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ error: 'IDs array is required' });
        }

        let deletedCount = 0;
        const idsToDelete = new Set(ids);

        for (let i = mockLeads.length - 1; i >= 0; i--) {
          if (idsToDelete.has(mockLeads[i].id)) {
            mockLeads.splice(i, 1);
            deletedCount++;
          }
        }

        return res.status(200).json({
          success: true,
          message: `Successfully deleted ${deletedCount} leads`,
          deleted: deletedCount,
        });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to bulk delete leads' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
