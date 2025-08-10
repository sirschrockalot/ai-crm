import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomFieldDocument = CustomField & Document;

@Schema({ timestamps: true })
export class CustomField {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: true })
  entity: string; // 'lead', 'contact', 'deal', 'company', etc.

  @Prop({ type: String, enum: ['text', 'textarea', 'number', 'email', 'phone', 'date', 'datetime', 'select', 'multiselect', 'checkbox', 'radio', 'url', 'file', 'location'], required: true })
  type: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Boolean, default: false })
  required: boolean;

  @Prop({ type: Boolean, default: false })
  unique: boolean;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({ type: String, default: '' })
  defaultValue: string;

  @Prop({
    type: {
      minLength: { type: Number, default: null },
      maxLength: { type: Number, default: null },
      minValue: { type: Number, default: null },
      maxValue: { type: Number, default: null },
      pattern: { type: String, default: '' },
      options: [{ type: String }],
      multiple: { type: Boolean, default: false },
      allowCustom: { type: Boolean, default: false },
    },
    default: {},
  })
  validation: {
    minLength: number | null;
    maxLength: number | null;
    minValue: number | null;
    maxValue: number | null;
    pattern: string;
    options: string[];
    multiple: boolean;
    allowCustom: boolean;
  };

  @Prop({
    type: {
      showInList: { type: Boolean, default: false },
      showInDetail: { type: Boolean, default: true },
      showInForm: { type: Boolean, default: true },
      showInSearch: { type: Boolean, default: false },
      showInReports: { type: Boolean, default: false },
      showInDashboard: { type: Boolean, default: false },
    },
    default: {},
  })
  display: {
    showInList: boolean;
    showInDetail: boolean;
    showInForm: boolean;
    showInSearch: boolean;
    showInReports: boolean;
    showInDashboard: boolean;
  };

  @Prop({
    type: {
      dependsOn: { type: String, default: '' },
      dependsValue: { type: String, default: '' },
      showWhen: { type: String, default: '' },
      hideWhen: { type: String, default: '' },
    },
    default: {},
  })
  dependencies: {
    dependsOn: string;
    dependsValue: string;
    showWhen: string;
    hideWhen: string;
  };

  @Prop({
    type: {
      apiField: { type: String, default: '' },
      externalId: { type: String, default: '' },
      syncDirection: { type: String, enum: ['inbound', 'outbound', 'bidirectional'], default: 'inbound' },
    },
    default: {},
  })
  integration: {
    apiField: string;
    externalId: string;
    syncDirection: string;
  };

  @Prop({
    type: {
      createdBy: { type: Types.ObjectId, ref: 'User', required: true },
      updatedBy: { type: Types.ObjectId, ref: 'User' },
      approvedBy: { type: Types.ObjectId, ref: 'User' },
      approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      approvalNotes: { type: String, default: '' },
    },
    default: {},
  })
  metadata: {
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    approvedBy: Types.ObjectId;
    approvalStatus: string;
    approvalNotes: string;
  };
}

export const CustomFieldSchema = SchemaFactory.createForClass(CustomField);

// Indexes
CustomFieldSchema.index({ tenantId: 1 });
CustomFieldSchema.index({ entity: 1 });
CustomFieldSchema.index({ name: 1 });
CustomFieldSchema.index({ active: 1 });
CustomFieldSchema.index({ sortOrder: 1 });
CustomFieldSchema.index({ 'metadata.approvalStatus': 1 });
CustomFieldSchema.index({ tenantId: 1, entity: 1, active: 1 });
CustomFieldSchema.index({ tenantId: 1, name: 1 }, { unique: true });
