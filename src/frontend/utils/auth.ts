/**
 * Production-safe authentication utilities
 * Ensures auth bypass is disabled in production builds
 */

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isAuthBypassEnabled = (): boolean => {
  // Never allow bypass in production
  if (isProduction()) {
    return false;
  }
  // Only allow in development if explicitly enabled
  return process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
};

/**
 * Role checking utilities
 */
export const hasRole = (userRoles: string[] | undefined, requiredRole: string): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  const normalizedRoles = userRoles.map(r => r.toUpperCase());
  const normalizedRequired = requiredRole.toUpperCase();
  
  // ADMIN has access to everything
  if (normalizedRoles.includes('ADMIN')) {
    return true;
  }
  
  return normalizedRoles.includes(normalizedRequired);
};

export const hasAnyRole = (userRoles: string[] | undefined, requiredRoles: string[]): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  return requiredRoles.some(role => hasRole(userRoles, role));
};

export const hasAllRoles = (userRoles: string[] | undefined, requiredRoles: string[]): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  return requiredRoles.every(role => hasRole(userRoles, role));
};

/**
 * Role constants
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  ACQ_REP: 'ACQ_REP',
  DISPO: 'DISPO',
  TX: 'TX',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
