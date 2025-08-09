// useWorkflowExecution Hook
// State management for workflow execution and real-time monitoring

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WorkflowExecution, 
  ExecutionLog 
} from '../types/automation';
import { automationService } from '../services/automationService';

export const useWorkflowExecution = (workflowId?: string, executionId?: string) => {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(2000); // 2 seconds

  const pollingRef = useRef<NodeJS.Timeout>();
  const wsSubscriptionRef = useRef<(() => void) | null>(null);

  // Load execution
  const loadExecution = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await automationService.getWorkflowExecution(id);
      setExecution(data);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load execution');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load executions for workflow
  const loadExecutions = useCallback(async (id: string, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await automationService.getWorkflowExecutions(id, limit);
      setExecutions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback(async (parameters?: Record<string, any>) => {
    if (!workflowId) return;
    
    setLoading(true);
    setError(null);
    try {
      const newExecution = await automationService.executeWorkflow(workflowId, parameters);
      setExecution(newExecution);
      setExecutions(prev => [newExecution, ...prev]);
      setLogs(newExecution.logs || []);
      return newExecution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  // Cancel execution
  const cancelExecution = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await automationService.cancelWorkflowExecution(id);
      // Update local state
      setExecution(prev => prev && prev.id === id ? { ...prev, status: 'cancelled' } : prev);
      setExecutions(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel execution');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling for execution updates
  const startPolling = useCallback((execId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsPolling(true);
    pollingRef.current = setInterval(async () => {
      try {
        const updatedExecution = await automationService.getWorkflowExecution(execId);
        setExecution(updatedExecution);
        setLogs(updatedExecution.logs || []);
        
        // Update in executions list
        setExecutions(prev => prev.map(e => e.id === execId ? updatedExecution : e));
        
        // Stop polling if execution is complete
        if (['completed', 'failed', 'cancelled'].includes(updatedExecution.status)) {
          stopPolling();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, pollingInterval);
  }, [pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = undefined;
    }
    setIsPolling(false);
  }, []);

  // Subscribe to WebSocket updates
  const subscribeToExecution = useCallback((execId: string) => {
    if (wsSubscriptionRef.current) {
      wsSubscriptionRef.current();
    }

    const handleExecutionUpdate = (updatedExecution: WorkflowExecution) => {
      if (updatedExecution.id === execId) {
        setExecution(updatedExecution);
        setLogs(updatedExecution.logs || []);
        
        // Update in executions list
        setExecutions(prev => prev.map(e => e.id === execId ? updatedExecution : e));
        
        // Stop polling if execution is complete
        if (['completed', 'failed', 'cancelled'].includes(updatedExecution.status)) {
          stopPolling();
        }
      }
    };

    automationService.subscribeToWorkflowExecution(workflowId!, handleExecutionUpdate);
    
    wsSubscriptionRef.current = () => {
      automationService.unsubscribeFromWorkflowExecution(workflowId!);
    };
  }, [workflowId, stopPolling]);

  // Set polling interval
  const setPollingIntervalMs = useCallback((interval: number) => {
    setPollingInterval(interval);
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Filter logs by level
  const filterLogs = useCallback((level?: 'info' | 'warning' | 'error' | 'debug') => {
    if (!level) return logs;
    return logs.filter(log => log.level === level);
  }, [logs]);

  // Get execution statistics
  const getExecutionStats = useCallback(() => {
    if (!executions.length) return null;

    const total = executions.length;
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const cancelled = executions.filter(e => e.status === 'cancelled').length;
    const running = executions.filter(e => e.status === 'running').length;
    const pending = executions.filter(e => e.status === 'pending').length;

    const successRate = total > 0 ? (completed / total) * 100 : 0;
    const averageExecutionTime = executions
      .filter(e => e.completedAt && e.startedAt)
      .reduce((acc, e) => {
        const duration = new Date(e.completedAt!).getTime() - new Date(e.startedAt).getTime();
        return acc + duration;
      }, 0) / completed || 0;

    return {
      total,
      completed,
      failed,
      cancelled,
      running,
      pending,
      successRate,
      averageExecutionTime,
    };
  }, [executions]);

  // Get recent errors
  const getRecentErrors = useCallback(() => {
    return executions
      .filter(e => e.status === 'failed' && e.error)
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        error: e.error!,
        timestamp: e.startedAt,
      }));
  }, [executions]);

  // Load execution on mount
  useEffect(() => {
    if (executionId) {
      loadExecution(executionId);
    }
  }, [executionId, loadExecution]);

  // Load executions on mount
  useEffect(() => {
    if (workflowId) {
      loadExecutions(workflowId);
    }
  }, [workflowId, loadExecutions]);

  // Start polling when execution is running
  useEffect(() => {
    if (execution && ['pending', 'running'].includes(execution.status)) {
      startPolling(execution.id);
      subscribeToExecution(execution.id);
    } else {
      stopPolling();
    }
  }, [execution, startPolling, stopPolling, subscribeToExecution]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (wsSubscriptionRef.current) {
        wsSubscriptionRef.current();
      }
    };
  }, [stopPolling]);

  return {
    // State
    execution,
    executions,
    logs,
    loading,
    error,
    isPolling,
    pollingInterval,
    
    // Actions
    loadExecution,
    loadExecutions,
    executeWorkflow,
    cancelExecution,
    startPolling,
    stopPolling,
    setPollingIntervalMs,
    clearLogs,
    filterLogs,
    getExecutionStats,
    getRecentErrors,
  };
};
