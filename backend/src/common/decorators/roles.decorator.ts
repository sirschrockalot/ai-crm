import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  ACQUISITION_REP: 'acquisition_rep',
  DISPOSITION_MANAGER: 'disposition_manager',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]; 