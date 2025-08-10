import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

export interface SecurityEvent {
  eventType: SecurityEventType;
  userId?: string;
  tenantId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  statusCode: number;
  timestamp: Date;
  details: any;
  severity: SecurityEventSeverity;
}

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_FAILURE = 'password_reset_failure',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_VERIFICATION_SUCCESS = 'mfa_verification_success',
  MFA_VERIFICATION_FAILURE = 'mfa_verification_failure',

  // Authorization events
  PERMISSION_DENIED = 'permission_denied',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',

  // Data access events
  DATA_ACCESS = 'data_access',
  DATA_CREATED = 'data_created',
  DATA_UPDATED = 'data_updated',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',

  // System events
  CONFIGURATION_CHANGED = 'configuration_changed',
  FEATURE_FLAG_TOGGLED = 'feature_flag_toggled',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',

  // Security events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',

  // Tenant events
  TENANT_CREATED = 'tenant_created',
  TENANT_UPDATED = 'tenant_updated',
  TENANT_DELETED = 'tenant_deleted',
  TENANT_SUSPENDED = 'tenant_suspended',
  TENANT_ACTIVATED = 'tenant_activated',
  CROSS_TENANT_ACCESS_ATTEMPT = 'cross_tenant_access_attempt',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Injectable()
export class SecurityLoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Simple logging without overriding res.end
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logSecurityEvent(req, res, duration);
    });

    next();
  }

  private async logSecurityEvent(req: Request, res: Response, duration: number) {
    try {
      const securityEvent = this.createSecurityEvent(req, res, duration);
      
      // Only log events that meet security criteria
      if (this.shouldLogEvent(securityEvent)) {
        await this.persistSecurityEvent(securityEvent);
        
        // Log to console for development
        if (this.configService.get('NODE_ENV') === 'development') {
          console.log('Security Event:', JSON.stringify(securityEvent, null, 2));
        }

        // Check for suspicious activity
        await this.checkForSuspiciousActivity(securityEvent);
      }
    } catch (error) {
      // Don't let logging errors affect the main application
      console.error('Security logging error:', error);
    }
  }

  private createSecurityEvent(req: Request, res: Response, duration: number): SecurityEvent {
    const eventType = this.determineEventType(req, res);
    const severity = this.determineSeverity(eventType, res.statusCode);
    
    return {
      eventType,
      userId: (req as any).user?.id,
      tenantId: (req as any).tenant?.tenantId,
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      timestamp: new Date(),
      details: this.extractEventDetails(req, res),
      severity,
    };
  }

  private determineEventType(req: Request, res: Response): SecurityEventType {
    const path = req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Authentication events
    if (path.includes('/auth/login') && method === 'POST') {
      return statusCode === 200 ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE;
    }

    if (path.includes('/auth/logout') && method === 'POST') {
      return SecurityEventType.LOGOUT;
    }

    if (path.includes('/auth/password-reset') && method === 'POST') {
      return statusCode === 200 ? SecurityEventType.PASSWORD_RESET_SUCCESS : SecurityEventType.PASSWORD_RESET_FAILURE;
    }

    // Authorization events
    if (statusCode === 403) {
      return SecurityEventType.PERMISSION_DENIED;
    }

    // Data access events
    if (path.includes('/users') || path.includes('/leads') || path.includes('/tenants')) {
      switch (method) {
        case 'GET':
          return SecurityEventType.DATA_ACCESS;
        case 'POST':
          return SecurityEventType.DATA_CREATED;
        case 'PUT':
        case 'PATCH':
          return SecurityEventType.DATA_UPDATED;
        case 'DELETE':
          return SecurityEventType.DATA_DELETED;
      }
    }

    // System events
    if (path.includes('/settings') || path.includes('/config')) {
      return SecurityEventType.CONFIGURATION_CHANGED;
    }

    // Default to data access for other endpoints
    return SecurityEventType.DATA_ACCESS;
  }

  private determineSeverity(eventType: SecurityEventType, statusCode: number): SecurityEventSeverity {
    // Critical events
    if (eventType === SecurityEventType.BRUTE_FORCE_ATTEMPT ||
        eventType === SecurityEventType.SQL_INJECTION_ATTEMPT ||
        eventType === SecurityEventType.XSS_ATTEMPT ||
        eventType === SecurityEventType.CSRF_ATTEMPT) {
      return SecurityEventSeverity.CRITICAL;
    }

    // High severity events
    if (eventType === SecurityEventType.LOGIN_FAILURE ||
        eventType === SecurityEventType.PERMISSION_DENIED ||
        eventType === SecurityEventType.CROSS_TENANT_ACCESS_ATTEMPT ||
        eventType === SecurityEventType.SUSPICIOUS_ACTIVITY) {
      return SecurityEventSeverity.HIGH;
    }

    // Medium severity events
    if (eventType === SecurityEventType.DATA_DELETED ||
        eventType === SecurityEventType.CONFIGURATION_CHANGED ||
        eventType === SecurityEventType.TENANT_SUSPENDED ||
        eventType === SecurityEventType.TENANT_DELETED) {
      return SecurityEventSeverity.MEDIUM;
    }

    // Low severity events (default)
    return SecurityEventSeverity.LOW;
  }

  private getClientIp(req: Request): string {
    // Check for forwarded headers (when behind proxy)
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }

    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  private extractEventDetails(req: Request, res: Response): any {
    const details: any = {
      requestBody: this.sanitizeRequestBody(req.body),
      queryParams: req.query,
      headers: this.sanitizeHeaders(req.headers),
    };

    // Add specific details based on event type
    if (req.path.includes('/auth/login')) {
      details.loginAttempt = {
        email: req.body?.email,
        success: res.statusCode === 200,
      };
    }

    if (req.path.includes('/users') && req.method === 'POST') {
      details.userCreated = {
        email: req.body?.email,
        role: req.body?.role,
      };
    }

    return details;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return null;

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private shouldLogEvent(event: SecurityEvent): boolean {
    // Always log high and critical events
    if (event.severity === SecurityEventSeverity.HIGH || 
        event.severity === SecurityEventSeverity.CRITICAL) {
      return true;
    }

    // Log authentication events
    if (event.eventType === SecurityEventType.LOGIN_SUCCESS ||
        event.eventType === SecurityEventType.LOGIN_FAILURE ||
        event.eventType === SecurityEventType.LOGOUT) {
      return true;
    }

    // Log data modification events
    if (event.eventType === SecurityEventType.DATA_CREATED ||
        event.eventType === SecurityEventType.DATA_UPDATED ||
        event.eventType === SecurityEventType.DATA_DELETED) {
      return true;
    }

    // Log permission denied events
    if (event.eventType === SecurityEventType.PERMISSION_DENIED) {
      return true;
    }

    // Don't log low-severity data access events unless in debug mode
    if (event.eventType === SecurityEventType.DATA_ACCESS && 
        event.severity === SecurityEventSeverity.LOW) {
      return this.configService.get('NODE_ENV') === 'development';
    }

    return false;
  }

  private async persistSecurityEvent(event: SecurityEvent): Promise<void> {
    // TODO: Implement database persistence for security events
    // This would typically save to a security events collection
    // For now, we'll just log to console in development
    
    if (this.configService.get('NODE_ENV') === 'development') {
      console.log('Security Event Logged:', {
        type: event.eventType,
        severity: event.severity,
        userId: event.userId,
        tenantId: event.tenantId,
        ipAddress: event.ipAddress,
        endpoint: event.endpoint,
        method: event.method,
        statusCode: event.statusCode,
        timestamp: event.timestamp,
      });
    }
  }

  private async checkForSuspiciousActivity(event: SecurityEvent): Promise<void> {
    // Check for brute force attempts
    if (event.eventType === SecurityEventType.LOGIN_FAILURE) {
      await this.checkBruteForceAttempt(event);
    }

    // Check for permission escalation attempts
    if (event.eventType === SecurityEventType.PERMISSION_DENIED) {
      await this.checkPermissionEscalation(event);
    }

    // Check for cross-tenant access attempts
    if (event.eventType === SecurityEventType.DATA_ACCESS && event.tenantId) {
      await this.checkCrossTenantAccess(event);
    }
  }

  private async checkBruteForceAttempt(event: SecurityEvent): Promise<void> {
    // TODO: Implement brute force detection
    // This would typically check for multiple failed login attempts from the same IP
    // and potentially block the IP or require additional verification
  }

  private async checkPermissionEscalation(event: SecurityEvent): Promise<void> {
    // TODO: Implement permission escalation detection
    // This would check if a user is repeatedly trying to access resources they don't have permission for
  }

  private async checkCrossTenantAccess(event: SecurityEvent): Promise<void> {
    // TODO: Implement cross-tenant access detection
    // This would check if a user is trying to access data from a different tenant
  }
} 