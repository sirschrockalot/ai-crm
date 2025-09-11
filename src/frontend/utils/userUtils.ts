/**
 * Utility functions for user-related operations
 */

/**
 * Generates user initials from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns String of initials (e.g., "JD" for "John Doe")
 */
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) {
    return 'U'; // Default to 'U' for User if no names provided
  }
  
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return firstInitial + lastInitial;
};

/**
 * Gets user's full name from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Full name string
 */
export const getFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) {
    return 'User';
  }
  
  return [firstName, lastName].filter(Boolean).join(' ');
};

/**
 * Gets user's display name (full name or email fallback)
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param email - User's email
 * @returns Display name string
 */
export const getDisplayName = (firstName?: string, lastName?: string, email?: string): string => {
  const fullName = getFullName(firstName, lastName);
  
  if (fullName !== 'User') {
    return fullName;
  }
  
  return email || 'User';
};
