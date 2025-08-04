import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleType } from '../schemas/role.schema';

export class CreateRoleDto {
  @ApiProperty({ description: 'Unique role name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Display name for the role' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: RoleType, default: RoleType.CUSTOM })
  @IsOptional()
  @IsEnum(RoleType)
  type?: RoleType;

  @ApiPropertyOptional({ description: 'List of permissions for this role' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: 'List of inherited role names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inheritedRoles?: string[];

  @ApiPropertyOptional({ description: 'Whether the role is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Display name for the role' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'List of permissions for this role' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: 'List of inherited role names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inheritedRoles?: string[];

  @ApiPropertyOptional({ description: 'Whether the role is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class RoleSearchDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term for role name or display name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RoleType, description: 'Filter by role type' })
  @IsOptional()
  @IsEnum(RoleType)
  type?: RoleType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class AssignRoleDto {
  @ApiProperty({ description: 'User ID to assign role to' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsMongoId()
  roleId: string;

  @ApiPropertyOptional({ description: 'When the role assignment expires' })
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Reason for assignment' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class RevokeRoleDto {
  @ApiPropertyOptional({ description: 'Reason for revocation' })
  @IsOptional()
  @IsString()
  reason?: string;
} 