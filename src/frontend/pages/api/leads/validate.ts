import { NextApiRequest, NextApiResponse } from 'next';

interface ValidationRequest {
  leads: Array<{
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    propertyAddress?: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    estimatedValue: number;
    status: string;
    assignedTo?: string;
    notes?: string;
    source?: string;
    company?: string;
    score?: number;
  }>;
}

interface ValidationResult {
  validIds: string[];
  invalidIds: string[];
  errors: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResult | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leads }: ValidationRequest = req.body;

    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ error: 'Leads array is required' });
    }

    const validIds: string[] = [];
    const invalidIds: string[] = [];
    const errors: string[] = [];

    leads.forEach((lead, index) => {
      const leadId = lead.id || `temp-${index}`;
      let isValid = true;
      let errorMessages: string[] = [];

      // Required field validation
      if (!lead.firstName?.trim()) {
        errorMessages.push('First name is required');
        isValid = false;
      }

      if (!lead.lastName?.trim()) {
        errorMessages.push('Last name is required');
        isValid = false;
      }

      if (!lead.email?.trim()) {
        errorMessages.push('Email is required');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
        errorMessages.push('Invalid email format');
        isValid = false;
      }

      if (!lead.phone?.trim()) {
        errorMessages.push('Phone is required');
        isValid = false;
      }

      if (!lead.address?.trim()) {
        errorMessages.push('Address is required');
        isValid = false;
      }

      if (!lead.city?.trim()) {
        errorMessages.push('City is required');
        isValid = false;
      }

      if (!lead.state?.trim()) {
        errorMessages.push('State is required');
        isValid = false;
      }

      if (!lead.zipCode?.trim()) {
        errorMessages.push('ZIP code is required');
        isValid = false;
      }

      if (!lead.propertyType?.trim()) {
        errorMessages.push('Property type is required');
        isValid = false;
      }

      if (typeof lead.estimatedValue !== 'number' || lead.estimatedValue <= 0) {
        errorMessages.push('Estimated value must be a positive number');
        isValid = false;
      }

      if (!lead.status?.trim()) {
        errorMessages.push('Status is required');
        isValid = false;
      }

      // Business logic validation
      if (lead.estimatedValue > 10000000) {
        errorMessages.push('Estimated value cannot exceed $10,000,000');
        isValid = false;
      }

      if (lead.score && (lead.score < 0 || lead.score > 100)) {
        errorMessages.push('Score must be between 0 and 100');
        isValid = false;
      }

      // Duplicate email check (mock)
      if (lead.email && lead.email.includes('duplicate')) {
        errorMessages.push('Email already exists in system');
        isValid = false;
      }

      if (isValid) {
        validIds.push(leadId);
      } else {
        invalidIds.push(leadId);
        errors.push(`Lead ${lead.firstName} ${lead.lastName}: ${errorMessages.join(', ')}`);
      }
    });

    return res.status(200).json({
      validIds,
      invalidIds,
      errors,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Validation failed' });
  }
}
