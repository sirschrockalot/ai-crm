import { IsString, IsOptional, IsDate, IsBoolean, IsArray, IsObject, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class DeviceInfoDto {
  @IsString()
  @IsOptional()
  deviceType?: string;

  @IsString()
  @IsOptional()
  browser?: string;

  @IsString()
  @IsOptional()
  os?: string;

  @IsString()
  @IsOptional()
  screenResolution?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  fingerprint?: string;
}

export class LocationInfoDto {
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class SessionActivityDto {
  @IsString()
  action: string;

  @IsString()
  resource: string;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;

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

export class CreateSessionDto {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  sessionToken: string;

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationInfoDto)
  location?: LocationInfoDto;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationInfoDto)
  location?: LocationInfoDto;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  securityFlags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SessionQueryDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  tenantId?: Types.ObjectId;

  @IsString()
  @IsOptional()
  sessionToken?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  deviceFingerprint?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAfter?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdBefore?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastActivityAfter?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastActivityBefore?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  securityFlags?: string[];

  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'lastActivity' | 'expiresAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class SessionResponseDto {
  @IsMongoId()
  _id: Types.ObjectId;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  tenantId: Types.ObjectId;

  @IsString()
  sessionToken: string;

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationInfoDto)
  location?: LocationInfoDto;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  lastActivity: Date;

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @IsBoolean()
  isActive: boolean;

  @IsMongoId()
  @IsOptional()
  terminatedBy?: Types.ObjectId;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  terminatedAt?: Date;

  @IsString()
  @IsOptional()
  terminationReason?: string;

  @IsArray()
  @IsString({ each: true })
  securityFlags: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionActivityDto)
  activityLog: SessionActivityDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  // Virtual properties
  @IsOptional()
  duration?: number;

  @IsOptional()
  age?: number;

  @IsString()
  status: string;
}

export class SessionStatisticsDto {
  @IsOptional()
  totalSessions?: number;

  @IsOptional()
  activeSessions?: number;

  @IsOptional()
  expiredSessions?: number;

  @IsOptional()
  terminatedSessions?: number;

  @IsOptional()
  avgSessionDuration?: number;

  @IsOptional()
  avgSessionAge?: number;

  @IsOptional()
  sessionsByDevice?: Record<string, number>;

  @IsOptional()
  sessionsByLocation?: Record<string, number>;

  @IsOptional()
  sessionsByBrowser?: Record<string, number>;

  @IsOptional()
  sessionsByOS?: Record<string, number>;
}

export class TerminateSessionDto {
  @IsMongoId()
  sessionId: Types.ObjectId;

  @IsMongoId()
  terminatedBy: Types.ObjectId;

  @IsString()
  reason: string;
}

export class SessionSecurityDto {
  @IsMongoId()
  sessionId: Types.ObjectId;

  @IsString()
  flag: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SessionAnalyticsDto {
  @IsMongoId()
  @IsOptional()
  tenantId?: Types.ObjectId;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsOptional()
  groupBy?: 'hour' | 'day' | 'week' | 'month';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metrics?: string[];
} 