import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum TenantPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export interface TenantSettings {
  // General settings
  companyName: string;
  timezone: string;
  locale: string;
  currency: string;
  
  // Feature flags
  features: {
    aiLeadScoring: boolean;
    advancedAnalytics: boolean;
    automationWorkflows: boolean;
    mobileApp: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
  };
  
  // Security settings
  security: {
    requireMfa: boolean;
    sessionTimeout: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    ipWhitelist: string[];
  };
  
  // Notification settings
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
    notificationPreferences: {
      leadAssigned: boolean;
      leadStatusChanged: boolean;
      automationTriggered: boolean;
      systemAlerts: boolean;
    };
  };
  
  // Integration settings
  integrations: {
    googleWorkspace: boolean;
    microsoft365: boolean;
    slack: boolean;
    zapier: boolean;
    customWebhooks: string[];
  };
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  subdomain: string;

  @Prop({ required: true, unique: true })
  tenantId: string; // UUID

  @Prop({ required: true, enum: TenantStatus, default: TenantStatus.PENDING })
  status: TenantStatus;

  @Prop({ required: true, enum: TenantPlan, default: TenantPlan.BASIC })
  plan: TenantPlan;

  @Prop({ type: Object, required: true })
  settings: TenantSettings;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  adminIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  memberIds: Types.ObjectId[];

  @Prop()
  maxUsers: number;

  @Prop()
  maxLeads: number;

  @Prop()
  maxStorage: number; // in MB

  @Prop()
  customDomain?: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  primaryColor?: string;

  @Prop()
  secondaryColor?: string;

  @Prop()
  description?: string;

  @Prop()
  industry?: string;

  @Prop()
  size?: string; // small, medium, large, enterprise

  @Prop()
  website?: string;

  @Prop()
  phone?: string;

  @Prop({ type: Object })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({ type: Object })
  billingInfo?: {
    companyName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    taxId?: string;
  };

  @Prop({ type: Object })
  subscriptionInfo?: {
    planId: string;
    subscriptionId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };

  @Prop({ type: Object })
  usageStats?: {
    totalUsers: number;
    totalLeads: number;
    totalStorage: number;
    lastUpdated: Date;
  };

  @Prop({ type: Object })
  auditLog?: {
    lastLogin: Date;
    lastActivity: Date;
    totalLogins: number;
    failedLogins: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes for performance
TenantSchema.index({ tenantId: 1 });
TenantSchema.index({ subdomain: 1 });
TenantSchema.index({ status: 1 });
TenantSchema.index({ plan: 1 });
TenantSchema.index({ ownerId: 1 });
TenantSchema.index({ 'settings.companyName': 1 });
TenantSchema.index({ createdAt: 1 });

// Compound indexes
TenantSchema.index({ status: 1, plan: 1 });
TenantSchema.index({ tenantId: 1, status: 1 });

// Text search index
TenantSchema.index({
  name: 'text',
  subdomain: 'text',
  'settings.companyName': 'text',
  description: 'text',
});

// Soft delete support
TenantSchema.index({ deletedAt: 1 }); 