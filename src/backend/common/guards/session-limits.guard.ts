import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SessionsService } from '../../modules/sessions/sessions.service';

@Injectable()
export class SessionLimitsGuard implements CanActivate {
  private readonly logger = new Logger(SessionLimitsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly sessionsService: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionLimits = this.reflector.get<{
      maxConcurrentSessions?: number;
      maxSessionsPerUser?: number;
      maxSessionsPerIP?: number;
      requireActiveSession?: boolean;
    }>('sessionLimits', context.getHandler());

    if (!sessionLimits) {
      return true; // No session limits specified
    }

    try {
      const userId = this.extractUserId(request);
      const tenantId = this.extractTenantId(request);
      const ipAddress = this.extractIPAddress(request);

      if (!userId || !tenantId) {
        this.logger.warn('Session limits check failed: missing user or tenant ID');
        return true; // Allow request if we can't identify user
      }

      // Check concurrent session limits
      if (sessionLimits.maxConcurrentSessions) {
        const canProceed = await this.checkConcurrentSessionLimit(
          userId,
          tenantId,
          sessionLimits.maxConcurrentSessions,
        );
        if (!canProceed) {
          throw new ForbiddenException('Maximum concurrent sessions exceeded');
        }
      }

      // Check sessions per user limit
      if (sessionLimits.maxSessionsPerUser) {
        const canProceed = await this.checkUserSessionLimit(
          userId,
          tenantId,
          sessionLimits.maxSessionsPerUser,
        );
        if (!canProceed) {
          throw new ForbiddenException('Maximum sessions per user exceeded');
        }
      }

      // Check sessions per IP limit
      if (sessionLimits.maxSessionsPerIP && ipAddress) {
        const canProceed = await this.checkIPSessionLimit(
          ipAddress,
          tenantId,
          sessionLimits.maxSessionsPerIP,
        );
        if (!canProceed) {
          throw new ForbiddenException('Maximum sessions per IP exceeded');
        }
      }

      // Check if active session is required
      if (sessionLimits.requireActiveSession) {
        const hasActiveSession = await this.checkActiveSession(userId, tenantId);
        if (!hasActiveSession) {
          throw new ForbiddenException('Active session required');
        }
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error in session limits guard:', error);
      return true; // Allow request on error
    }
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(request: Request): string | null {
    return request.headers['x-user-id'] as string || null;
  }

  /**
   * Extract tenant ID from request
   */
  private extractTenantId(request: Request): string | null {
    return request.headers['x-tenant-id'] as string || null;
  }

  /**
   * Extract IP address from request
   */
  private extractIPAddress(request: Request): string {
    const ip = 
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.headers['x-client-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown';

    return ip.split(',')[0].trim();
  }

  /**
   * Check concurrent session limit
   */
  private async checkConcurrentSessionLimit(
    userId: string,
    tenantId: string,
    maxSessions: number,
  ): Promise<boolean> {
    try {
      // Get active sessions for user
      const activeSessions = await this.sessionsService.getSessions(
        { userId: userId as any, isActive: true },
        tenantId,
      );

      const currentSessionCount = activeSessions.sessions.length;

      this.logger.debug(`User ${userId} has ${currentSessionCount} active sessions (limit: ${maxSessions})`);

      return currentSessionCount < maxSessions;
    } catch (error) {
      this.logger.error('Error checking concurrent session limit:', error);
      return true; // Allow on error
    }
  }

  /**
   * Check user session limit
   */
  private async checkUserSessionLimit(
    userId: string,
    tenantId: string,
    maxSessions: number,
  ): Promise<boolean> {
    try {
      // Get all sessions for user (active and inactive)
      const userSessions = await this.sessionsService.getSessions(
        { userId: userId as any },
        tenantId,
      );

      const totalSessionCount = userSessions.total;

      this.logger.debug(`User ${userId} has ${totalSessionCount} total sessions (limit: ${maxSessions})`);

      return totalSessionCount < maxSessions;
    } catch (error) {
      this.logger.error('Error checking user session limit:', error);
      return true; // Allow on error
    }
  }

  /**
   * Check IP session limit
   */
  private async checkIPSessionLimit(
    ipAddress: string,
    tenantId: string,
    maxSessions: number,
  ): Promise<boolean> {
    try {
      // Get sessions by IP address
      const ipSessions = await this.sessionsService.getSessionsByIpAddress(ipAddress, tenantId);

      const activeIPSessionCount = ipSessions.filter(session => session.isActive).length;

      this.logger.debug(`IP ${ipAddress} has ${activeIPSessionCount} active sessions (limit: ${maxSessions})`);

      return activeIPSessionCount < maxSessions;
    } catch (error) {
      this.logger.error('Error checking IP session limit:', error);
      return true; // Allow on error
    }
  }

  /**
   * Check if user has active session
   */
  private async checkActiveSession(userId: string, tenantId: string): Promise<boolean> {
    try {
      // Get active sessions for user
      const activeSessions = await this.sessionsService.getSessions(
        { userId: userId as any, isActive: true },
        tenantId,
      );

      const hasActiveSession = activeSessions.sessions.length > 0;

      this.logger.debug(`User ${userId} has active session: ${hasActiveSession}`);

      return hasActiveSession;
    } catch (error) {
      this.logger.error('Error checking active session:', error);
      return false; // Deny on error
    }
  }

  /**
   * Get session limits for user role
   */
  private getSessionLimitsForRole(userRole: string): {
    maxConcurrentSessions: number;
    maxSessionsPerUser: number;
    maxSessionsPerIP: number;
  } {
    // Define session limits based on user role
    const roleLimits: Record<string, {
      maxConcurrentSessions: number;
      maxSessionsPerUser: number;
      maxSessionsPerIP: number;
    }> = {
      admin: {
        maxConcurrentSessions: 10,
        maxSessionsPerUser: 50,
        maxSessionsPerIP: 5,
      },
      'security-admin': {
        maxConcurrentSessions: 5,
        maxSessionsPerUser: 20,
        maxSessionsPerIP: 3,
      },
      user: {
        maxConcurrentSessions: 3,
        maxSessionsPerUser: 10,
        maxSessionsPerIP: 2,
      },
      guest: {
        maxConcurrentSessions: 1,
        maxSessionsPerUser: 5,
        maxSessionsPerIP: 1,
      },
    };

    return roleLimits[userRole] || roleLimits.user;
  }

  /**
   * Check if session is suspicious
   */
  private async isSuspiciousSession(
    userId: string,
    tenantId: string,
    ipAddress: string,
  ): Promise<boolean> {
    try {
      // Check for multiple sessions from different IPs
      const userSessions = await this.sessionsService.getSessions(
        { userId: userId as any, isActive: true },
        tenantId,
      );

      const uniqueIPs = new Set(userSessions.sessions.map(session => session.ipAddress));

      // If user has sessions from more than 2 different IPs, it's suspicious
      if (uniqueIPs.size > 2) {
        this.logger.warn(`Suspicious session pattern detected for user ${userId}: ${uniqueIPs.size} different IPs`);
        return true;
      }

      // Check for rapid session creation
      const recentSessions = userSessions.sessions.filter(
        session => new Date().getTime() - new Date(session.createdAt).getTime() < 5 * 60 * 1000 // 5 minutes
      );

      if (recentSessions.length > 3) {
        this.logger.warn(`Rapid session creation detected for user ${userId}: ${recentSessions.length} sessions in 5 minutes`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking suspicious session:', error);
      return false;
    }
  }
} 