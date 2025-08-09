import { ChartDataPoint, AnalyticsData, AnalyticsMetrics, AnalyticsCharts } from '../types/analytics';

// Data transformation utilities
export const transformChartData = (rawData: any[]): ChartDataPoint[] => {
  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((item, index) => ({
    label: item.label || item.name || `Item ${index + 1}`,
    value: Number(item.value || item.count || 0),
    color: item.color || undefined,
    metadata: item.metadata || {},
  }));
};

export const aggregateDataByField = (data: any[], field: string, valueField: string = 'value') => {
  const aggregated = data.reduce((acc, item) => {
    const key = item[field];
    if (key) {
      acc[key] = (acc[key] || 0) + Number(item[valueField] || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(aggregated).map(([label, value]) => ({
    label,
    value,
  }));
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', options).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Time series data processing
export const processTimeSeriesData = (data: any[], timeField: string, valueField: string) => {
  return data
    .map(item => ({
      label: new Date(item[timeField]).toLocaleDateString(),
      value: Number(item[valueField] || 0),
      timestamp: new Date(item[timeField]).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
};

// Funnel data processing
export const processFunnelData = (data: any[]): ChartDataPoint[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  
  return data.map((item, index) => ({
    label: item.label || `Step ${index + 1}`,
    value: Number(item.value || 0),
    percentage: calculatePercentage(Number(item.value || 0), total),
    metadata: {
      step: index + 1,
      conversionRate: index > 0 ? calculatePercentage(Number(item.value || 0), data[index - 1]?.value || 0) : 100,
    },
  }));
};

// Performance metrics processing
export const processPerformanceMetrics = (data: AnalyticsMetrics): AnalyticsMetrics => {
  if (!data) return data;

  return {
    ...data,
    metrics: data.metrics?.map(metric => ({
      ...metric,
      formattedValue: formatNumber(metric.value),
      trend: metric.trend || 'neutral',
      changePercentage: metric.change ? formatPercentage(metric.change) : undefined,
    })),
    trends: data.trends?.map(trend => ({
      ...trend,
      formattedValue: formatNumber(trend.value),
      formattedChange: trend.change ? formatPercentage(trend.change) : undefined,
    })),
  };
};

// Team performance processing
export const processTeamPerformance = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];

  return data.map(member => ({
    ...member,
    performance: {
      ...member.performance,
      conversionRate: formatPercentage(member.performance?.conversionRate || 0),
      revenue: formatCurrency(member.performance?.revenue || 0),
      leads: formatNumber(member.performance?.leads || 0),
    },
    metrics: member.metrics?.map((metric: any) => ({
      ...metric,
      formattedValue: formatNumber(metric.value),
      formattedChange: metric.change ? formatPercentage(metric.change) : undefined,
    })),
  }));
};

// Data validation utilities
export const validateAnalyticsData = (data: any): boolean => {
  if (!data) return false;
  
  // Check if data has required structure
  if (typeof data !== 'object') return false;
  
  // Add more specific validation as needed
  return true;
};

export const sanitizeAnalyticsData = (data: any): any => {
  if (!data) return null;

  // Remove sensitive information
  const sanitized = { ...data };
  
  // Remove user-specific sensitive data
  if (sanitized.users) {
    sanitized.users = sanitized.users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email ? `${user.email.split('@')[0]}@***` : undefined,
      // Remove other sensitive fields
    }));
  }

  return sanitized;
};

// Caching utilities
export const createDataCacheKey = (endpoint: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${endpoint}:${sortedParams}`;
};

export const isDataStale = (timestamp: number, maxAge: number = 5 * 60 * 1000): boolean => {
  return Date.now() - timestamp > maxAge;
};

// Real-time data processing
export const processRealTimeData = (data: any): any => {
  if (!data) return null;

  return {
    ...data,
    timestamp: new Date().toISOString(),
    processedAt: Date.now(),
  };
};

// Export data formatting
export const formatDataForExport = (data: any, format: 'csv' | 'json' | 'xlsx' = 'csv'): string | object => {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'csv':
      return convertToCSV(data);
    
    case 'xlsx':
      return data; // Return as-is for xlsx processing
    
    default:
      return data;
  }
};

const convertToCSV = (data: any): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    ),
  ];

  return csvRows.join('\n');
};

// Data comparison utilities
export const compareDataSets = (current: any[], previous: any[], keyField: string = 'id'): any[] => {
  const currentMap = new Map(current.map(item => [item[keyField], item]));
  const previousMap = new Map(previous.map(item => [item[keyField], item]));

  return current.map(item => {
    const previousItem = previousMap.get(item[keyField]);
    const change = previousItem ? item.value - previousItem.value : 0;
    const changePercentage = previousItem && previousItem.value !== 0 
      ? calculatePercentage(change, previousItem.value)
      : 0;

    return {
      ...item,
      change,
      changePercentage,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  });
};

// Performance optimization utilities
export const memoizeDataProcessing = <T extends any[], R>(
  fn: (...args: T) => R,
  getKey: (...args: T) => string
) => {
  const cache = new Map<string, R>();

  return (...args: T): R => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Data filtering utilities
export const filterDataByDateRange = (
  data: any[],
  startDate: Date,
  endDate: Date,
  dateField: string = 'date'
): any[] => {
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

export const filterDataByValue = (
  data: any[],
  field: string,
  value: any,
  operator: 'equals' | 'contains' | 'greater' | 'less' = 'equals'
): any[] => {
  return data.filter(item => {
    const itemValue = item[field];
    
    switch (operator) {
      case 'equals':
        return itemValue === value;
      case 'contains':
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      case 'greater':
        return Number(itemValue) > Number(value);
      case 'less':
        return Number(itemValue) < Number(value);
      default:
        return itemValue === value;
    }
  });
};
