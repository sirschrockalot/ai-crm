import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ActivityType, ActivitySeverity } from '../../modules/users/schemas/user-activity.schema';

export interface ActivityLoggingOptions {
  enabled: boolean;
  logLevel: 'all' | 'important' | 'security' | 'none';
  excludePaths: string[];
  includePaths: string[];
  sensitiveFields: string[];
}

@Injectable()
export class ActivityLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ActivityLoggingMiddleware.name);
  private readonly options: ActivityLoggingOptions;

  constructor(options: Partial<ActivityLoggingOptions> = {}) {
    this.options = {
      enabled: true,
      logLevel: 'important',
      excludePaths: ['/health', '/metrics', '/favicon.ico'],
      includePaths: [],
      sensitiveFields: ['password', 'token', 'secret', 'key'],
      ...options,
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.options.enabled) {
      return next();
    }

    // Skip logging for excluded paths
    if (this.shouldSkipPath(req.path)) {
      return next();
    }

    // Only log for included paths if specified
    if (this.options.includePaths.length > 0 && !this.options.includePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Capture request start time
    const startTime = Date.now();

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      // Log activity based on response
      this.logActivity(req, res, duration);
      
      // Call original end method
      originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  private shouldSkipPath(path: string): boolean {
    return this.options.excludePaths.some(excludePath => path.startsWith(excludePath));
  }

  private shouldLogActivity(req: Request, res: Response): boolean {
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;

    // Always log security-related activities
    if (this.isSecurityActivity(method, path)) {
      return true;
    }

    // Log based on log level
    switch (this.options.logLevel) {
      case 'all':
        return true;
      case 'important':
        return this.isImportantActivity(method, path, statusCode);
      case 'security':
        return this.isSecurityActivity(method, path);
      case 'none':
        return false;
      default:
        return false;
    }
  }

  private isImportantActivity(method: string, path: string, statusCode: number): boolean {
    // Log all POST, PUT, DELETE requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return true;
    }

    // Log specific important GET requests
    const importantPaths = [
      '/users/profile',
      '/users/settings',
      '/auth/logout',
      '/admin/',
    ];

    if (method === 'GET' && importantPaths.some(importantPath => path.startsWith(importantPath))) {
      return true;
    }

    // Log error responses
    if (statusCode >= 400) {
      return true;
    }

    return false;
  }

  private isSecurityActivity(method: string, path: string): boolean {
    const securityPaths = [
      '/auth/login',
      '/auth/logout',
      '/auth/refresh',
      '/auth/google',
      '/users/password',
      '/users/status',
      '/users/roles',
    ];

    return securityPaths.some(securityPath => path.startsWith(securityPath));
  }

  private async logActivity(req: Request, res: Response, duration: number) {
    if (!this.shouldLogActivity(req, res)) {
      return;
    }

    try {
      const user = (req as any).user;
      if (!user) {
        return; // Skip if no authenticated user
      }

      const activityData = this.buildActivityData(req, res, duration, user);
      
      // Get users service from request context
      const usersService = (req as any).usersService;
      if (usersService && typeof usersService.logUserActivity === 'function') {
        await usersService.logUserActivity(activityData);
      } else {
        // Fallback to console logging
        this.logger.log(`Activity: ${activityData.type} - ${activityData.description}`, {
          userId: user.sub,
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
        });
      }
    } catch (error) {
      this.logger.error('Failed to log activity:', error);
    }
  }

  private buildActivityData(req: Request, res: Response, duration: number, user: any) {
    const method = req.method;
    const path = req.path;
    const statusCode = res.statusCode;

    // Determine activity type based on request
    let type = ActivityType.API_ACCESS;
    let description = `${method} ${path}`;
    let severity = ActivitySeverity.LOW;

    if (this.isSecurityActivity(method, path)) {
      type = ActivityType.SECURITY_EVENT;
      severity = ActivitySeverity.MEDIUM;
    }

    if (statusCode >= 400) {
      severity = ActivitySeverity.HIGH;
      description = `Failed: ${method} ${path} (${statusCode})`;
    }

    if (statusCode >= 500) {
      severity = ActivitySeverity.CRITICAL;
    }

    // Sanitize request body for logging
    const sanitizedBody = this.sanitizeData(req.body);

    return {
      userId: user.sub,
      tenantId: user.tenantId,
      type,
      description,
      severity,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method,
        path,
        statusCode,
        duration,
        requestId: req.headers['x-request-id'] as string,
      },
      context: {
        module: this.getModuleFromPath(path),
        action: method,
        target: path,
      },
      performedAt: new Date(),
      performedBy: user.sub,
    };
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    for (const field of this.options.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getModuleFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    return segments[0] || 'unknown';
  }
} 