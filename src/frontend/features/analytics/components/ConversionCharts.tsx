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

interface ConversionChartsProps {
  timeRange?: string;
  onSegmentClick?: (segment: string) => void;
}

export const ConversionCharts: React.FC<ConversionChartsProps> = ({
  timeRange = '30d',
  onSegmentClick,
}) => {
  const toast = useToast();
  const {
    analyticsData,
    loading,
    error,
    isAuthenticated,
    fetchAnalyticsData,
    updateFilters,
  } = useAnalytics();

  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: timeRange as '7d' | '30d' | '90d' | '1y',
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access conversion charts.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Fetch conversion data on mount
    fetchAnalyticsData(filters);
  }, [fetchAnalyticsData, filters, isAuthenticated, toast]);

  // Handle segment selection
  const handleSegmentClick = (segment: string) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment);
  };

  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    if (type === 'bar' || type === 'pie' || type === 'line') {
      setChartType(type as 'bar' | 'pie' | 'line');
    }
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access conversion charts.
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
        <AlertTitle>Error Loading Conversion Charts</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Mock conversion data (in real app, this would come from analyticsData)
  const funnelData: ChartDataPoint[] = [
    { name: 'Leads Generated', value: 1000, percentage: 100 },
    { name: 'Contacted', value: 750, percentage: 75 },
    { name: 'Qualified', value: 500, percentage: 50 },
    { name: 'Proposals Sent', value: 300, percentage: 30 },
    { name: 'Negotiations', value: 200, percentage: 20 },
    { name: 'Closed Won', value: 150, percentage: 15 },
  ];

  const conversionRateData: ChartDataPoint[] = [
    { name: 'Website', value: 25.5 },
    { name: 'Referral', value: 18.2 },
    { name: 'Social Media', value: 12.8 },
    { name: 'Cold Call', value: 8.5 },
    { name: 'Email Campaign', value: 15.3 },
  ];

  const monthlyConversionData: ChartDataPoint[] = [
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

  const getChartData = (): ChartDataPoint[] => {
    switch (chartType) {
      case 'line':
        return funnelData;
      case 'pie':
        return conversionRateData;
      case 'bar':
        return monthlyConversionData;
      default:
        return funnelData;
    }
  };

  const getChartTitle = (): string => {
    switch (chartType) {
      case 'line':
        return 'Conversion Funnel';
      case 'pie':
        return 'Conversion Rate by Source';
      case 'bar':
        return 'Monthly Conversion Rate';
      default:
        return 'Conversion Charts';
    }
  };

  const getYAxisLabel = (): string => {
    switch (chartType) {
      case 'line':
        return 'Number of Leads';
      case 'pie':
        return 'Conversion Rate (%)';
      case 'bar':
        return 'Conversion Rate (%)';
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
            <Heading size="lg">Conversion Charts</Heading>
            <Text color="gray.600">
              Track conversion rates and funnel performance
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Select
              value={chartType}
              onChange={(e) => handleChartTypeChange(e.target.value)}
              maxW="120px"
            >
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="line">Line</option>
            </Select>
          </HStack>
        </HStack>

        {/* Chart */}
        <Card>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">{getChartTitle()}</Heading>
            {loading ? (
              <Loading variant="skeleton" />
            ) : (
              <Chart
                type={chartType}
                data={getChartData()}
                title={getChartTitle()}
                showGrid={chartType === 'bar'}
                showLegend={chartType === 'pie'}
                colors={chartType === 'pie' ? ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5'] : ['#3182CE']}
              />
            )}
          </VStack>
        </Card>

        {/* Conversion Metrics */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Overall Conversion Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">22.8%</Text>
              <Text fontSize="sm" color="green.500">+1.3% from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Funnel Drop-off Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">15.2%</Text>
              <Text fontSize="sm" color="red.500">+0.8% from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Avg Time to Convert</Text>
              <Text fontSize="2xl" fontWeight="bold">18.5 days</Text>
              <Text fontSize="sm" color="green.500">-2.1 days from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Conversion Value</Text>
              <Text fontSize="2xl" fontWeight="bold">$45.2K</Text>
              <Text fontSize="sm" color="green.500">+$3.1K from last month</Text>
            </VStack>
          </Card>
        </Grid>

        {/* Segment Breakdown */}
        <Card>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Conversion by Segment</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              {[
                { name: 'Website', rate: 25.5, change: 2.1 },
                { name: 'Referral', rate: 18.2, change: -0.8 },
                { name: 'Social Media', rate: 12.8, change: 1.5 },
                { name: 'Cold Call', rate: 8.5, change: -1.2 },
              ].map((segment) => (
                <HStack key={segment.name} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">{segment.name}</Text>
                    <Text fontSize="sm" color="gray.500">{segment.rate}% conversion rate</Text>
                  </VStack>
                  <Text
                    fontSize="sm"
                    color={segment.change >= 0 ? 'green.500' : 'red.500'}
                  >
                    {segment.change >= 0 ? '+' : ''}{segment.change}%
                  </Text>
                </HStack>
              ))}
            </Grid>
          </VStack>
        </Card>
      </VStack>
    </ErrorBoundary>
  );
};
