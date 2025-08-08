import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto, SessionResponseDto, TerminateSessionDto, SessionSecurityDto, SessionAnalyticsDto } from './dto/session.dto';
import { DeviceFingerprintingService } from '../security/device-fingerprinting.service';
import { LocationTrackingService } from '../security/location-tracking.service';
import { SecurityEventsService } from '../security/security-events.service';
import * as Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly redis: Redis.Redis;

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly deviceFingerprintingService: DeviceFingerprintingService,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly securityEventsService: SecurityEventsService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: 0,
      keyPrefix: 'session:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis for session management');
    });
  }

  /**
   * Create a new session
   */
  async createSession(createSessionDto: CreateSessionDto): Promise<SessionResponseDto> {
    try {
      // Generate device fingerprint if not provided
      if (!createSessionDto.deviceInfo?.fingerprint) {
        const fingerprint = await this.deviceFingerprintingService.generateFingerprint(createSessionDto.userAgent);
        createSessionDto.deviceInfo = {
          ...createSessionDto.deviceInfo,
          fingerprint,
        };
      }

      // Get location information if not provided
      if (!createSessionDto.location) {
        const location = await this.locationTrackingService.getLocationFromIP(createSessionDto.ipAddress);
        createSessionDto.location = location;
      }

      // Set default expiration if not provided
      if (!createSessionDto.expiresAt) {
        createSessionDto.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      }

      // Create session in database
      const session = new this.sessionModel(createSessionDto);
      const savedSession = await session.save();

      // Store session in Redis for fast access
      await this.storeSessionInRedis(savedSession);

      // Emit session created event
      this.eventEmitter.emit('session.created', {
        sessionId: savedSession._id,
        userId: savedSession.userId,
        tenantId: savedSession.tenantId,
        ipAddress: savedSession.ipAddress,
        deviceInfo: savedSession.deviceInfo,
      });

      // Log security event
      await this.securityEventsService.logSecurityEvent({
        eventType: 'SESSION_CREATED',
        userId: savedSession.userId.toString(),
        tenantId: savedSession.tenantId.toString(),
        ipAddress: savedSession.ipAddress,
        userAgent: savedSession.userAgent,
        resource: 'session',
        action: 'create',
        outcome: 'success',
        details: {
          sessionId: savedSession._id.toString(),
          deviceFingerprint: savedSession.deviceInfo?.fingerprint,
          location: savedSession.location,
        },
      });

      return this.mapToResponseDto(savedSession);
    } catch (error) {
      this.logger.error('Error creating session:', error);
      throw new BadRequestException('Failed to create session');
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string, tenantId: string): Promise<SessionResponseDto> {
    try {
      // Try to get from Redis first
      const cachedSession = await this.getSessionFromRedis(sessionId);
      if (cachedSession) {
        return cachedSession;
      }

      // Get from database
      const session = await this.sessionModel.findOne({
        _id: new Types.ObjectId(sessionId),
        tenantId: new Types.ObjectId(tenantId),
      }).exec();

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Store in Redis for future access
      await this.storeSessionInRedis(session);

      return this.mapToResponseDto(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting session by ID:', error);
      throw new BadRequestException('Failed to get session');
    }
  }

  /**
   * Get sessions with filtering and pagination
   */
  async getSessions(query: SessionQueryDto, tenantId: string): Promise<{ sessions: SessionResponseDto[]; total: number; page: number; limit: number }> {
    try {
      const filter: any = { tenantId: new Types.ObjectId(tenantId) };

      // Apply filters
      if (query.userId) filter.userId = new Types.ObjectId(query.userId.toString());
      if (query.sessionToken) filter.sessionToken = query.sessionToken;
      if (query.ipAddress) filter.ipAddress = query.ipAddress;
      if (query.deviceFingerprint) filter['deviceInfo.fingerprint'] = query.deviceFingerprint;
      if (query.isActive !== undefined) filter.isActive = query.isActive;
      if (query.createdAfter) filter.createdAt = { $gte: query.createdAfter };
      if (query.createdBefore) filter.createdAt = { ...filter.createdAt, $lte: query.createdBefore };
      if (query.lastActivityAfter) filter.lastActivity = { $gte: query.lastActivityAfter };
      if (query.lastActivityBefore) filter.lastActivity = { ...filter.lastActivity, $lte: query.lastActivityBefore };
      if (query.securityFlags && query.securityFlags.length > 0) {
        filter.securityFlags = { $in: query.securityFlags };
      }

      // Build sort object
      const sort: any = {};
      if (query.sortBy) {
        sort[query.sortBy] = query.sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.lastActivity = -1; // Default sort by last activity
      }

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Execute query
      const [sessions, total] = await Promise.all([
        this.sessionModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.sessionModel.countDocuments(filter).exec(),
      ]);

      return {
        sessions: sessions.map(session => this.mapToResponseDto(session)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Error getting sessions:', error);
      throw new BadRequestException('Failed to get sessions');
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, ipAddress?: string, userAgent?: string): Promise<SessionResponseDto> {
    try {
      const session = await this.sessionModel.findById(sessionId).exec();
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Update activity
      await session.updateActivity(ipAddress, userAgent);

      // Update Redis cache
      await this.storeSessionInRedis(session);

      // Emit activity update event
      this.eventEmitter.emit('session.activity_updated', {
        sessionId: session._id,
        userId: session.userId,
        tenantId: session.tenantId,
        lastActivity: session.lastActivity,
      });

      return this.mapToResponseDto(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating session activity:', error);
      throw new BadRequestException('Failed to update session activity');
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(terminateSessionDto: TerminateSessionDto): Promise<SessionResponseDto> {
    try {
      const session = await this.sessionModel.findById(terminateSessionDto.sessionId).exec();
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Terminate session
      await session.terminate(terminateSessionDto.terminatedBy, terminateSessionDto.reason);

      // Remove from Redis
      await this.removeSessionFromRedis(session._id.toString());

      // Emit session terminated event
      this.eventEmitter.emit('session.terminated', {
        sessionId: session._id,
        userId: session.userId,
        tenantId: session.tenantId,
        terminatedBy: terminateSessionDto.terminatedBy,
        reason: terminateSessionDto.reason,
      });

      // Log security event
      await this.securityEventsService.logSecurityEvent({
        eventType: 'SESSION_TERMINATED',
        userId: session.userId.toString(),
        tenantId: session.tenantId.toString(),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        resource: 'session',
        action: 'terminate',
        outcome: 'success',
        details: {
          sessionId: session._id.toString(),
          terminatedBy: terminateSessionDto.terminatedBy.toString(),
          reason: terminateSessionDto.reason,
        },
      });

      return this.mapToResponseDto(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error terminating session:', error);
      throw new BadRequestException('Failed to terminate session');
    }
  }

  /**
   * Add security flag to session
   */
  async addSecurityFlag(sessionSecurityDto: SessionSecurityDto): Promise<SessionResponseDto> {
    try {
      const session = await this.sessionModel.findById(sessionSecurityDto.sessionId).exec();
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Add security flag
      await session.addSecurityFlag(sessionSecurityDto.flag);

      // Update Redis cache
      await this.storeSessionInRedis(session);

      // Log security event
      await this.securityEventsService.logSecurityEvent({
        eventType: 'SESSION_SECURITY_FLAG_ADDED',
        userId: session.userId.toString(),
        tenantId: session.tenantId.toString(),
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        resource: 'session',
        action: 'add_security_flag',
        outcome: 'success',
        details: {
          sessionId: session._id.toString(),
          flag: sessionSecurityDto.flag,
          reason: sessionSecurityDto.reason,
        },
      });

      return this.mapToResponseDto(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding security flag:', error);
      throw new BadRequestException('Failed to add security flag');
    }
  }

  /**
   * Remove security flag from session
   */
  async removeSecurityFlag(sessionSecurityDto: SessionSecurityDto): Promise<SessionResponseDto> {
    try {
      const session = await this.sessionModel.findById(sessionSecurityDto.sessionId).exec();
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Remove security flag
      await session.removeSecurityFlag(sessionSecurityDto.flag);

      // Update Redis cache
      await this.storeSessionInRedis(session);

      return this.mapToResponseDto(session);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing security flag:', error);
      throw new BadRequestException('Failed to remove security flag');
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(tenantId: string): Promise<any> {
    try {
      const stats = await this.sessionModel.getStatistics(new Types.ObjectId(tenantId));
      return stats[0] || {};
    } catch (error) {
      this.logger.error('Error getting session statistics:', error);
      throw new BadRequestException('Failed to get session statistics');
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.sessionModel.cleanupExpired();
      this.logger.log(`Cleaned up ${result.modifiedCount} expired sessions`);
      return result.modifiedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
      throw new BadRequestException('Failed to cleanup expired sessions');
    }
  }

  /**
   * Get sessions by device fingerprint
   */
  async getSessionsByDeviceFingerprint(fingerprint: string, tenantId: string): Promise<SessionResponseDto[]> {
    try {
      const sessions = await this.sessionModel.findByDeviceFingerprint(fingerprint, new Types.ObjectId(tenantId));
      return sessions.map(session => this.mapToResponseDto(session));
    } catch (error) {
      this.logger.error('Error getting sessions by device fingerprint:', error);
      throw new BadRequestException('Failed to get sessions by device fingerprint');
    }
  }

  /**
   * Get sessions by IP address
   */
  async getSessionsByIpAddress(ipAddress: string, tenantId: string): Promise<SessionResponseDto[]> {
    try {
      const sessions = await this.sessionModel.findByIpAddress(ipAddress, new Types.ObjectId(tenantId));
      return sessions.map(session => this.mapToResponseDto(session));
    } catch (error) {
      this.logger.error('Error getting sessions by IP address:', error);
      throw new BadRequestException('Failed to get sessions by IP address');
    }
  }

  /**
   * Store session in Redis
   */
  private async storeSessionInRedis(session: SessionDocument): Promise<void> {
    try {
      const sessionData = this.mapToResponseDto(session);
      await this.redis.setex(
        session._id.toString(),
        3600, // 1 hour TTL
        JSON.stringify(sessionData)
      );
    } catch (error) {
      this.logger.warn('Failed to store session in Redis:', error);
    }
  }

  /**
   * Get session from Redis
   */
  private async getSessionFromRedis(sessionId: string): Promise<SessionResponseDto | null> {
    try {
      const sessionData = await this.redis.get(sessionId);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to get session from Redis:', error);
      return null;
    }
  }

  /**
   * Remove session from Redis
   */
  private async removeSessionFromRedis(sessionId: string): Promise<void> {
    try {
      await this.redis.del(sessionId);
    } catch (error) {
      this.logger.warn('Failed to remove session from Redis:', error);
    }
  }

  /**
   * Map session document to response DTO
   */
  private mapToResponseDto(session: SessionDocument): SessionResponseDto {
    return {
      _id: session._id,
      userId: session.userId,
      tenantId: session.tenantId,
      sessionToken: session.sessionToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceInfo: session.deviceInfo,
      location: session.location,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      terminatedBy: session.terminatedBy,
      terminatedAt: session.terminatedAt,
      terminationReason: session.terminationReason,
      securityFlags: session.securityFlags,
      activityLog: session.activityLog,
      metadata: session.metadata,
      duration: session.duration,
      age: session.age,
      status: session.status,
    };
  }

  /**
   * On module destroy, close Redis connection
   */
  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
} 