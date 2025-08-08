import { SetMetadata } from '@nestjs/common';

export interface PermissionConfig {
  permissions: string[];
  requireAll?: boolean; // true = AND, false = OR
  scopes?: string[]; // e.g., ['own', 'team', 'all']
  conditions?: string[]; // e.g., ['business_hours', 'location_based']
  featureFlags?: string[]; // Feature flags that must be enabled
  bypassRoles?: string[]; // Roles that can bypass this check
  audit?: boolean; // Whether to audit this permission check
  cache?: boolean; // Whether to use cached permissions
}

export interface PermissionScope {
  type: 'own' | 'team' | 'all' | 'custom';
  value?: any; // Custom scope value
  conditions?: Record<string, any>; // Scope-specific conditions
}

export interface PermissionCondition {
  type: string;
  parameters: Record<string, any>;
  operator: 'AND' | 'OR';
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions?: Record<string, any>;
}

/**
 * Decorator for requiring specific permissions
 */
export const RequirePermissions = (config: PermissionConfig) => {
  return SetMetadata('permissions', config);
};

/**
 * Decorator for requiring a single permission
 */
export const RequirePermission = (permission: string, options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [permission],
    requireAll: true,
    ...options,
  });
};

/**
 * Decorator for requiring any of the specified permissions
 */
export const RequireAnyPermission = (permissions: string[], options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions,
    requireAll: false,
    ...options,
  });
};

/**
 * Decorator for requiring all of the specified permissions
 */
export const RequireAllPermissions = (permissions: string[], options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions,
    requireAll: true,
    ...options,
  });
};

/**
 * Decorator for resource-specific permissions
 */
export const RequireResourcePermission = (
  resource: string,
  action: string,
  scope?: PermissionScope,
  options?: Partial<PermissionConfig>
) => {
  const permission = scope ? `${resource}:${action}:${scope.type}` : `${resource}:${action}`;
  return RequirePermissions({
    permissions: [permission],
    requireAll: true,
    scopes: scope ? [scope.type] : undefined,
    ...options,
  });
};

/**
 * Decorator for CRUD permissions
 */
export const RequireCRUDPermission = (
  resource: string,
  operation: 'create' | 'read' | 'update' | 'delete',
  scope?: PermissionScope,
  options?: Partial<PermissionConfig>
) => {
  return RequireResourcePermission(resource, operation, scope, options);
};

/**
 * Decorator for admin-only endpoints
 */
export const RequireAdmin = (options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: ['admin:all'],
    requireAll: true,
    bypassRoles: ['super_admin', 'system_admin'],
    ...options,
  });
};

/**
 * Decorator for system-level permissions
 */
export const RequireSystemPermission = (permission: string, options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [permission],
    requireAll: true,
    bypassRoles: ['system_admin'],
    audit: true,
    ...options,
  });
};

/**
 * Decorator for feature flag protected endpoints
 */
export const RequireFeatureFlag = (featureFlag: string, options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [],
    featureFlags: [featureFlag],
    ...options,
  });
};

/**
 * Decorator for business hours restricted endpoints
 */
export const RequireBusinessHours = (options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [],
    conditions: ['business_hours'],
    ...options,
  });
};

/**
 * Decorator for location-based permissions
 */
export const RequireLocationPermission = (options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [],
    conditions: ['location_based'],
    ...options,
  });
};

/**
 * Decorator for audit-required endpoints
 */
export const RequireAudit = (permission: string, options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [permission],
    requireAll: true,
    audit: true,
    ...options,
  });
};

/**
 * Decorator for cached permission checks
 */
export const RequireCachedPermission = (permission: string, options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [permission],
    requireAll: true,
    cache: true,
    ...options,
  });
};

/**
 * Decorator for role-based access
 */
export const RequireRole = (role: string, options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [],
    bypassRoles: [role],
    ...options,
  });
};

/**
 * Decorator for multiple role access
 */
export const RequireAnyRole = (roles: string[], options?: Partial<PermissionConfig>) => {
  return RequirePermissions({
    permissions: [],
    bypassRoles: roles,
    ...options,
  });
};

/**
 * Decorator for complex permission scenarios
 */
export const RequireComplexPermission = (
  permissions: string[],
  scopes: string[],
  conditions: string[],
  options?: Partial<PermissionConfig>
) => {
  return RequirePermissions({
    permissions,
    scopes,
    conditions,
    requireAll: true,
    audit: true,
    cache: true,
    ...options,
  });
};

/**
 * Helper function to create permission key
 */
export const createPermissionKey = (resource: string, action: string, scope?: string): string => {
  return scope ? `${resource}:${action}:${scope}` : `${resource}:${action}`;
};

/**
 * Helper function to parse permission key
 */
export const parsePermissionKey = (permissionKey: string): {
  resource: string;
  action: string;
  scope?: string;
} => {
  const parts = permissionKey.split(':');
  return {
    resource: parts[0],
    action: parts[1],
    scope: parts[2],
  };
};

/**
 * Helper function to check if permission matches pattern
 */
export const permissionMatches = (permission: string, pattern: string): boolean => {
  const permissionParts = permission.split(':');
  const patternParts = pattern.split(':');
  
  if (patternParts.length > permissionParts.length) {
    return false;
  }
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] !== '*' && patternParts[i] !== permissionParts[i]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Helper function to get permission hierarchy
 */
export const getPermissionHierarchy = (permission: string): string[] => {
  const parts = permission.split(':');
  const hierarchy: string[] = [];
  
  for (let i = 1; i <= parts.length; i++) {
    hierarchy.push(parts.slice(0, i).join(':'));
  }
  
  return hierarchy;
};

/**
 * Helper function to validate permission format
 */
export const validatePermissionFormat = (permission: string): boolean => {
  const permissionRegex = /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*)*$/;
  return permissionRegex.test(permission);
};

/**
 * Helper function to get permission scope
 */
export const getPermissionScope = (permission: string): string | null => {
  const parts = permission.split(':');
  return parts.length > 2 ? parts[2] : null;
};

/**
 * Helper function to get permission resource
 */
export const getPermissionResource = (permission: string): string => {
  return permission.split(':')[0];
};

/**
 * Helper function to get permission action
 */
export const getPermissionAction = (permission: string): string => {
  return permission.split(':')[1];
}; 