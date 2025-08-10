import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsUrl,
  ValidateNested,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ===== USER PROFILE DTOs =====

export class UserProfileDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;
}

// ===== USER PREFERENCES DTOs =====

export class DashboardPreferencesDto {
  @ApiProperty()
  @IsEnum(['grid', 'list', 'compact'])
  layout: 'grid' | 'list' | 'compact';

  @ApiProperty()
  @IsString()
  defaultView: string;

  @ApiProperty()
  @IsNumber()
  @Min(5)
  @Max(300)
  refreshInterval: number;

  @ApiProperty()
  @IsBoolean()
  showCharts: boolean;

  @ApiProperty()
  @IsBoolean()
  showMetrics: boolean;

  @ApiProperty()
  @IsBoolean()
  showRecentActivity: boolean;

  @ApiProperty()
  @IsBoolean()
  compactMode: boolean;
}

export class UserPreferencesDto {
  @ApiProperty()
  @IsEnum(['light', 'dark', 'system'])
  theme: 'light' | 'dark' | 'system';

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiProperty()
  @IsEnum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

  @ApiProperty()
  @IsEnum(['12h', '24h'])
  timeFormat: '12h' | '24h';

  @ApiProperty()
  @ValidateNested()
  @Type(() => DashboardPreferencesDto)
  dashboard: DashboardPreferencesDto;

  @ApiProperty()
  @IsBoolean()
  autoRefresh: boolean;

  @ApiProperty()
  @IsBoolean()
  showNotifications: boolean;

  @ApiProperty()
  @IsBoolean()
  soundEnabled: boolean;
}

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['12h', '24h'])
  timeFormat?: '12h' | '24h';

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => DashboardPreferencesDto)
  dashboard?: Partial<DashboardPreferencesDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoRefresh?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;
}

// ===== NOTIFICATION SETTINGS DTOs =====

export class EmailNotificationDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsEnum(['immediate', 'daily', 'weekly'])
  frequency: 'immediate' | 'daily' | 'weekly';

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  types: string[];

  @ApiProperty()
  @IsBoolean()
  marketingEmails: boolean;

  @ApiProperty()
  @IsBoolean()
  systemEmails: boolean;
}

export class PushNotificationDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  types: string[];

  @ApiProperty()
  @IsBoolean()
  soundEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  vibrationEnabled: boolean;
}

export class SmsNotificationDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  types: string[];

  @ApiProperty()
  @IsBoolean()
  urgentAlerts: boolean;
}

export class NotificationSettingsDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => EmailNotificationDto)
  email: EmailNotificationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PushNotificationDto)
  push: PushNotificationDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => SmsNotificationDto)
  sms: SmsNotificationDto;

  @ApiProperty()
  @IsBoolean()
  inAppNotifications: boolean;

  @ApiProperty()
  @IsBoolean()
  desktopNotifications: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  quietHoursStart: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  quietHoursEnd: number;
}

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailNotificationDto)
  email?: Partial<EmailNotificationDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PushNotificationDto)
  push?: Partial<PushNotificationDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SmsNotificationDto)
  sms?: Partial<SmsNotificationDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  desktopNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quietHoursStart?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quietHoursEnd?: number;
}

// ===== SECURITY SETTINGS DTOs =====

export class PasswordPolicyDto {
  @ApiProperty()
  @IsNumber()
  @Min(8)
  @Max(128)
  minLength: number;

  @ApiProperty()
  @IsBoolean()
  requireUppercase: boolean;

  @ApiProperty()
  @IsBoolean()
  requireLowercase: boolean;

  @ApiProperty()
  @IsBoolean()
  requireNumbers: boolean;

  @ApiProperty()
  @IsBoolean()
  requireSpecialChars: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(365)
  expirationDays: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(10)
  preventReuse: number;
}

export class SecuritySettingsDto {
  @ApiProperty()
  @IsBoolean()
  twoFactorEnabled: boolean;

  @ApiProperty()
  @IsEnum(['totp', 'sms', 'email'])
  twoFactorMethod: 'totp' | 'sms' | 'email';

  @ApiProperty()
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy: PasswordPolicyDto;

  @ApiProperty()
  @IsNumber()
  @Min(5)
  @Max(480)
  sessionTimeout: number;

  @ApiProperty()
  @IsBoolean()
  loginHistory: boolean;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  ipRestrictions: string[];

  @ApiProperty()
  @IsBoolean()
  suspiciousActivityDetection: boolean;

  @ApiProperty()
  @IsBoolean()
  accountLockout: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxLoginAttempts: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(60)
  lockoutDuration: number;
}

export class UpdateSecuritySettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['totp', 'sms', 'email'])
  twoFactorMethod?: 'totp' | 'sms' | 'email';

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy?: Partial<PasswordPolicyDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  sessionTimeout?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  loginHistory?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipRestrictions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  suspiciousActivityDetection?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  accountLockout?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxLoginAttempts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  lockoutDuration?: number;
}

// ===== SYSTEM SETTINGS DTOs =====

export class CompanyInfoDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;
}

export class BrandingDto {
  @ApiProperty()
  @IsString()
  primaryColor: string;

  @ApiProperty()
  @IsString()
  secondaryColor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string;
}

export class FeatureFlagsDto {
  @ApiProperty()
  @IsBoolean()
  aiLeadScoring: boolean;

  @ApiProperty()
  @IsBoolean()
  advancedAnalytics: boolean;

  @ApiProperty()
  @IsBoolean()
  automationWorkflows: boolean;

  @ApiProperty()
  @IsBoolean()
  mobileApp: boolean;

  @ApiProperty()
  @IsBoolean()
  apiAccess: boolean;

  @ApiProperty()
  @IsBoolean()
  customIntegrations: boolean;

  @ApiProperty()
  @IsBoolean()
  multiTenancy: boolean;

  @ApiProperty()
  @IsBoolean()
  auditLogging: boolean;
}

export class IntegrationConfigDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  version: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  config: Record<string, any>;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastSync?: string;
}

export class SystemSettingsDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company: CompanyInfoDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding: BrandingDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => FeatureFlagsDto)
  features: FeatureFlagsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => IntegrationConfigDto)
  integrations: Record<string, IntegrationConfigDto>;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiProperty()
  @IsString()
  locale: string;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxUsers: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxLeads: number;
}

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company?: Partial<CompanyInfoDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding?: Partial<BrandingDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => FeatureFlagsDto)
  features?: Partial<FeatureFlagsDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => IntegrationConfigDto)
  integrations?: Record<string, Partial<IntegrationConfigDto>>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxLeads?: number;
}

// ===== COMPANY BRANDING DTOs =====

export class CompanyBrandingDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company: CompanyInfoDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding: BrandingDto;

  @ApiProperty()
  @IsString()
  slogan?: string;

  @ApiProperty()
  @IsString()
  mission?: string;

  @ApiProperty()
  @IsString()
  vision?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  socialMedia?: string[];

  @ApiProperty()
  @IsString()
  contactEmail?: string;

  @ApiProperty()
  @IsString()
  supportEmail?: string;
}

export class UpdateCompanyBrandingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company?: Partial<CompanyInfoDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding?: Partial<BrandingDto>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  socialMedia?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supportEmail?: string;
}

// ===== CUSTOM FIELD DTOs =====

export class CustomFieldDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsEnum(['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'boolean', 'textarea', 'url'])
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'url';

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiProperty()
  @IsString()
  entity: string; // 'lead', 'contact', 'deal', etc.

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  validation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  minLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  minValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxValue?: number;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  sortOrder: number;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsDateString()
  updatedAt: string;
}

export class CreateCustomFieldDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsEnum(['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'boolean', 'textarea', 'url'])
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'url';

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiProperty()
  @IsString()
  entity: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  validation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  minLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  minValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sortOrder?: number;
}

export class UpdateCustomFieldDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['text', 'number', 'email', 'phone', 'date', 'select', 'multiselect', 'boolean', 'textarea', 'url'])
  type?: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea' | 'url';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  validation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  minLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  minValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sortOrder?: number;
}

// ===== WORKFLOW DTOs =====

export class WorkflowStepDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(100)
  order: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  config: Record<string, any>;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actions?: string[];
}

export class WorkflowDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  entity: string;

  @ApiProperty()
  @IsEnum(['manual', 'automatic', 'scheduled'])
  trigger: 'manual' | 'automatic' | 'scheduled';

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsBoolean()
  requiresApproval: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvalRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority: number;

  @ApiProperty()
  @IsDateString()
  createdAt: string;

  @ApiProperty()
  @IsDateString()
  updatedAt: string;
}

export class CreateWorkflowDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  entity: string;

  @ApiProperty()
  @IsEnum(['manual', 'automatic', 'scheduled'])
  trigger: 'manual' | 'automatic' | 'scheduled';

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvalRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;
}

export class UpdateWorkflowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['manual', 'automatic', 'scheduled'])
  trigger?: 'manual' | 'automatic' | 'scheduled';

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  approvalRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;
}

// ===== AUDIT LOG DTOs =====

export class AuditLogDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsString()
  entity: string;

  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Object)
  changes: Record<string, any>;

  @ApiProperty()
  @IsString()
  ipAddress: string;

  @ApiProperty()
  @IsString()
  userAgent: string;

  @ApiProperty()
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metadata?: string;
}

export class AuditLogQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
