// Automation Service
// API integration for workflow management and execution

import { 
  Workflow, 
  WorkflowExecution, 
  AutomationStats, 
  WorkflowTemplate,
  AutomationFilters,
  AutomationApiResponse,
  AutomationApiError 
} from '../types/automation';

class AutomationService {
  private baseUrl = '/api/automation';
  private wsConnection: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // WebSocket connection management
  private connectWebSocket() {
    try {
      this.wsConnection = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/automation`);
      
      this.wsConnection.onopen = () => {
        console.log('Automation WebSocket connected');
        this.wsReconnectAttempts = 0;
      };

      this.wsConnection.onclose = () => {
        console.log('Automation WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.wsConnection.onerror = (error) => {
        console.error('Automation WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
      this.wsReconnectAttempts++;
      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectDelay * this.wsReconnectAttempts);
    }
  }

  public subscribeToWorkflowExecution(workflowId: string, callback: (execution: WorkflowExecution) => void) {
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      this.connectWebSocket();
    }

    if (this.wsConnection) {
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        workflowId
      }));

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'workflow_execution_update' && data.workflowId === workflowId) {
            callback(data.execution);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    }
  }

  public unsubscribeFromWorkflowExecution(workflowId: string) {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'unsubscribe',
        workflowId
      }));
    }
  }

  // HTTP API methods
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<AutomationApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Workflow Management
  public async getWorkflows(filters?: AutomationFilters): Promise<Workflow[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const response = await this.makeRequest<Workflow[]>(`/workflows?${queryParams.toString()}`);
    return response.data || [];
  }

  public async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.makeRequest<Workflow>(`/workflows/${id}`);
    return response.data!;
  }

  public async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const response = await this.makeRequest<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
    return response.data!;
  }

  public async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const response = await this.makeRequest<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  public async deleteWorkflow(id: string): Promise<void> {
    await this.makeRequest(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  public async duplicateWorkflow(id: string): Promise<Workflow> {
    const response = await this.makeRequest<Workflow>(`/workflows/${id}/duplicate`, {
      method: 'POST',
    });
    return response.data!;
  }

  // Workflow Execution
  public async executeWorkflow(id: string, parameters?: Record<string, any>): Promise<WorkflowExecution> {
    const response = await this.makeRequest<WorkflowExecution>(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ parameters }),
    });
    return response.data!;
  }

  public async getWorkflowExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await this.makeRequest<WorkflowExecution>(`/executions/${executionId}`);
    return response.data!;
  }

  public async getWorkflowExecutions(workflowId: string, limit = 50): Promise<WorkflowExecution[]> {
    const response = await this.makeRequest<WorkflowExecution[]>(`/workflows/${workflowId}/executions?limit=${limit}`);
    return response.data || [];
  }

  public async cancelWorkflowExecution(executionId: string): Promise<void> {
    await this.makeRequest(`/executions/${executionId}/cancel`, {
      method: 'POST',
    });
  }

  // Workflow Templates
  public async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    const queryParams = category ? `?category=${category}` : '';
    const response = await this.makeRequest<WorkflowTemplate[]>(`/templates${queryParams}`);
    return response.data || [];
  }

  public async getWorkflowTemplate(id: string): Promise<WorkflowTemplate> {
    const response = await this.makeRequest<WorkflowTemplate>(`/templates/${id}`);
    return response.data!;
  }

  public async createWorkflowFromTemplate(templateId: string, name: string): Promise<Workflow> {
    const response = await this.makeRequest<Workflow>(`/templates/${templateId}/create`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response.data!;
  }

  // Available Components
  public async getAvailableTriggers(): Promise<Array<{
    type: string;
    name: string;
    description: string;
    configSchema: Record<string, any>;
    icon: string;
    category: string;
  }>> {
    const response = await this.makeRequest<Array<{
      type: string;
      name: string;
      description: string;
      configSchema: Record<string, any>;
      icon: string;
      category: string;
    }>>('/triggers');
    return response.data || [];
  }

  public async getAvailableActions(): Promise<Array<{
    type: string;
    name: string;
    description: string;
    configSchema: Record<string, any>;
    icon: string;
    category: string;
  }>> {
    const response = await this.makeRequest<Array<{
      type: string;
      name: string;
      description: string;
      configSchema: Record<string, any>;
      icon: string;
      category: string;
    }>>('/actions');
    return response.data || [];
  }

  // Analytics and Stats
  public async getAutomationStats(timeRange: 'today' | 'week' | 'month' | 'year' = 'week'): Promise<AutomationStats> {
    const response = await this.makeRequest<AutomationStats>(`/stats?timeRange=${timeRange}`);
    return response.data!;
  }

  public async getWorkflowPerformance(workflowId: string, timeRange: 'today' | 'week' | 'month' | 'year' = 'week'): Promise<{
    executions: number;
    successRate: number;
    averageExecutionTime: number;
    errors: Array<{ message: string; count: number }>;
  }> {
    const response = await this.makeRequest<{
      executions: number;
      successRate: number;
      averageExecutionTime: number;
      errors: Array<{ message: string; count: number }>;
    }>(`/workflows/${workflowId}/performance?timeRange=${timeRange}`);
    return response.data!;
  }

  // Import/Export
  public async exportWorkflow(id: string): Promise<string> {
    const response = await this.makeRequest<{ exportData: string }>(`/workflows/${id}/export`);
    return response.data!.exportData;
  }

  public async importWorkflow(exportData: string): Promise<Workflow> {
    const response = await this.makeRequest<Workflow>('/workflows/import', {
      method: 'POST',
      body: JSON.stringify({ exportData }),
    });
    return response.data!;
  }

  // Validation
  public async validateWorkflow(workflow: Workflow): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.makeRequest<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>('/workflows/validate', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
    return response.data!;
  }

  // Test Workflow
  public async testWorkflow(workflow: Workflow, testData?: Record<string, any>): Promise<{
    success: boolean;
    results: Record<string, any>;
    logs: Array<{ level: string; message: string; timestamp: string }>;
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      results: Record<string, any>;
      logs: Array<{ level: string; message: string; timestamp: string }>;
    }>('/workflows/test', {
      method: 'POST',
      body: JSON.stringify({ workflow, testData }),
    });
    return response.data!;
  }

  // Cleanup
  public disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

// Export singleton instance
export const automationService = new AutomationService();
export default automationService;
