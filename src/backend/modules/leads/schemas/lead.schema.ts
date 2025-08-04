import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  UNDER_CONTRACT = 'under_contract',
  CLOSED = 'closed',
  LOST = 'lost',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  MULTI_FAMILY = 'multi_family',
  COMMERCIAL = 'commercial',
  LAND = 'land',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  SOCIAL_MEDIA = 'social_media',
  PAID_ADS = 'paid_ads',
  DIRECT_MAIL = 'direct_mail',
  DRIVING_FOR_DOLLARS = 'driving_for_dollars',
  OTHER = 'other',
}

@Schema({ _id: false })
export class Address {
  @Prop()
  street?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  zipCode?: string;

  @Prop()
  county?: string;

  @Prop()
  fullAddress?: string;
}

@Schema({ _id: false })
export class PropertyDetails {
  @Prop({ enum: PropertyType })
  type?: PropertyType;

  @Prop({ min: 0 })
  bedrooms?: number;

  @Prop({ min: 0 })
  bathrooms?: number;

  @Prop({ min: 0 })
  squareFeet?: number;

  @Prop({ min: 0 })
  lotSize?: number;

  @Prop({ min: 1800, max: new Date().getFullYear() })
  yearBuilt?: number;
}

@Schema({ _id: false })
export class AutomationStep {
  @Prop({ required: true })
  step: string;

  @Prop({ required: true })
  executedAt: Date;

  @Prop()
  result?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

@Schema({ _id: false })
export class AutomationData {
  @Prop({ type: Types.ObjectId, ref: 'Workflow' })
  workflowId?: Types.ObjectId;

  @Prop()
  lastAutomationStep?: string;

  @Prop({ type: [AutomationStep], default: [] })
  automationHistory: AutomationStep[];
}

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ type: Address })
  address?: Address;

  @Prop({ type: PropertyDetails })
  propertyDetails?: PropertyDetails;

  @Prop({ min: 0 })
  estimatedValue?: number;

  @Prop({ min: 0 })
  askingPrice?: number;

  @Prop({ enum: LeadSource, default: LeadSource.OTHER })
  source: LeadSource;

  @Prop({ enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Prop({ enum: LeadPriority, default: LeadPriority.MEDIUM })
  priority: LeadPriority;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  notes?: string;

  @Prop({ default: 0, min: 0 })
  communicationCount: number;

  @Prop()
  lastContacted?: Date;

  @Prop()
  nextFollowUp?: Date;

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  @Prop()
  aiSummary?: string;

  @Prop({ type: [String], default: [] })
  aiTags: string[];

  @Prop({ min: 0, max: 100, default: 0 })
  leadScore: number;

  @Prop({ min: 0, max: 1, default: 0 })
  qualificationProbability: number;

  @Prop({ type: AutomationData, default: {} })
  automationData: AutomationData;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Add indexes for better query performance
LeadSchema.index({ tenantId: 1, status: 1 });
LeadSchema.index({ tenantId: 1, assignedTo: 1 });
LeadSchema.index({ tenantId: 1, phone: 1 });
LeadSchema.index({ tenantId: 1, email: 1 });
LeadSchema.index({ tenantId: 1, source: 1 });
LeadSchema.index({ tenantId: 1, tags: 1 });
LeadSchema.index({ tenantId: 1, lastContacted: -1 });
LeadSchema.index({ tenantId: 1, nextFollowUp: 1 });
LeadSchema.index({ tenantId: 1, priority: 1 });
LeadSchema.index({ tenantId: 1, leadScore: -1 });
LeadSchema.index({ tenantId: 1, createdAt: -1 });
LeadSchema.index({ tenantId: 1, updatedAt: -1 });

// Text search index
LeadSchema.index(
  { 
    tenantId: 1, 
    name: 'text', 
    phone: 'text', 
    email: 'text',
    notes: 'text',
    'address.fullAddress': 'text'
  },
  { 
    name: 'lead_text_search',
    weights: {
      name: 10,
      phone: 8,
      email: 8,
      notes: 5,
      'address.fullAddress': 6
    }
  }
);

// Compound indexes for common queries
LeadSchema.index({ tenantId: 1, status: 1, priority: 1 });
LeadSchema.index({ tenantId: 1, assignedTo: 1, status: 1 });
LeadSchema.index({ tenantId: 1, source: 1, status: 1 });
LeadSchema.index({ tenantId: 1, tags: 1, status: 1 });

// Geospatial index for address-based queries (if needed in future)
// LeadSchema.index({ 'address.location': '2dsphere' }); 