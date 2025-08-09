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
  res: NextApiResponse<string | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { format = 'csv', filters } = req.query;
    const exportFormat = Array.isArray(format) ? format[0] : format;

    // Apply filters if provided
    let filteredLeads = [...mockLeads];
    
    if (filters) {
      const filterParams = Array.isArray(filters) ? filters[0] : filters;
      const filterObj = JSON.parse(filterParams);
      
      if (filterObj.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filterObj.status);
      }
      if (filterObj.propertyType) {
        filteredLeads = filteredLeads.filter(lead => lead.propertyType === filterObj.propertyType);
      }
      if (filterObj.minValue) {
        filteredLeads = filteredLeads.filter(lead => lead.estimatedValue >= filterObj.minValue);
      }
      if (filterObj.maxValue) {
        filteredLeads = filteredLeads.filter(lead => lead.estimatedValue <= filterObj.maxValue);
      }
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (exportFormat) {
      case 'csv':
        const csvHeaders = [
          'ID',
          'First Name',
          'Last Name',
          'Email',
          'Phone',
          'Address',
          'Property Address',
          'City',
          'State',
          'ZIP Code',
          'Property Type',
          'Estimated Value',
          'Status',
          'Assigned To',
          'Notes',
          'Source',
          'Company',
          'Score',
          'Created At',
          'Updated At',
        ].join(',');

        const csvRows = filteredLeads.map(lead => [
          lead.id,
          `"${lead.firstName}"`,
          `"${lead.lastName}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${lead.address}"`,
          `"${lead.propertyAddress}"`,
          `"${lead.city}"`,
          `"${lead.state}"`,
          `"${lead.zipCode}"`,
          `"${lead.propertyType}"`,
          lead.estimatedValue,
          `"${lead.status}"`,
          `"${lead.assignedTo}"`,
          `"${lead.notes}"`,
          `"${lead.source}"`,
          `"${lead.company}"`,
          lead.score,
          `"${lead.createdAt.toISOString()}"`,
          `"${lead.updatedAt.toISOString()}"`,
        ].join(','));

        exportData = [csvHeaders, ...csvRows].join('\n');
        contentType = 'text/csv';
        filename = 'leads-export.csv';
        break;

      case 'json':
        exportData = JSON.stringify(filteredLeads, null, 2);
        contentType = 'application/json';
        filename = 'leads-export.json';
        break;

      case 'xlsx':
        // Mock Excel export - in a real implementation, you'd use a library like xlsx
        exportData = JSON.stringify(filteredLeads, null, 2);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = 'leads-export.xlsx';
        break;

      default:
        return res.status(400).json({ error: 'Unsupported export format' });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(exportData);
  } catch (error) {
    return res.status(500).json({ error: 'Export failed' });
  }
}
