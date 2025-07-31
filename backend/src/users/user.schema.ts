import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export interface User {
  _id: string;
  google_id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  tenant_id: Types.ObjectId;
  role: string;
  permissions: string[];
  is_active: boolean;
  is_verified: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    dashboard_layout?: object;
    default_view?: 'leads' | 'buyers' | 'dashboard';
  };
  last_login?: Date;
  login_count: number;
  created_at: Date;
  updated_at: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  google_id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  first_name?: string;

  @Prop({ required: false })
  last_name?: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  avatar_url?: string;

  @Prop({ type: Types.ObjectId, required: true })
  tenant_id: Types.ObjectId;

  @Prop({ default: 'acquisition_rep' })
  role: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_verified: boolean;

  @Prop({ type: Object, required: false })
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    dashboard_layout?: object;
    default_view?: 'leads' | 'buyers' | 'dashboard';
  };

  @Prop({ required: false })
  last_login?: Date;

  @Prop({ default: 0 })
  login_count: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for performance and multi-tenant isolation
UserSchema.index({ google_id: 1 });
UserSchema.index({ tenant_id: 1, email: 1 });
UserSchema.index({ tenant_id: 1, role: 1 });
UserSchema.index({ tenant_id: 1, is_active: 1 });
UserSchema.index({ tenant_id: 1, permissions: 1 }); 