import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MFA, MFADocument, MFAModel } from './schemas/mfa.schema';
import { 
  CreateMFADto, 
  UpdateMFADto, 
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
} from './dto/mfa.dto';
import { TOTPService } from '../../common/services/totp.service';
import { SecurityEventsService } from '../security/security-events.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MFAService {
  private readonly logger = new Logger(MFAService.name);

  constructor(
    @InjectModel(MFA.name) private mfaModel: MFAModel,
    private readonly totpService: TOTPService,
    private readonly securityEventsService: SecurityEventsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Setup MFA for a user
   */
  async setupMFA(setupDto: MFASetupDto): Promise<MFASetupResponseDto> {
    try {
      // Check if MFA already exists for user
      const existingMFA = await this.mfaModel.findByUser(setupDto.userId, setupDto.tenantId);
      if (existingMFA) {
        throw new BadRequestException('MFA already exists for this user');
      }

      // Generate TOTP secret
      const secret = this.totpService.generateSecret();

      // Generate backup codes
      const backupCodes = this.totpService.generateBackupCodes();

      // Create MFA record
      const mfa = new this.mfaModel({
        userId: setupDto.userId,
        tenantId: setupDto.tenantId,
        secret,
        isEnabled: false,
        isVerified: false,
        backupCodes,
      });

      const savedMFA = await mfa.save();

      // Generate QR code URL
      const qrCodeUrl = this.totpService.generateQRCodeUrl(
        secret,
        setupDto.userEmail,
        setupDto.issuer || 'DealCycle CRM',
      );

      // Generate manual entry key
      const manualEntryKey = this.totpService.generateManualEntryKey(
        secret,
        setupDto.userEmail,
        setupDto.issuer || 'DealCycle CRM',
      );

      // Log security event
      await this.securityEventsService.logSecurityEvent({
        eventType: 'MFA_SETUP',
        userId: setupDto.userId.toString(),
        tenantId: setupDto.tenantId.toString(),
        ipAddress: 'unknown',
        userAgent: 'unknown',
        resource: 'mfa',
        action: 'setup',
        outcome: 'success',
        severity: 'medium',
        details: {
          mfaId: savedMFA._id.toString(),
          userEmail: setupDto.userEmail,
        },
      });

      // Emit MFA setup event
      this.eventEmitter.emit('mfa.setup', {
        mfaId: savedMFA._id,
        userId: savedMFA.userId,
        tenantId: savedMFA.tenantId,
        userEmail: setupDto.userEmail,
      });

      return {
        secret,
        qrCodeUrl,
        manualEntryKey,
        backupCodes,
        issuer: setupDto.issuer || 'DealCycle CRM',
        label: setupDto.userEmail,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error setting up MFA:', error);
      throw new BadRequestException('Failed to setup MFA');
    }
  }

  /**
   * Enable MFA for a user
   */
  async enableMFA(userId: string, tenantId: string): Promise<MFAResponseDto> {
    try {
      const mfa = await this.mfaModel.findByUser(new Types.ObjectId(userId), new Types.ObjectId(tenantId));
      if (!mfa) {
        throw new NotFoundException('MFA not found for user');
      }

      await mfa.enable();

      // Log security event
      await this.securityEventsService.logSecurityEvent({
        eventType: 'MFA_ENABLED',
        userId,
        tenantId,
        ipAddress: 'unknown',
        userAgent: 'unknown',
        resource: 'mfa',
        action: 'enable',
        outcome: 'success',
        severity: 'medium',
        details: {
          mfaId: mfa._id.toString(),
        },
      });

      return this.mapToResponseDto(mfa);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error enabling MFA:', error);
      throw new BadRequestException('Failed to enable MFA');
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(disableDto: MFADisableDto): Promise<MFAResponseDto> {
    try {
      const mfa = await this.mfaModel.findByUser(disableDto.userId, disableDto.tenantId);
      if (!mfa) {
        throw new NotFoundException('MFA not found for user');
      }

      await mfa.disable();

      // Log security event
      await this.securityEventsService.logSecurityEvent({
        eventType: 'MFA_DISABLED',
        userId: disableDto.userId.toString(),
        tenantId: disableDto.tenantId.toString(),
        ipAddress: 'unknown',
        userAgent: 'unknown',
        resource: 'mfa',
        action: 'disable',
        outcome: 'success',
        severity: 'medium',
        details: {
          mfaId: mfa._id.toString(),
          reason: disableDto.reason,
          disabledBy: disableDto.disabledBy?.toString(),
        },
      });

      return this.mapToResponseDto(mfa);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error disabling MFA:', error);
      throw new BadRequestException('Failed to disable MFA');
    }
  }

  /**
   * Verify TOTP code
   */
  async verifyTOTP(verifyDto: MFAVerifyDto): Promise<MFAVerificationResponseDto> {
    try {
      const mfa = await this.mfaModel.findByUser(verifyDto.userId, verifyDto.tenantId);
      if (!mfa) {
        throw new NotFoundException('MFA not found for user');
      }

      if (!mfa.isEnabled) {
        throw new ForbiddenException('MFA is not enabled');
      }

      // Check if MFA is locked
      if (mfa.lockedUntil && mfa.lockedUntil > new Date()) {
        return {
          success: false,
          message: 'MFA is temporarily locked',
          lockedUntil: mfa.lockedUntil.toISOString(),
        };
      }

      // Validate code format
      if (!this.totpService.validateCode(verifyDto.code)) {
        await mfa.recordFailedAttempt(verifyDto.ipAddress, verifyDto.userAgent);
        return {
          success: false,
          message: 'Invalid code format',
          remainingAttempts: 5 - mfa.failedAttempts,
        };
      }

      // Verify TOTP code
      const isValid = this.totpService.verifyTOTP(mfa.secret, verifyDto.code);
      if (!isValid) {
        await mfa.recordFailedAttempt(verifyDto.ipAddress, verifyDto.userAgent);
        
        // Log failed attempt
        await this.securityEventsService.logSecurityEvent({
          eventType: 'MFA_VERIFICATION_FAILED',
          userId: verifyDto.userId.toString(),
          tenantId: verifyDto.tenantId.toString(),
          ipAddress: verifyDto.ipAddress || 'unknown',
          userAgent: verifyDto.userAgent || 'unknown',
          resource: 'mfa',
          action: 'verify_totp',
          outcome: 'failure',
          severity: 'high',
          details: {
            mfaId: mfa._id.toString(),
            failedAttempts: mfa.failedAttempts + 1,
          },
        });

        return {
          success: false,
          message: 'Invalid TOTP code',
          remainingAttempts: 5 - mfa.failedAttempts,
        };
      }

      // Verify MFA
      await mfa.verify(verifyDto.ipAddress, verifyDto.userAgent);

      // Log successful verification
      await this.securityEventsService.logSecurityEvent({
        eventType: 'MFA_VERIFICATION_SUCCESS',
        userId: verifyDto.userId.toString(),
        tenantId: verifyDto.tenantId.toString(),
        ipAddress: verifyDto.ipAddress || 'unknown',
        userAgent: verifyDto.userAgent || 'unknown',
        resource: 'mfa',
        action: 'verify_totp',
        outcome: 'success',
        severity: 'low',
        details: {
          mfaId: mfa._id.toString(),
        },
      });

      return {
        success: true,
        message: 'MFA verification successful',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error verifying TOTP:', error);
      throw new BadRequestException('Failed to verify TOTP');
    }
  }

  /**
   * Use backup code
   */
  async useBackupCode(backupCodeDto: MFABackupCodeDto): Promise<MFAVerificationResponseDto> {
    try {
      const mfa = await this.mfaModel.findByUser(backupCodeDto.userId, backupCodeDto.tenantId);
      if (!mfa) {
        throw new NotFoundException('MFA not found for user');
      }

      if (!mfa.isEnabled) {
        throw new ForbiddenException('MFA is not enabled');
      }

      // Check if MFA is locked
      if (mfa.lockedUntil && mfa.lockedUntil > new Date()) {
        return {
          success: false,
          message: 'MFA is temporarily locked',
          lockedUntil: mfa.lockedUntil.toISOString(),
        };
      }

      // Validate backup code format
      if (!this.totpService.validateBackupCode(backupCodeDto.code)) {
        await mfa.recordFailedAttempt(backupCodeDto.ipAddress, backupCodeDto.userAgent);
        return {
          success: false,
          message: 'Invalid backup code format',
          remainingAttempts: 5 - mfa.failedAttempts,
        };
      }

      // Use backup code
      await mfa.useBackupCode(backupCodeDto.code, backupCodeDto.ipAddress, backupCodeDto.userAgent);

      // Log successful backup code usage
      await this.securityEventsService.logSecurityEvent({
        eventType: 'MFA_BACKUP_CODE_USED',
        userId: backupCodeDto.userId.toString(),
        tenantId: backupCodeDto.tenantId.toString(),
        ipAddress: backupCodeDto.ipAddress || 'unknown',
        userAgent: backupCodeDto.userAgent || 'unknown',
        resource: 'mfa',
        action: 'use_backup_code',
        outcome: 'success',
        severity: 'medium',
        details: {
          mfaId: mfa._id.toString(),
          remainingCodes: mfa.backupCodes.length,
        },
      });

      return {
        success: true,
        message: 'Backup code used successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error using backup code:', error);
      throw new BadRequestException('Failed to use backup code');
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(regenerateDto: MFARegenerateBackupCodesDto): Promise<MFARegenerateBackupCodesResponseDto> {
    try {
      const mfa = await this.mfaModel.findByUser(regenerateDto.userId, regenerateDto.tenantId);
      if (!mfa) {
        throw new NotFoundException('MFA not found for user');
      }

      // Generate new backup codes
      const newBackupCodes = this.totpService.generateBackupCodes();

      // Update MFA with new backup codes
      mfa.backupCodes = newBackupCodes;
      mfa.usedBackupCodes = [];
      await mfa.save();

      // Log backup codes regeneration
      await this.securityEventsService.logSecurityEvent({
        eventType: 'MFA_BACKUP_CODES_REGENERATED',
        userId: regenerateDto.userId.toString(),
        tenantId: regenerateDto.tenantId.toString(),
        ipAddress: 'unknown',
        userAgent: 'unknown',
        resource: 'mfa',
        action: 'regenerate_backup_codes',
        outcome: 'success',
        severity: 'medium',
        details: {
          mfaId: mfa._id.toString(),
          reason: regenerateDto.reason,
        },
      });

      return {
        newBackupCodes,
        message: 'Backup codes regenerated successfully',
        codesGenerated: newBackupCodes.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error regenerating backup codes:', error);
      throw new BadRequestException('Failed to regenerate backup codes');
    }
  }

  /**
   * Get MFA for user
   */
  async getMFA(userId: string, tenantId: string): Promise<MFAResponseDto> {
    try {
      const mfa = await this.mfaModel.findByUser(new Types.ObjectId(userId), new Types.ObjectId(tenantId));
      if (!mfa) {
        throw new NotFoundException('MFA not found for user');
      }

      return this.mapToResponseDto(mfa);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting MFA:', error);
      throw new BadRequestException('Failed to get MFA');
    }
  }

  /**
   * Get MFA statistics
   */
  async getMFAStatistics(tenantId: string): Promise<any> {
    try {
      const stats = await this.mfaModel.getStatistics(new Types.ObjectId(tenantId));
      return stats[0] || {};
    } catch (error) {
      this.logger.error('Error getting MFA statistics:', error);
      throw new BadRequestException('Failed to get MFA statistics');
    }
  }

  /**
   * Cleanup expired MFA locks
   */
  async cleanupExpiredLocks(): Promise<number> {
    try {
      const result = await this.mfaModel.cleanupExpiredLocks();
      this.logger.log(`Cleaned up ${result.modifiedCount} expired MFA locks`);
      return result.modifiedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired MFA locks:', error);
      throw new BadRequestException('Failed to cleanup expired MFA locks');
    }
  }

  /**
   * Map MFA document to response DTO
   */
  private mapToResponseDto(mfa: MFADocument): MFAResponseDto {
    return {
      _id: mfa._id,
      userId: mfa.userId,
      tenantId: mfa.tenantId,
      secret: mfa.secret.substring(0, 8) + '****', // Mask secret in response
      isEnabled: mfa.isEnabled,
      isVerified: mfa.isVerified,
      backupCodes: mfa.backupCodes.map(code => code.substring(0, 4) + '****'), // Mask backup codes
      usedBackupCodes: mfa.usedBackupCodes,
      createdAt: mfa.createdAt.toISOString(),
      verifiedAt: mfa.verifiedAt?.toISOString(),
      lastUsedAt: mfa.lastUsedAt?.toISOString(),
      failedAttempts: mfa.failedAttempts,
      lockedUntil: mfa.lockedUntil?.toISOString(),
      securityFlags: mfa.securityFlags,
      activityLog: mfa.activityLog.map(log => ({
        action: log.action,
        timestamp: log.timestamp.toISOString(),
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        outcome: log.outcome,
        details: log.details,
      })),
      metadata: mfa.metadata,
      status: mfa.status,
      remainingBackupCodes: mfa.remainingBackupCodes,
    };
  }
} 