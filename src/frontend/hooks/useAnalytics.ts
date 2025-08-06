import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export interface AnalyticsData {
  leads: any[];
  buyers: any[];
  metrics: {
    totalLeads: number;
    totalBuyers: number;
    conversionRate: number;
    averageLeadValue: number;
    totalPipelineValue: number;
    activeBuyers: number;
  };
  charts: {
    leadStatusDistribution: any[];
    propertyTypeDistribution: any[];
    buyerTypeDistribution: any[];
    monthlyLeadGrowth: any[];
    conversionRateOverTime: any[];
  };
}

export interface AnalyticsFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  status?: string;
  propertyType?: string;
  buyerType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  includeMetrics: boolean;
  dateRange?: string;
}

export function useAnalytics() {
  const analyticsApi = useApi<AnalyticsData>();
  const exportApi = useApi<string>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '30d',
  });

  const fetchAnalyticsData = useCallback(async (filters?: AnalyticsFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await analyticsApi.execute({
      method: 'GET',
      url: `/api/analytics${params.toString() ? `?${params.toString()}` : ''}`,
    });

    setAnalyticsData(response);
    return response;
  }, [analyticsApi]);

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportAnalytics = useCallback(async (options: ExportOptions) => {
    const response = await exportApi.execute({
      method: 'POST',
      url: '/api/analytics/export',
      data: options,
    });

    return response;
  }, [exportApi]);

  const getRealTimeMetrics = useCallback(async () => {
    const response = await analyticsApi.execute({
      method: 'GET',
      url: '/api/analytics/realtime',
    });

    return response;
  }, [analyticsApi]);

  const getCustomReport = useCallback(async (reportConfig: any) => {
    const response = await analyticsApi.execute({
      method: 'POST',
      url: '/api/analytics/custom-report',
      data: reportConfig,
    });

    return response;
  }, [analyticsApi]);

  const refreshData = useCallback(async () => {
    return await fetchAnalyticsData(filters);
  }, [fetchAnalyticsData, filters]);

  return {
    analyticsData,
    filters,
    loading: analyticsApi.loading || exportApi.loading,
    error: analyticsApi.error || exportApi.error,
    fetchAnalyticsData,
    updateFilters,
    exportAnalytics,
    getRealTimeMetrics,
    getCustomReport,
    refreshData,
    reset: () => {
      analyticsApi.reset();
      exportApi.reset();
    },
  };
} 