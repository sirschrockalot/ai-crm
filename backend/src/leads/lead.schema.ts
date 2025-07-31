import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

export interface Lead {
  _id: string;
  tenant_id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    county?: string;
    full_address?: string;
  };
  property_details?: {
    type?: string; // single_family, multi_family, commercial, land
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
  };
  estimated_value?: number;
  asking_price?: number;
  source?: string; // website, referral, cold_call, etc.
  status: string; // new, contacted, under_contract, closed, lost
  priority: string; // low, medium, high, urgent
  assigned_to?: Types.ObjectId; // Reference to users collection
  tags: string[];
  notes?: string;
  communication_count: number;
  last_contacted?: Date;
  next_follow_up?: Date;
  custom_fields?: Record<string, any>; // Flexible custom fields
  ai_summary?: string; // AI-generated summary (from Epic 5)
  ai_tags?: string[]; // AI-generated tags (from Epic 5)
  created_at: Date;
  updated_at: Date;
}

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: Types.ObjectId, required: true })
  tenant_id: Types.ObjectId;

  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ type: Object, required: false })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    county?: string;
    full_address?: string;
  };

  @Prop({ type: Object, required: false })
  property_details?: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
  };

  @Prop({ required: false })
  estimated_value?: number;

  @Prop({ required: false })
  asking_price?: number;

  @Prop({ required: false })
  source?: string;

  @Prop({ default: 'new' })
  status: string;

  @Prop({ default: 'medium' })
  priority: string;

  @Prop({ type: Types.ObjectId, required: false })
  assigned_to?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: false })
  notes?: string;

  @Prop({ default: 0 })
  communication_count: number;

  @Prop({ required: false })
  last_contacted?: Date;

  @Prop({ required: false })
  next_follow_up?: Date;

  @Prop({ type: Object, required: false })
  custom_fields?: Record<string, any>;

  @Prop({ required: false })
  ai_summary?: string;

  @Prop({ type: [String], default: [] })
  ai_tags?: string[];

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Indexes for performance and multi-tenant isolation
LeadSchema.index({ tenant_id: 1, status: 1 });
LeadSchema.index({ tenant_id: 1, assigned_to: 1 });
LeadSchema.index({ tenant_id: 1, phone: 1 });
LeadSchema.index({ tenant_id: 1, email: 1 });
LeadSchema.index({ tenant_id: 1, source: 1 });
LeadSchema.index({ tenant_id: 1, tags: 1 });
LeadSchema.index({ tenant_id: 1, last_contacted: -1 });
LeadSchema.index({ tenant_id: 1, next_follow_up: 1 });
LeadSchema.index({ tenant_id: 1, name: 'text', phone: 'text' }); 