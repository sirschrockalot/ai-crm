import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  subdomain?: string;
}

export interface RequestWithTenant extends Request {
  tenant: TenantContext;
  user?: {
    sub: string;
    email: string;
    tenantId?: string;
    roles?: string[];
    status?: string;
  };
}

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction) {
    try {
      // Extract tenant information from multiple sources
      const tenantContext = await this.extractTenantContext(req);
      
      if (!tenantContext) {
        throw new UnauthorizedException('Tenant context not found');
      }

      // Validate tenant access
      await this.validateTenantAccess(req, tenantContext);

      // Inject tenant context into request
      req.tenant = tenantContext;

      // Add tenant context to response headers for debugging
      res.setHeader('X-Tenant-ID', tenantContext.tenantId);
      res.setHeader('X-Tenant-Name', tenantContext.tenantName);

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      
      // Log unexpected errors but don't expose internal details
      console.error('Tenant isolation middleware error:', error);
      throw new UnauthorizedException('Tenant validation failed');
    }
  }

  private async extractTenantContext(req: Request): Promise<TenantContext | null> {
    // Priority order for tenant extraction:
    // 1. JWT token (primary method)
    // 2. Subdomain
    // 3. Custom header
    // 4. Query parameter (for development/testing)

    // Method 1: Extract from JWT token
    const tenantFromToken = await this.extractTenantFromToken(req);
    if (tenantFromToken) {
      return tenantFromToken;
    }

    // Method 2: Extract from subdomain
    const tenantFromSubdomain = this.extractTenantFromSubdomain(req);
    if (tenantFromSubdomain) {
      return tenantFromSubdomain;
    }

    // Method 3: Extract from custom header
    const tenantFromHeader = this.extractTenantFromHeader(req);
    if (tenantFromHeader) {
      return tenantFromHeader;
    }

    // Method 4: Extract from query parameter (development/testing only)
    if (this.configService.get('NODE_ENV') === 'development') {
      const tenantFromQuery = this.extractTenantFromQuery(req);
      if (tenantFromQuery) {
        return tenantFromQuery;
      }
    }

    return null;
  }

  private async extractTenantFromToken(req: Request): Promise<TenantContext | null> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token);

      if (payload.tenantId && payload.tenantName) {
        return {
          tenantId: payload.tenantId,
          tenantName: payload.tenantName,
          subdomain: payload.subdomain,
        };
      }

      return null;
    } catch (error) {
      // Token is invalid or expired, but that's handled by auth guard
      return null;
    }
  }

  private extractTenantFromSubdomain(req: Request): TenantContext | null {
    const host = req.headers.host;
    if (!host) {
      return null;
    }

    // Extract subdomain from host
    // Example: tenant1.dealcycle.com -> tenant1
    const subdomain = host.split('.')[0];
    
    // Skip common subdomains that aren't tenant-specific
    const skipSubdomains = ['www', 'api', 'admin', 'app', 'dev', 'staging', 'prod'];
    if (skipSubdomains.includes(subdomain)) {
      return null;
    }

    // For now, use subdomain as tenant name
    // In production, you'd look up the tenant in a database
    return {
      tenantId: subdomain, // This should be a UUID in production
      tenantName: subdomain,
      subdomain: subdomain,
    };
  }

  private extractTenantFromHeader(req: Request): TenantContext | null {
    const tenantId = req.headers['x-tenant-id'] as string;
    const tenantName = req.headers['x-tenant-name'] as string;

    if (tenantId && tenantName) {
      return {
        tenantId,
        tenantName,
        subdomain: req.headers['x-tenant-subdomain'] as string,
      };
    }

    return null;
  }

  private extractTenantFromQuery(req: Request): TenantContext | null {
    const tenantId = req.query.tenantId as string;
    const tenantName = req.query.tenantName as string;

    if (tenantId && tenantName) {
      return {
        tenantId,
        tenantName,
        subdomain: req.query.tenantSubdomain as string,
      };
    }

    return null;
  }

  private async validateTenantAccess(req: Request, tenantContext: TenantContext): Promise<void> {
    // Validate tenant exists and is active
    // This would typically involve a database lookup
    const isValidTenant = await this.validateTenantExists(tenantContext.tenantId);
    
    if (!isValidTenant) {
      throw new ForbiddenException('Invalid or inactive tenant');
    }

    // Check if user has access to this tenant
    // This would be validated by the auth guard, but we can add additional checks here
    const userHasTenantAccess = await this.validateUserTenantAccess(req, tenantContext);
    
    if (!userHasTenantAccess) {
      throw new ForbiddenException('User does not have access to this tenant');
    }
  }

  private async validateTenantExists(tenantId: string): Promise<boolean> {
    // TODO: Implement database lookup to validate tenant exists and is active
    // For now, return true for development
    return true;
  }

  private async validateUserTenantAccess(req: Request, tenantContext: TenantContext): Promise<boolean> {
    // TODO: Implement user-tenant access validation
    // This would check if the authenticated user has access to the specified tenant
    // For now, return true for development
    return true;
  }
} 