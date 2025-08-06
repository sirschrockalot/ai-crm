import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export interface DashboardStats {
  totalLeads: number;
  conversionRate: number;
  activeBuyers: number;
  revenue: number;
  leadGrowth: number;
  conversionGrowth: number;
  buyerGrowth: number;
  revenueGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  leadPipelineData: ChartData[];
  monthlyGrowthData: ChartData[];
  conversionTrendData: ChartData[];
  revenueData: ChartData[];
  recentActivity: ActivityItem[];
  alerts: AlertItem[];
}

export interface ActivityItem {
  id: string;
  type: 'lead' | 'conversion' | 'workflow' | 'alert';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeCharts: boolean;
  includeActivity: boolean;
  includeAlerts: boolean;
}

export function useDashboard() {
  const dashboardApi = useApi<DashboardData>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '30d',
    includeCharts: true,
    includeActivity: true,
    includeAlerts: true,
  });

  const fetchDashboardData = useCallback(async (filters?: DashboardFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await dashboardApi.execute({
      method: 'GET',
      url: `/api/dashboard${params.toString() ? `?${params.toString()}` : ''}`,
    });

    setDashboardData(response);
    return response;
  }, [dashboardApi]);

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshDashboard = useCallback(async () => {
    return await fetchDashboardData(filters);
  }, [fetchDashboardData, filters]);

  const getRealTimeStats = useCallback(async () => {
    const response = await dashboardApi.execute({
      method: 'GET',
      url: '/api/dashboard/realtime',
    });

    return response;
  }, [dashboardApi]);

  const markAlertAsRead = useCallback(async (alertId: string) => {
    const response = await dashboardApi.execute({
      method: 'POST',
      url: `/api/dashboard/alerts/${alertId}/read`,
    });

    return response;
  }, [dashboardApi]);

  const dismissAlert = useCallback(async (alertId: string) => {
    const response = await dashboardApi.execute({
      method: 'DELETE',
      url: `/api/dashboard/alerts/${alertId}`,
    });

    return response;
  }, [dashboardApi]);

  const exportDashboard = useCallback(async (format: 'pdf' | 'csv' | 'excel') => {
    const response = await dashboardApi.execute({
      method: 'POST',
      url: '/api/dashboard/export',
      data: { format, filters },
    });

    return response;
  }, [dashboardApi, filters]);

  const getCustomReport = useCallback(async (reportConfig: any) => {
    const response = await dashboardApi.execute({
      method: 'POST',
      url: '/api/dashboard/custom-report',
      data: reportConfig,
    });

    return response;
  }, [dashboardApi]);

  return {
    dashboardData,
    filters,
    loading: dashboardApi.loading,
    error: dashboardApi.error,
    fetchDashboardData,
    updateFilters,
    refreshDashboard,
    getRealTimeStats,
    markAlertAsRead,
    dismissAlert,
    exportDashboard,
    getCustomReport,
    reset: () => {
      dashboardApi.reset();
    },
  };
} 