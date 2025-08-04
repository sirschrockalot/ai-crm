import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QueueEntryDocument = QueueEntry & Document;
export type AssignmentHistoryDocument = AssignmentHistory & Document;
export type QueueAnalyticsDocument = QueueAnalytics & Document;
export type QueueConfigurationDocument = QueueConfiguration & Document;

export enum QueuePriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum QueueStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum AssignmentType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  OVERRIDE = 'override',
  REASSIGNMENT = 'reassignment',
}

export interface QueueEntry {
  @Prop({ required: true })
  queueId: string; // UUID

  @Prop({ required: true })
  tenantId: string; // Multi-tenant support

  @Prop({ required: true })
  leadId: string; // Reference to lead

  @Prop({ required: true, enum: QueuePriority, default: QueuePriority.NORMAL })
  priority: QueuePriority;

  @Prop({ required: true, enum: QueueStatus, default: QueueStatus.PENDING })
  status: QueueStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId; // Assigned agent

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedBy?: Types.ObjectId; // Who assigned the lead

  @Prop({ required: true })
  score: number; // Lead score (0-100)

  @Prop()
  estimatedProcessingTime?: number; // Estimated time in minutes

  @Prop()
  actualProcessingTime?: number; // Actual time in minutes

  @Prop()
  queuePosition: number; // Position in queue

  @Prop()
  waitTime: number; // Time spent waiting in queue (minutes)

  @Prop()
  assignmentReason?: string; // Reason for assignment

  @Prop()
  notes?: string; // Additional notes

  @Prop()
  tags?: string[]; // Tags for categorization

  @Prop()
  metadata?: Record<string, any>; // Additional metadata

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  assignedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  expiresAt?: Date; // Queue entry expiration
}

export interface AssignmentHistory {
  @Prop({ required: true })
  historyId: string; // UUID

  @Prop({ required: true })
  tenantId: string; // Multi-tenant support

  @Prop({ required: true })
  leadId: string; // Reference to lead

  @Prop({ required: true })
  queueId: string; // Reference to queue entry

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId; // Assigned agent

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedBy: Types.ObjectId; // Who made the assignment

  @Prop({ required: true, enum: AssignmentType })
  assignmentType: AssignmentType;

  @Prop()
  previousAgent?: Types.ObjectId; // Previous agent if reassignment

  @Prop()
  assignmentReason?: string; // Reason for assignment

  @Prop()
  assignmentNotes?: string; // Additional notes

  @Prop()
  workloadAtAssignment?: number; // Agent workload at assignment time

  @Prop()
  capacityAtAssignment?: number; // Agent capacity at assignment time

  @Prop()
  skillMatchScore?: number; // Skill match score (0-100)

  @Prop()
  responseTime?: number; // Time to first response (minutes)

  @Prop()
  processingTime?: number; // Total processing time (minutes)

  @Prop()
  outcome?: 'converted' | 'lost' | 'pending' | 'cancelled';

  @Prop()
  metadata?: Record<string, any>; // Additional metadata

  @Prop({ required: true })
  createdAt: Date;
}

export interface QueueAnalytics {
  @Prop({ required: true })
  analyticsId: string; // UUID

  @Prop({ required: true })
  tenantId: string; // Multi-tenant support

  @Prop({ required: true })
  date: Date; // Date of analytics

  @Prop({ required: true })
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';

  // Queue Performance Metrics
  @Prop({ required: true })
  totalLeadsQueued: number;

  @Prop({ required: true })
  totalLeadsAssigned: number;

  @Prop({ required: true })
  totalLeadsCompleted: number;

  @Prop({ required: true })
  averageWaitTime: number; // Average wait time in minutes

  @Prop({ required: true })
  averageProcessingTime: number; // Average processing time in minutes

  @Prop({ required: true })
  queueThroughput: number; // Leads processed per hour

  @Prop({ required: true })
  queueUtilization: number; // Queue utilization percentage

  // Assignment Metrics
  @Prop({ required: true })
  automaticAssignments: number;

  @Prop({ required: true })
  manualAssignments: number;

  @Prop({ required: true })
  reassignments: number;

  @Prop({ required: true })
  averageAssignmentTime: number; // Time to assign in minutes

  // Agent Performance Metrics
  @Prop({ required: true })
  totalAgents: number;

  @Prop({ required: true })
  activeAgents: number;

  @Prop({ required: true })
  averageAgentWorkload: number;

  @Prop({ required: true })
  workloadBalanceScore: number; // Workload balance score (0-100)

  // Bottleneck Metrics
  @Prop()
  bottleneckDetected: boolean;

  @Prop()
  bottleneckType?: 'queue_full' | 'agent_capacity' | 'processing_slow' | 'assignment_delay';

  @Prop()
  bottleneckSeverity?: 'low' | 'medium' | 'high' | 'critical';

  @Prop()
  bottleneckDescription?: string;

  // Efficiency Metrics
  @Prop({ required: true })
  conversionRate: number; // Lead conversion rate

  @Prop({ required: true })
  responseRate: number; // Response rate percentage

  @Prop({ required: true })
  satisfactionScore: number; // Customer satisfaction score

  // Priority Distribution
  @Prop({ required: true })
  urgentLeads: number;

  @Prop({ required: true })
  highPriorityLeads: number;

  @Prop({ required: true })
  normalPriorityLeads: number;

  @Prop({ required: true })
  lowPriorityLeads: number;

  // Performance Trends
  @Prop()
  trendDirection?: 'improving' | 'stable' | 'declining';

  @Prop()
  trendPercentage?: number; // Percentage change from previous period

  @Prop()
  recommendations?: string[]; // Optimization recommendations

  @Prop()
  metadata?: Record<string, any>; // Additional metadata

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export interface QueueConfiguration {
  @Prop({ required: true })
  configId: string; // UUID

  @Prop({ required: true })
  tenantId: string; // Multi-tenant support

  // Queue Settings
  @Prop({ required: true, default: 1000 })
  maxQueueSize: number; // Maximum queue size

  @Prop({ required: true, default: 30 })
  maxWaitTime: number; // Maximum wait time in minutes

  @Prop({ required: true, default: 5 })
  assignmentTimeout: number; // Assignment timeout in minutes

  @Prop({ required: true, default: 24 })
  queueEntryExpiration: number; // Queue entry expiration in hours

  // Assignment Settings
  @Prop({ required: true, default: 10 })
  maxLeadsPerAgent: number; // Maximum leads per agent

  @Prop({ required: true, default: 80 })
  maxWorkloadPercentage: number; // Maximum workload percentage

  @Prop({ required: true, default: true })
  enableSkillMatching: boolean; // Enable skill-based assignment

  @Prop({ required: true, default: true })
  enableWorkloadBalancing: boolean; // Enable workload balancing

  @Prop({ required: true, default: 60 })
  skillMatchThreshold: number; // Minimum skill match score

  // Priority Settings
  @Prop({ required: true, default: 1 })
  urgentPriorityWeight: number;

  @Prop({ required: true, default: 2 })
  highPriorityWeight: number;

  @Prop({ required: true, default: 3 })
  normalPriorityWeight: number;

  @Prop({ required: true, default: 4 })
  lowPriorityWeight: number;

  // Auto-Scaling Settings
  @Prop({ required: true, default: false })
  enableAutoScaling: boolean;

  @Prop({ required: true, default: 80 })
  scalingThreshold: number; // Workload threshold for scaling

  @Prop({ required: true, default: 20 })
  scalingCooldown: number; // Scaling cooldown in minutes

  // Alert Settings
  @Prop({ required: true, default: true })
  enableAlerts: boolean;

  @Prop({ required: true, default: 90 })
  alertThreshold: number; // Alert threshold percentage

  @Prop({ required: true, default: 5 })
  alertCooldown: number; // Alert cooldown in minutes

  // Performance Settings
  @Prop({ required: true, default: 1000 })
  batchSize: number; // Batch processing size

  @Prop({ required: true, default: 60 })
  processingInterval: number; // Processing interval in seconds

  @Prop({ required: true, default: true })
  enableCaching: boolean; // Enable Redis caching

  @Prop({ required: true, default: 300 })
  cacheExpiration: number; // Cache expiration in seconds

  // Custom Rules
  @Prop()
  customRules?: {
    ruleId: string;
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
    priority: number;
  }[];

  @Prop()
  metadata?: Record<string, any>; // Additional metadata

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

// Create schemas
export const QueueEntrySchema = SchemaFactory.createForClass(QueueEntry as any);
export const AssignmentHistorySchema = SchemaFactory.createForClass(AssignmentHistory as any);
export const QueueAnalyticsSchema = SchemaFactory.createForClass(QueueAnalytics as any);
export const QueueConfigurationSchema = SchemaFactory.createForClass(QueueConfiguration as any);

// Add indexes for performance
QueueEntrySchema.index({ tenantId: 1, status: 1, priority: 1, createdAt: 1 });
QueueEntrySchema.index({ tenantId: 1, leadId: 1 });
QueueEntrySchema.index({ tenantId: 1, assignedTo: 1, status: 1 });
QueueEntrySchema.index({ tenantId: 1, queuePosition: 1 });

AssignmentHistorySchema.index({ tenantId: 1, leadId: 1, createdAt: -1 });
AssignmentHistorySchema.index({ tenantId: 1, assignedTo: 1, createdAt: -1 });
AssignmentHistorySchema.index({ tenantId: 1, assignmentType: 1, createdAt: -1 });

QueueAnalyticsSchema.index({ tenantId: 1, date: 1, period: 1 });
QueueAnalyticsSchema.index({ tenantId: 1, bottleneckDetected: 1, date: -1 });

QueueConfigurationSchema.index({ tenantId: 1 }); 