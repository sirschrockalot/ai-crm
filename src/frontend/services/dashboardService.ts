import { apiService } from './apiService';
import { 
  DashboardData, 
  DashboardStats, 
  ChartData, 
  ActivityItem, 
  AlertItem,
  DashboardFilters 
} from '../hooks/useDashboard';

class DashboardService {
  private baseUrl = '/api/dashboard';

  /**
   * Fetch dashboard data
   */
  async getDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Fetch real-time dashboard stats
   */
  async getRealTimeStats(): Promise<DashboardStats> {
    const response = await apiService.get(`${this.baseUrl}/realtime`);
    return response.data;
  }

  /**
   * Fetch dashboard charts data
   */
  async getChartsData(chartType: string, filters?: DashboardFilters): Promise<ChartData[]> {
    const params = new URLSearchParams();
    params.append('chartType', chartType);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/charts?${params.toString()}`);
    return response.data;
  }

  /**
   * Fetch recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const response = await apiService.get(`${this.baseUrl}/activity?limit=${limit}`);
    return response.data;
  }

  /**
   * Fetch dashboard alerts
   */
  async getAlerts(): Promise<AlertItem[]> {
    const response = await apiService.get(`${this.baseUrl}/alerts`);
    return response.data;
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    await apiService.put(`${this.baseUrl}/alerts/${alertId}/read`);
  }

  /**
   * Mark all alerts as read
   */
  async markAllAlertsAsRead(): Promise<void> {
    await apiService.put(`${this.baseUrl}/alerts/read-all`);
  }

  /**
   * Get dashboard configuration
   */
  async getDashboardConfig(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/config`);
    return response.data;
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(config: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/config`, config);
    return response.data;
  }

  /**
   * Get dashboard widgets
   */
  async getWidgets(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/widgets`);
    return response.data;
  }

  /**
   * Update widget configuration
   */
  async updateWidget(widgetId: string, config: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/widgets/${widgetId}`, config);
    return response.data;
  }

  /**
   * Add new widget
   */
  async addWidget(config: any): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/widgets`, config);
    return response.data;
  }

  /**
   * Remove widget
   */
  async removeWidget(widgetId: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/widgets/${widgetId}`);
  }

  /**
   * Get dashboard layout
   */
  async getLayout(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/layout`);
    return response.data;
  }

  /**
   * Update dashboard layout
   */
  async updateLayout(layout: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/layout`, layout);
    return response.data;
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(format: 'pdf' | 'csv' | 'excel', filters?: DashboardFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get dashboard insights
   */
  async getInsights(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/insights`);
    return response.data;
  }

  /**
   * Get dashboard trends
   */
  async getTrends(timeRange: string = '30d'): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/trends?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get dashboard performance metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/performance`);
    return response.data;
  }

  /**
   * Get dashboard notifications
   */
  async getNotifications(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/notifications`);
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiService.put(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  /**
   * Get dashboard shortcuts
   */
  async getShortcuts(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/shortcuts`);
    return response.data;
  }

  /**
   * Add dashboard shortcut
   */
  async addShortcut(shortcut: any): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/shortcuts`, shortcut);
    return response.data;
  }

  /**
   * Remove dashboard shortcut
   */
  async removeShortcut(shortcutId: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/shortcuts/${shortcutId}`);
  }

  /**
   * Get dashboard themes
   */
  async getThemes(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/themes`);
    return response.data;
  }

  /**
   * Apply dashboard theme
   */
  async applyTheme(themeId: string): Promise<void> {
    await apiService.put(`${this.baseUrl}/themes/${themeId}/apply`);
  }

  /**
   * Get dashboard preferences
   */
  async getPreferences(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/preferences`);
    return response.data;
  }

  /**
   * Update dashboard preferences
   */
  async updatePreferences(preferences: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/preferences`, preferences);
    return response.data;
  }

  /**
   * Get dashboard help content
   */
  async getHelpContent(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/help`);
    return response.data;
  }

  /**
   * Search dashboard content
   */
  async searchContent(query: string): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Get dashboard analytics
   */
  async getAnalytics(timeRange: string = '30d'): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/analytics?timeRange=${timeRange}`);
    return response.data;
  }

  /**
   * Get dashboard reports
   */
  async getReports(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/reports`);
    return response.data;
  }

  /**
   * Generate dashboard report
   */
  async generateReport(reportType: string, filters?: DashboardFilters): Promise<any> {
    const params = new URLSearchParams();
    params.append('type', reportType);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.post(`${this.baseUrl}/reports/generate?${params.toString()}`);
    return response.data;
  }

  /**
   * Get dashboard data sources
   */
  async getDataSources(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/data-sources`);
    return response.data;
  }

  /**
   * Test data source connection
   */
  async testDataSourceConnection(sourceId: string): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/data-sources/${sourceId}/test`);
    return response.data;
  }

  /**
   * Refresh dashboard data
   */
  async refreshData(): Promise<void> {
    await apiService.post(`${this.baseUrl}/refresh`);
  }

  /**
   * Get dashboard cache status
   */
  async getCacheStatus(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/cache/status`);
    return response.data;
  }

  /**
   * Clear dashboard cache
   */
  async clearCache(): Promise<void> {
    await apiService.delete(`${this.baseUrl}/cache`);
  }

  /**
   * Get dashboard system status
   */
  async getSystemStatus(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/system/status`);
    return response.data;
  }

  /**
   * Get dashboard health check
   */
  async getHealthCheck(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/health`);
    return response.data;
  }
}

export const dashboardService = new DashboardService();
