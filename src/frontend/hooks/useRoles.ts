import { useAuth } from '../contexts/AuthContext';
import { hasRole, hasAnyRole, hasAllRoles, ROLES, Role } from '../utils/auth';

export const useRoles = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  return {
    userRoles,
    hasRole: (role: Role | string) => hasRole(userRoles, role),
    hasAnyRole: (roles: (Role | string)[]) => hasAnyRole(userRoles, roles),
    hasAllRoles: (roles: (Role | string)[]) => hasAllRoles(userRoles, roles),
    isAdmin: () => hasRole(userRoles, ROLES.ADMIN),
    isAcqRep: () => hasRole(userRoles, ROLES.ACQ_REP),
    isDispo: () => hasRole(userRoles, ROLES.DISPO),
    isTx: () => hasRole(userRoles, ROLES.TX),
    ROLES,
  };
};
