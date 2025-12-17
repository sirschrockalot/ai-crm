// useAutomation Hook
// State management for automation features with shared services integration

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useDebounce } from '../../../hooks/useDebounce';
import { 
  Workflow, 
  WorkflowExecution, 
  AutomationStats, 
  WorkflowTemplate,
  AutomationFilters 
} from '../types/automation';
import { mockAutomationService } from '../services/mockAutomationService';

export const useAutomation = () => {
  const { isAuthenticated, user } = useAuth();

  // Local storage for caching automation preferences
  const [cachedFilters, setCachedFilters] = useLocalStorage<string | null>('automation_filters', null);
  const [cachedWorkflows, setCachedWorkflows] = useLocalStorage<string | null>('automation_workflows', null);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [filters, setFilters] = useState<AutomationFilters>(() => {
    if (cachedFilters) {
      try {
        return JSON.parse(cachedFilters);
      } catch (error) {
        console.warn('Failed to parse cached filters:', error);
      }
    }
    return {};
  });

  // Debounced filters for performance
  const debouncedFilters = useDebounce(filters, 500);

  // Cache filters when they change
  useEffect(() => {
    setCachedFilters(JSON.stringify(filters));
  }, [filters, setCachedFilters]);

  // Cache workflows when they change
  useEffect(() => {
    if (workflows.length > 0) {
      setCachedWorkflows(JSON.stringify(workflows));
    }
  }, [workflows, setCachedWorkflows]);

  // Load workflows with shared service integration
  const loadWorkflows = useCallback(
    async (filters?: AutomationFilters) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] loadWorkflows called while not authenticated; skipping');
        return [];
      }

      // Try to load cached workflows first
      if (cachedWorkflows && !filters) {
        try {
          const parsed = JSON.parse(cachedWorkflows);
          setWorkflows(parsed);
        } catch (error) {
          console.warn('Failed to parse cached workflows:', error);
        }
      }

      // Always use mock automation service in current phase
      const mockWorkflows = await mockAutomationService.getWorkflows(filters);
      setWorkflows(mockWorkflows);
      return mockWorkflows;
    },
    [isAuthenticated, cachedWorkflows],
  );

  // Load templates with shared service integration
  const loadTemplates = useCallback(
    async (category?: string) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] loadTemplates called while not authenticated; skipping');
        return [];
      }

      const mockTemplates = await mockAutomationService.getWorkflowTemplates(category);
      setTemplates(mockTemplates);
      return mockTemplates;
    },
    [isAuthenticated],
  );

  // Load stats with shared service integration
  const loadStats = useCallback(
    async (timeRange: 'today' | 'week' | 'month' | 'year' = 'week') => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] loadStats called while not authenticated; skipping');
        setStats(null);
        return null;
      }

      const mockStats = await mockAutomationService.getAutomationStats(timeRange);
      setStats(mockStats);
      return mockStats;
    },
    [isAuthenticated],
  );

  // Create workflow (mock-backed)
  const createWorkflow = useCallback(
    async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] createWorkflow called while not authenticated; skipping');
        return;
      }

      const mockWorkflow = await mockAutomationService.createWorkflow(workflow);
      setWorkflows(prev => [...prev, mockWorkflow]);
      return mockWorkflow;
    },
    [isAuthenticated],
  );

  // Update workflow (mock-backed)
  const updateWorkflow = useCallback(
    async (id: string, updates: Partial<Workflow>) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] updateWorkflow called while not authenticated; skipping');
        return;
      }

      const mockWorkflow = await mockAutomationService.updateWorkflow(id, updates);
      setWorkflows(prev => prev.map(w => (w.id === id ? mockWorkflow : w)));
      return mockWorkflow;
    },
    [isAuthenticated],
  );

  // Delete workflow (mock-backed)
  const deleteWorkflow = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] deleteWorkflow called while not authenticated; skipping');
        return;
      }

      await mockAutomationService.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    },
    [isAuthenticated],
  );

  // Duplicate workflow (mock-backed)
  const duplicateWorkflow = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] duplicateWorkflow called while not authenticated; skipping');
        return;
      }

      const originalWorkflow = await mockAutomationService.getWorkflow(id);
      if (!originalWorkflow) {
        throw new Error('Workflow not found');
      }
      const duplicatedWorkflow = await mockAutomationService.createWorkflow({
        ...originalWorkflow,
        name: `${originalWorkflow.name} (Copy)`,
        isActive: false,
      });
      setWorkflows(prev => [...prev, duplicatedWorkflow]);
      return duplicatedWorkflow;
    },
    [isAuthenticated],
  );

  // Execute workflow (mock-backed)
  const executeWorkflow = useCallback(
    async (id: string, parameters?: Record<string, any>) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] executeWorkflow called while not authenticated; skipping');
        return;
      }

      return await mockAutomationService.executeWorkflow(id, parameters);
    },
    [isAuthenticated],
  );

  // Create workflow from template (mock-backed)
  const createFromTemplate = useCallback(
    async (templateId: string, name: string) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] createFromTemplate called while not authenticated; skipping');
        return;
      }

      const templates = await mockAutomationService.getWorkflowTemplates();
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      const newWorkflow = await mockAutomationService.createWorkflow({
        name,
        description: template.description,
        isActive: false,
        nodes: template.nodes,
        edges: template.edges,
        triggers: [],
        actions: [],
        conditions: [],
        delays: [],
        integrations: [],
        metadata: {
          version: '1.0.0',
          author: 'Admin User',
          tags: template.tags,
          category: template.category,
        },
      });
      setWorkflows(prev => [...prev, newWorkflow]);
      return newWorkflow;
    },
    [isAuthenticated],
  );

  // Export workflow (mock-backed)
  const exportWorkflow = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] exportWorkflow called while not authenticated; skipping');
        return;
      }

      const workflow = await mockAutomationService.getWorkflow(id);
      if (!workflow) {
        throw new Error('Workflow not found');
      }
      return {
        workflow,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        format: 'json',
      };
    },
    [isAuthenticated],
  );

  // Import workflow (mock-backed)
  const importWorkflow = useCallback(
    async (exportData: string) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] importWorkflow called while not authenticated; skipping');
        return;
      }

      let importData;
      try {
        importData = JSON.parse(exportData);
      } catch {
        throw new Error('Invalid export data format');
      }

      if (!importData.workflow) {
        throw new Error('No workflow data found in export');
      }

      const workflow = await mockAutomationService.createWorkflow({
        ...importData.workflow,
        name: `${importData.workflow.name} (Imported)`,
        isActive: false,
      });

      setWorkflows(prev => [...prev, workflow]);
      return workflow;
    },
    [isAuthenticated],
  );

  // Validate workflow (mock-backed)
  const validateWorkflow = useCallback(
    async (workflow: Workflow) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] validateWorkflow called while not authenticated; skipping');
        return;
      }

      const isValid = workflow.nodes.length > 0 && workflow.edges.length > 0;
      return {
        isValid,
        errors: isValid ? [] : ['Workflow must have at least one node and edge'],
        warnings: [] as string[],
      };
    },
    [isAuthenticated],
  );

  // Test workflow (mock-backed)
  const testWorkflow = useCallback(
    async (workflow: Workflow, testData?: Record<string, any>) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] testWorkflow called while not authenticated; skipping');
        return;
      }

      return await mockAutomationService.executeWorkflow(workflow.id, testData);
    },
    [isAuthenticated],
  );

  // Export analytics (mock-backed)
  const exportAnalytics = useCallback(
    async (params: {
      timeRange: 'today' | 'week' | 'month' | 'year';
      filters?: AutomationFilters;
      format: 'csv' | 'json' | 'xlsx';
    }) => {
      if (!isAuthenticated) {
        console.warn('[useAutomation] exportAnalytics called while not authenticated; skipping');
        return;
      }

      const mockStats = await mockAutomationService.getAutomationStats(params.timeRange);
      const mockWorkflows = await mockAutomationService.getWorkflows(params.filters);

      return {
        data: {
          stats: mockStats,
          workflows: mockWorkflows,
          exportDate: new Date().toISOString(),
          format: params.format,
        },
        filename: `automation-analytics-${params.timeRange}-${new Date().toISOString().split('T')[0]}.${params.format}`,
      };
    },
    [isAuthenticated],
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AutomationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setCachedFilters(null);
    setCachedWorkflows(null);
  }, [setCachedFilters, setCachedWorkflows]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkflows();
      loadTemplates();
      loadStats();
    }
  }, [isAuthenticated, loadWorkflows, loadTemplates, loadStats]);

  return {
    // State
    workflows,
    templates,
    stats,
    filters,
    debouncedFilters,

    // Simplified loading/error flags for mock-backed implementation
    loading: false as boolean,
    error: null as string | null,

    // Authentication state
    isAuthenticated,
    user,

    // Actions
    loadWorkflows,
    loadTemplates,
    loadStats,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    executeWorkflow,
    createFromTemplate,
    exportWorkflow,
    importWorkflow,
    validateWorkflow,
    testWorkflow,
    exportAnalytics,
    updateFilters,
    clearCache,

    // Reset functions
    reset: () => {
      setWorkflows([]);
      setTemplates([]);
      setStats(null);
      setFilters({});
    },
  };
};
