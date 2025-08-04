import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from '../constants/permissions';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const RequirePermissions = (...permissions: (keyof typeof PERMISSIONS)[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

// Convenience decorators for common permission patterns
export const RequireLeadAccess = () => RequirePermissions('LEADS_READ');
export const RequireLeadWrite = () => RequirePermissions('LEADS_CREATE', 'LEADS_UPDATE');
export const RequireLeadFull = () => RequirePermissions('LEADS_CREATE', 'LEADS_READ', 'LEADS_UPDATE', 'LEADS_DELETE');

export const RequireBuyerAccess = () => RequirePermissions('BUYERS_READ');
export const RequireBuyerWrite = () => RequirePermissions('BUYERS_CREATE', 'BUYERS_UPDATE');
export const RequireBuyerFull = () => RequirePermissions('BUYERS_CREATE', 'BUYERS_READ', 'BUYERS_UPDATE', 'BUYERS_DELETE');

export const RequireUserAccess = () => RequirePermissions('USERS_READ');
export const RequireUserWrite = () => RequirePermissions('USERS_CREATE', 'USERS_UPDATE');
export const RequireUserFull = () => RequirePermissions('USERS_CREATE', 'USERS_READ', 'USERS_UPDATE', 'USERS_DELETE');

export const RequireAnalyticsAccess = () => RequirePermissions('ANALYTICS_READ');
export const RequireReportsAccess = () => RequirePermissions('REPORTS_GENERATE', 'REPORTS_EXPORT');

export const RequireSystemAccess = () => RequirePermissions('SYSTEM_SETTINGS');
export const RequireSystemFull = () => RequirePermissions('SYSTEM_SETTINGS', 'SYSTEM_INTEGRATIONS', 'SYSTEM_BACKUP');

export const RequireCommunicationAccess = () => RequirePermissions('COMMUNICATIONS_READ');
export const RequireCommunicationWrite = () => RequirePermissions('COMMUNICATIONS_SEND', 'COMMUNICATIONS_READ');

export const RequireAutomationAccess = () => RequirePermissions('AUTOMATION_READ');
export const RequireAutomationWrite = () => RequirePermissions('AUTOMATION_CREATE', 'AUTOMATION_UPDATE');
export const RequireAutomationFull = () => RequirePermissions('AUTOMATION_CREATE', 'AUTOMATION_READ', 'AUTOMATION_UPDATE', 'AUTOMATION_DELETE');

// Role-based convenience decorators
export const RequireSuperAdmin = () => Roles('SUPER_ADMIN');
export const RequireAdmin = () => Roles('SUPER_ADMIN', 'TENANT_ADMIN');
export const RequireManager = () => Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER');
export const RequireAgent = () => Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'AGENT'); 