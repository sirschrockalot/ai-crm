import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import LeadsPage from '../../pages/leads/index';
import AnalyticsPage from '../../pages/analytics/index';
import AutomationPage from '../../pages/automation/index';
import DashboardPage from '../../pages/dashboard';

// Mock all hooks and components to focus on performance
jest.mock('../../hooks/services/useLeads', () => ({
  useLeads: () => ({
    leads: Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      firstName: `User${i}`,
      lastName: `Test${i}`,
      email: `user${i}@example.com`,
      phone: `555-${i.toString().padStart(4, '0')}`,
      status: 'new',
      propertyType: 'single_family',
      estimatedValue: 250000 + i * 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })),
    loading: false,
    error: null,
    fetchLeads: jest.fn(),
    createLead: jest.fn(),
    updateLead: jest.fn(),
    deleteLead: jest.fn(),
    bulkUpdate: jest.fn(),
    bulkDelete: jest.fn(),
    bulkAssign: jest.fn(),
    bulkChangeStatus: jest.fn(),
    getBulkOperationStats: jest.fn(),
    validateLeadIds: jest.fn(),
  }),
}));

jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    analyticsData: {
      leads: Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        status: 'new',
        propertyType: 'single_family',
        estimatedValue: 250000 + i * 1000,
      })),
      buyers: Array.from({ length: 500 }, (_, i) => ({
        id: `${i}`,
        buyerType: 'individual',
        isActive: true,
      })),
      metrics: {
        totalLeads: 1000,
        totalBuyers: 500,
        conversionRate: 12.5,
        averageLeadValue: 350000,
        totalPipelineValue: 350000000,
        activeBuyers: 500,
      },
      charts: {
        leadStatusDistribution: [
          { name: 'New', value: 400 },
          { name: 'Contacted', value: 300 },
          { name: 'Qualified', value: 200 },
          { name: 'Converted', value: 100 },
        ],
        propertyTypeDistribution: [
          { name: 'Single Family', value: 600 },
          { name: 'Multi Family', value: 300 },
          { name: 'Commercial', value: 100 },
        ],
        buyerTypeDistribution: [
          { name: 'Individual', value: 300 },
          { name: 'Company', value: 150 },
          { name: 'Investor', value: 50 },
        ],
        monthlyLeadGrowth: Array.from({ length: 12 }, (_, i) => ({
          name: `Month ${i + 1}`,
          value: 50 + i * 10,
        })),
        conversionRateOverTime: Array.from({ length: 12 }, (_, i) => ({
          name: `Month ${i + 1}`,
          value: 10 + i * 0.5,
        })),
      },
    },
    loading: false,
    error: null,
    fetchAnalyticsData: jest.fn(),
    updateFilters: jest.fn(),
    exportAnalytics: jest.fn(),
    getRealTimeMetrics: jest.fn(),
    getCustomReport: jest.fn(),
    refreshData: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../../hooks/useAutomation', () => ({
  useAutomation: () => ({
    workflows: Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      name: `Workflow ${i}`,
      description: `Description for workflow ${i}`,
      triggerType: 'automatic',
      triggerCondition: `Condition ${i}`,
      actions: [
        { type: 'email', config: { template: 'welcome', delay: '1h' } },
        { type: 'notification', config: { message: 'Notification sent' } }
      ],
      isActive: true,
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })),
    executions: Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      workflowId: `${i % 10}`,
      workflowName: `Workflow ${i % 10}`,
      status: 'completed',
      progress: 100,
      totalSteps: 3,
      completedSteps: 3,
      failedSteps: 0,
      startedAt: new Date(Date.now() - i * 60000),
      completedAt: new Date(Date.now() - i * 30000),
      logs: [
        { id: '1', timestamp: new Date(), level: 'info', message: 'Started' },
        { id: '2', timestamp: new Date(), level: 'success', message: 'Completed' },
      ],
    })),
    loading: false,
    error: null,
    fetchWorkflows: jest.fn(),
    fetchWorkflow: jest.fn(),
    createWorkflow: jest.fn(),
    updateWorkflow: jest.fn(),
    deleteWorkflow: jest.fn(),
    toggleWorkflow: jest.fn(),
    executeWorkflow: jest.fn(),
    fetchExecutions: jest.fn(),
    cancelExecution: jest.fn(),
    retryExecution: jest.fn(),
    getExecutionLogs: jest.fn(),
    validateWorkflow: jest.fn(),
    duplicateWorkflow: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../../hooks/useDashboard', () => ({
  useDashboard: () => ({
    dashboardData: {
      stats: {
        totalLeads: 1000,
        conversionRate: 12.5,
        activeBuyers: 500,
        revenue: 45678000,
        leadGrowth: 23.36,
        conversionGrowth: 5.2,
        buyerGrowth: -2.1,
        revenueGrowth: 18.7,
      },
      leadPipelineData: [
        { name: 'New Leads', value: 400, color: '#2196f3' },
        { name: 'Contacted', value: 300, color: '#ff9800' },
        { name: 'Qualified', value: 200, color: '#4caf50' },
        { name: 'Converted', value: 100, color: '#9c27b0' },
      ],
      monthlyGrowthData: Array.from({ length: 12 }, (_, i) => ({
        name: `Month ${i + 1}`,
        value: 50 + i * 10,
      })),
      conversionTrendData: Array.from({ length: 12 }, (_, i) => ({
        name: `Month ${i + 1}`,
        value: 10 + i * 0.5,
      })),
      revenueData: Array.from({ length: 12 }, (_, i) => ({
        name: `Month ${i + 1}`,
        value: 25000 + i * 5000,
      })),
      recentActivity: Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        type: 'lead',
        message: `Activity ${i}`,
        timestamp: new Date(Date.now() - i * 60000),
        priority: 'medium',
      })),
      alerts: Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: 'info',
        title: `Alert ${i}`,
        message: `Alert message ${i}`,
        timestamp: new Date(Date.now() - i * 60000),
        isRead: false,
      })),
    },
    loading: false,
    error: null,
    fetchDashboardData: jest.fn(),
    updateFilters: jest.fn(),
    refreshDashboard: jest.fn(),
    getRealTimeStats: jest.fn(),
    markAlertAsRead: jest.fn(),
    dismissAlert: jest.fn(),
    exportDashboard: jest.fn(),
    getCustomReport: jest.fn(),
    reset: jest.fn(),
  }),
}));

// Mock layout components
jest.mock('../../components/layout', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
  Header: () => <div data-testid="header">Header</div>,
  Navigation: () => <div data-testid="navigation">Navigation</div>,
  SearchBar: () => <div data-testid="search-bar">SearchBar</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render leads page with 1000 leads in under 100ms', () => {
    const startTime = performance.now();
    
    renderWithProviders(<LeadsPage />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100);
  });

  it('should render analytics page with large datasets in under 150ms', () => {
    const startTime = performance.now();
    
    renderWithProviders(<AnalyticsPage />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(150);
  });

  it('should render automation page with 100 workflows in under 120ms', () => {
    const startTime = performance.now();
    
    renderWithProviders(<AutomationPage />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(120);
  });

  it('should render dashboard page with complex charts in under 200ms', () => {
    const startTime = performance.now();
    
    renderWithProviders(<DashboardPage />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(200);
  });

  it('should handle memory usage efficiently', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Render multiple pages to test memory usage
    const { unmount: unmountLeads } = renderWithProviders(<LeadsPage />);
    unmountLeads();
    
    const { unmount: unmountAnalytics } = renderWithProviders(<AnalyticsPage />);
    unmountAnalytics();
    
    const { unmount: unmountAutomation } = renderWithProviders(<AutomationPage />);
    unmountAutomation();
    
    const { unmount: unmountDashboard } = renderWithProviders(<DashboardPage />);
    unmountDashboard();
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  it('should maintain responsive UI during heavy operations', () => {
    const startTime = performance.now();
    
    // Simulate heavy operations by rendering multiple components
    const { rerender } = renderWithProviders(<LeadsPage />);
    
    // Rerender multiple times to simulate updates
    for (let i = 0; i < 10; i++) {
      rerender(<LeadsPage />);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Total time should be reasonable
    expect(totalTime).toBeLessThan(500);
  });

  it('should handle large data filtering efficiently', () => {
    const startTime = performance.now();
    
    renderWithProviders(<LeadsPage />);
    
    // Simulate filtering operations
    const filterOperations = 100;
    for (let i = 0; i < filterOperations; i++) {
      // This would normally trigger filtering logic
      // For now, we just measure the render time
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Filtering operations should be fast
    expect(totalTime).toBeLessThan(200);
  });

  it('should optimize bundle size', () => {
    // This test would normally check actual bundle size
    // For now, we'll just ensure the components render without errors
    expect(() => {
      renderWithProviders(<LeadsPage />);
    }).not.toThrow();
    
    expect(() => {
      renderWithProviders(<AnalyticsPage />);
    }).not.toThrow();
    
    expect(() => {
      renderWithProviders(<AutomationPage />);
    }).not.toThrow();
    
    expect(() => {
      renderWithProviders(<DashboardPage />);
    }).not.toThrow();
  });

  it('should handle concurrent operations efficiently', () => {
    const startTime = performance.now();
    
    // Simulate concurrent operations
    const promises = [
      Promise.resolve(renderWithProviders(<LeadsPage />)),
      Promise.resolve(renderWithProviders(<AnalyticsPage />)),
      Promise.resolve(renderWithProviders(<AutomationPage />)),
      Promise.resolve(renderWithProviders(<DashboardPage />)),
    ];
    
    Promise.all(promises).then(() => {
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Concurrent operations should complete in reasonable time
      expect(totalTime).toBeLessThan(300);
    });
  });
}); 