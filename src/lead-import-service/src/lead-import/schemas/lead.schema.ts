import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, type: Types.ObjectId })
  tenant_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zip_code: String,
      county: String,
      full_address: String,
    },
  })
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    county?: string;
    full_address?: string;
  };

  @Prop({
    type: {
      type: String,
      bedrooms: Number,
      bathrooms: Number,
      square_feet: Number,
      lot_size: Number,
      year_built: Number,
    },
  })
  property_details: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
  };

  @Prop()
  estimated_value: number;

  @Prop()
  asking_price: number;

  @Prop()
  source: string;

  @Prop({ 
    type: String, 
    enum: ['new', 'contacted', 'under_contract', 'closed', 'lost'], 
    default: 'new' 
  })
  status: string;

  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_to: Types.ObjectId;

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  notes: string;

  @Prop({ type: Number, default: 0 })
  communication_count: number;

  @Prop({ type: Date })
  last_contacted: Date;

  @Prop({ type: Date })
  next_follow_up: Date;

  @Prop({ type: Object })
  custom_fields: Record<string, any>;

  @Prop()
  ai_summary: string;

  @Prop({ type: [String] })
  ai_tags: string[];

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  lead_score: number;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  qualification_probability: number;

  @Prop({
    type: {
      workflow_id: Types.ObjectId,
      last_automation_step: String,
      automation_history: [{
        step: String,
        executed_at: Date,
        result: String,
      }],
    },
  })
  automation_data: {
    workflow_id?: Types.ObjectId;
    last_automation_step?: string;
    automation_history?: Array<{
      step: string;
      executed_at: Date;
      result: string;
    }>;
  };
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Indexes for performance
LeadSchema.index({ tenant_id: 1, status: 1 });
LeadSchema.index({ tenant_id: 1, assigned_to: 1 });
LeadSchema.index({ tenant_id: 1, phone: 1 });
LeadSchema.index({ tenant_id: 1, email: 1 });
LeadSchema.index({ tenant_id: 1, source: 1 });
LeadSchema.index({ tenant_id: 1, tags: 1 });
LeadSchema.index({ tenant_id: 1, last_contacted: 1 });
LeadSchema.index({ tenant_id: 1, lead_score: -1 });
LeadSchema.index({ tenant_id: 1, created_at: -1 });

// Text search index
LeadSchema.index(
  { 
    tenant_id: 1,
    name: 'text',
    'address.full_address': 'text',
    notes: 'text'
  },
  { 
    name: 'tenant_text_search',
    weights: {
      name: 10,
      'address.full_address': 5,
      notes: 1
    }
  }
);
