import { IsOptional, IsString, IsObject, IsBoolean, IsIn, MaxLength, IsPhoneNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @IsOptional()
  @IsBoolean()
  push?: boolean;
}

export class UserPreferencesDto {
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'auto'])
  theme?: 'light' | 'dark' | 'auto';

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notifications?: NotificationPreferencesDto;

  @IsOptional()
  @IsObject()
  dashboard_layout?: Record<string, any>;

  @IsOptional()
  @IsString()
  @IsIn(['leads', 'buyers', 'dashboard'])
  default_view?: 'leads' | 'buyers' | 'dashboard';
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;
} 