import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserStatusHistoryDocument = UserStatusHistory & Document;

export enum StatusChangeReason {
  ADMIN_ACTION = 'admin_action',
  VIOLATION = 'violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PAYMENT_ISSUE = 'payment_issue',
  USER_REQUEST = 'user_request',
  SYSTEM_AUTO = 'system_auto',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class UserStatusHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop({ required: true })
  oldStatus: string;

  @Prop({ required: true })
  newStatus: string;

  @Prop({ enum: StatusChangeReason, default: StatusChangeReason.OTHER })
  reason: StatusChangeReason;

  @Prop()
  reasonDetails?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now })
  changedAt: Date;
}

export const UserStatusHistorySchema = SchemaFactory.createForClass(UserStatusHistory);

// Add indexes for better query performance
UserStatusHistorySchema.index({ userId: 1, changedAt: -1 });
UserStatusHistorySchema.index({ tenantId: 1, changedAt: -1 });
UserStatusHistorySchema.index({ performedBy: 1, changedAt: -1 }); 