import { NextApiRequest, NextApiResponse } from 'next';

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp as string)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (req.method === 'POST') {
    try {
      const { leadId, fromStageId, toStageId } = req.body;

      if (!leadId || !fromStageId || !toStageId) {
        return res.status(400).json({ 
          error: 'Missing required fields: leadId, fromStageId, toStageId' 
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock lead data - in real implementation, this would update the database
      const mockLead = {
        id: leadId,
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
        status: toStageId === 'stage-1' ? 'new' : 
                toStageId === 'stage-2' ? 'contacted' :
                toStageId === 'stage-3' ? 'qualified' :
                toStageId === 'stage-4' ? 'converted' : 'lost',
        assignedTo: 'agent-1',
        notes: 'Lead moved between stages',
        source: 'website',
        company: 'ABC Realty',
        score: 85,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
      };

      return res.status(200).json({
        success: true,
        lead: mockLead,
        message: `Lead moved from ${fromStageId} to ${toStageId}`,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to move lead' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
