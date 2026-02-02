import { NextApiRequest, NextApiResponse } from 'next';
import { TransactionDetails } from '../../../../types';

// In-memory store for transaction details (in production, this would be a database)
const transactionStore: Map<string, TransactionDetails> = new Map();

// Initialize with some mock transaction details for existing leads
const initializeMockTransactions = () => {
  if (transactionStore.size === 0) {
    // Mock transaction details for lead ID '1'
    transactionStore.set('1', {
      leadId: '1',
      acquisitionPrice: 295000,
      listingPrice: 410000,
      commission: 7000,
      repairCosts: 0,
      closingCosts: 8000,
      contractDate: new Date('2024-12-10'),
      inspectionDate: new Date('2024-12-15'),
      closingDate: new Date('2025-01-10'),
      arv: 410000,
      estimatedRepairs: 15000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};

initializeMockTransactions();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionDetails | { error: string }>
) {
  const { id } = req.query;
  const leadId = Array.isArray(id) ? id[0] : id;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  // Check if authentication bypass is enabled
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  
  // Basic authentication check (skip if bypass is enabled)
  if (!bypassAuth) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  switch (req.method) {
    case 'GET': {
      const transaction = transactionStore.get(leadId);
      return res.status(200).json(transaction ?? null);
    }

    case 'PUT':
    case 'POST':
      // Create or update transaction details
      const { 
        acquisitionPrice, 
        listingPrice, 
        commission, 
        repairCosts, 
        closingCosts,
        contractDate,
        inspectionDate,
        closingDate,
        arv,
        estimatedRepairs,
      } = req.body;

      const existingTransaction = transactionStore.get(leadId);
      const now = new Date();

      const transactionDetails: TransactionDetails = {
        leadId,
        acquisitionPrice: acquisitionPrice !== undefined ? Number(acquisitionPrice) : existingTransaction?.acquisitionPrice,
        listingPrice: listingPrice !== undefined ? Number(listingPrice) : existingTransaction?.listingPrice,
        commission: commission !== undefined ? Number(commission) : existingTransaction?.commission,
        repairCosts: repairCosts !== undefined ? Number(repairCosts) : existingTransaction?.repairCosts,
        closingCosts: closingCosts !== undefined ? Number(closingCosts) : existingTransaction?.closingCosts,
        contractDate: contractDate ? new Date(contractDate) : existingTransaction?.contractDate,
        inspectionDate: inspectionDate ? new Date(inspectionDate) : existingTransaction?.inspectionDate,
        closingDate: closingDate ? new Date(closingDate) : existingTransaction?.closingDate,
        arv: arv !== undefined ? Number(arv) : existingTransaction?.arv,
        estimatedRepairs: estimatedRepairs !== undefined ? Number(estimatedRepairs) : existingTransaction?.estimatedRepairs,
        createdAt: existingTransaction?.createdAt || now,
        updatedAt: now,
      };

      transactionStore.set(leadId, transactionDetails);
      return res.status(200).json(transactionDetails);

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

