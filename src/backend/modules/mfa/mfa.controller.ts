import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MFAService } from './mfa.service';
import { 
  MFASetupDto, 
  MFAVerifyDto, 
  MFABackupCodeDto, 
  MFARecoveryDto,
  MFAResponseDto,
  MFASetupResponseDto,
  MFAVerificationResponseDto,
  MFARecoveryResponseDto,
  MFARegenerateBackupCodesDto,
  MFARegenerateBackupCodesResponseDto,
  MFADisableDto,
  MFAQueryDto,
  MFAChallengeDto,
  MFAChallengeResponseDto,
  MFAStatisticsDto,
} from './dto/mfa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Request } from 'express';

@ApiTags('Multi-Factor Authentication')
@Controller('mfa')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@ApiBearerAuth()
export class MFAController {
  constructor(private readonly mfaService: MFAService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Setup MFA for a user' })
  @ApiResponse({ status: 201, description: 'MFA setup successful', type: MFASetupResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(HttpStatus.CREATED)
  async setupMFA(
    @Body() setupDto: MFASetupDto,
    @Req() req: Request,
  ): Promise<MFASetupResponseDto> {
    // Extract tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    setupDto.tenantId = tenantId as any;

    return this.mfaService.setupMFA(setupDto);
  }

  @Post('enable/:userId')
  @ApiOperation({ summary: 'Enable MFA for a user' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully', type: MFAResponseDto })
  @ApiResponse({ status: 404, description: 'MFA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async enableMFA(
    @Param('userId') userId: string,
    @Req() req: Request,
  ): Promise<MFAResponseDto> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.mfaService.enableMFA(userId, tenantId);
  }

  @Post('disable')
  @ApiOperation({ summary: 'Disable MFA for a user' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully', type: MFAResponseDto })
  @ApiResponse({ status: 404, description: 'MFA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin')
  async disableMFA(
    @Body() disableDto: MFADisableDto,
  ): Promise<MFAResponseDto> {
    return this.mfaService.disableMFA(disableDto);
  }

  @Post('verify/totp')
  @ApiOperation({ summary: 'Verify TOTP code' })
  @ApiResponse({ status: 200, description: 'TOTP verification result', type: MFAVerificationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'MFA not found' })
  async verifyTOTP(
    @Body() verifyDto: MFAVerifyDto,
    @Req() req: Request,
  ): Promise<MFAVerificationResponseDto> {
    // Extract IP address and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    verifyDto.ipAddress = ipAddress;
    verifyDto.userAgent = userAgent;

    return this.mfaService.verifyTOTP(verifyDto);
  }

  @Post('verify/backup-code')
  @ApiOperation({ summary: 'Use backup code for MFA verification' })
  @ApiResponse({ status: 200, description: 'Backup code verification result', type: MFAVerificationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'MFA not found' })
  async useBackupCode(
    @Body() backupCodeDto: MFABackupCodeDto,
    @Req() req: Request,
  ): Promise<MFAVerificationResponseDto> {
    // Extract IP address and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    backupCodeDto.ipAddress = ipAddress;
    backupCodeDto.userAgent = userAgent;

    return this.mfaService.useBackupCode(backupCodeDto);
  }

  @Post('regenerate-backup-codes')
  @ApiOperation({ summary: 'Regenerate backup codes for MFA' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated successfully', type: MFARegenerateBackupCodesResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'MFA not found' })
  async regenerateBackupCodes(
    @Body() regenerateDto: MFARegenerateBackupCodesDto,
  ): Promise<MFARegenerateBackupCodesResponseDto> {
    return this.mfaService.regenerateBackupCodes(regenerateDto);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get MFA status for a user' })
  @ApiResponse({ status: 200, description: 'MFA status retrieved successfully', type: MFAResponseDto })
  @ApiResponse({ status: 404, description: 'MFA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMFA(
    @Param('userId') userId: string,
    @Req() req: Request,
  ): Promise<MFAResponseDto> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.mfaService.getMFA(userId, tenantId);
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Get MFA statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: MFAStatisticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin', 'analytics-admin')
  async getMFAStatistics(@Req() req: Request): Promise<MFAStatisticsDto> {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.mfaService.getMFAStatistics(tenantId);
  }

  @Post('challenge')
  @ApiOperation({ summary: 'Create MFA challenge' })
  @ApiResponse({ status: 200, description: 'Challenge created successfully', type: MFAChallengeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createChallenge(
    @Body() challengeDto: MFAChallengeDto,
    @Req() req: Request,
  ): Promise<MFAChallengeResponseDto> {
    // Extract IP address and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    challengeDto.ipAddress = ipAddress;
    challengeDto.userAgent = userAgent;

    // This would typically create a challenge and return challenge details
    // For now, we'll return a mock response
    return {
      challengeId: 'challenge_' + Date.now(),
      challengeType: challengeDto.challengeType,
      expiresIn: 300, // 5 minutes
      message: 'Please enter your TOTP code or backup code',
    };
  }

  @Post('recovery')
  @ApiOperation({ summary: 'Recover MFA access' })
  @ApiResponse({ status: 200, description: 'Recovery process initiated', type: MFARecoveryResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async initiateRecovery(
    @Body() recoveryDto: MFARecoveryDto,
    @Req() req: Request,
  ): Promise<MFARecoveryResponseDto> {
    // Extract IP address and user agent from request
    const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    recoveryDto.ipAddress = ipAddress;
    recoveryDto.userAgent = userAgent;

    // This would typically initiate a recovery process
    // For now, we'll return a mock response
    return {
      success: true,
      message: 'Recovery process initiated',
      nextStep: 'admin_approval_required',
      requiresAdditionalVerification: true,
    };
  }

  @Post('cleanup/expired-locks')
  @ApiOperation({ summary: 'Cleanup expired MFA locks' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'system-admin')
  async cleanupExpiredLocks(): Promise<{ cleanedCount: number }> {
    const cleanedCount = await this.mfaService.cleanupExpiredLocks();
    return { cleanedCount };
  }

  @Get('health/check')
  @ApiOperation({ summary: 'Health check for MFA system' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        totp: 'active',
        backupCodes: 'active',
        security: 'active',
      },
      features: {
        totp: true,
        backupCodes: true,
        qrCodes: true,
        recovery: true,
      },
    };
  }

  @Get('compliance/status')
  @ApiOperation({ summary: 'Get MFA compliance status' })
  @ApiResponse({ status: 200, description: 'Compliance status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'security-admin', 'compliance-admin')
  async getComplianceStatus(@Req() req: Request): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // This would typically check compliance requirements
    return {
      tenantId,
      complianceStatus: 'compliant',
      requirements: {
        mfaEnabled: true,
        backupCodesEnabled: true,
        recoveryEnabled: true,
        auditLogging: true,
      },
      lastAudit: new Date().toISOString(),
      nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  }

  @Get('analytics/usage')
  @ApiOperation({ summary: 'Get MFA usage analytics' })
  @ApiResponse({ status: 200, description: 'Usage analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by time period' })
  @Roles('admin', 'analytics-admin')
  async getUsageAnalytics(
    @Query() query: { startDate?: string; endDate?: string; groupBy?: string },
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // This would typically query analytics data
    return {
      period: {
        start: query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: query.endDate || new Date().toISOString(),
      },
      summary: {
        totalVerifications: 0,
        successfulVerifications: 0,
        failedVerifications: 0,
        backupCodeUsage: 0,
        averageResponseTime: 0,
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: [],
      },
      topUsers: [],
      topDevices: [],
    };
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export MFA data to CSV' })
  @ApiResponse({ status: 200, description: 'MFA data exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('admin', 'analytics-admin')
  async exportMFAData(
    @Query() query: MFAQueryDto,
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // This would generate and return a CSV file
    return {
      message: 'CSV export functionality to be implemented',
      downloadUrl: '/api/mfa/export/download/123',
      recordCount: 0,
    };
  }
} 