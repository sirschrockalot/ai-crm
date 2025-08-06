import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { Workflow, WorkflowTriggerType, WorkflowPriority } from '../types';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
}

export interface WorkflowFilters {
  triggerType?: WorkflowTriggerType;
  priority?: WorkflowPriority;
  isActive?: boolean;
  searchTerm?: string;
}

export interface WorkflowAction {
  type: 'email' | 'sms' | 'notification' | 'status_change' | 'assignment';
  config: Record<string, any>;
}

export function useAutomation() {
  const workflowsApi = useApi<Workflow[]>();
  const singleWorkflowApi = useApi<Workflow>();
  const executionsApi = useApi<WorkflowExecution[]>();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  const fetchWorkflows = useCallback(async (filters?: WorkflowFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await workflowsApi.execute({
      method: 'GET',
      url: `/api/automation/workflows${params.toString() ? `?${params.toString()}` : ''}`,
    });

    setWorkflows(response);
    return response;
  }, [workflowsApi]);

  const fetchWorkflow = useCallback(async (id: string) => {
    const response = await singleWorkflowApi.execute({
      method: 'GET',
      url: `/api/automation/workflows/${id}`,
    });

    setCurrentWorkflow(response);
    return response;
  }, [singleWorkflowApi]);

  const createWorkflow = useCallback(async (data: Partial<Workflow>) => {
    const response = await singleWorkflowApi.execute({
      method: 'POST',
      url: '/api/automation/workflows',
      data,
    });

    setWorkflows(prev => [...prev, response]);
    return response;
  }, [singleWorkflowApi]);

  const updateWorkflow = useCallback(async (id: string, data: Partial<Workflow>) => {
    const response = await singleWorkflowApi.execute({
      method: 'PUT',
      url: `/api/automation/workflows/${id}`,
      data,
    });

    setWorkflows(prev => prev.map(workflow => workflow.id === id ? response : workflow));
    if (currentWorkflow?.id === id) {
      setCurrentWorkflow(response);
    }
    return response;
  }, [singleWorkflowApi, currentWorkflow]);

  const deleteWorkflow = useCallback(async (id: string) => {
    await singleWorkflowApi.execute({
      method: 'DELETE',
      url: `/api/automation/workflows/${id}`,
    });

    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
    if (currentWorkflow?.id === id) {
      setCurrentWorkflow(null);
    }
  }, [singleWorkflowApi, currentWorkflow]);

  const toggleWorkflow = useCallback(async (id: string, isActive: boolean) => {
    return updateWorkflow(id, { isActive });
  }, [updateWorkflow]);

  const executeWorkflow = useCallback(async (id: string, data?: any) => {
    const response = await singleWorkflowApi.execute({
      method: 'POST',
      url: `/api/automation/workflows/${id}/execute`,
      data,
    });

    return response;
  }, [singleWorkflowApi]);

  const fetchExecutions = useCallback(async (workflowId?: string) => {
    const params = new URLSearchParams();
    if (workflowId) {
      params.append('workflowId', workflowId);
    }

    const response = await executionsApi.execute({
      method: 'GET',
      url: `/api/automation/executions${params.toString() ? `?${params.toString()}` : ''}`,
    });

    setExecutions(response);
    return response;
  }, [executionsApi]);

  const cancelExecution = useCallback(async (executionId: string) => {
    const response = await executionsApi.execute({
      method: 'POST',
      url: `/api/automation/executions/${executionId}/cancel`,
    });

    return response;
  }, [executionsApi]);

  const retryExecution = useCallback(async (executionId: string) => {
    const response = await executionsApi.execute({
      method: 'POST',
      url: `/api/automation/executions/${executionId}/retry`,
    });

    return response;
  }, [executionsApi]);

  const getExecutionLogs = useCallback(async (executionId: string) => {
    const response = await executionsApi.execute({
      method: 'GET',
      url: `/api/automation/executions/${executionId}/logs`,
    });

    return response;
  }, [executionsApi]);

  const validateWorkflow = useCallback(async (workflow: Partial<Workflow>) => {
    const response = await singleWorkflowApi.execute({
      method: 'POST',
      url: '/api/automation/workflows/validate',
      data: workflow,
    });

    return response;
  }, [singleWorkflowApi]);

  const duplicateWorkflow = useCallback(async (id: string, newName: string) => {
    const response = await singleWorkflowApi.execute({
      method: 'POST',
      url: `/api/automation/workflows/${id}/duplicate`,
      data: { name: newName },
    });

    setWorkflows(prev => [...prev, response]);
    return response;
  }, [singleWorkflowApi]);

  return {
    workflows,
    currentWorkflow,
    executions,
    loading: workflowsApi.loading || singleWorkflowApi.loading || executionsApi.loading,
    error: workflowsApi.error || singleWorkflowApi.error || executionsApi.error,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    executeWorkflow,
    fetchExecutions,
    cancelExecution,
    retryExecution,
    getExecutionLogs,
    validateWorkflow,
    duplicateWorkflow,
    reset: () => {
      workflowsApi.reset();
      singleWorkflowApi.reset();
      executionsApi.reset();
    },
  };
} 