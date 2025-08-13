import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetDocument = PasswordReset & Document;

@Schema({ timestamps: true })
export class PasswordReset {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop()
  usedAt?: Date;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  lastAttemptAt?: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedReason?: string;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);

// Indexes for performance and security
PasswordResetSchema.index({ token: 1 }, { unique: true });
PasswordResetSchema.index({ userId: 1, createdAt: -1 });
PasswordResetSchema.index({ expiresAt: 1 });
PasswordResetSchema.index({ isUsed: 1, expiresAt: 1 });

// TTL index to automatically delete expired tokens (keep for 24 hours after expiry)
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
