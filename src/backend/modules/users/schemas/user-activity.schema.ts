import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  SETTINGS_UPDATE = 'settings_update',
  PASSWORD_CHANGE = 'password_change',
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  STATUS_CHANGE = 'status_change',
  ROLE_CHANGE = 'role_change',
  PERMISSION_UPDATE = 'permission_update',
  ACCOUNT_CREATION = 'account_creation',
  ACCOUNT_DELETION = 'account_deletion',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  API_ACCESS = 'api_access',
  SECURITY_EVENT = 'security_event',
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

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ActivitySeverity, default: ActivitySeverity.LOW })
  severity: ActivitySeverity;

  @Prop({ type: Object })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    deviceInfo?: string;
    sessionId?: string;
    requestId?: string;
    resourceId?: string;
    resourceType?: string;
    oldValue?: any;
    newValue?: any;
    [key: string]: any;
  };

  @Prop({ type: Object })
  context: {
    module?: string;
    action?: string;
    target?: string;
    reason?: string;
    [key: string]: any;
  };

  @Prop()
  performedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isSystemEvent: boolean;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

// Indexes for better query performance
UserActivitySchema.index({ userId: 1 });
UserActivitySchema.index({ tenantId: 1 });
UserActivitySchema.index({ type: 1 });
UserActivitySchema.index({ severity: 1 });
UserActivitySchema.index({ performedAt: -1 });
UserActivitySchema.index({ createdAt: -1 });
UserActivitySchema.index({ userId: 1, type: 1 });
UserActivitySchema.index({ tenantId: 1, createdAt: -1 }); 