import { useState, useCallback, useEffect } from 'react';
import { useSharedApi, useGet, usePost } from './useSharedApi';
import { useDashboardRealtime } from './useRealtime';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from './useLocalStorage';
import { useDebounce } from './useDebounce';
import { withErrorHandling, formatErrorForUser } from '../utils/error';

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

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  user?: string;
}

export interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
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

export interface DashboardFilters {
  timeRange: string;
  includeCharts: boolean;
  includeActivity: boolean;
  includeAlerts: boolean;
}

// Development mode authentication bypass
const isDevelopmentMode = process.env.NODE_ENV === 'development';
const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

export function useDashboard() {
  const { isAuthenticated, user, checkSessionTimeout } = useAuth();
  
  // Use shared API hooks
  const dashboardApi = useGet<DashboardData>('/api/dashboard', {
    enableCache: true,
    cacheKey: 'dashboard_data',
    loadingId: 'dashboard_loading',
  });
  
  const realtimeApi = useGet<DashboardStats>('/api/dashboard/realtime', {
    enableCache: false,
    loadingId: 'realtime_loading',
  });

  // Real-time updates
  const realtime = useDashboardRealtime();
  
  // Local storage for caching dashboard preferences
  const [cachedFilters, setCachedFilters] = useLocalStorage<string | null>('dashboard_filters', null);
  const [cachedData, setCachedData] = useLocalStorage<string | null>('dashboard_data', null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(() => {
    if (cachedFilters) {
      try {
        return JSON.parse(cachedFilters);
      } catch (error) {
        console.warn('Failed to parse cached filters:', error);
      }
    }
    return {
      timeRange: '30d',
      includeCharts: true,
      includeActivity: true,
      includeAlerts: true,
    };
  });

  // Debounced filters for performance
  const debouncedFilters = useDebounce(filters, 500);

  // Cache filters when they change
  useEffect(() => {
    setCachedFilters(JSON.stringify(filters));
  }, [filters, setCachedFilters]);

  // Cache dashboard data when it changes
  useEffect(() => {
    if (dashboardData) {
      setCachedData(JSON.stringify(dashboardData));
    }
  }, [dashboardData, setCachedData]);

  const fetchDashboardData = useCallback(
    withErrorHandling(async (filters?: DashboardFilters) => {
      // Skip authentication check in development mode
      if (!bypassAuth && !isAuthenticated) {
        throw new Error('Authentication required');
      }

      // Try to load cached data first
      if (cachedData && !filters) {
        try {
          const parsed = JSON.parse(cachedData);
          setDashboardData(parsed);
        } catch (error) {
          console.warn('Failed to parse cached dashboard data:', error);
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

      const response = await dashboardApi.execute({
        params: Object.fromEntries(params),
      });

      setDashboardData(response);
      return response;
    }, (error) => {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error(formatErrorForUser(error));
    }),
    [dashboardApi, isAuthenticated, cachedData, bypassAuth]
  );

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshDashboard = useCallback(async () => {
    return await fetchDashboardData(filters);
  }, [fetchDashboardData, filters]);

  const getRealTimeStats = useCallback(
    withErrorHandling(async () => {
      // Skip authentication check in development mode
      if (!bypassAuth && !isAuthenticated) {
        throw new Error('Authentication required');
      }

      const response = await realtimeApi.execute();
      return response;
    }, (error) => {
      console.error('Failed to get real-time stats:', error);
      throw new Error(formatErrorForUser(error));
    }),
    [realtimeApi, isAuthenticated, bypassAuth]
  );

  const clearCache = useCallback(() => {
    setCachedFilters(null);
    setCachedData(null);
    dashboardApi.clearCache();
  }, [setCachedFilters, setCachedData, dashboardApi]);

  // Dashboard-specific API calls using shared services
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

  // Check session timeout on mount and periodically
  useEffect(() => {
    if (!bypassAuth && isAuthenticated) {
      // Check session timeout immediately
      checkSessionTimeout();
      
      // Set up periodic session checks
      const interval = setInterval(() => {
        checkSessionTimeout();
      }, 120000); // Check every 2 minutes to avoid overwhelming the system

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkSessionTimeout, bypassAuth]);

  // Real-time subscription setup
  useEffect(() => {
    if (realtime.isConnected && (bypassAuth || isAuthenticated)) {
      // Subscribe to dashboard updates
      const dashboardSub = realtime.subscribeToDashboard((message) => {
        if (message.type === 'dashboard_stats_update') {
          // Update dashboard stats in real-time
          setDashboardData(prev => prev ? {
            ...prev,
            stats: message.data,
          } : null);
        }
      });

      // Subscribe to alerts
      const alertsSub = realtime.subscribeToAlerts((message) => {
        if (message.type === 'dashboard_alert') {
          // Handle new alerts
          console.log('New alert received:', message.data);
        }
      });

      // Subscribe to activity
      const activitySub = realtime.subscribeToActivity((message) => {
        if (message.type === 'dashboard_activity') {
          // Handle new activity
          console.log('New activity received:', message.data);
        }
      });

      return () => {
        realtime.unsubscribe(dashboardSub);
        realtime.unsubscribe(alertsSub);
        realtime.unsubscribe(activitySub);
      };
    }
    return undefined;
  }, [realtime, isAuthenticated, bypassAuth]);

  return {
    dashboardData,
    filters,
    debouncedFilters,
    
    // Loading states from shared API hooks
    loading: dashboardApi.loading || realtimeApi.loading,
    error: dashboardApi.error || realtimeApi.error,
    
    // Authentication state
    isAuthenticated,
    user,
    
    // Real-time state
    realtime: {
      isConnected: realtime.isConnected,
      isPolling: realtime.isPolling,
      connection: realtime.connection,
      error: realtime.error,
    },
    
    // Actions
    fetchDashboardData,
    updateFilters,
    refreshDashboard,
    getRealTimeStats,
    markAlertAsRead,
    dismissAlert,
    exportDashboard,
    getCustomReport,
    clearCache,
    
    // Reset functions
    reset: () => {
      dashboardApi.reset();
      realtimeApi.reset();
      setDashboardData(null);
      setFilters({
        timeRange: '30d',
        includeCharts: true,
        includeActivity: true,
        includeAlerts: true,
      });
    },
  };
} 