import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  displayName?: string;

  @Prop()
  picture?: string;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop()
  googleId?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastActiveAt?: Date;

  @Prop({ type: Object })
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme: string;
    language: string;
    timezone: string;
  };

  @Prop({ type: Object })
  profile: {
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    company?: string;
    position?: string;
    bio?: string;
    website?: string;
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: Object })
  preferences: {
    dashboardLayout?: string;
    defaultView?: string;
    autoRefresh?: boolean;
    emailDigest?: boolean;
  };

  @Prop()
  emailVerifiedAt?: Date;

  @Prop()
  phoneVerifiedAt?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActiveAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true }); 