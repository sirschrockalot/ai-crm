import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: String, required: true })
  entity: string;

  @Prop({ type: Types.ObjectId, default: null })
  entityId: Types.ObjectId;

  @Prop({ type: String, default: '' })
  entityName: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  details: string;

  @Prop({
    type: {
      before: { type: Object, default: null },
      after: { type: Object, default: null },
      changes: [{ type: Object }],
    },
    default: {},
  })
  changes: {
    before: any | null;
    after: any | null;
    changes: any[];
  };

  @Prop({
    type: {
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' },
      location: { type: String, default: '' },
      device: { type: String, default: '' },
      browser: { type: String, default: '' },
      os: { type: String, default: '' },
    },
    default: {},
  })
  context: {
    ipAddress: string;
    userAgent: string;
    location: string;
    device: string;
    browser: string;
    os: string;
  };

  @Prop({
    type: {
      level: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
      category: { type: String, default: '' },
      tags: [{ type: String }],
      priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    },
    default: {},
  })
  metadata: {
    level: string;
    category: string;
    tags: string[];
    priority: string;
  };

  @Prop({
    type: {
      relatedAction: { type: String, default: '' },
      relatedEntity: { type: String, default: '' },
      relatedEntityId: { type: Types.ObjectId, default: null },
      batchId: { type: String, default: '' },
      transactionId: { type: String, default: '' },
    },
    default: {},
  })
  relationships: {
    relatedAction: string;
    relatedEntity: string;
    relatedEntityId: Types.ObjectId | null;
    batchId: string;
    transactionId: string;
  };

  @Prop({
    type: {
      retentionDays: { type: Number, default: 2555 }, // 7 years
      isArchived: { type: Boolean, default: false },
      archiveDate: { type: Date, default: null },
      archiveLocation: { type: String, default: '' },
    },
    default: {},
  })
  retention: {
    retentionDays: number;
    isArchived: boolean;
    archiveDate: Date | null;
    archiveLocation: string;
  };

  @Prop({
    type: {
      isCompliance: { type: Boolean, default: false },
      complianceType: { type: String, default: '' },
      complianceLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
      regulatoryFramework: { type: String, default: '' },
    },
    default: {},
  })
  compliance: {
    isCompliance: boolean;
    complianceType: string;
    complianceLevel: string;
    regulatoryFramework: string;
  };
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ tenantId: 1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entity: 1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ createdAt: 1 });
AuditLogSchema.index({ 'metadata.level': 1 });
AuditLogSchema.index({ 'metadata.category': 1 });
AuditLogSchema.index({ 'metadata.priority': 1 });
AuditLogSchema.index({ 'compliance.isCompliance': 1 });
AuditLogSchema.index({ tenantId: 1, createdAt: 1 });
AuditLogSchema.index({ tenantId: 1, action: 1 });
AuditLogSchema.index({ tenantId: 1, entity: 1 });
AuditLogSchema.index({ tenantId: 1, userId: 1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2555 * 24 * 60 * 60 }); // TTL index for 7 years
