import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);
    
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }
    
    req.tenantId = tenantId;
    next();
  }

  private extractTenantId(req: Request): string {
    // First try to get from JWT token (user context)
    if (req.user && req.user.tenant_id) {
      return req.user.tenant_id;
    }
    
    // Fallback to header (for admin operations)
    const headerTenantId = req.headers['x-tenant-id'] as string;
    if (headerTenantId) {
      return headerTenantId;
    }
    
    // For OAuth flows, use default tenant
    if (req.path.includes('/auth/google')) {
      return process.env.DEFAULT_TENANT_ID || '507f1f77bcf86cd799439011';
    }
    
    return null;
  }
} 