import { IsString, IsOptional, IsEmail, IsObject, IsNumber, IsArray, MaxLength, Matches, IsMongoId, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip_code?: string;

  @IsOptional()
  @IsString()
  county?: string;

  @IsOptional()
  @IsString()
  full_address?: string;
}

export class UpdatePropertyDetailsDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  square_feet?: number;

  @IsOptional()
  @IsNumber()
  lot_size?: number;

  @IsOptional()
  @IsNumber()
  year_built?: number;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[1-9]\d{1,14}$/, { message: 'Please enter a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePropertyDetailsDto)
  property_details?: UpdatePropertyDetailsDto;

  @IsOptional()
  @IsNumber()
  estimated_value?: number;

  @IsOptional()
  @IsNumber()
  asking_price?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  @IsIn(['new', 'contacted', 'under_contract', 'closed', 'lost'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  assigned_to?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  communication_count?: number;

  @IsOptional()
  last_contacted?: Date;

  @IsOptional()
  next_follow_up?: Date;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;
} 