import { NextApiRequest, NextApiResponse } from 'next';
import { PropertyDetails } from '../../../../types';

// In-memory store for property details (in production, this would be a database)
const propertyDetailsStore: Map<string, PropertyDetails> = new Map();

// Initialize with some mock data for existing leads
const initializeMockPropertyDetails = () => {
  if (propertyDetailsStore.size === 0) {
    propertyDetailsStore.set('1', {
      leadId: '1',
      yearHouseBuilt: 1985,
      bedrooms: '3',
      bath: '2',
      propertyType: 'Single Family',
      reasonForSelling: 'She wants to offload the property as it has been in the family for over 50 years',
      soldComparables: [
        { id: 'comp-1', link: 'https://www.zillow.com/homedetails/0-Whitehe', price: 53000 },
        { id: 'comp-2', link: 'https://www.zillow.com/homedetails/0-Cook-R', price: 80000 },
        { id: 'comp-3', link: 'https://www.zillow.com/homedetails/885-North', price: 80000 },
      ],
      pendingComparables: [
        { id: 'comp-4', link: 'https://www.zillow.com/homedetails/0-Hard-Rc', price: 55000 },
        { id: 'comp-5', link: 'https://www.zillow.com/homedetails/70-Clear-s', price: 65000 },
      ],
      targetCloseDate: new Date('2026-01-16'),
      inspectionPeriodDate: new Date('2025-12-10'),
      nextStep: 'Dispo',
      photosLink: 'https://drive.google.com/drive/folders/1pi3UX6_RAROAJbhSICFxvTzF6u69UBkz?usp=shar',
      dateOfSignedContract: new Date('2025-11-05'),
      dateOfPhotosReceived: new Date('2025-11-10'),
    });
  }
};

initializeMockPropertyDetails();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PropertyDetails | { error: string }>
) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  // Basic authentication check, with bypass for development
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  if (!bypassAuth) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  switch (req.method) {
    case 'GET':
      const details = propertyDetailsStore.get(leadId);
      if (details) {
        return res.status(200).json(details);
      }
      return res.status(404).json({ error: 'Property details not found' });

    case 'PUT':
    case 'POST':
      const updatedDetails: PropertyDetails = {
        ...req.body,
        leadId,
        // Convert date strings to Date objects
        targetCloseDate: req.body.targetCloseDate ? new Date(req.body.targetCloseDate) : undefined,
        inspectionPeriodDate: req.body.inspectionPeriodDate ? new Date(req.body.inspectionPeriodDate) : undefined,
        emdReceivedDate: req.body.emdReceivedDate ? new Date(req.body.emdReceivedDate) : undefined,
        dateOfSignedContract: req.body.dateOfSignedContract ? new Date(req.body.dateOfSignedContract) : undefined,
        dateOfPhotosReceived: req.body.dateOfPhotosReceived ? new Date(req.body.dateOfPhotosReceived) : undefined,
        updatedAt: new Date(),
      };

      propertyDetailsStore.set(leadId, updatedDetails);
      return res.status(200).json(updatedDetails);

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

