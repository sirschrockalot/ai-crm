import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleDocument = Role & Document;

export enum RoleType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: RoleType, default: RoleType.CUSTOM })
  type: RoleType;

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop({ type: [String], required: true, default: [] })
  permissions: string[];

  @Prop({ type: [String], default: [] })
  inheritedRoles: string[];

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes for better query performance
RoleSchema.index({ name: 1 });
RoleSchema.index({ tenantId: 1 });
RoleSchema.index({ type: 1 });
RoleSchema.index({ isActive: 1 });
RoleSchema.index({ createdAt: -1 });

// Ensure virtual fields are serialized
RoleSchema.set('toJSON', { virtuals: true });
RoleSchema.set('toObject', { virtuals: true }); 