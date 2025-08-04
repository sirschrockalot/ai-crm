import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles or permissions are required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check roles first
    if (requiredRoles) {
      const hasRequiredRole = this.checkRoles(user, requiredRoles);
      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Insufficient role. Required: ${requiredRoles.join(', ')}. User roles: ${user.roles?.join(', ') || 'none'}`
        );
      }
    }

    // Check permissions
    if (requiredPermissions) {
      const hasRequiredPermissions = this.checkPermissions(user, requiredPermissions);
      if (!hasRequiredPermissions) {
        throw new ForbiddenException(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
        );
      }
    }

    return true;
  }

  private checkRoles(user: any, requiredRoles: string[]): boolean {
    if (!user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    return requiredRoles.some(role => user.roles.includes(role));
  }

  private checkPermissions(user: any, requiredPermissions: string[]): boolean {
    const userPermissions = this.getUserPermissions(user);
    
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  private getUserPermissions(user: any): string[] {
    const permissions = new Set<string>();
    
    // Add permissions from user's roles
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((role: string) => {
        const rolePermissions = ROLE_PERMISSIONS[role] || [];
        rolePermissions.forEach(permission => permissions.add(permission));
      });
    }

    // Add any custom permissions assigned directly to the user
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  }
} 