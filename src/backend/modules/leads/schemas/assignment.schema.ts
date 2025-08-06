import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Lead' })
  leadId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  agentId: Types.ObjectId;

  @Prop({ required: true, enum: ['pending', 'accepted', 'rejected', 'reassigned', 'completed'], default: 'pending' })
  status: string;

  @Prop({ required: true, enum: ['automatic', 'manual', 'reassignment'], default: 'automatic' })
  assignmentType: string;

  @Prop()
  reason?: string;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  previousAgentId?: Types.ObjectId;

  @Prop()
  reassignedAt?: Date;

  @Prop()
  reassignmentReason?: string;

  @Prop()
  workloadAtAssignment?: number;

  @Prop()
  capacityAtAssignment?: number;

  @Prop({ min: 0, max: 100 })
  skillMatchScore?: number;

  @Prop()
  responseTime?: number; // Time to first response in minutes

  @Prop()
  processingTime?: number; // Total processing time in minutes

  @Prop({ enum: ['converted', 'lost', 'pending', 'cancelled'] })
  outcome?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

// Indexes for performance
AssignmentSchema.index({ leadId: 1, status: 1 });
AssignmentSchema.index({ agentId: 1, status: 1 });
AssignmentSchema.index({ assignedAt: -1 });
AssignmentSchema.index({ assignmentType: 1 });
AssignmentSchema.index({ status: 1, assignedAt: -1 }); 