import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetTokenDocument = PasswordResetToken & Document;

@Schema({ timestamps: true })
export class PasswordResetToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  usedAt?: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(PasswordResetToken);

// Indexes for better query performance
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ token: 1 }, { unique: true });
PasswordResetTokenSchema.index({ expiresAt: 1 });
PasswordResetTokenSchema.index({ usedAt: 1 });
PasswordResetTokenSchema.index({ createdAt: -1 });

// Compound indexes for common queries
PasswordResetTokenSchema.index({ userId: 1, expiresAt: 1 });
PasswordResetTokenSchema.index({ token: 1, expiresAt: 1 });
PasswordResetTokenSchema.index({ token: 1, usedAt: 1 });

// Ensure virtual fields are serialized
PasswordResetTokenSchema.set('toJSON', { virtuals: true });
PasswordResetTokenSchema.set('toObject', { virtuals: true }); 