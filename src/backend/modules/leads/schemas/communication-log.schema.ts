import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunicationLogDocument = CommunicationLog & Document;

@Schema({ timestamps: true })
export class CommunicationLog {
  @Prop({ type: Types.ObjectId, ref: 'Lead', required: false })
  leadId?: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, enum: ['sms', 'voice', 'email'] })
  type: 'sms' | 'voice' | 'email';

  @Prop({ required: true, enum: ['outbound', 'inbound'] })
  direction: 'outbound' | 'inbound';

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ['queued', 'sent', 'delivered', 'failed'] })
  status: 'queued' | 'sent' | 'delivered' | 'failed';

  @Prop()
  messageId?: string;

  @Prop({ type: Number, default: 0 })
  cost?: number;

  @Prop()
  error?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const CommunicationLogSchema = SchemaFactory.createForClass(CommunicationLog);

// Indexes for efficient querying
CommunicationLogSchema.index({ tenantId: 1, createdAt: -1 });
CommunicationLogSchema.index({ leadId: 1, createdAt: -1 });
CommunicationLogSchema.index({ userId: 1, createdAt: -1 });
CommunicationLogSchema.index({ type: 1, status: 1 });
CommunicationLogSchema.index({ messageId: 1 }, { unique: true, sparse: true }); 