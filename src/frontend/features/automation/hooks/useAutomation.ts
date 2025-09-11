// useAutomation Hook
// State management for automation features with shared services integration

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useDebounce } from '../../../hooks/useDebounce';
import { withErrorHandling, formatErrorForUser } from '../../../utils/error';
import { 
  Workflow, 
  WorkflowExecution, 
  AutomationStats, 
  WorkflowTemplate,
  AutomationFilters 
} from '../types/automation';
import { automationService } from '../services/automationService';
import { mockAutomationService } from '../services/mockAutomationService';

export const useAutomation = () => {
  const { isAuthenticated, user } = useAuth();
  const workflowsApi = useApi<Workflow[]>();
  const templatesApi = useApi<WorkflowTemplate[]>();
  const statsApi = useApi<AutomationStats>();
  const executionApi = useApi<WorkflowExecution>();

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

  // Get authentication headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return { Authorization: `Bearer ${token}` };
  }, []);

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
    withErrorHandling(async (filters?: AutomationFilters) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
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

      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      try {
        const response = await workflowsApi.execute({
          method: 'GET',
          url: `/api/automation/workflows${params.toString() ? `?${params.toString()}` : ''}`,
          headers: getAuthHeaders(),
        });

        setWorkflows(response);
        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock data for development
        const mockWorkflows = await mockAutomationService.getWorkflows(filters);
        setWorkflows(mockWorkflows);
        return mockWorkflows;
      }
    }, (error) => {
      console.error('Failed to load workflows:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders, cachedWorkflows]);

  // Load templates with shared service integration
  const loadTemplates = useCallback(
    withErrorHandling(async (category?: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (category) {
        params.append('category', category);
      }

      try {
        const response = await templatesApi.execute({
          method: 'GET',
          url: `/api/automation/templates${params.toString() ? `?${params.toString()}` : ''}`,
          headers: getAuthHeaders(),
        });

        setTemplates(response);
        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock data for development
        const mockTemplates = await mockAutomationService.getWorkflowTemplates(category);
        setTemplates(mockTemplates);
        return mockTemplates;
      }
    }, (error) => {
      console.error('Failed to load templates:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [templatesApi, isAuthenticated, getAuthHeaders]);

  // Load stats with shared service integration
  const loadStats = useCallback(
    withErrorHandling(async (timeRange: 'today' | 'week' | 'month' | 'year' = 'week') => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await statsApi.execute({
          method: 'GET',
          url: `/api/automation/stats?timeRange=${timeRange}`,
          headers: getAuthHeaders(),
        });

        setStats(response);
        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock data for development
        const mockStats = await mockAutomationService.getAutomationStats(timeRange);
        setStats(mockStats);
        return mockStats;
      }
    }, (error) => {
      console.error('Failed to load stats:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [statsApi, isAuthenticated, getAuthHeaders]);

  // Create workflow with shared service integration
  const createWorkflow = useCallback(
    withErrorHandling(async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'POST',
          url: '/api/automation/workflows',
          data: workflow,
          headers: getAuthHeaders(),
        });

        // Handle the case where response might be an array or single object
        const newWorkflow = Array.isArray(response) ? response[0] : response as Workflow;
        setWorkflows(prev => [...prev, newWorkflow]);
        return newWorkflow;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        const mockWorkflow = await mockAutomationService.createWorkflow(workflow);
        setWorkflows(prev => [...prev, mockWorkflow]);
        return mockWorkflow;
      }
    }, (error) => {
      console.error('Failed to create workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Update workflow with shared service integration
  const updateWorkflow = useCallback(
    withErrorHandling(async (id: string, updates: Partial<Workflow>) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'PUT',
          url: `/api/automation/workflows/${id}`,
          data: updates,
          headers: getAuthHeaders(),
        });

        // Handle the case where response might be an array or single object
        const updatedWorkflow = Array.isArray(response) ? response[0] : response as Workflow;
        setWorkflows(prev => prev.map(w => w.id === id ? updatedWorkflow : w));
        return updatedWorkflow;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        const mockWorkflow = await mockAutomationService.updateWorkflow(id, updates);
        setWorkflows(prev => prev.map(w => w.id === id ? mockWorkflow : w));
        return mockWorkflow;
      }
    }, (error) => {
      console.error('Failed to update workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Delete workflow with shared service integration
  const deleteWorkflow = useCallback(
    withErrorHandling(async (id: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        await workflowsApi.execute({
          method: 'DELETE',
          url: `/api/automation/workflows/${id}`,
          headers: getAuthHeaders(),
        });

        setWorkflows(prev => prev.filter(w => w.id !== id));
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        await mockAutomationService.deleteWorkflow(id);
        setWorkflows(prev => prev.filter(w => w.id !== id));
      }
    }, (error) => {
      console.error('Failed to delete workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Duplicate workflow with shared service integration
  const duplicateWorkflow = useCallback(
    withErrorHandling(async (id: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'POST',
          url: `/api/automation/workflows/${id}/duplicate`,
          headers: getAuthHeaders(),
        });

        // Handle the case where response might be an array or single object
        const newWorkflow = Array.isArray(response) ? response[0] : response as Workflow;
        setWorkflows(prev => [...prev, newWorkflow]);
        return newWorkflow;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        const originalWorkflow = await mockAutomationService.getWorkflow(id);
        if (!originalWorkflow) {
          throw new Error('Workflow not found');
        }
        
        const duplicatedWorkflow = await mockAutomationService.createWorkflow({
          ...originalWorkflow,
          name: `${originalWorkflow.name} (Copy)`,
          isActive: false
        });
        
        setWorkflows(prev => [...prev, duplicatedWorkflow]);
        return duplicatedWorkflow;
      }
    }, (error) => {
      console.error('Failed to duplicate workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Execute workflow with shared service integration
  const executeWorkflow = useCallback(
    withErrorHandling(async (id: string, parameters?: Record<string, any>) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await executionApi.execute({
          method: 'POST',
          url: `/api/automation/workflows/${id}/execute`,
          data: parameters,
          headers: getAuthHeaders(),
        });

        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        return await mockAutomationService.executeWorkflow(id, parameters);
      }
    }, (error) => {
      console.error('Failed to execute workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [executionApi, isAuthenticated, getAuthHeaders]);

  // Create workflow from template with shared service integration
  const createFromTemplate = useCallback(
    withErrorHandling(async (templateId: string, name: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'POST',
          url: `/api/automation/templates/${templateId}/create`,
          data: { name },
          headers: getAuthHeaders(),
        });

        // Handle the case where response might be an array or single object
        const newWorkflow = Array.isArray(response) ? response[0] : response as Workflow;
        setWorkflows(prev => [...prev, newWorkflow]);
        return newWorkflow;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        const template = await mockAutomationService.getWorkflowTemplates().then(templates => 
          templates.find(t => t.id === templateId)
        );
        
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
            category: template.category
          }
        });
        
        setWorkflows(prev => [...prev, newWorkflow]);
        return newWorkflow;
      }
    }, (error) => {
      console.error('Failed to create workflow from template:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Export workflow with shared service integration
  const exportWorkflow = useCallback(
    withErrorHandling(async (id: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'GET',
          url: `/api/automation/workflows/${id}/export`,
          headers: getAuthHeaders(),
        });

        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        const workflow = await mockAutomationService.getWorkflow(id);
        if (!workflow) {
          throw new Error('Workflow not found');
        }
        
        // Return a mock export format
        return {
          workflow,
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          format: 'json'
        };
      }
    }, (error) => {
      console.error('Failed to export workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Import workflow with shared service integration
  const importWorkflow = useCallback(
    withErrorHandling(async (exportData: string) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'POST',
          url: '/api/automation/workflows/import',
          data: { exportData },
          headers: getAuthHeaders(),
        });

        // Handle the case where response might be an array or single object
        const newWorkflow = Array.isArray(response) ? response[0] : response as Workflow;
        setWorkflows(prev => [...prev, newWorkflow]);
        return newWorkflow;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock service for development
        let importData;
        try {
          importData = JSON.parse(exportData);
        } catch (parseError) {
          throw new Error('Invalid export data format');
        }
        
        if (!importData.workflow) {
          throw new Error('No workflow data found in export');
        }
        
        const workflow = await mockAutomationService.createWorkflow({
          ...importData.workflow,
          name: `${importData.workflow.name} (Imported)`,
          isActive: false
        });
        
        setWorkflows(prev => [...prev, workflow]);
        return workflow;
      }
    }, (error) => {
      console.error('Failed to import workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Validate workflow with shared service integration
  const validateWorkflow = useCallback(
    withErrorHandling(async (workflow: Workflow) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'POST',
          url: '/api/automation/workflows/validate',
          data: workflow,
          headers: getAuthHeaders(),
        });

        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock validation for development
        const isValid = workflow.nodes.length > 0 && workflow.edges.length > 0;
        return {
          isValid,
          errors: isValid ? [] : ['Workflow must have at least one node and edge'],
          warnings: [] as string[]
        };
      }
    }, (error) => {
      console.error('Failed to validate workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Test workflow with shared service integration
  const testWorkflow = useCallback(
    withErrorHandling(async (workflow: Workflow, testData?: Record<string, any>) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await workflowsApi.execute({
          method: 'POST',
          url: '/api/automation/workflows/test',
          data: { workflow, testData },
          headers: getAuthHeaders(),
        });

        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock testing for development
        return await mockAutomationService.executeWorkflow(workflow.id, testData);
      }
    }, (error) => {
      console.error('Failed to test workflow:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [workflowsApi, isAuthenticated, getAuthHeaders]);

  // Export analytics with shared service integration
  const exportAnalytics = useCallback(
    withErrorHandling(async (params: {
      timeRange: 'today' | 'week' | 'month' | 'year';
      filters?: AutomationFilters;
      format: 'csv' | 'json' | 'xlsx';
    }) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      try {
        const response = await statsApi.execute({
          method: 'POST',
          url: '/api/automation/analytics/export',
          data: params,
          headers: getAuthHeaders(),
        });

        return response;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        
        // Fall back to mock analytics export for development
        const mockStats = await mockAutomationService.getAutomationStats(params.timeRange);
        const mockWorkflows = await mockAutomationService.getWorkflows(params.filters);
        
        return {
          data: {
            stats: mockStats,
            workflows: mockWorkflows,
            exportDate: new Date().toISOString(),
            format: params.format
          },
          filename: `automation-analytics-${params.timeRange}-${new Date().toISOString().split('T')[0]}.${params.format}`
        };
      }
    }, (error) => {
      console.error('Failed to export analytics:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [statsApi, isAuthenticated, getAuthHeaders]);

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
    
    // Loading states from shared API hooks
    loading: workflowsApi.loading || templatesApi.loading || statsApi.loading || executionApi.loading,
    error: workflowsApi.error || templatesApi.error || statsApi.error || executionApi.error,
    
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
      workflowsApi.reset();
      templatesApi.reset();
      statsApi.reset();
      executionApi.reset();
      setWorkflows([]);
      setTemplates([]);
      setStats(null);
      setFilters({});
    },
  };
};
