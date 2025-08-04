import { IsEmail, IsString, IsOptional, IsEnum, IsArray, IsObject, ValidateNested, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { UserStatus, UserRole } from '../schemas/user.schema';

export class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

export class SocialMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebook?: string;
}

export class ProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;
}

export class NotificationSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  push?: boolean;
}

export class UserSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UserPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dashboardLayout?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultView?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoRefresh?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailDigest?: boolean;
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'User display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'User profile picture URL' })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({ description: 'Google OAuth ID' })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsOptional()
  tenantId?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'User profile information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;

  @ApiPropertyOptional({ description: 'User settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserSettingsDto)
  settings?: UserSettingsDto;

  @ApiPropertyOptional({ description: 'User preferences' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;

  @ApiPropertyOptional({ description: 'User tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'User notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'User profile picture URL' })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({ description: 'User status' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ description: 'User role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'User profile information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;

  @ApiPropertyOptional({ description: 'User settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserSettingsDto)
  settings?: UserSettingsDto;

  @ApiPropertyOptional({ description: 'User preferences' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;

  @ApiPropertyOptional({ description: 'User permissions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: 'User tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'User notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'User metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UserSearchDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term for email, name, or display name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by user status', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ description: 'Filter by user role', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'New user status', enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'New user role', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ description: 'Reason for role change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UserActivitySearchDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by activity type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by severity' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - start' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - end' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
} 