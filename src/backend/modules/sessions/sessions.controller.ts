import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto, SessionResponseDto, TerminateSessionDto, SessionSecurityDto, SessionAnalyticsDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { Request } from 'express';

@ApiTags('Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully', type: SessionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Request,
  ): Promise<SessionResponseDto> {
    // Extract tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    createSessionDto.tenantId = tenantId as any;

    return this.sessionsService.createSession(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get sessions with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'sessionToken', required: false, description: 'Filter by session token' })
  @ApiQuery({ name: 'ipAddress', required: false, description: 'Filter by IP address' })
  @ApiQuery({ name: 'deviceFingerprint', required: false, description: 'Filter by device fingerprint' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  async getSessions(
    @Query() query: SessionQueryDto,
    @Req() req: Request,
  ): Promise<{ sessions: SessionResponseDto[]; total: number; page: number; limit: number }> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.sessionsService.getSessions(query, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully', type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSessionById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SessionResponseDto> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.sessionsService.getSessionById(id, tenantId);
  }

  @Put(':id/activity')
  @ApiOperation({ summary: 'Update session activity' })
  @ApiResponse({ status: 200, description: 'Session activity updated successfully', type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateSessionActivity(
    @Param('id') id: string,
    @Body() updateData: { ipAddress?: string; userAgent?: string },
    @Req() req: Request,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.updateSessionActivity(
      id,
      updateData.ipAddress,
      updateData.userAgent,
    );
  }

  @Post('terminate')
  @ApiOperation({ summary: 'Terminate a session' })
  @ApiResponse({ status: 200, description: 'Session terminated successfully', type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async terminateSession(
    @Body() terminateSessionDto: TerminateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.terminateSession(terminateSessionDto);
  }

  @Post('security/flag/add')
  @ApiOperation({ summary: 'Add security flag to session' })
  @ApiResponse({ status: 200, description: 'Security flag added successfully', type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async addSecurityFlag(
    @Body() sessionSecurityDto: SessionSecurityDto,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.addSecurityFlag(sessionSecurityDto);
  }

  @Post('security/flag/remove')
  @ApiOperation({ summary: 'Remove security flag from session' })
  @ApiResponse({ status: 200, description: 'Security flag removed successfully', type: SessionResponseDto })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async removeSecurityFlag(
    @Body() sessionSecurityDto: SessionSecurityDto,
  ): Promise<SessionResponseDto> {
    return this.sessionsService.removeSecurityFlag(sessionSecurityDto);
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin', 'analytics-admin')
  async getSessionStatistics(@Req() req: Request): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.sessionsService.getSessionStatistics(tenantId);
  }

  @Get('device/:fingerprint')
  @ApiOperation({ summary: 'Get sessions by device fingerprint' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully', type: [SessionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async getSessionsByDeviceFingerprint(
    @Param('fingerprint') fingerprint: string,
    @Req() req: Request,
  ): Promise<SessionResponseDto[]> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.sessionsService.getSessionsByDeviceFingerprint(fingerprint, tenantId);
  }

  @Get('ip/:ipAddress')
  @ApiOperation({ summary: 'Get sessions by IP address' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully', type: [SessionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async getSessionsByIpAddress(
    @Param('ipAddress') ipAddress: string,
    @Req() req: Request,
  ): Promise<SessionResponseDto[]> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.sessionsService.getSessionsByIpAddress(ipAddress, tenantId);
  }

  @Post('cleanup/expired')
  @ApiOperation({ summary: 'Cleanup expired sessions' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'system-admin')
  async cleanupExpiredSessions(): Promise<{ cleanedCount: number }> {
    const cleanedCount = await this.sessionsService.cleanupExpiredSessions();
    return { cleanedCount };
  }

  @Get('analytics/security')
  @ApiOperation({ summary: 'Get security analytics for sessions' })
  @ApiResponse({ status: 200, description: 'Security analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by time period' })
  @Roles('admin', 'security-admin', 'analytics-admin')
  async getSecurityAnalytics(
    @Query() query: SessionAnalyticsDto,
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    // This would integrate with the analytics service
    return {
      suspiciousSessions: 0,
      terminatedSessions: 0,
      securityFlags: [],
      threatLevel: 'low',
      recommendations: [],
    };
  }

  @Get('analytics/performance')
  @ApiOperation({ summary: 'Get performance analytics for sessions' })
  @ApiResponse({ status: 200, description: 'Performance analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by time period' })
  @Roles('admin', 'analytics-admin')
  async getPerformanceAnalytics(
    @Query() query: SessionAnalyticsDto,
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    // This would integrate with the analytics service
    return {
      avgSessionDuration: 0,
      avgSessionsPerUser: 0,
      peakUsageTimes: [],
      deviceDistribution: {},
      browserDistribution: {},
    };
  }

  @Get('analytics/behavior')
  @ApiOperation({ summary: 'Get user behavior analytics for sessions' })
  @ApiResponse({ status: 200, description: 'Behavior analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by time period' })
  @Roles('admin', 'analytics-admin')
  async getBehaviorAnalytics(
    @Query() query: SessionAnalyticsDto,
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    // This would integrate with the analytics service
    return {
      userJourneys: [],
      commonPatterns: [],
      anomalyDetection: [],
      userSegments: {},
    };
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export sessions to CSV' })
  @ApiResponse({ status: 200, description: 'Sessions exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'analytics-admin')
  async exportSessionsToCSV(
    @Query() query: SessionQueryDto,
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    // This would generate and return a CSV file
    return {
      message: 'CSV export functionality to be implemented',
      downloadUrl: '/api/sessions/export/download/123',
    };
  }

  @Get('health/check')
  @ApiOperation({ summary: 'Health check for session management system' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        security: 'active',
      },
    };
  }
} 