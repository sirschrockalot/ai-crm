import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, IsDate, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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

export class QueueEntryDto {
  @ApiProperty({ description: 'Queue entry ID' })
  @IsString()
  queueId: string;

  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Queue priority', enum: QueuePriority })
  @IsEnum(QueuePriority)
  priority: QueuePriority;

  @ApiProperty({ description: 'Queue status', enum: QueueStatus })
  @IsEnum(QueueStatus)
  status: QueueStatus;

  @ApiProperty({ description: 'Assigned agent ID', required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Lead score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: 'Queue position' })
  @IsNumber()
  queuePosition: number;

  @ApiProperty({ description: 'Wait time in minutes' })
  @IsNumber()
  waitTime: number;

  @ApiProperty({ description: 'Estimated processing time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  estimatedProcessingTime?: number;

  @ApiProperty({ description: 'Actual processing time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  actualProcessingTime?: number;

  @ApiProperty({ description: 'Assignment reason', required: false })
  @IsOptional()
  @IsString()
  assignmentReason?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: 'Assigned timestamp', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  assignedAt?: Date;

  @ApiProperty({ description: 'Completed timestamp', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;
}

export class AssignmentHistoryDto {
  @ApiProperty({ description: 'Assignment history ID' })
  @IsString()
  historyId: string;

  @ApiProperty({ description: 'Lead ID' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Queue ID' })
  @IsString()
  queueId: string;

  @ApiProperty({ description: 'Assigned agent ID' })
  @IsString()
  assignedTo: string;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType })
  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;

  @ApiProperty({ description: 'Previous agent ID', required: false })
  @IsOptional()
  @IsString()
  previousAgent?: string;

  @ApiProperty({ description: 'Assignment reason', required: false })
  @IsOptional()
  @IsString()
  assignmentReason?: string;

  @ApiProperty({ description: 'Assignment notes', required: false })
  @IsOptional()
  @IsString()
  assignmentNotes?: string;

  @ApiProperty({ description: 'Workload at assignment time', required: false })
  @IsOptional()
  @IsNumber()
  workloadAtAssignment?: number;

  @ApiProperty({ description: 'Capacity at assignment time', required: false })
  @IsOptional()
  @IsNumber()
  capacityAtAssignment?: number;

  @ApiProperty({ description: 'Skill match score', minimum: 0, maximum: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  skillMatchScore?: number;

  @ApiProperty({ description: 'Response time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @ApiProperty({ description: 'Processing time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  processingTime?: number;

  @ApiProperty({ description: 'Assignment outcome', required: false })
  @IsOptional()
  @IsString()
  outcome?: 'converted' | 'lost' | 'pending' | 'cancelled';

  @ApiProperty({ description: 'Created timestamp' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}

export class QueueStatusDto {
  @ApiProperty({ description: 'Total leads in queue' })
  @IsNumber()
  totalLeads: number;

  @ApiProperty({ description: 'Pending leads count' })
  @IsNumber()
  pendingLeads: number;

  @ApiProperty({ description: 'Assigned leads count' })
  @IsNumber()
  assignedLeads: number;

  @ApiProperty({ description: 'Processing leads count' })
  @IsNumber()
  processingLeads: number;

  @ApiProperty({ description: 'Completed leads count' })
  @IsNumber()
  completedLeads: number;

  @ApiProperty({ description: 'Average wait time in minutes' })
  @IsNumber()
  averageWaitTime: number;

  @ApiProperty({ description: 'Average processing time in minutes' })
  @IsNumber()
  averageProcessingTime: number;

  @ApiProperty({ description: 'Queue utilization percentage' })
  @IsNumber()
  queueUtilization: number;

  @ApiProperty({ description: 'Active agents count' })
  @IsNumber()
  activeAgents: number;

  @ApiProperty({ description: 'Queue health status' })
  @IsString()
  healthStatus: 'healthy' | 'warning' | 'critical';

  @ApiProperty({ description: 'Last updated timestamp' })
  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;
}

export class AssignmentRequestDto {
  @ApiProperty({ description: 'Lead ID to assign' })
  @IsString()
  leadId: string;

  @ApiProperty({ description: 'Agent ID to assign to', required: false })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiProperty({ description: 'Assignment type', enum: AssignmentType })
  @IsEnum(AssignmentType)
  assignmentType: AssignmentType;

  @ApiProperty({ description: 'Assignment reason', required: false })
  @IsOptional()
  @IsString()
  assignmentReason?: string;

  @ApiProperty({ description: 'Assignment notes', required: false })
  @IsOptional()
  @IsString()
  assignmentNotes?: string;

  @ApiProperty({ description: 'Priority override', enum: QueuePriority, required: false })
  @IsOptional()
  @IsEnum(QueuePriority)
  priority?: QueuePriority;
}

export class ManualAssignmentDto {
  @ApiProperty({ description: 'Lead IDs to assign', type: [String] })
  @IsArray()
  @IsString({ each: true })
  leadIds: string[];

  @ApiProperty({ description: 'Agent ID to assign to' })
  @IsString()
  agentId: string;

  @ApiProperty({ description: 'Assignment reason', required: false })
  @IsOptional()
  @IsString()
  assignmentReason?: string;

  @ApiProperty({ description: 'Assignment notes', required: false })
  @IsOptional()
  @IsString()
  assignmentNotes?: string;
}

export class QueueConfigurationDto {
  @ApiProperty({ description: 'Maximum queue size' })
  @IsNumber()
  @Min(1)
  maxQueueSize: number;

  @ApiProperty({ description: 'Maximum wait time in minutes' })
  @IsNumber()
  @Min(1)
  maxWaitTime: number;

  @ApiProperty({ description: 'Assignment timeout in minutes' })
  @IsNumber()
  @Min(1)
  assignmentTimeout: number;

  @ApiProperty({ description: 'Queue entry expiration in hours' })
  @IsNumber()
  @Min(1)
  queueEntryExpiration: number;

  @ApiProperty({ description: 'Maximum leads per agent' })
  @IsNumber()
  @Min(1)
  maxLeadsPerAgent: number;

  @ApiProperty({ description: 'Maximum workload percentage' })
  @IsNumber()
  @Min(1)
  @Max(100)
  maxWorkloadPercentage: number;

  @ApiProperty({ description: 'Enable skill matching' })
  @IsBoolean()
  enableSkillMatching: boolean;

  @ApiProperty({ description: 'Enable workload balancing' })
  @IsBoolean()
  enableWorkloadBalancing: boolean;

  @ApiProperty({ description: 'Skill match threshold', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  skillMatchThreshold: number;

  @ApiProperty({ description: 'Enable auto-scaling' })
  @IsBoolean()
  enableAutoScaling: boolean;

  @ApiProperty({ description: 'Scaling threshold percentage' })
  @IsNumber()
  @Min(1)
  @Max(100)
  scalingThreshold: number;

  @ApiProperty({ description: 'Enable alerts' })
  @IsBoolean()
  enableAlerts: boolean;

  @ApiProperty({ description: 'Alert threshold percentage' })
  @IsNumber()
  @Min(1)
  @Max(100)
  alertThreshold: number;
}

export class QueueAnalyticsDto {
  @ApiProperty({ description: 'Analytics period' })
  @IsString()
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ description: 'Total leads queued' })
  @IsNumber()
  totalLeadsQueued: number;

  @ApiProperty({ description: 'Total leads assigned' })
  @IsNumber()
  totalLeadsAssigned: number;

  @ApiProperty({ description: 'Total leads completed' })
  @IsNumber()
  totalLeadsCompleted: number;

  @ApiProperty({ description: 'Average wait time in minutes' })
  @IsNumber()
  averageWaitTime: number;

  @ApiProperty({ description: 'Average processing time in minutes' })
  @IsNumber()
  averageProcessingTime: number;

  @ApiProperty({ description: 'Queue throughput (leads per hour)' })
  @IsNumber()
  queueThroughput: number;

  @ApiProperty({ description: 'Queue utilization percentage' })
  @IsNumber()
  queueUtilization: number;

  @ApiProperty({ description: 'Automatic assignments count' })
  @IsNumber()
  automaticAssignments: number;

  @ApiProperty({ description: 'Manual assignments count' })
  @IsNumber()
  manualAssignments: number;

  @ApiProperty({ description: 'Reassignments count' })
  @IsNumber()
  reassignments: number;

  @ApiProperty({ description: 'Average assignment time in minutes' })
  @IsNumber()
  averageAssignmentTime: number;

  @ApiProperty({ description: 'Total agents count' })
  @IsNumber()
  totalAgents: number;

  @ApiProperty({ description: 'Active agents count' })
  @IsNumber()
  activeAgents: number;

  @ApiProperty({ description: 'Average agent workload' })
  @IsNumber()
  averageAgentWorkload: number;

  @ApiProperty({ description: 'Workload balance score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  workloadBalanceScore: number;

  @ApiProperty({ description: 'Bottleneck detected' })
  @IsBoolean()
  bottleneckDetected: boolean;

  @ApiProperty({ description: 'Bottleneck type', required: false })
  @IsOptional()
  @IsString()
  bottleneckType?: 'queue_full' | 'agent_capacity' | 'processing_slow' | 'assignment_delay';

  @ApiProperty({ description: 'Bottleneck severity', required: false })
  @IsOptional()
  @IsString()
  bottleneckSeverity?: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Conversion rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  conversionRate: number;

  @ApiProperty({ description: 'Response rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  responseRate: number;

  @ApiProperty({ description: 'Satisfaction score', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  satisfactionScore: number;

  @ApiProperty({ description: 'Priority distribution' })
  priorityDistribution: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };

  @ApiProperty({ description: 'Trend direction', required: false })
  @IsOptional()
  @IsString()
  trendDirection?: 'improving' | 'stable' | 'declining';

  @ApiProperty({ description: 'Trend percentage', required: false })
  @IsOptional()
  @IsNumber()
  trendPercentage?: number;

  @ApiProperty({ description: 'Optimization recommendations', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];

  @ApiProperty({ description: 'Analytics date' })
  @IsDate()
  @Type(() => Date)
  date: Date;
}

export class QueuePerformanceDto {
  @ApiProperty({ description: 'Average queue processing time in milliseconds' })
  @IsNumber()
  averageProcessingTimeMs: number;

  @ApiProperty({ description: 'Total queue operations' })
  @IsNumber()
  totalOperations: number;

  @ApiProperty({ description: 'Successful queue operations' })
  @IsNumber()
  successfulOperations: number;

  @ApiProperty({ description: 'Failed queue operations' })
  @IsNumber()
  failedOperations: number;

  @ApiProperty({ description: 'Success rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  successRate: number;

  @ApiProperty({ description: 'Average assignment time in milliseconds' })
  @IsNumber()
  averageAssignmentTimeMs: number;

  @ApiProperty({ description: 'Queue throughput (operations per minute)' })
  @IsNumber()
  throughput: number;

  @ApiProperty({ description: 'Queue latency in milliseconds' })
  @IsNumber()
  latency: number;

  @ApiProperty({ description: 'Last operation timestamp' })
  @IsDate()
  @Type(() => Date)
  lastOperationTime: Date;

  @ApiProperty({ description: 'Performance metrics by time period' })
  performanceByPeriod: {
    period: string;
    averageTimeMs: number;
    totalOperations: number;
    successRate: number;
    throughput: number;
  }[];
}

export class QueueOptimizationDto {
  @ApiProperty({ description: 'Optimization recommendations' })
  @IsArray()
  @IsString({ each: true })
  recommendations: string[];

  @ApiProperty({ description: 'Performance improvements' })
  @IsArray()
  @IsString({ each: true })
  improvements: string[];

  @ApiProperty({ description: 'Configuration suggestions' })
  @IsArray()
  @IsString({ each: true })
  configSuggestions: string[];

  @ApiProperty({ description: 'Estimated performance gains' })
  @IsNumber()
  estimatedGains: number;

  @ApiProperty({ description: 'Optimization priority' })
  @IsString()
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Implementation effort' })
  @IsString()
  effort: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Optimization timestamp' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

export class QueueReorderingDto {
  @ApiProperty({ description: 'Queue entry ID' })
  @IsString()
  queueId: string;

  @ApiProperty({ description: 'New priority', enum: QueuePriority, required: false })
  @IsOptional()
  @IsEnum(QueuePriority)
  newPriority?: QueuePriority;

  @ApiProperty({ description: 'New position in queue', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  newPosition?: number;

  @ApiProperty({ description: 'Reordering reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueueBulkOperationDto {
  @ApiProperty({ description: 'Queue entry IDs' })
  @IsArray()
  @IsString({ each: true })
  queueIds: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsString()
  operation: 'assign' | 'reassign' | 'cancel' | 'prioritize' | 'delete';

  @ApiProperty({ description: 'Target agent ID', required: false })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiProperty({ description: 'New priority', enum: QueuePriority, required: false })
  @IsOptional()
  @IsEnum(QueuePriority)
  priority?: QueuePriority;

  @ApiProperty({ description: 'Operation reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 