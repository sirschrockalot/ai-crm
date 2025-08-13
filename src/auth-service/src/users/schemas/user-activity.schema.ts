import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',
  EMAIL_VERIFICATION = 'email_verification',
  MFA_SETUP = 'mfa_setup',
  MFA_VERIFICATION = 'mfa_verification',
  MFA_DISABLE = 'mfa_disable',
  PROFILE_UPDATE = 'profile_update',
  SESSION_CREATE = 'session_create',
  SESSION_REVOKE = 'session_revoke',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  ROLE_CHANGE = 'role_change',
  STATUS_CHANGE = 'status_change',
}

export enum ActivitySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class UserActivity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ type: String, enum: ActivitySeverity, default: ActivitySeverity.LOW })
  severity: ActivitySeverity;

  @Prop({ required: true })
  description: string;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop()
  device: string;

  @Prop({ type: Object })
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop({ type: Object })
  metadata?: {
    sessionId?: string;
    targetUserId?: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    [key: string]: any;
  };

  @Prop({ default: false })
  isSuspicious: boolean;

  @Prop()
  suspiciousReason?: string;

  @Prop({ default: false })
  requiresReview: boolean;

  @Prop()
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewNotes?: string;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

// Indexes for performance and querying
UserActivitySchema.index({ userId: 1, createdAt: -1 });
UserActivitySchema.index({ type: 1, createdAt: -1 });
UserActivitySchema.index({ severity: 1, createdAt: -1 });
UserActivitySchema.index({ isSuspicious: 1, createdAt: -1 });
UserActivitySchema.index({ ip: 1, createdAt: -1 });
UserActivitySchema.index({ createdAt: -1 });

// TTL index to automatically delete old activities (keep for 1 year)
UserActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
