import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Select,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
} from '@chakra-ui/react';
import { Card, Chart, ErrorBoundary, Loading } from '../../../components/ui';
import { useAnalytics } from '../hooks/useAnalytics';
import { AnalyticsFilters, ChartDataPoint } from '../types/analytics';

interface PerformanceMetricsProps {
  timeRange?: string;
  onMetricSelect?: (metric: string) => void;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  timeRange = '30d',
  onMetricSelect,
}) => {
  const toast = useToast();
  const {
    analyticsData,
    loading,
    error,
    isAuthenticated,
    fetchPerformanceMetrics,
    updateFilters,
  } = useAnalytics();

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['conversionRate', 'leadGrowth']);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: timeRange as '7d' | '30d' | '90d' | '1y',
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access performance metrics.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Fetch performance metrics on mount
    fetchPerformanceMetrics(filters);
  }, [fetchPerformanceMetrics, filters, isAuthenticated, toast]);

  // Handle metric selection
  const handleMetricSelect = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
    onMetricSelect?.(metric);
  };

  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    if (type === 'line' || type === 'bar' || type === 'area') {
      setChartType(type);
    }
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access performance metrics.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (loading && !analyticsData) {
    return <Loading variant="spinner" size="lg" />;
  }

  // Show error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Performance Metrics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Mock performance data (in real app, this would come from analyticsData)
  const performanceData: ChartDataPoint[] = [
    { name: 'Jan', value: 12.5 },
    { name: 'Feb', value: 14.2 },
    { name: 'Mar', value: 13.8 },
    { name: 'Apr', value: 16.1 },
    { name: 'May', value: 15.7 },
    { name: 'Jun', value: 18.3 },
    { name: 'Jul', value: 17.9 },
    { name: 'Aug', value: 19.2 },
    { name: 'Sep', value: 18.7 },
    { name: 'Oct', value: 20.1 },
    { name: 'Nov', value: 21.5 },
    { name: 'Dec', value: 22.8 },
  ];

  const leadGrowthData: ChartDataPoint[] = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 67 },
    { name: 'May', value: 73 },
    { name: 'Jun', value: 89 },
    { name: 'Jul', value: 95 },
    { name: 'Aug', value: 102 },
    { name: 'Sep', value: 87 },
    { name: 'Oct', value: 113 },
    { name: 'Nov', value: 128 },
    { name: 'Dec', value: 145 },
  ];

  const revenueData: ChartDataPoint[] = [
    { name: 'Jan', value: 125000 },
    { name: 'Feb', value: 142000 },
    { name: 'Mar', value: 138000 },
    { name: 'Apr', value: 161000 },
    { name: 'May', value: 157000 },
    { name: 'Jun', value: 183000 },
    { name: 'Jul', value: 179000 },
    { name: 'Aug', value: 192000 },
    { name: 'Sep', value: 187000 },
    { name: 'Oct', value: 201000 },
    { name: 'Nov', value: 215000 },
    { name: 'Dec', value: 228000 },
  ];

  const getChartData = (metric: string): ChartDataPoint[] => {
    switch (metric) {
      case 'conversionRate':
        return performanceData;
      case 'leadGrowth':
        return leadGrowthData;
      case 'revenue':
        return revenueData;
      default:
        return performanceData;
    }
  };

  const getChartTitle = (metric: string): string => {
    switch (metric) {
      case 'conversionRate':
        return 'Conversion Rate Over Time';
      case 'leadGrowth':
        return 'Lead Growth';
      case 'revenue':
        return 'Revenue Growth';
      default:
        return 'Performance Metrics';
    }
  };

  const getYAxisLabel = (metric: string): string => {
    switch (metric) {
      case 'conversionRate':
        return 'Conversion Rate (%)';
      case 'leadGrowth':
        return 'Number of Leads';
      case 'revenue':
        return 'Revenue ($)';
      default:
        return 'Value';
    }
  };

  return (
    <ErrorBoundary>
      <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Performance Metrics</Heading>
            <Text color="gray.600">
              Track key performance indicators over time
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Select
              value={chartType}
              onChange={(e) => handleChartTypeChange(e.target.value)}
              maxW="120px"
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="area">Area</option>
            </Select>
          </HStack>
        </HStack>

        {/* Metric Selection */}
        <Card>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Select Metrics</Heading>
            <HStack spacing={4} wrap="wrap">
              {[
                { key: 'conversionRate', label: 'Conversion Rate' },
                { key: 'leadGrowth', label: 'Lead Growth' },
                { key: 'revenue', label: 'Revenue' },
              ].map((metric) => (
                <Select
                  key={metric.key}
                  value={selectedMetrics.includes(metric.key) ? 'selected' : ''}
                  onChange={() => handleMetricSelect(metric.key)}
                  maxW="150px"
                >
                  <option value="">{metric.label}</option>
                  <option value="selected">✓ {metric.label}</option>
                </Select>
              ))}
            </HStack>
          </VStack>
        </Card>

        {/* Charts */}
        {selectedMetrics.map((metric) => (
          <Card key={metric}>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">{getChartTitle(metric)}</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type={chartType}
                  data={getChartData(metric)}
                  options={{
                    title: getChartTitle(metric),
                    xAxisLabel: 'Month',
                    yAxisLabel: getYAxisLabel(metric),
                    showGrid: true,
                    animate: true,
                    colors: ['#3182CE'],
                  }}
                />
              )}
            </VStack>
          </Card>
        ))}

        {/* Summary Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Current Conversion Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">22.8%</Text>
              <Text fontSize="sm" color="green.500">+1.3% from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Total Leads This Month</Text>
              <Text fontSize="2xl" fontWeight="bold">145</Text>
              <Text fontSize="sm" color="green.500">+17 from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Monthly Revenue</Text>
              <Text fontSize="2xl" fontWeight="bold">$228K</Text>
              <Text fontSize="sm" color="green.500">+13K from last month</Text>
            </VStack>
          </Card>
        </Grid>
      </VStack>
    </ErrorBoundary>
  );
};
