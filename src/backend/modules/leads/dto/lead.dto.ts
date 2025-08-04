import { IsEmail, IsString, IsOptional, IsEnum, IsArray, IsNumber, IsObject, ValidateNested, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { LeadStatus, LeadPriority, PropertyType, LeadSource } from '../schemas/lead.schema';

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
  county?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullAddress?: string;
}

export class PropertyDetailsDto {
  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFeet?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lotSize?: number;

  @ApiPropertyOptional({ minimum: 1800 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  yearBuilt?: number;
}

export class CreateLeadDto {
  @ApiProperty({ description: 'Lead name/contact person' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Property address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Property details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  propertyDetails?: PropertyDetailsDto;

  @ApiPropertyOptional({ description: 'Estimated property value', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Asking price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  askingPrice?: number;

  @ApiPropertyOptional({ description: 'Lead source', enum: LeadSource, default: LeadSource.OTHER })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'Lead status', enum: LeadStatus, default: LeadStatus.NEW })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Lead priority', enum: LeadPriority, default: LeadPriority.MEDIUM })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  assignedTo?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Notes about the lead' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Next follow-up date' })
  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ description: 'Lead name/contact person' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Property address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Property details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  propertyDetails?: PropertyDetailsDto;

  @ApiPropertyOptional({ description: 'Estimated property value', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Asking price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  askingPrice?: number;

  @ApiPropertyOptional({ description: 'Lead source', enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'Lead status', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Lead priority', enum: LeadPriority })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  assignedTo?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Notes about the lead' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Next follow-up date' })
  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'AI summary' })
  @IsOptional()
  @IsString()
  aiSummary?: string;

  @ApiPropertyOptional({ description: 'AI-generated tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiTags?: string[];

  @ApiPropertyOptional({ description: 'Lead score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  leadScore?: number;

  @ApiPropertyOptional({ description: 'Qualification probability (0-1)', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  qualificationProbability?: number;
}

export class LeadSearchDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term for name, phone, email, notes, or address' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by lead status', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Filter by lead priority', enum: LeadPriority })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiPropertyOptional({ description: 'Filter by lead source', enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  assignedTo?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Filter by tags (comma-separated)' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: 'Filter by property type', enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ description: 'Filter by minimum estimated value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minEstimatedValue?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum estimated value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxEstimatedValue?: number;

  @ApiPropertyOptional({ description: 'Filter by minimum lead score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minLeadScore?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum lead score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxLeadScore?: number;

  @ApiPropertyOptional({ description: 'Filter by date range - created after' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - created before' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - last contacted after' })
  @IsOptional()
  @IsDateString()
  lastContactedAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - last contacted before' })
  @IsOptional()
  @IsDateString()
  lastContactedBefore?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - next follow-up after' })
  @IsOptional()
  @IsDateString()
  nextFollowUpAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - next follow-up before' })
  @IsOptional()
  @IsDateString()
  nextFollowUpBefore?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class LeadBulkUpdateDto {
  @ApiProperty({ description: 'Array of lead IDs to update' })
  @IsArray()
  leadIds: Types.ObjectId[];

  @ApiPropertyOptional({ description: 'Lead status to set', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Lead priority to set', enum: LeadPriority })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiPropertyOptional({ description: 'Assigned user ID to set' })
  @IsOptional()
  assignedTo?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Tags to add' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagsToAdd?: string[];

  @ApiPropertyOptional({ description: 'Tags to remove' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagsToRemove?: string[];
}

export class LeadExportDto {
  @ApiPropertyOptional({ description: 'Filter by lead status', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Filter by lead source', enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  assignedTo?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Filter by date range - created after' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter by date range - created before' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Export format', enum: ['json', 'csv'], default: 'json' })
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv';
} 