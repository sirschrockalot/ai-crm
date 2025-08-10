import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimesheetDocument = Timesheet & Document;

@Schema({ timestamps: true })
export class Timesheet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  weekStartDate: Date;

  @Prop({ required: true })
  weekEndDate: Date;

  @Prop({ required: true, min: 0, max: 168 }) // 7 days * 24 hours
  totalHours: number;

  @Prop({ required: true, min: 0, max: 168 })
  billableHours: number;

  @Prop({ 
    enum: ['draft', 'submitted', 'approved', 'rejected'], 
    default: 'draft' 
  })
  status: 'draft' | 'submitted' | 'approved' | 'rejected';

  @Prop()
  submittedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'TimeEntry' }] })
  entries: Types.ObjectId[];

  @Prop({ trim: true })
  comments?: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
}

export const TimesheetSchema = SchemaFactory.createForClass(Timesheet);

// Indexes for performance
TimesheetSchema.index({ userId: 1, weekStartDate: -1 });
TimesheetSchema.index({ tenantId: 1, status: 1 });
TimesheetSchema.index({ weekStartDate: 1, weekEndDate: 1 });
TimesheetSchema.index({ submittedAt: 1, status: 1 }); // For approval queue
