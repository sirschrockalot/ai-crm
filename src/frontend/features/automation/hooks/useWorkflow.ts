// useWorkflow Hook
// State management for individual workflow editing and validation

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowBuilderState,
  WorkflowExecution 
} from '../types/automation';
import { automationService } from '../services/automationService';

export const useWorkflow = (workflowId?: string) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [builderState, setBuilderState] = useState<WorkflowBuilderState>({
    selectedNode: undefined,
    isDragging: false,
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedTemplate: undefined,
    workflowConfig: {},
    isValid: true,
    errors: [],
  });
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Load workflow
  const loadWorkflow = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await automationService.getWorkflow(id);
      setWorkflow(data);
      setBuilderState(prev => ({
        ...prev,
        workflowConfig: data,
        isValid: true,
        errors: [],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load executions
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

  // Update workflow
  const updateWorkflow = useCallback(async (updates: Partial<Workflow>): Promise<Workflow | undefined> => {
    if (!workflow) return undefined;
    
    setLoading(true);
    setError(null);
    try {
      const updatedWorkflow = await automationService.updateWorkflow(workflow.id, updates);
      setWorkflow(updatedWorkflow);
      setBuilderState(prev => ({
        ...prev,
        workflowConfig: updatedWorkflow,
      }));
      return updatedWorkflow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow]);

  // Save workflow
  const saveWorkflow = useCallback(async (): Promise<Workflow | undefined> => {
    if (!workflow) return undefined;
    
    setLoading(true);
    setError(null);
    try {
      const updatedWorkflow = await automationService.updateWorkflow(workflow.id, workflow);
      setWorkflow(updatedWorkflow);
      return updatedWorkflow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow]);

  // Execute workflow
  const executeWorkflow = useCallback(async (parameters?: Record<string, any>): Promise<WorkflowExecution | undefined> => {
    if (!workflow) return undefined;
    
    setLoading(true);
    setError(null);
    try {
      const execution = await automationService.executeWorkflow(workflow.id, parameters);
      setExecutions(prev => [execution, ...prev]);
      return execution;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow]);

  // Validate workflow
  const validateWorkflow = useCallback(async (workflowData?: Workflow) => {
    const workflowToValidate = workflowData || workflow;
    if (!workflowToValidate) return undefined;

    setIsValidating(true);
    setError(null);
    try {
      const result = await automationService.validateWorkflow(workflowToValidate);
      setValidationResult(result);
      setBuilderState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: result.errors,
      }));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate workflow');
      throw err;
    } finally {
      setIsValidating(false);
    }
  }, [workflow]);

  // Test workflow
  const testWorkflow = useCallback(async (testData?: Record<string, any>) => {
    if (!workflow) return undefined;
    
    setLoading(true);
    setError(null);
    try {
      const result = await automationService.testWorkflow(workflow, testData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test workflow');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow]);

  // Builder state management
  const updateBuilderState = useCallback((updates: Partial<WorkflowBuilderState>) => {
    setBuilderState(prev => ({ ...prev, ...updates }));
  }, []);

  const selectNode = useCallback((nodeId?: string) => {
    setBuilderState(prev => ({ ...prev, selectedNode: nodeId }));
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    setBuilderState(prev => ({ ...prev, isDragging }));
  }, []);

  const updateCanvas = useCallback((zoom: number, pan: { x: number; y: number }) => {
    setBuilderState(prev => ({ ...prev, zoom, pan }));
  }, []);

  const selectTemplate = useCallback((template?: any) => {
    setBuilderState(prev => ({ ...prev, selectedTemplate: template }));
  }, []);

  // Node management
  const addNode = useCallback((node: WorkflowNode) => {
    if (!workflow) return;
    
    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, node],
    };
    setWorkflow(updatedWorkflow);
    setBuilderState(prev => ({
      ...prev,
      workflowConfig: updatedWorkflow,
    }));
  }, [workflow]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!workflow) return;
    
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      ),
    };
    setWorkflow(updatedWorkflow);
    setBuilderState(prev => ({
      ...prev,
      workflowConfig: updatedWorkflow,
    }));
  }, [workflow]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!workflow) return;
    
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(node => node.id !== nodeId),
      edges: workflow.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
    };
    setWorkflow(updatedWorkflow);
    setBuilderState(prev => ({
      ...prev,
      workflowConfig: updatedWorkflow,
      selectedNode: prev.selectedNode === nodeId ? undefined : prev.selectedNode,
    }));
  }, [workflow]);

  // Edge management
  const addEdge = useCallback((edge: WorkflowEdge) => {
    if (!workflow) return;
    
    const updatedWorkflow = {
      ...workflow,
      edges: [...workflow.edges, edge],
    };
    setWorkflow(updatedWorkflow);
    setBuilderState(prev => ({
      ...prev,
      workflowConfig: updatedWorkflow,
    }));
  }, [workflow]);

  const deleteEdge = useCallback((edgeId: string) => {
    if (!workflow) return;
    
    const updatedWorkflow = {
      ...workflow,
      edges: workflow.edges.filter(edge => edge.id !== edgeId),
    };
    setWorkflow(updatedWorkflow);
    setBuilderState(prev => ({
      ...prev,
      workflowConfig: updatedWorkflow,
    }));
  }, [workflow]);

  // Auto-validation with debouncing
  const debouncedValidation = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      if (workflow) {
        validateWorkflow();
      }
    }, 1000);
  }, [workflow, validateWorkflow]);

  // Subscribe to real-time execution updates
  useEffect(() => {
    if (!workflow) return undefined;

    const handleExecutionUpdate = (execution: WorkflowExecution) => {
      setExecutions(prev => {
        const existingIndex = prev.findIndex(e => e.id === execution.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = execution;
          return updated;
        } else {
          return [execution, ...prev];
        }
      });
    };

    automationService.subscribeToWorkflowExecution(workflow.id, handleExecutionUpdate);

    return () => {
      automationService.unsubscribeFromWorkflowExecution(workflow.id);
    };
  }, [workflow]);

  // Auto-validate when workflow changes
  useEffect(() => {
    if (workflow) {
      debouncedValidation();
    }
  }, [workflow, debouncedValidation]);

  // Load workflow on mount
  useEffect(() => {
    if (workflowId) {
      loadWorkflow(workflowId);
      loadExecutions(workflowId);
    }
  }, [workflowId, loadWorkflow, loadExecutions]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    workflow,
    builderState,
    executions,
    loading,
    error,
    isValidating,
    validationResult,
    
    // Actions
    loadWorkflow,
    loadExecutions,
    updateWorkflow,
    saveWorkflow,
    executeWorkflow,
    validateWorkflow,
    testWorkflow,
    updateBuilderState,
    selectNode,
    setDragging,
    updateCanvas,
    selectTemplate,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
  };
};
