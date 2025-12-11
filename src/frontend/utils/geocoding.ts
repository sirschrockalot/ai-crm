/**
 * Geocoding utility to convert addresses to coordinates
 * For production, integrate with a geocoding service like Google Maps Geocoding API,
 * Mapbox Geocoding API, or OpenStreetMap Nominatim
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Mock coordinates for common cities (for testing/demo purposes)
 * In production, replace with actual geocoding API calls
 */
const MOCK_COORDINATES: Record<string, Coordinates> = {
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Springfield, IL': { lat: 39.7817, lng: -89.6501 },
  'Naperville, IL': { lat: 41.7508, lng: -88.1535 },
  'St. Louis, MO': { lat: 38.6270, lng: -90.1994 },
  'Aurora, IL': { lat: 41.7606, lng: -88.3201 },
  'Milwaukee, WI': { lat: 43.0389, lng: -87.9065 },
  // Zip codes
  '60601': { lat: 41.8825, lng: -87.6441 },
  '60602': { lat: 41.8815, lng: -87.6298 },
  '60603': { lat: 41.8805, lng: -87.6298 },
  '62701': { lat: 39.7817, lng: -89.6501 },
  '62702': { lat: 39.7817, lng: -89.6501 },
  '60540': { lat: 41.7508, lng: -88.1535 },
  '60541': { lat: 41.7508, lng: -88.1535 },
  '60542': { lat: 41.7508, lng: -88.1535 },
};

/**
 * Get coordinates for an address
 * @param address - Address string (city, state, zip, or full address)
 * @returns Promise with coordinates or null if not found
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const normalizedAddress = address.trim();

  // Check mock coordinates first
  if (MOCK_COORDINATES[normalizedAddress]) {
    return MOCK_COORDINATES[normalizedAddress];
  }

  // Try to match city, state format
  const cityStateMatch = normalizedAddress.match(/^([^,]+),\s*([A-Z]{2})$/i);
  if (cityStateMatch) {
    const cityState = `${cityStateMatch[1].trim()}, ${cityStateMatch[2].toUpperCase()}`;
    if (MOCK_COORDINATES[cityState]) {
      return MOCK_COORDINATES[cityState];
    }
  }

  // Try zip code
  const zipMatch = normalizedAddress.match(/\b(\d{5})\b/);
  if (zipMatch && MOCK_COORDINATES[zipMatch[1]]) {
    return MOCK_COORDINATES[zipMatch[1]];
  }

  // In production, make API call here:
  // Example with OpenStreetMap Nominatim (free, no API key required):
  // const response = await fetch(
  //   `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
  // );
  // const data = await response.json();
  // if (data && data.length > 0) {
  //   return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  // }

  return null;
}

/**
 * Get coordinates for a buyer's location
 */
export async function geocodeBuyer(buyer: { city: string; state: string; zipCode: string }): Promise<Coordinates | null> {
  const address = `${buyer.city}, ${buyer.state} ${buyer.zipCode}`;
  return geocodeAddress(address);
}

