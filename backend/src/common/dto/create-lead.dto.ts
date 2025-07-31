import { IsString, IsOptional, IsEmail, IsObject, IsNumber, IsArray, MaxLength, Matches, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
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

export class PropertyDetailsDto {
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

export class CreateLeadDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[+]?[1-9]\d{1,14}$/, { message: 'Please enter a valid phone number' })
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  property_details?: PropertyDetailsDto;

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
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  assigned_to?: string;
} 