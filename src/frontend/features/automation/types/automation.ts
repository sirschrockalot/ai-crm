// Automation Types
// Comprehensive type definitions for automation components and workflows

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'integration';
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    isValid: boolean;
    error?: string;
  };
  sourcePosition?: 'top' | 'bottom' | 'left' | 'right';
  targetPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'step' | 'smoothstep';
  animated?: boolean;
  style?: React.CSSProperties;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: Trigger[];
  actions: Action[];
  conditions: Condition[];
  delays: Delay[];
  integrations: Integration[];
  metadata: {
    version: string;
    author: string;
    tags: string[];
    category: string;
  };
}

export interface Trigger {
  id: string;
  type: 'email' | 'sms' | 'lead_status_change' | 'form_submission' | 'api_webhook' | 'schedule';
  name: string;
  description: string;
  config: Record<string, any>;
  isEnabled: boolean;
  conditions?: TriggerCondition[];
}

export interface Action {
  id: string;
  type: 'send_email' | 'send_sms' | 'update_lead' | 'create_task' | 'api_call' | 'webhook';
  name: string;
  description: string;
  config: Record<string, any>;
  isEnabled: boolean;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface Condition {
  id: string;
  type: 'if_then' | 'filter' | 'switch' | 'loop';
  name: string;
  description: string;
  config: Record<string, any>;
  isEnabled: boolean;
  logic: {
    operator: 'and' | 'or' | 'not';
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
      value: any;
    }>;
  };
}

export interface Delay {
  id: string;
  type: 'timer' | 'schedule' | 'wait_for_event';
  name: string;
  description: string;
  config: Record<string, any>;
  isEnabled: boolean;
  duration?: number; // milliseconds
  schedule?: {
    cron: string;
    timezone: string;
  };
}

export interface Integration {
  id: string;
  type: 'api' | 'webhook' | 'database' | 'external_service';
  name: string;
  description: string;
  config: Record<string, any>;
  isEnabled: boolean;
  authentication?: {
    type: 'api_key' | 'oauth' | 'basic';
    credentials: Record<string, any>;
  };
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'regex';
  value: any;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  results: Record<string, any>;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  data?: Record<string, any>;
}

export interface AutomationStats {
  totalWorkflows: number;
  activeWorkflows: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
  successRate: number;
  averageExecutionTime: number;
  topTriggers: Array<{
    type: string;
    count: number;
  }>;
  topActions: Array<{
    type: string;
    count: number;
  }>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  config: Record<string, any>;
  isPublic: boolean;
  author: string;
  createdAt: Date;
  usageCount: number;
}

export interface AutomationFilters {
  status?: 'active' | 'inactive' | 'all';
  category?: string;
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  search?: string;
}

export interface WorkflowBuilderState {
  selectedNode?: string;
  isDragging: boolean;
  zoom: number;
  pan: { x: number; y: number };
  selectedTemplate?: WorkflowTemplate;
  workflowConfig: Partial<Workflow>;
  isValid: boolean;
  errors: string[];
}

export interface AutomationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AutomationApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Component Props Types
export interface WorkflowBuilderProps {
  workflow?: Workflow;
  templates?: WorkflowTemplate[];
  onSave: (workflow: Workflow) => void;
  onTest: (workflow: Workflow) => void;
  onExport?: (workflow: Workflow) => void;
  onImport?: (workflow: Workflow) => void;
  className?: string;
}

export interface WorkflowCanvasProps {
  workflow: Workflow;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodeAdd: (node: WorkflowNode) => void;
  onNodeEdit: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onEdgeAdd: (edge: WorkflowEdge) => void;
  onEdgeDelete: (edgeId: string) => void;
  onCanvasChange?: (zoom: number, pan: { x: number; y: number }) => void;
  className?: string;
}

export interface WorkflowComponentsProps {
  components: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }>;
  onComponentSelect: (component: any) => void;
  onComponentAdd: (component: any) => void;
  className?: string;
}

export interface TriggerConfiguratorProps {
  trigger: Trigger;
  availableTriggers: Array<{
    type: string;
    name: string;
    description: string;
    configSchema: Record<string, any>;
  }>;
  onTriggerChange: (trigger: Trigger) => void;
  className?: string;
}

export interface ActionConfiguratorProps {
  action: Action;
  availableActions: Array<{
    type: string;
    name: string;
    description: string;
    configSchema: Record<string, any>;
  }>;
  onActionChange: (action: Action) => void;
  className?: string;
}

export interface AutomationStatsProps {
  stats: AutomationStats;
  timeRange: 'today' | 'week' | 'month' | 'year';
  filters?: AutomationFilters;
  onFilterChange: (filters: AutomationFilters) => void;
  className?: string;
}

export interface WorkflowListProps {
  workflows: Workflow[];
  filters?: AutomationFilters;
  onWorkflowSelect: (workflow: Workflow) => void;
  onWorkflowDelete: (workflowId: string) => void;
  onWorkflowDuplicate: (workflowId: string) => void;
  onWorkflowExport: (workflow: Workflow) => void;
  className?: string;
}

export interface WorkflowNodeProps {
  node: WorkflowNode;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onConnect: (nodeId: string, targetId: string) => void;
  isSelected: boolean;
  className?: string;
}
