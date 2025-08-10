import { 
  Workflow, 
  WorkflowExecution, 
  AutomationStats, 
  WorkflowTemplate,
  AutomationFilters 
} from '../types/automation';

// Mock data for development
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Lead Follow-up Automation',
    description: 'Automatically follows up with new leads',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    nodes: [],
    edges: [],
    triggers: [],
    actions: [],
    conditions: [],
    delays: [],
    integrations: [],
    metadata: {
      version: '1.0.0',
      author: 'Admin User',
      tags: ['lead-management', 'follow-up'],
      category: 'lead-automation'
    }
  },
  {
    id: '2',
    name: 'Email Campaign Automation',
    description: 'Sends targeted email campaigns based on lead behavior',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    nodes: [],
    edges: [],
    triggers: [],
    actions: [],
    conditions: [],
    delays: [],
    integrations: [],
    metadata: {
      version: '1.0.0',
      author: 'Admin User',
      tags: ['email', 'campaign', 'behavior'],
      category: 'email-automation'
    }
  },
  {
    id: '3',
    name: 'Task Assignment Automation',
    description: 'Automatically assigns tasks to team members',
    isActive: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    nodes: [],
    edges: [],
    triggers: [],
    actions: [],
    conditions: [],
    delays: [],
    integrations: [],
    metadata: {
      version: '1.0.0',
      author: 'Admin User',
      tags: ['task-management', 'assignment'],
      category: 'task-automation'
    }
  }
];

const mockStats: AutomationStats = {
  totalWorkflows: 3,
  activeWorkflows: 2,
  executionsToday: 45,
  executionsThisWeek: 234,
  executionsThisMonth: 892,
  successRate: 94.2,
  averageExecutionTime: 2500, // 2.5 seconds
  topTriggers: [
    { type: 'lead_status_change', count: 18 },
    { type: 'form_submission', count: 12 },
    { type: 'email_opened', count: 8 },
    { type: 'schedule', count: 5 },
    { type: 'api_webhook', count: 2 }
  ],
  topActions: [
    { type: 'send_email', count: 25 },
    { type: 'update_lead', count: 12 },
    { type: 'create_task', count: 5 },
    { type: 'api_call', count: 3 }
  ]
};

const mockTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: 'Lead Nurturing Template',
    description: 'A comprehensive lead nurturing workflow',
    category: 'lead-management',
    tags: ['lead-nurturing', 'email-sequence'],
    nodes: [],
    edges: [],
    config: {},
    isPublic: true,
    author: 'System',
    createdAt: new Date('2024-01-01'),
    usageCount: 15
  },
  {
    id: 'template-2',
    name: 'Customer Onboarding Template',
    description: 'Automated customer onboarding process',
    category: 'customer-success',
    tags: ['onboarding', 'welcome'],
    nodes: [],
    edges: [],
    config: {},
    isPublic: true,
    author: 'System',
    createdAt: new Date('2024-01-01'),
    usageCount: 8
  }
];

export class MockAutomationService {
  // Simulate API delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get workflows with optional filtering
  async getWorkflows(filters?: AutomationFilters): Promise<Workflow[]> {
    await this.delay();
    
    if (!filters) {
      return mockWorkflows;
    }

    let filtered = [...mockWorkflows];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(w => 
        filters.status === 'active' ? w.isActive : !w.isActive
      );
    }

    if (filters.category) {
      filtered = filtered.filter(w => 
        w.metadata.category === filters.category
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchLower) ||
        w.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<Workflow | null> {
    await this.delay();
    return mockWorkflows.find(w => w.id === id) || null;
  }

  // Create new workflow
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    await this.delay();
    
    const newWorkflow: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockWorkflows.push(newWorkflow);
    return newWorkflow;
  }

  // Update workflow
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    await this.delay();
    
    const index = mockWorkflows.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }

    mockWorkflows[index] = {
      ...mockWorkflows[index],
      ...updates,
      updatedAt: new Date()
    };

    return mockWorkflows[index];
  }

  // Delete workflow
  async deleteWorkflow(id: string): Promise<void> {
    await this.delay();
    
    const index = mockWorkflows.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }

    mockWorkflows.splice(index, 1);
  }

  // Get automation statistics
  async getAutomationStats(timeRange: 'today' | 'week' | 'month' | 'year' = 'week'): Promise<AutomationStats> {
    await this.delay();
    
    // Adjust stats based on time range
    const stats = { ...mockStats };
    
    switch (timeRange) {
      case 'today':
        stats.executionsToday = Math.floor(Math.random() * 100) + 20;
        break;
      case 'week':
        stats.executionsThisWeek = Math.floor(Math.random() * 500) + 100;
        break;
      case 'month':
        stats.executionsThisMonth = Math.floor(Math.random() * 2000) + 500;
        break;
      case 'year':
        stats.executionsThisMonth = Math.floor(Math.random() * 10000) + 2000;
        break;
    }

    return stats;
  }

  // Get workflow templates
  async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    await this.delay();
    
    if (category) {
      return mockTemplates.filter(t => t.category === category);
    }
    
    return mockTemplates;
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, input?: Record<string, any>): Promise<WorkflowExecution> {
    await this.delay(1000); // Simulate execution time
    
    const workflow = mockWorkflows.find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      results: {
        success: true,
        message: 'Workflow executed successfully',
        output: input || {}
      },
      logs: [
        {
          id: '1',
          timestamp: new Date(),
          level: 'info',
          message: 'Workflow started',
          nodeId: 'start'
        },
        {
          id: '2',
          timestamp: new Date(),
          level: 'info',
          message: 'Workflow completed successfully',
          nodeId: 'end'
        }
      ]
    };

    return execution;
  }

  // Get execution history
  async getExecutionHistory(workflowId?: string): Promise<WorkflowExecution[]> {
    await this.delay();
    
    // Generate some mock execution history
    const executions: WorkflowExecution[] = [];
    
    for (let i = 0; i < 10; i++) {
      const workflow = mockWorkflows[Math.floor(Math.random() * mockWorkflows.length)];
      executions.push({
        id: `exec-${i}`,
        workflowId: workflow.id,
        status: Math.random() > 0.1 ? 'completed' : 'failed',
        startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        completedAt: new Date(),
        results: {
          success: Math.random() > 0.1,
          message: Math.random() > 0.1 ? 'Execution successful' : 'Execution failed',
          output: {}
        },
        logs: []
      });
    }

    if (workflowId) {
      return executions.filter(e => e.workflowId === workflowId);
    }

    return executions;
  }
}

export const mockAutomationService = new MockAutomationService();
