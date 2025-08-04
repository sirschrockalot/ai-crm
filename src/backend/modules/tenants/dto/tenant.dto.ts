import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsNumber, IsBoolean, IsUrl, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus, TenantPlan, TenantSettings } from '../schemas/tenant.schema';

export class TenantSettingsDto {
  @IsString()
  companyName: string;

  @IsString()
  timezone: string;

  @IsString()
  locale: string;

  @IsString()
  currency: string;

  @IsObject()
  features: {
    @IsBoolean()
    aiLeadScoring: boolean;

    @IsBoolean()
    advancedAnalytics: boolean;

    @IsBoolean()
    automationWorkflows: boolean;

    @IsBoolean()
    mobileApp: boolean;

    @IsBoolean()
    apiAccess: boolean;

    @IsBoolean()
    customIntegrations: boolean;
  };

  @IsObject()
  security: {
    @IsBoolean()
    requireMfa: boolean;

    @IsNumber()
    sessionTimeout: number;

    @IsObject()
    passwordPolicy: {
      @IsNumber()
      minLength: number;

      @IsBoolean()
      requireUppercase: boolean;

      @IsBoolean()
      requireLowercase: boolean;

      @IsBoolean()
      requireNumbers: boolean;

      @IsBoolean()
      requireSpecialChars: boolean;
    };

    @IsArray()
    @IsString({ each: true })
    ipWhitelist: string[];
  };

  @IsObject()
  notifications: {
    @IsBoolean()
    emailNotifications: boolean;

    @IsBoolean()
    smsNotifications: boolean;

    @IsBoolean()
    inAppNotifications: boolean;

    @IsObject()
    notificationPreferences: {
      @IsBoolean()
      leadAssigned: boolean;

      @IsBoolean()
      leadStatusChanged: boolean;

      @IsBoolean()
      automationTriggered: boolean;

      @IsBoolean()
      systemAlerts: boolean;
    };
  };

  @IsObject()
  integrations: {
    @IsBoolean()
    googleWorkspace: boolean;

    @IsBoolean()
    microsoft365: boolean;

    @IsBoolean()
    slack: boolean;

    @IsBoolean()
    zapier: boolean;

    @IsArray()
    @IsString({ each: true })
    customWebhooks: string[];
  };
}

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  subdomain: string;

  @IsEnum(TenantPlan)
  @IsOptional()
  plan?: TenantPlan = TenantPlan.BASIC;

  @ValidateNested()
  @Type(() => TenantSettingsDto)
  settings: TenantSettingsDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  address?: {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    zipCode: string;

    @IsString()
    country: string;
  };
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subdomain?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsEnum(TenantPlan)
  @IsOptional()
  plan?: TenantPlan;

  @ValidateNested()
  @Type(() => TenantSettingsDto)
  @IsOptional()
  settings?: Partial<TenantSettingsDto>;

  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @IsOptional()
  maxLeads?: number;

  @IsNumber()
  @IsOptional()
  maxStorage?: number;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  address?: {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    zipCode: string;

    @IsString()
    country: string;
  };
}

export class TenantResponseDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  name: string;

  @IsString()
  subdomain: string;

  @IsEnum(TenantStatus)
  status: TenantStatus;

  @IsEnum(TenantPlan)
  plan: TenantPlan;

  @IsObject()
  settings: TenantSettings;

  @IsString()
  ownerId: string;

  @IsArray()
  @IsString({ each: true })
  adminIds: string[];

  @IsArray()
  @IsString({ each: true })
  memberIds: string[];

  @IsNumber()
  @IsOptional()
  maxUsers?: number;

  @IsNumber()
  @IsOptional()
  maxLeads?: number;

  @IsNumber()
  @IsOptional()
  maxStorage?: number;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @IsObject()
  @IsOptional()
  usageStats?: {
    totalUsers: number;
    totalLeads: number;
    totalStorage: number;
    lastUpdated: Date;
  };

  @IsObject()
  @IsOptional()
  auditLog?: {
    lastLogin: Date;
    lastActivity: Date;
    totalLogins: number;
    failedLogins: number;
  };

  @IsString()
  createdBy: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;
}

export class TenantListResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TenantResponseDto)
  tenants: TenantResponseDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  totalPages: number;
}

export class TenantStatsDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  tenantName: string;

  @IsNumber()
  totalUsers: number;

  @IsNumber()
  totalLeads: number;

  @IsNumber()
  totalStorage: number;

  @IsNumber()
  activeUsers: number;

  @IsNumber()
  newLeadsThisMonth: number;

  @IsNumber()
  conversionRate: number;

  @IsString()
  lastActivity: Date;
} 