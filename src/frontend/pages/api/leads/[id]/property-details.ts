import { NextApiRequest, NextApiResponse } from 'next';
import { PropertyDetails } from '../../../../types';
import { getLeadsServiceConfig } from '@/services/configService';
import { getBypassToken, isBypassAuthExpected } from '@/services/bypassToken';

// In-memory store for user-edited property details (overlay on lead data)
const propertyDetailsStore: Map<string, PropertyDetails> = new Map();

/** Build PropertyDetails from a lead document (Leads Service / DB). */
function leadToPropertyDetails(leadId: string, lead: Record<string, any>): Partial<PropertyDetails> {
  const address = lead?.address && typeof lead.address === 'object' ? lead.address : {};
  const custom = lead?.customFields && typeof lead.customFields === 'object' ? lead.customFields : {};
  const parts: string[] = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  const propertyAddress = parts.length ? parts.join(', ') : undefined;
  return {
    leadId,
    reasonForSelling: lead?.notes ?? undefined,
    customerAskingPrice: lead?.estimatedValue ?? lead?.actualValue ?? undefined,
    propertyType: custom?.propertyType ?? lead?.propertyType ?? undefined,
    propertyNotes: propertyAddress,
    // Map common customFields into PropertyDetails for display
    yearHouseBuilt: custom?.yearHouseBuilt ?? undefined,
    bedrooms: custom?.bedrooms ?? undefined,
    bath: custom?.bath ?? undefined,
    ...(custom?.soldComparables && { soldComparables: custom.soldComparables }),
    ...(custom?.pendingComparables && { pendingComparables: custom.pendingComparables }),
  };
}

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
    case 'GET': {
      let authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const bypassToken = await getBypassToken();
        if (bypassToken) authHeader = `Bearer ${bypassToken}`;
      }
      if ((!authHeader || !authHeader.startsWith('Bearer ')) && isBypassAuthExpected()) {
        return res.status(503).json({
          error: 'Bypass token unavailable. Ensure Auth Service is running and DEV_ADMIN_PASSWORD (or ADMIN_PASSWORD) is set for admin@dealcycle.com.',
          code: 'bypass_token_unavailable',
        } as any);
      }
      const stored = propertyDetailsStore.get(leadId);
      try {
        const leadsService = getLeadsServiceConfig();
        const baseUrl = leadsService.apiUrl.replace(/\/leads\/?$/, '');
        const leadRes = await fetch(`${baseUrl}/leads/${leadId}`, {
          headers: authHeader && authHeader.startsWith('Bearer ') ? { Authorization: authHeader } : {},
        });
        if (leadRes.ok) {
          const lead = await leadRes.json();
          const fromLead = leadToPropertyDetails(leadId, lead);
          const merged: PropertyDetails = {
            ...fromLead,
            ...stored,
            leadId,
          } as PropertyDetails;
          return res.status(200).json(merged);
        }
      } catch (_) {
        // Leads Service unreachable or error; fall back to stored only
      }
      return res.status(200).json(stored ?? null);
    }

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

