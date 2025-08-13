import { Injectable, Logger } from '@nestjs/common';
import { UserDocument } from '../users/schemas/user.schema';

interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: Date;
  count: number;
}

interface IpActivity {
  ip: string;
  attempts: number;
  lastAttempt: Date;
  blocked: boolean;
  blockedUntil?: Date;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  
  // In-memory storage for login attempts (in production, use Redis)
  private loginAttempts = new Map<string, LoginAttempt>();
  private ipActivity = new Map<string, IpActivity>();
  
  // Configuration
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly IP_BLOCK_THRESHOLD = 10;
  private readonly IP_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour

  async recordFailedLoginAttempt(email: string, ip: string, userAgent: string): Promise<void> {
    const key = `${email}:${ip}`;
    const now = new Date();
    
    // Record login attempt
    const attempt = this.loginAttempts.get(key) || {
      email,
      ip,
      timestamp: now,
      count: 0,
    };
    
    attempt.count++;
    attempt.timestamp = now;
    this.loginAttempts.set(key, attempt);
    
    // Record IP activity
    const ipRecord = this.ipActivity.get(ip) || {
      ip,
      attempts: 0,
      lastAttempt: now,
      blocked: false,
    };
    
    ipRecord.attempts++;
    ipRecord.lastAttempt = now;
    
    // Block IP if too many attempts
    if (ipRecord.attempts >= this.IP_BLOCK_THRESHOLD && !ipRecord.blocked) {
      ipRecord.blocked = true;
      ipRecord.blockedUntil = new Date(now.getTime() + this.IP_BLOCK_DURATION);
      this.logger.warn(`IP ${ip} blocked due to excessive failed login attempts`);
    }
    
    this.ipActivity.set(ip, ipRecord);
    
    // Clean up old records
    this.cleanupOldRecords();
    
    this.logger.warn(`Failed login attempt for ${email} from IP ${ip} (attempt ${attempt.count})`);
  }

  async checkSuspiciousActivity(user: UserDocument, ip: string, userAgent: string): Promise<void> {
    const suspicious = await this.detectSuspiciousActivity(user, ip, userAgent);
    
    if (suspicious) {
      this.logger.warn(`Suspicious activity detected for user ${user.email} from IP ${ip}`);
      
      // Log suspicious activity
      // This would typically trigger alerts or additional verification
    }
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    const ipRecord = this.ipActivity.get(ip);
    
    if (!ipRecord || !ipRecord.blocked) {
      return false;
    }
    
    // Check if block has expired
    if (ipRecord.blockedUntil && ipRecord.blockedUntil < new Date()) {
      ipRecord.blocked = false;
      ipRecord.blockedUntil = undefined;
      this.ipActivity.set(ip, ipRecord);
      return false;
    }
    
    return true;
  }

  async getLoginAttempts(email: string, ip: string): Promise<number> {
    const key = `${email}:${ip}`;
    const attempt = this.loginAttempts.get(key);
    return attempt ? attempt.count : 0;
  }

  async shouldLockAccount(email: string, ip: string): Promise<boolean> {
    const attempts = await this.getLoginAttempts(email, ip);
    return attempts >= this.MAX_LOGIN_ATTEMPTS;
  }

  async resetLoginAttempts(email: string, ip: string): Promise<void> {
    const key = `${email}:${ip}`;
    this.loginAttempts.delete(key);
  }

  private async detectSuspiciousActivity(user: UserDocument, ip: string, userAgent: string): Promise<boolean> {
    // Check for multiple failed attempts
    const failedAttempts = await this.getLoginAttempts(user.email, ip);
    if (failedAttempts > 0) {
      return true;
    }
    
    // Check for unusual login time (outside business hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      return true;
    }
    
    // Check for new device/location (simplified)
    const existingSessions = user.sessions || [];
    const hasExistingSession = existingSessions.some(s => s.ip === ip);
    
    if (!hasExistingSession && existingSessions.length > 0) {
      return true;
    }
    
    // Check for rapid successive logins
    if (user.lastLoginAt) {
      const timeSinceLastLogin = Date.now() - user.lastLoginAt.getTime();
      if (timeSinceLastLogin < 5 * 60 * 1000) { // Less than 5 minutes
        return true;
      }
    }
    
    return false;
  }

  private cleanupOldRecords(): void {
    const now = new Date();
    const cutoff = new Date(now.getTime() - this.LOCKOUT_DURATION);
    
    // Clean up old login attempts
    for (const [key, attempt] of this.loginAttempts.entries()) {
      if (attempt.timestamp < cutoff) {
        this.loginAttempts.delete(key);
      }
    }
    
    // Clean up old IP activity
    for (const [ip, record] of this.ipActivity.entries()) {
      if (record.lastAttempt < cutoff && !record.blocked) {
        this.ipActivity.delete(ip);
      }
    }
  }

  // Rate limiting methods
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    // Simple in-memory rate limiting (in production, use Redis)
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // This is a simplified implementation
    // In production, use a proper rate limiting library
    return true;
  }

  // Security monitoring
  async logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    this.logger.log(`Security Event [${event.severity.toUpperCase()}]: ${event.type} - ${event.description}`);
    
    // In production, this would send to a security monitoring system
    // and potentially trigger alerts
  }
}
