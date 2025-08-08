// Validation utilities
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's a valid US phone number (10 or 11 digits)
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isValidZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

export const isValidSSN = (ssn: string): boolean => {
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
};

export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/\s|-/g, '');
  
  // Check if it's all digits and has a valid length
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const isValidDateString = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const isValidNumber = (value: any): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed);
  }
  return false;
};

export const isValidInteger = (value: any): boolean => {
  if (typeof value === 'number') return Number.isInteger(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed.toString() === value;
  }
  return false;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

export const isAlphaNumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

export const isAlpha = (value: string): boolean => {
  return /^[a-zA-Z]+$/.test(value);
};

export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

export const isLowerCase = (value: string): boolean => {
  return value === value.toLowerCase();
};

export const isUpperCase = (value: string): boolean => {
  return value === value.toUpperCase();
};

export const containsOnly = (value: string, allowedChars: string): boolean => {
  const regex = new RegExp(`^[${allowedChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`);
  return regex.test(value);
};

export const validateObject = <T extends Record<string, any>>(
  obj: T,
  rules: Record<keyof T, ((value: any) => boolean | string)[]>
): { isValid: boolean; errors: Record<keyof T, string[]> } => {
  const errors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
  let isValid = true;

  for (const [key, validators] of Object.entries(rules)) {
    const value = obj[key];
    const fieldErrors: string[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (result !== true) {
        fieldErrors.push(typeof result === 'string' ? result : `Invalid ${key}`);
      }
    }

    if (fieldErrors.length > 0) {
      errors[key as keyof T] = fieldErrors;
      isValid = false;
    } else {
      errors[key as keyof T] = [];
    }
  }

  return { isValid, errors };
}; 