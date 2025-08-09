import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useDebounce } from '../../../hooks/useDebounce';
import { withErrorHandling, formatErrorForUser } from '../../../utils/error';
import { useToast } from '@chakra-ui/react';
import {
  AnalyticsData,
  AnalyticsFilters,
  ExportOptions,
  CustomReportConfig,
  AnalyticsMetrics,
  AnalyticsCharts,
} from '../types/analytics';

export function useAnalytics() {
  const { isAuthenticated, user } = useAuth();
  const analyticsApi = useApi<AnalyticsData>();
  const exportApi = useApi<string>();
  const metricsApi = useApi<AnalyticsMetrics>();
  const chartsApi = useApi<AnalyticsCharts>();
  const reportApi = useApi<any>();
  const toast = useToast();

  // Local storage for caching analytics preferences
  const { getItem: getCachedFilters, setItem: setCachedFilters } = useLocalStorage('analytics_filters');
  const { getItem: getCachedData, setItem: setCachedData } = useLocalStorage('analytics_data');

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(() => {
    const cached = getCachedFilters();
    return cached ? JSON.parse(cached) : { timeRange: '30d' };
  });

  // Real-time update interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced filters for performance
  const debouncedFilters = useDebounce(filters, 500);

  // Get authentication headers with error handling
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

  // Cache analytics data when it changes
  useEffect(() => {
    if (analyticsData) {
      setCachedData(JSON.stringify(analyticsData));
    }
  }, [analyticsData, setCachedData]);

  // Auto-refresh data when filters change
  useEffect(() => {
    if (debouncedFilters) {
      fetchAnalyticsData(debouncedFilters);
    }
  }, [debouncedFilters]);

  const fetchAnalyticsData = useCallback(
    withErrorHandling(async (filters?: AnalyticsFilters) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      setLoading(true);
      setError(null);

      try {
        // Try to load cached data first for better UX
        const cachedData = getCachedData();
        if (cachedData && !filters) {
          try {
            const parsed = JSON.parse(cachedData);
            setAnalyticsData(parsed);
          } catch (error) {
            console.warn('Failed to parse cached analytics data:', error);
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

        const response = await analyticsApi.execute({
          method: 'GET',
          url: `/api/analytics/dashboard${params.toString() ? `?${params.toString()}` : ''}`,
          headers: getAuthHeaders(),
        });

        setAnalyticsData(response);
        return response;
      } catch (error) {
        const errorMessage = formatErrorForUser(error);
        setError(errorMessage);
        toast({
          title: 'Analytics Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Failed to fetch analytics data:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [analyticsApi, isAuthenticated, getAuthHeaders, getCachedData, toast]);

  const fetchPerformanceMetrics = useCallback(
    withErrorHandling(async (filters?: AnalyticsFilters) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await metricsApi.execute({
        method: 'GET',
        url: `/api/analytics/performance${params.toString() ? `?${params.toString()}` : ''}`,
        headers: getAuthHeaders(),
      });

      return response;
    }, (error) => {
      console.error('Failed to fetch performance metrics:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [metricsApi, isAuthenticated, getAuthHeaders]);

  const fetchChartData = useCallback(
    withErrorHandling(async (chartType: string, filters?: AnalyticsFilters) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      params.append('chartType', chartType);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await chartsApi.execute({
        method: 'GET',
        url: `/api/analytics/charts?${params.toString()}`,
        headers: getAuthHeaders(),
      });

      return response;
    }, (error) => {
      console.error('Failed to fetch chart data:', error);
      throw new Error(formatErrorForUser(error));
    })
  , [chartsApi, isAuthenticated, getAuthHeaders]);

  const exportAnalytics = useCallback(
    withErrorHandling(async (options: ExportOptions) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await exportApi.execute({
        method: 'POST',
        url: '/api/analytics/export',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        data: options,
      });

      // Handle file download
      if (response) {
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: 'Export Successful',
        description: `Analytics data exported as ${options.format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
      });

      return response;
    }, (error) => {
      console.error('Failed to export analytics:', error);
      toast({
        title: 'Export Failed',
        description: formatErrorForUser(error),
        status: 'error',
        duration: 5000,
      });
      throw new Error(formatErrorForUser(error));
    })
  , [exportApi, isAuthenticated, getAuthHeaders, toast]);

  const createCustomReport = useCallback(
    withErrorHandling(async (config: CustomReportConfig) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await reportApi.execute({
        method: 'POST',
        url: '/api/analytics/reports',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        data: config,
      });

      toast({
        title: 'Report Created',
        description: `Custom report "${config.name}" has been created successfully`,
        status: 'success',
        duration: 3000,
      });

      return response;
    }, (error) => {
      console.error('Failed to create custom report:', error);
      toast({
        title: 'Report Creation Failed',
        description: formatErrorForUser(error),
        status: 'error',
        duration: 5000,
      });
      throw new Error(formatErrorForUser(error));
    })
  , [reportApi, isAuthenticated, getAuthHeaders, toast]);

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ timeRange: '30d' });
  }, []);

  const startAutoRefresh = useCallback((intervalMs: number = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      fetchAnalyticsData(filters);
    }, intervalMs);
  }, [fetchAnalyticsData, filters]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    analyticsData,
    loading,
    error,
    isAuthenticated,
    filters,
    fetchAnalyticsData,
    fetchPerformanceMetrics,
    fetchChartData,
    exportAnalytics,
    createCustomReport,
    updateFilters,
    clearFilters,
    startAutoRefresh,
    stopAutoRefresh,
  };
}
