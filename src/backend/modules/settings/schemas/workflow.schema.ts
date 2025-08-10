import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkflowDocument = Workflow & Document;

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, required: true })
  entity: string; // 'lead', 'contact', 'deal', 'company', etc.

  @Prop({ type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({
    type: {
      trigger: { type: String, enum: ['manual', 'automatic', 'scheduled', 'webhook'], required: true },
      conditions: [{ type: Object }],
      schedule: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
    },
    default: {},
  })
  trigger: {
    trigger: string;
    conditions: any[];
    schedule: string;
    webhookUrl: string;
  };

  @Prop({
    type: [{
      id: { type: String, required: true },
      type: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, default: '' },
      config: { type: Object, default: {} },
      position: { type: Object, default: { x: 0, y: 0 } },
      connections: [{ type: String }],
      conditions: [{ type: Object }],
      actions: [{ type: Object }],
      delay: { type: Number, default: 0 },
      retryCount: { type: Number, default: 0 },
      retryDelay: { type: Number, default: 0 },
    }],
    default: [],
  })
  steps: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    config: any;
    position: { x: number; y: number };
    connections: string[];
    conditions: any[];
    actions: any[];
    delay: number;
    retryCount: number;
    retryDelay: number;
  }>;

  @Prop({
    type: {
      maxExecutionTime: { type: Number, default: 3600 }, // seconds
      allowParallel: { type: Boolean, default: false },
      maxParallelExecutions: { type: Number, default: 1 },
      stopOnError: { type: Boolean, default: true },
      retryOnFailure: { type: Boolean, default: false },
      maxRetries: { type: Number, default: 3 },
    },
    default: {},
  })
  execution: {
    maxExecutionTime: number;
    allowParallel: boolean;
    maxParallelExecutions: number;
    stopOnError: boolean;
    retryOnFailure: boolean;
    maxRetries: number;
  };

  @Prop({
    type: {
      notifyOnStart: { type: Boolean, default: false },
      notifyOnComplete: { type: Boolean, default: false },
      notifyOnError: { type: Boolean, default: true },
      notifyUsers: [{ type: Types.ObjectId, ref: 'User' }],
      notifyRoles: [{ type: String }],
      emailTemplate: { type: String, default: '' },
    },
    default: {},
  })
  notifications: {
    notifyOnStart: boolean;
    notifyOnComplete: boolean;
    notifyOnError: boolean;
    notifyUsers: Types.ObjectId[];
    notifyRoles: string[];
    emailTemplate: string;
  };

  @Prop({
    type: {
      createdBy: { type: Types.ObjectId, ref: 'User', required: true },
      updatedBy: { type: Types.ObjectId, ref: 'User' },
      approvedBy: { type: Types.ObjectId, ref: 'User' },
      approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      approvalNotes: { type: String, default: '' },
      version: { type: Number, default: 1 },
      isTemplate: { type: Boolean, default: false },
    },
    default: {},
  })
  metadata: {
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    approvedBy: Types.ObjectId;
    approvalStatus: string;
    approvalNotes: string;
    version: number;
    isTemplate: boolean;
  };

  @Prop({
    type: {
      totalExecutions: { type: Number, default: 0 },
      successfulExecutions: { type: Number, default: 0 },
      failedExecutions: { type: Number, default: 0 },
      averageExecutionTime: { type: Number, default: 0 },
      lastExecution: { type: Date, default: null },
      lastExecutionStatus: { type: String, enum: ['success', 'failure', 'running'], default: null },
    },
    default: {},
  })
  statistics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecution: Date | null;
    lastExecutionStatus: string | null;
  };
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);

// Indexes
WorkflowSchema.index({ tenantId: 1 });
WorkflowSchema.index({ entity: 1 });
WorkflowSchema.index({ status: 1 });
WorkflowSchema.index({ isDefault: 1 });
WorkflowSchema.index({ sortOrder: 1 });
WorkflowSchema.index({ 'metadata.approvalStatus': 1 });
WorkflowSchema.index({ 'metadata.isTemplate': 1 });
WorkflowSchema.index({ tenantId: 1, entity: 1, status: 1 });
WorkflowSchema.index({ tenantId: 1, name: 1 }, { unique: true });
