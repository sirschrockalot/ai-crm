import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested, IsMongoId, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class MFAActivityDto {
  @IsString()
  action: string;

  @IsString()
  timestamp: string;

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsString()
  outcome: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>;
}

export class CreateMFADto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  secret: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  backupCodes?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateMFADto {
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  backupCodes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  usedBackupCodes?: string[];

  @IsNumber()
  @IsOptional()
  failedAttempts?: number;

  @IsString()
  @IsOptional()
  lockedUntil?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  securityFlags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class MFASetupDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  userEmail: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  label?: string;
}

export class MFAVerifyDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  @Min(6)
  @Max(6)
  code: string; // 6-digit TOTP code

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class MFABackupCodeDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  @Min(8)
  @Max(8)
  code: string; // 8-character backup code

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class MFARecoveryDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  recoveryMethod: 'backup_code' | 'admin_bypass' | 'email_verification';

  @IsString()
  @IsOptional()
  backupCode?: string;

  @IsString()
  @IsOptional()
  emailCode?: string;

  @IsString()
  @IsOptional()
  adminUserId?: Types.ObjectId;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class MFAResponseDto {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  secret: string; // Will be masked in response

  @IsBoolean()
  isEnabled: boolean;

  @IsBoolean()
  isVerified: boolean;

  @IsArray()
  @IsString({ each: true })
  backupCodes: string[]; // Will be masked in response

  @IsArray()
  @IsString({ each: true })
  usedBackupCodes: string[];

  @IsString()
  createdAt: string;

  @IsString()
  @IsOptional()
  verifiedAt?: string;

  @IsString()
  @IsOptional()
  lastUsedAt?: string;

  @IsNumber()
  failedAttempts: number;

  @IsString()
  @IsOptional()
  lockedUntil?: string;

  @IsArray()
  @IsString({ each: true })
  securityFlags: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MFAActivityDto)
  activityLog: MFAActivityDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  // Virtual properties
  @IsString()
  status: string;

  @IsArray()
  @IsString({ each: true })
  remainingBackupCodes: string[];
}

export class MFASetupResponseDto {
  @IsString()
  secret: string; // Base32 encoded secret

  @IsString()
  qrCodeUrl: string; // QR code URL for authenticator apps

  @IsString()
  manualEntryKey: string; // Manual entry key for authenticator apps

  @IsArray()
  @IsString({ each: true })
  backupCodes: string[]; // Initial backup codes

  @IsString()
  issuer: string;

  @IsString()
  label: string;
}

export class MFAVerificationResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  nextStep?: string;

  @IsNumber()
  @IsOptional()
  remainingAttempts?: number;

  @IsString()
  @IsOptional()
  lockedUntil?: string;
}

export class MFARecoveryResponseDto {
  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  nextStep?: string;

  @IsBoolean()
  @IsOptional()
  requiresAdditionalVerification?: boolean;
}

export class MFARegenerateBackupCodesDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class MFARegenerateBackupCodesResponseDto {
  @IsArray()
  @IsString({ each: true })
  newBackupCodes: string[];

  @IsString()
  message: string;

  @IsNumber()
  codesGenerated: number;
}

export class MFADisableDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  reason: string;

  @IsMongoId()
  @IsOptional()
  disabledBy?: Types.ObjectId;
}

export class MFAStatisticsDto {
  @IsOptional()
  totalMFA?: number;

  @IsOptional()
  enabledMFA?: number;

  @IsOptional()
  verifiedMFA?: number;

  @IsOptional()
  lockedMFA?: number;

  @IsOptional()
  avgFailedAttempts?: number;

  @IsOptional()
  mfaByStatus?: Record<string, number>;

  @IsOptional()
  mfaByDevice?: Record<string, number>;

  @IsOptional()
  mfaByLocation?: Record<string, number>;
}

export class MFAQueryDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  tenantId?: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  status?: 'active' | 'disabled' | 'pending' | 'locked';

  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'lastUsedAt' | 'failedAttempts';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class MFAChallengeDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  challengeType: 'totp' | 'backup_code' | 'recovery';

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class MFAChallengeResponseDto {
  @IsString()
  challengeId: string;

  @IsString()
  challengeType: string;

  @IsString()
  @IsOptional()
  qrCodeUrl?: string;

  @IsString()
  @IsOptional()
  manualEntryKey?: string;

  @IsNumber()
  expiresIn: number; // seconds

  @IsString()
  @IsOptional()
  message?: string;
} 