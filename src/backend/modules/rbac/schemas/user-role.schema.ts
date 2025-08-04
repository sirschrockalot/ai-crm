import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRoleDocument = UserRole & Document;

@Schema({ timestamps: true })
export class UserRole {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop()
  assignedAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  revokedBy?: Types.ObjectId;

  @Prop()
  revokedAt?: Date;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

// Compound index for unique user-role assignments
UserRoleSchema.index({ userId: 1, roleId: 1, tenantId: 1 }, { unique: true });

// Indexes for better query performance
UserRoleSchema.index({ userId: 1 });
UserRoleSchema.index({ roleId: 1 });
UserRoleSchema.index({ tenantId: 1 });
UserRoleSchema.index({ isActive: 1 });
UserRoleSchema.index({ assignedAt: -1 });
UserRoleSchema.index({ expiresAt: 1 });

// Ensure virtual fields are serialized
UserRoleSchema.set('toJSON', { virtuals: true });
UserRoleSchema.set('toObject', { virtuals: true }); 