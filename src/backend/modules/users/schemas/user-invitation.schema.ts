import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from './user.schema';

export type UserInvitationDocument = UserInvitation & Document;

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class UserInvitation {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true, enum: InvitationStatus, default: InvitationStatus.PENDING })
  status: InvitationStatus;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: [String], default: [UserRole.USER] })
  roles: string[];

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop()
  message?: string;

  @Prop({ type: Object })
  metadata: {
    invitationSource?: string;
    campaignId?: string;
    referrer?: string;
    [key: string]: any;
  };

  // Virtual properties
  isExpired?: boolean;
  isValid?: boolean;
}

export const UserInvitationSchema = SchemaFactory.createForClass(UserInvitation);

// Indexes for better query performance
UserInvitationSchema.index({ email: 1 });
UserInvitationSchema.index({ token: 1 }, { unique: true });
UserInvitationSchema.index({ invitedBy: 1 });
UserInvitationSchema.index({ status: 1 });
UserInvitationSchema.index({ expiresAt: 1 });
UserInvitationSchema.index({ tenantId: 1 });
UserInvitationSchema.index({ createdAt: -1 });

// Compound indexes for common queries
UserInvitationSchema.index({ email: 1, status: 1 });
UserInvitationSchema.index({ invitedBy: 1, status: 1 });
UserInvitationSchema.index({ tenantId: 1, status: 1 });
UserInvitationSchema.index({ status: 1, expiresAt: 1 });

// TTL index to automatically expire invitations
UserInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure virtual fields are serialized
UserInvitationSchema.set('toJSON', { virtuals: true });
UserInvitationSchema.set('toObject', { virtuals: true });

// Virtual for checking if invitation is expired
UserInvitationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual for checking if invitation is valid
UserInvitationSchema.virtual('isValid').get(function() {
  return this.status === InvitationStatus.PENDING && !this.isExpired;
});

// Pre-save middleware to set expiration if not provided
UserInvitationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + 7); // 7 days from now
  }
  next();
});

 