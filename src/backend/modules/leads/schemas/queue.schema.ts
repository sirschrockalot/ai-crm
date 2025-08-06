import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueueItemDocument = QueueItem & Document;

@Schema({ timestamps: true })
export class QueueItem {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Lead' })
  leadId: Types.ObjectId;

  @Prop({ required: true, default: 1, min: 1, max: 10 })
  priority: number;

  @Prop({ required: true, enum: ['pending', 'assigned', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  agentId?: Types.ObjectId;

  @Prop()
  assignedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const QueueItemSchema = SchemaFactory.createForClass(QueueItem);

// Indexes for performance
QueueItemSchema.index({ status: 1, priority: -1, createdAt: 1 });
QueueItemSchema.index({ leadId: 1 });
QueueItemSchema.index({ agentId: 1 });
QueueItemSchema.index({ createdAt: 1 }); 