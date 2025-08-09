import { apiService } from './apiService';
import { 
  AnalyticsData, 
  AnalyticsFilters, 
  ExportOptions, 
  CustomReportConfig,
  AnalyticsMetrics,
  AnalyticsCharts,
  ChartDataPoint 
} from '../features/analytics/types/analytics';

class AnalyticsService {
  private baseUrl = '/api/analytics';

  /**
   * Fetch analytics dashboard data
   */
  async getDashboardData(filters?: AnalyticsFilters): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/dashboard${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Fetch performance metrics
   */
  async getPerformanceMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetrics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/performance${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Fetch chart data by type
   */
  async getChartData(chartType: string, filters?: AnalyticsFilters): Promise<ChartDataPoint[]> {
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
   * Fetch team performance data
   */
  async getTeamPerformance(filters?: AnalyticsFilters): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/team${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Fetch conversion data
   */
  async getConversionData(filters?: AnalyticsFilters): Promise<ChartDataPoint[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/conversions${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Export analytics data
   */
  async exportData(options: ExportOptions): Promise<Blob> {
    const response = await apiService.post(`${this.baseUrl}/export`, options, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Create custom report
   */
  async createCustomReport(config: CustomReportConfig): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/reports`, config);
    return response.data;
  }

  /**
   * Get custom reports list
   */
  async getCustomReports(): Promise<CustomReportConfig[]> {
    const response = await apiService.get(`${this.baseUrl}/reports`);
    return response.data;
  }

  /**
   * Update custom report
   */
  async updateCustomReport(reportId: string, config: Partial<CustomReportConfig>): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/reports/${reportId}`, config);
    return response.data;
  }

  /**
   * Delete custom report
   */
  async deleteCustomReport(reportId: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/reports/${reportId}`);
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<AnalyticsMetrics> {
    const response = await apiService.get(`${this.baseUrl}/realtime`);
    return response.data;
  }

  /**
   * Get analytics insights
   */
  async getInsights(filters?: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/insights${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Get analytics trends
   */
  async getTrends(filters?: AnalyticsFilters): Promise<ChartDataPoint[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiService.get(`${this.baseUrl}/trends${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
  }

  /**
   * Get analytics alerts
   */
  async getAlerts(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/alerts`);
    return response.data;
  }

  /**
   * Update analytics alert settings
   */
  async updateAlertSettings(settings: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/alerts/settings`, settings);
    return response.data;
  }

  /**
   * Get analytics dashboard configuration
   */
  async getDashboardConfig(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/dashboard/config`);
    return response.data;
  }

  /**
   * Update analytics dashboard configuration
   */
  async updateDashboardConfig(config: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/dashboard/config`, config);
    return response.data;
  }

  /**
   * Get analytics data cache status
   */
  async getCacheStatus(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/cache/status`);
    return response.data;
  }

  /**
   * Clear analytics data cache
   */
  async clearCache(): Promise<void> {
    await apiService.delete(`${this.baseUrl}/cache`);
  }

  /**
   * Refresh analytics data cache
   */
  async refreshCache(): Promise<void> {
    await apiService.post(`${this.baseUrl}/cache/refresh`);
  }

  /**
   * Get analytics data processing status
   */
  async getProcessingStatus(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/processing/status`);
    return response.data;
  }

  /**
   * Trigger analytics data processing
   */
  async triggerProcessing(): Promise<void> {
    await apiService.post(`${this.baseUrl}/processing/trigger`);
  }

  /**
   * Get analytics data quality metrics
   */
  async getDataQualityMetrics(): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/quality`);
    return response.data;
  }

  /**
   * Get analytics data sources
   */
  async getDataSources(): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/sources`);
    return response.data;
  }

  /**
   * Update analytics data source configuration
   */
  async updateDataSource(sourceId: string, config: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/sources/${sourceId}`, config);
    return response.data;
  }

  /**
   * Test analytics data source connection
   */
  async testDataSourceConnection(sourceId: string): Promise<any> {
    const response = await apiService.post(`${this.baseUrl}/sources/${sourceId}/test`);
    return response.data;
  }

  /**
   * Get analytics data source schema
   */
  async getDataSourceSchema(sourceId: string): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/sources/${sourceId}/schema`);
    return response.data;
  }

  /**
   * Get analytics data source preview
   */
  async getDataSourcePreview(sourceId: string, limit: number = 100): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/sources/${sourceId}/preview?limit=${limit}`);
    return response.data;
  }

  /**
   * Get analytics data source refresh history
   */
  async getDataSourceRefreshHistory(sourceId: string): Promise<any[]> {
    const response = await apiService.get(`${this.baseUrl}/sources/${sourceId}/history`);
    return response.data;
  }

  /**
   * Trigger analytics data source refresh
   */
  async triggerDataSourceRefresh(sourceId: string): Promise<void> {
    await apiService.post(`${this.baseUrl}/sources/${sourceId}/refresh`);
  }

  /**
   * Get analytics data source refresh schedule
   */
  async getDataSourceRefreshSchedule(sourceId: string): Promise<any> {
    const response = await apiService.get(`${this.baseUrl}/sources/${sourceId}/schedule`);
    return response.data;
  }

  /**
   * Update analytics data source refresh schedule
   */
  async updateDataSourceRefreshSchedule(sourceId: string, schedule: any): Promise<any> {
    const response = await apiService.put(`${this.baseUrl}/sources/${sourceId}/schedule`, schedule);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
