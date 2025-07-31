export const ROLE_PERMISSIONS = {
  admin: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'leads:read', 'leads:create', 'leads:update', 'leads:delete',
    'buyers:read', 'buyers:create', 'buyers:update', 'buyers:delete',
    'analytics:read', 'settings:read', 'settings:update'
  ],
  acquisition_rep: [
    'leads:read', 'leads:create', 'leads:update',
    'buyers:read', 'communications:read', 'communications:create'
  ],
  disposition_manager: [
    'leads:read', 'buyers:read', 'buyers:create', 'buyers:update',
    'communications:read', 'communications:create', 'analytics:read'
  ]
};

export const PERMISSIONS = {
  // User management
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Lead management
  LEADS_READ: 'leads:read',
  LEADS_CREATE: 'leads:create',
  LEADS_UPDATE: 'leads:update',
  LEADS_DELETE: 'leads:delete',
  
  // Buyer management
  BUYERS_READ: 'buyers:read',
  BUYERS_CREATE: 'buyers:create',
  BUYERS_UPDATE: 'buyers:update',
  BUYERS_DELETE: 'buyers:delete',
  
  // Communications
  COMMUNICATIONS_READ: 'communications:read',
  COMMUNICATIONS_CREATE: 'communications:create',
  
  // Analytics
  ANALYTICS_READ: 'analytics:read',
  
  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update'
};

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
} 