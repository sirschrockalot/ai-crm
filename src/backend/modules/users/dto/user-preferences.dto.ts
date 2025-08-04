import { IsObject, IsOptional, IsBoolean, IsString, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class EmailNotificationsDto {
  @ApiProperty({
    description: 'Marketing email notifications',
    example: true,
  })
  @IsBoolean()
  marketing: boolean;

  @ApiProperty({
    description: 'Security email notifications',
    example: true,
  })
  @IsBoolean()
  security: boolean;

  @ApiProperty({
    description: 'Update email notifications',
    example: false,
  })
  @IsBoolean()
  updates: boolean;

  @ApiProperty({
    description: 'Email frequency',
    example: 'daily',
    enum: ['daily', 'weekly', 'monthly', 'never'],
  })
  @IsIn(['daily', 'weekly', 'monthly', 'never'])
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

export class UiPreferencesDto {
  @ApiProperty({
    description: 'UI theme',
    example: 'light',
    enum: ['light', 'dark', 'auto'],
  })
  @IsIn(['light', 'dark', 'auto'])
  theme: 'light' | 'dark' | 'auto';

  @ApiProperty({
    description: 'Language preference',
    example: 'en',
  })
  @IsString()
  language: string;

  @ApiProperty({
    description: 'Timezone',
    example: 'UTC',
  })
  @IsString()
  timezone: string;

  @ApiProperty({
    description: 'Date format',
    example: 'MM/DD/YYYY',
  })
  @IsString()
  dateFormat: string;
}

export class PrivacyPreferencesDto {
  @ApiProperty({
    description: 'Profile visibility',
    example: 'public',
    enum: ['public', 'private', 'team'],
  })
  @IsIn(['public', 'private', 'team'])
  profileVisibility: 'public' | 'private' | 'team';

  @ApiProperty({
    description: 'Data sharing preference',
    example: false,
  })
  @IsBoolean()
  dataSharing: boolean;

  @ApiProperty({
    description: 'Analytics tracking preference',
    example: true,
  })
  @IsBoolean()
  analytics: boolean;
}

export class ApplicationPreferencesDto {
  @ApiProperty({
    description: 'Auto refresh preference',
    example: true,
  })
  @IsBoolean()
  autoRefresh: boolean;

  @ApiProperty({
    description: 'Email digest preference',
    example: false,
  })
  @IsBoolean()
  emailDigest: boolean;

  @ApiProperty({
    description: 'Dashboard layout',
    example: 'default',
  })
  @IsString()
  dashboardLayout: string;

  @ApiProperty({
    description: 'Default view',
    example: 'list',
  })
  @IsString()
  defaultView: string;
}

export class UserPreferencesDto {
  @ApiProperty({
    description: 'Email notification preferences',
    type: EmailNotificationsDto,
  })
  @ValidateNested()
  @Type(() => EmailNotificationsDto)
  emailNotifications: EmailNotificationsDto;

  @ApiProperty({
    description: 'UI preferences',
    type: UiPreferencesDto,
  })
  @ValidateNested()
  @Type(() => UiPreferencesDto)
  ui: UiPreferencesDto;

  @ApiProperty({
    description: 'Privacy preferences',
    type: PrivacyPreferencesDto,
  })
  @ValidateNested()
  @Type(() => PrivacyPreferencesDto)
  privacy: PrivacyPreferencesDto;

  @ApiProperty({
    description: 'Application preferences',
    type: ApplicationPreferencesDto,
  })
  @ValidateNested()
  @Type(() => ApplicationPreferencesDto)
  application: ApplicationPreferencesDto;
}

export class UpdateUserPreferencesDto {
  @ApiProperty({
    description: 'User preferences to update',
    type: UserPreferencesDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences: Partial<UserPreferencesDto>;
}

export class PreferenceChangeHistoryDto {
  @ApiProperty({
    description: 'Field that was changed',
    example: 'emailNotifications.frequency',
  })
  field: string;

  @ApiProperty({
    description: 'Old value',
    example: 'daily',
  })
  oldValue: any;

  @ApiProperty({
    description: 'New value',
    example: 'weekly',
  })
  newValue: any;

  @ApiProperty({
    description: 'When the change was made',
    example: '2024-08-04T17:00:00.000Z',
  })
  changedAt: Date;

  @ApiProperty({
    description: 'Who made the change',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  changedBy?: string;
} 