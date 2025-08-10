import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SecuritySettingsDocument = SecuritySettings & Document;

@Schema({ timestamps: true })
export class SecuritySettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: String, enum: ['totp', 'sms', 'email'], default: 'totp' })
  twoFactorMethod: string;

  @Prop({ type: String, default: '' })
  twoFactorSecret: string;

  @Prop({ type: [String], default: [] })
  backupCodes: string[];

  @Prop({
    type: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true },
      expirationDays: { type: Number, default: 90 },
      preventReuse: { type: Number, default: 5 },
    },
    default: {},
  })
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
    preventReuse: number;
  };

  @Prop({ type: Number, default: 1440 }) // 24 hours in minutes
  sessionTimeout: number;

  @Prop({ type: Boolean, default: true })
  loginHistory: boolean;

  @Prop({ type: [String], default: [] })
  ipRestrictions: string[];

  @Prop({ type: Boolean, default: false })
  requireIpVerification: boolean;

  @Prop({ type: Boolean, default: true })
  notifyOnNewLogin: boolean;

  @Prop({ type: Boolean, default: true })
  notifyOnPasswordChange: boolean;

  @Prop({ type: Boolean, default: true })
  notifyOnSecuritySettingsChange: boolean;

  @Prop({
    type: {
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 15 }, // minutes
      requireCaptcha: { type: Boolean, default: false },
    },
    default: {},
  })
  loginSecurity: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireCaptcha: boolean;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      notifyAdmins: { type: Boolean, default: true },
    },
    default: {},
  })
  sensitiveOperations: {
    enabled: boolean;
    requireApproval: boolean;
    notifyAdmins: boolean;
  };
}

export const SecuritySettingsSchema = SchemaFactory.createForClass(SecuritySettings);

// Indexes
SecuritySettingsSchema.index({ userId: 1 });
SecuritySettingsSchema.index({ twoFactorEnabled: 1 });
SecuritySettingsSchema.index({ 'passwordPolicy.expirationDays': 1 });
SecuritySettingsSchema.index({ sessionTimeout: 1 });
