export interface Lead {
  id: string;
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  priority: string;
  value: number;
  stageId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  notes?: string;
  tags?: string[];
  source: string;
  score?: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStats {
  totalLeads: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  stageDistribution: Record<string, number>;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  settings?: {
    allowStageReordering?: boolean;
    allowLeadDuplication?: boolean;
    enableAutomation?: boolean;
    notificationSettings?: {
      stageTransitions?: boolean;
      leadAssignments?: boolean;
      overdueLeads?: boolean;
    };
  };
}

export interface PipelineAnalytics {
  stageId: string;
  stageName: string;
  leadCount: number;
  conversionRate: number;
  averageVelocity: number;
  totalValue: number;
  averageScore: number;
  bottleneckScore: number;
}

export interface PipelineTrigger {
  id: string;
  name: string;
  type: 'stage_transition' | 'time_based' | 'property_change';
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: any;
}

export interface TriggerAction {
  type: 'assign_lead' | 'send_notification' | 'update_field' | 'create_task' | 'send_email';
  parameters: Record<string, any>;
}

export interface PipelineSettings {
  allowStageReordering: boolean;
  allowLeadDuplication: boolean;
  enableAutomation: boolean;
  defaultStages: PipelineStage[];
  notificationSettings: {
    stageTransitions: boolean;
    leadAssignments: boolean;
    overdueLeads: boolean;
  };
  automationSettings: {
    autoAssignLeads: boolean;
    autoScoreLeads: boolean;
    autoFollowUp: boolean;
  };
}

export interface LeadMoveRequest {
  leadId: string;
  fromStageId: string;
  toStageId: string;
  reason?: string;
  userId: string;
  tenantId: string;
}

export interface LeadMoveResponse {
  success: boolean;
  lead: Lead;
  message?: string;
  errors?: string[];
}

export interface PipelineStageUpdateRequest {
  stageId: string;
  name?: string;
  description?: string;
  type?: string;
  order?: number;
  color?: string;
  isActive?: boolean;
  settings?: Record<string, any>;
}

export interface PipelineAnalyticsRequest {
  pipelineId: string;
  dateRange: {
    start: string;
    end: string;
  };
  groupBy?: 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface PipelineAnalyticsResponse {
  stages: PipelineAnalytics[];
  summary: {
    totalLeads: number;
    totalValue: number;
    averageConversionRate: number;
    averageVelocity: number;
    totalScore: number;
  };
  trends: {
    date: string;
    leads: number;
    value: number;
    conversions: number;
  }[];
} 