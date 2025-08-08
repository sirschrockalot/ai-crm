import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SessionTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionTrackingMiddleware.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract session information from request
    const sessionId = this.extractSessionId(req);
    const userId = this.extractUserId(req);
    const tenantId = this.extractTenantId(req);
    const ipAddress = this.extractIPAddress(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Track session activity
    if (sessionId && userId && tenantId) {
      this.trackSessionActivity({
        sessionId,
        userId,
        tenantId,
        ipAddress,
        userAgent,
        method: req.method,
        url: req.url,
        timestamp: new Date(),
      });
    }

    // Add response tracking
    res.on('finish', () => {
      this.trackResponse({
        sessionId,
        userId,
        tenantId,
        ipAddress,
        userAgent,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: Date.now() - req.startTime,
        timestamp: new Date(),
      });
    });

    // Set request start time for response time calculation
    req.startTime = Date.now();

    next();
  }

  /**
   * Extract session ID from request
   */
  private extractSessionId(req: Request): string | null {
    // Check various sources for session ID
    const sessionId = 
      req.headers['x-session-id'] ||
      req.headers['authorization']?.toString().replace('Bearer ', '') ||
      req.cookies?.sessionId ||
      req.query.sessionId as string;

    return sessionId || null;
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(req: Request): string | null {
    // Check JWT token or other authentication headers
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.toString().startsWith('Bearer ')) {
      try {
        // In a real implementation, you would decode the JWT token
        // For now, we'll extract from headers or user object
        return req.headers['x-user-id'] as string || null;
      } catch (error) {
        this.logger.warn('Error extracting user ID from token:', error);
      }
    }

    return req.headers['x-user-id'] as string || null;
  }

  /**
   * Extract tenant ID from request
   */
  private extractTenantId(req: Request): string | null {
    return req.headers['x-tenant-id'] as string || null;
  }

  /**
   * Extract IP address from request
   */
  private extractIPAddress(req: Request): string {
    // Check various headers for real IP address
    const ip = 
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.headers['x-client-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown';

    // Handle multiple IPs in x-forwarded-for
    return ip.split(',')[0].trim();
  }

  /**
   * Track session activity
   */
  private trackSessionActivity(activity: {
    sessionId: string;
    userId: string;
    tenantId: string;
    ipAddress: string;
    userAgent: string;
    method: string;
    url: string;
    timestamp: Date;
  }) {
    try {
      // Emit session activity event
      this.eventEmitter.emit('session.activity', activity);

      // Log session activity
      this.logger.debug(`Session activity: ${activity.sessionId} - ${activity.method} ${activity.url}`);

      // In a real implementation, you would:
      // 1. Store activity in database
      // 2. Update session last activity
      // 3. Check for suspicious patterns
      // 4. Update analytics

    } catch (error) {
      this.logger.error('Error tracking session activity:', error);
    }
  }

  /**
   * Track response information
   */
  private trackResponse(response: {
    sessionId: string | null;
    userId: string | null;
    tenantId: string | null;
    ipAddress: string;
    userAgent: string;
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
  }) {
    try {
      // Emit response event
      this.eventEmitter.emit('session.response', response);

      // Log response information
      this.logger.debug(`Response: ${response.method} ${response.url} - ${response.statusCode} (${response.responseTime}ms)`);

      // Check for suspicious response patterns
      this.checkSuspiciousResponse(response);

    } catch (error) {
      this.logger.error('Error tracking response:', error);
    }
  }

  /**
   * Check for suspicious response patterns
   */
  private checkSuspiciousResponse(response: {
    sessionId: string | null;
    userId: string | null;
    tenantId: string | null;
    ipAddress: string;
    userAgent: string;
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
  }) {
    try {
      // Check for error responses
      if (response.statusCode >= 400) {
        this.eventEmitter.emit('session.error_response', response);
      }

      // Check for slow responses
      if (response.responseTime > 5000) { // 5 seconds
        this.eventEmitter.emit('session.slow_response', response);
      }

      // Check for suspicious status codes
      const suspiciousStatusCodes = [401, 403, 500, 502, 503];
      if (suspiciousStatusCodes.includes(response.statusCode)) {
        this.eventEmitter.emit('session.suspicious_response', response);
      }

      // Check for rapid requests (potential abuse)
      // This would typically involve checking request frequency
      
    } catch (error) {
      this.logger.error('Error checking suspicious response:', error);
    }
  }
} 