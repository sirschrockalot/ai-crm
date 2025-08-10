import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, unique: true })
  tenantId: Types.ObjectId;

  @Prop({
    type: {
      name: { type: String, required: true },
      logo: { type: String, default: '' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
      industry: { type: String, default: '' },
      size: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'], default: 'medium' },
    },
    default: {},
  })
  company: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    industry: string;
    size: string;
  };

  @Prop({
    type: {
      primaryColor: { type: String, default: '#3182CE' },
      secondaryColor: { type: String, default: '#E53E3E' },
      accentColor: { type: String, default: '#38A169' },
      customCss: { type: String, default: '' },
      logoAlignment: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
      showCompanyName: { type: Boolean, default: true },
      showCompanyLogo: { type: Boolean, default: true },
    },
    default: {},
  })
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    customCss: string;
    logoAlignment: string;
    showCompanyName: boolean;
    showCompanyLogo: boolean;
  };

  @Prop({
    type: {
      leadManagement: { type: Boolean, default: true },
      pipelineManagement: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      automation: { type: Boolean, default: true },
      integrations: { type: Boolean, default: true },
      reporting: { type: Boolean, default: true },
      mobile: { type: Boolean, default: true },
      api: { type: Boolean, default: true },
    },
    default: {},
  })
  features: {
    leadManagement: boolean;
    pipelineManagement: boolean;
    analytics: boolean;
    automation: boolean;
    integrations: boolean;
    reporting: boolean;
    mobile: boolean;
    api: boolean;
  };

  @Prop({
    type: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      calendar: { type: Boolean, default: false },
      crm: { type: Boolean, default: false },
      accounting: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    default: {},
  })
  integrations: {
    email: boolean;
    sms: boolean;
    calendar: boolean;
    crm: boolean;
    accounting: boolean;
    marketing: boolean;
  };

  @Prop({
    type: {
      defaultTimezone: { type: String, default: 'UTC' },
      defaultLanguage: { type: String, default: 'en-US' },
      defaultCurrency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      timeFormat: { type: String, default: '12h' },
      weekStart: { type: String, enum: ['monday', 'sunday'], default: 'monday' },
    },
    default: {},
  })
  localization: {
    defaultTimezone: string;
    defaultLanguage: string;
    defaultCurrency: string;
    dateFormat: string;
    timeFormat: string;
    weekStart: string;
  };

  @Prop({
    type: {
      maxUsers: { type: Number, default: 10 },
      maxLeads: { type: Number, default: 1000 },
      maxStorage: { type: Number, default: 10 }, // GB
      retentionDays: { type: Number, default: 2555 }, // 7 years
      backupFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    },
    default: {},
  })
  limits: {
    maxUsers: number;
    maxLeads: number;
    maxStorage: number;
    retentionDays: number;
    backupFrequency: string;
  };

  @Prop({
    type: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String, default: 'System is under maintenance. Please try again later.' },
      allowAdminAccess: { type: Boolean, default: true },
      scheduledMaintenance: { type: Boolean, default: false },
      maintenanceStart: { type: Date, default: null },
      maintenanceEnd: { type: Date, default: null },
    },
    default: {},
  })
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowAdminAccess: boolean;
    scheduledMaintenance: boolean;
    maintenanceStart: Date | null;
    maintenanceEnd: Date | null;
  };
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);

// Indexes
SystemSettingsSchema.index({ tenantId: 1 });
SystemSettingsSchema.index({ 'company.name': 1 });
SystemSettingsSchema.index({ 'company.industry': 1 });
SystemSettingsSchema.index({ 'features.leadManagement': 1 });
SystemSettingsSchema.index({ 'system.maintenanceMode': 1 });
