/**
 * Phone number utilities for formatting and validation
 */

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as US phone number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // If it's already formatted or doesn't match US format, return as is
  return phone;
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
};

/**
 * Normalize phone number to digits only
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Extract country code from phone number
 */
export const extractCountryCode = (phone: string): string => {
  const digits = normalizePhoneNumber(phone);
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+1';
  }
  return '';
};

/**
 * Check if phone number is international
 */
export const isInternationalNumber = (phone: string): boolean => {
  const digits = normalizePhoneNumber(phone);
  return digits.length > 10;
};

/**
 * Format phone number for API calls (E.164 format)
 */
export const formatForAPI = (phone: string): string => {
  const digits = normalizePhoneNumber(phone);
  
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return phone;
};

/**
 * Mask phone number for privacy
 */
export const maskPhoneNumber = (phone: string): string => {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length < 10) return formatted;
  
  // Mask middle digits
  const parts = formatted.split(' ');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const maskedLastPart = lastPart.replace(/\d(?=\d{2})/g, '*');
    parts[parts.length - 1] = maskedLastPart;
    return parts.join(' ');
  }
  
  return formatted;
};
