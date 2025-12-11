/**
 * Address Parser Utility
 * Parses address strings to extract city, state, and zip code
 */

export interface ParsedAddress {
  city?: string;
  state?: string;
  zipCode?: string;
  fullAddress?: string;
}

/**
 * US State abbreviations
 */
const US_STATES: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
};

/**
 * Parse an address string to extract city, state, and zip code
 * @param address - The address string to parse
 * @returns Parsed address with city, state, and zip code
 */
export function parseAddress(address: string): ParsedAddress {
  if (!address || typeof address !== 'string') {
    return {};
  }

  const trimmed = address.trim();
  const result: ParsedAddress = {
    fullAddress: trimmed,
  };

  // Pattern to match zip code (5 digits or 5+4 format)
  const zipPattern = /\b(\d{5}(?:-\d{4})?)\b/;
  const zipMatch = trimmed.match(zipPattern);
  if (zipMatch) {
    result.zipCode = zipMatch[1];
  }

  // Split by common delimiters
  const parts = trimmed.split(/[,\n]/).map(p => p.trim()).filter(p => p.length > 0);

  // Try to find state (2-letter code or full name)
  let stateFound = false;
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].toLowerCase();
    
    // Check for 2-letter state code
    if (part.length === 2 && /^[A-Z]{2}$/i.test(parts[i])) {
      const upperState = parts[i].toUpperCase();
      if (Object.values(US_STATES).includes(upperState)) {
        result.state = upperState;
        stateFound = true;
        // City is likely the part before state
        if (i > 0) {
          result.city = parts[i - 1];
        }
        break;
      }
    }
    
    // Check for full state name
    if (US_STATES[part]) {
      result.state = US_STATES[part];
      stateFound = true;
      // City is likely the part before state
      if (i > 0) {
        result.city = parts[i - 1];
      }
      break;
    }
  }

  // If no state found, try to extract city from common patterns
  if (!stateFound && parts.length >= 2) {
    // Assume last part before zip is city
    const lastPartIndex = parts.length - (result.zipCode ? 2 : 1);
    if (lastPartIndex >= 0) {
      result.city = parts[lastPartIndex];
    }
  }

  // If still no city, try to extract from address
  if (!result.city && parts.length > 0) {
    // Skip street address (usually first part with numbers)
    const cityCandidate = parts.find(p => !/^\d+/.test(p) && p.length > 2);
    if (cityCandidate) {
      result.city = cityCandidate;
    }
  }

  return result;
}

/**
 * Normalize state code to 2-letter uppercase format
 */
export function normalizeState(state: string | undefined): string | undefined {
  if (!state) return undefined;
  
  const normalized = state.trim().toLowerCase();
  
  // If already 2 letters, uppercase it
  if (normalized.length === 2) {
    return normalized.toUpperCase();
  }
  
  // Try to find in state map
  return US_STATES[normalized] || state.toUpperCase().substring(0, 2);
}

/**
 * Normalize zip code (remove dashes, ensure 5 digits minimum)
 */
export function normalizeZipCode(zip: string | undefined): string | undefined {
  if (!zip) return undefined;
  
  // Remove non-digits
  const digits = zip.replace(/\D/g, '');
  
  // Return first 5 digits
  return digits.substring(0, 5);
}

