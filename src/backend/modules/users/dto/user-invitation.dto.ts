import { IsEmail, IsString, IsOptional, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { InvitationStatus } from '../schemas/user-invitation.schema';
import { UserRole } from '../schemas/user.schema';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email address of the person to invite',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Roles to assign to the invited user',
    example: [UserRole.USER],
    enum: UserRole,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: string[];

  @ApiProperty({
    description: 'Custom message to include in the invitation email',
    example: 'Welcome to our platform!',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Tenant ID for multi-tenant setups',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token',
    example: 'abc123def456...',
  })
  @IsString({ message: 'Token must be a string' })
  token: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
  })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

export class InvitationResponseDto {
  @ApiProperty({
    description: 'Invitation ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the invited user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Invitation status',
    example: InvitationStatus.PENDING,
    enum: InvitationStatus,
  })
  status: InvitationStatus;

  @ApiProperty({
    description: 'When the invitation expires',
    example: '2024-08-11T17:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'When the invitation was created',
    example: '2024-08-04T17:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the invitation was accepted',
    example: '2024-08-05T10:30:00.000Z',
    required: false,
  })
  acceptedAt?: Date;

  @ApiProperty({
    description: 'Roles assigned to the invitation',
    example: [UserRole.USER],
  })
  roles: string[];

  @ApiProperty({
    description: 'Custom message included in the invitation',
    example: 'Welcome to our platform!',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Whether the invitation is expired',
    example: false,
  })
  isExpired: boolean;

  @ApiProperty({
    description: 'Whether the invitation is valid',
    example: true,
  })
  isValid: boolean;
}

export class InvitationListDto {
  @ApiProperty({
    description: 'List of invitations',
    type: [InvitationResponseDto],
  })
  invitations: InvitationResponseDto[];

  @ApiProperty({
    description: 'Total number of invitations',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages: number;
}

export class InvitationStatsDto {
  @ApiProperty({
    description: 'Total number of invitations',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of pending invitations',
    example: 15,
  })
  pending: number;

  @ApiProperty({
    description: 'Number of accepted invitations',
    example: 80,
  })
  accepted: number;

  @ApiProperty({
    description: 'Number of expired invitations',
    example: 5,
  })
  expired: number;

  @ApiProperty({
    description: 'Number of cancelled invitations',
    example: 0,
  })
  cancelled: number;
} 