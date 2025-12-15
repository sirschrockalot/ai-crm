import { NextApiRequest, NextApiResponse } from 'next';

interface FieldMappingRequest {
  headers: string[];
}

interface FieldMappingResponse {
  mapping: Record<string, string>;
  suggestions: Record<string, string[]>;
}

// Define the standard PDR buyer fields
const PDR_FIELDS = [
  'buyerid', 'csvid', 'status', 'entity_name', 'bname', 'bstreet', 'bcity', 'bstate', 'bzip',
  'bssn', 'bphone1', 'bphone2', 'bemail', 'bpaypalemail', 'downershiptype',
  'notes', 'phone_key', 'btype', 'btag1', 'btag2', 'btag3', 'lsource',
  'datecr', 'bnotes', 'useridcr', 'audited', 'buyer_street', 'buyer_city',
  'buyer_zip', 'buyer_state', 'bneighborhood', 'investment_goals',
  'property_notes', 'bcounties', 'archived', 'offer_accepted',
  'terminated_reason', 'terminated_user', 'terminated_date', 'sent_comm'
];

// Define common variations and synonyms for each field
const FIELD_VARIATIONS: Record<string, string[]> = {
  'buyerid': ['buyer_id', 'buyer id', 'id', 'buyerid'],
  'csvid': ['csv_id', 'csv id', 'csvid'],
  'status': ['buyer_status', 'buyer status', 'active', 'inactive', 'status'],
  'entity_name': ['entity', 'entity_name', 'entity name', 'company', 'company_name', 'company name', 'business name', 'business'],
  'bname': ['name', 'buyer_name', 'buyer name', 'company_name', 'company name', 'contact_name', 'contact name', 'bname'],
  'bstreet': ['street', 'address', 'street_address', 'street address', 'bstreet', 'buyer_street', 'buyer street'],
  'bcity': ['city', 'buyer_city', 'buyer city', 'bcity'],
  'bstate': ['state', 'buyer_state', 'buyer state', 'bstate'],
  'bzip': ['zip', 'zipcode', 'zip_code', 'zip code', 'postal_code', 'postal code', 'bzip', 'buyer_zip', 'buyer zip'],
  'bssn': ['ssn', 'social_security', 'social security', 'bssn'],
  'bphone1': ['phone', 'phone1', 'primary_phone', 'primary phone', 'phone_number', 'phone number', 'bphone1'],
  'bphone2': ['phone2', 'secondary_phone', 'secondary phone', 'alt_phone', 'alt phone', 'bphone2'],
  'bphone3': ['phone3', 'third_phone', 'tertiary_phone', 'phone 3', 'bphone3'],
  'bemail': ['email', 'email_address', 'email address', 'buyer_email', 'buyer email', 'bemail'],
  'bpaypalemail': ['paypal_email', 'paypal email', 'paypal', 'bpaypalemail'],
  'downershiptype': ['ownership_type', 'ownership type', 'owner_type', 'owner type', 'downershiptype'],
  'notes': ['buyer_notes', 'buyer notes', 'comments', 'description', 'notes'],
  'phone_key': ['phone_key', 'phone key'],
  'btype': ['type', 'buyer_type', 'buyer type', 'customer_type', 'customer type', 'btype'],
  'btag1': ['tag1', 'tag_1', 'tag 1', 'property_type', 'property type', 'btag1'],
  'btag2': ['tag2', 'tag_2', 'tag 2', 'btag2'],
  'btag3': ['tag3', 'tag_3', 'tag 3', 'btag3'],
  'lsource': ['source', 'lead_source', 'lead source', 'lsource'],
  'datecr': ['created_date', 'created date', 'date_created', 'date created', 'datecr'],
  'bnotes': ['notes', 'buyer_notes', 'buyer notes', 'bnotes'],
  'useridcr': ['created_by', 'created by', 'user_created', 'user created', 'useridcr'],
  'audited': ['audited', 'verified', 'checked'],
  'buyer_street': ['street', 'address', 'street_address', 'street address', 'buyer_street', 'buyer street'],
  'buyer_city': ['city', 'buyer_city', 'buyer city'],
  'buyer_zip': ['zip', 'zipcode', 'zip_code', 'zip code', 'postal_code', 'postal code', 'buyer_zip', 'buyer zip'],
  'buyer_state': ['state', 'buyer_state', 'buyer state'],
  'bneighborhood': ['neighborhood', 'area', 'district', 'bneighborhood'],
  'investment_goals': ['investment_goals', 'investment goals', 'budget', 'price_range', 'price range', 'investment_goals'],
  'property_notes': ['property_notes', 'property notes', 'property_notes'],
  'bcounties': ['counties', 'county', 'bcounties'],
  'archived': ['archived', 'deleted', 'inactive'],
  'offer_accepted': ['offer_accepted', 'offer accepted', 'accepted'],
  'terminated_reason': ['terminated_reason', 'terminated reason', 'termination_reason', 'termination reason'],
  'terminated_user': ['terminated_user', 'terminated user', 'terminated_by', 'terminated by'],
  'terminated_date': ['terminated_date', 'terminated date', 'termination_date', 'termination date'],
  'sent_comm': ['sent_comm', 'sent comm', 'communication_sent', 'communication sent']
};

function findBestMatch(header: string, targetFields: string[]): string | null {
  const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // First, try exact matches
  for (const field of targetFields) {
    if (normalizedHeader === field.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      return field;
    }
  }
  
  // Then try variations
  for (const [field, variations] of Object.entries(FIELD_VARIATIONS)) {
    for (const variation of variations) {
      const normalizedVariation = variation.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedHeader === normalizedVariation) {
        return field;
      }
    }
  }
  
  // Finally, try partial matches
  for (const [field, variations] of Object.entries(FIELD_VARIATIONS)) {
    for (const variation of variations) {
      const normalizedVariation = variation.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedHeader.includes(normalizedVariation) || normalizedVariation.includes(normalizedHeader)) {
        return field;
      }
    }
  }
  
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FieldMappingResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { headers }: FieldMappingRequest = req.body;

    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({ error: 'Headers array is required' });
    }

    const mapping: Record<string, string> = {};
    const suggestions: Record<string, string[]> = {};

    // Process each header
    headers.forEach(header => {
      const bestMatch = findBestMatch(header, PDR_FIELDS);
      
      if (bestMatch) {
        mapping[header] = bestMatch;
      } else {
        // Provide suggestions for unmatched headers
        const possibleMatches: string[] = [];
        
        // Find similar fields based on keywords
        const headerWords = header.toLowerCase().split(/[^a-z0-9]+/);
        
        for (const [field, variations] of Object.entries(FIELD_VARIATIONS)) {
          for (const variation of variations) {
            const variationWords = variation.toLowerCase().split(/[^a-z0-9]+/);
            
            // Check for word overlap
            const overlap = headerWords.filter(word => 
              variationWords.some(vWord => 
                word.includes(vWord) || vWord.includes(word)
              )
            );
            
            if (overlap.length > 0 && !possibleMatches.includes(field)) {
              possibleMatches.push(field);
            }
          }
        }
        
        suggestions[header] = possibleMatches.slice(0, 3); // Limit to 3 suggestions
      }
    });

    const response: FieldMappingResponse = {
      mapping,
      suggestions,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error generating field mapping:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
