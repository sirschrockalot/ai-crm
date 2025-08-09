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

// Mock leads data
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
  res: NextApiResponse<MockLead | { error: string }>
) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);

  switch (req.method) {
    case 'GET':
      if (leadIndex === -1) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.status(200).json(mockLeads[leadIndex]);

    case 'PUT':
      if (leadIndex === -1) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      const updatedLead = {
        ...mockLeads[leadIndex],
        ...req.body,
        id: leadId, // Ensure ID doesn't change
        updatedAt: new Date(),
      };
      
      mockLeads[leadIndex] = updatedLead;
      return res.status(200).json(updatedLead);

    case 'DELETE':
      if (leadIndex === -1) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      mockLeads.splice(leadIndex, 1);
      return res.status(200).json(mockLeads[leadIndex]);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
