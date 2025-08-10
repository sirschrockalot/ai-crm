import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeEntryDocument = TimeEntry & Document;

@Schema({ timestamps: true })
export class TimeEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  taskId?: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true, min: 0, max: 24 })
  duration: number; // in hours

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ default: false })
  billable: boolean;

  @Prop({ min: 0 })
  hourlyRate?: number;

  @Prop({ 
    enum: ['draft', 'submitted', 'approved', 'rejected'], 
    default: 'draft' 
  })
  status: 'draft' | 'submitted' | 'approved' | 'rejected';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({ trim: true })
  comments?: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);

// Indexes for performance
TimeEntrySchema.index({ userId: 1, startTime: -1 });
TimeEntrySchema.index({ projectId: 1, startTime: -1 });
TimeEntrySchema.index({ tenantId: 1, status: 1 });
TimeEntrySchema.index({ startTime: 1, endTime: 1 }); // For overlap detection
