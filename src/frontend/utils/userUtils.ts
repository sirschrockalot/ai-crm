/**
 * Utility functions for user-related operations
 */

/**
 * Generates user initials from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns String of initials (e.g., "JD" for "John Doe")
 */
export const getUserInitials = (firstName?: string, lastName?: string, email?: string): string => {
  const safe = (s?: string) => (s || '').trim();
  const first = safe(firstName);
  const last = safe(lastName);

  if (first || last) {
    const fi = first ? first[0] : '';
    const li = last ? last[0] : '';
    return (fi + li || fi || li).toUpperCase().slice(0, 2);
  }

  const fromEmail = safe(email);
  if (fromEmail) {
    const handle = fromEmail.split('@')[0] || '';
    if (handle.length >= 2) return handle.slice(0, 2).toUpperCase();
    if (handle.length === 1) return handle.toUpperCase();
  }

  return 'U';
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
