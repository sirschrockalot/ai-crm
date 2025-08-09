import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  Select,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Card, Chart, ErrorBoundary, Loading } from '../../../components/ui';
import { useAnalytics } from '../hooks/useAnalytics';
import { useLeads } from '../../../hooks/services/useLeads';
import { useBuyers } from '../../../hooks/services/useBuyers';
import {
  AnalyticsFilters,
  LeadStatus,
  PropertyType,
  BuyerType,
  ChartConfig,
  ChartDataPoint,
  TeamPerformanceData,
} from '../types/analytics';

interface AnalyticsDashboardProps {
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  timeRange = '30d',
  onTimeRangeChange,
}) => {
  const toast = useToast();
  const {
    analyticsData,
    loading,
    error,
    isAuthenticated,
    fetchAnalyticsData,
    updateFilters,
    exportAnalytics,
  } = useAnalytics();
  const { leads } = useLeads();
  const { buyers } = useBuyers();

  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: timeRange as '7d' | '30d' | '90d' | '1y',
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access analytics features.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Fetch analytics data on mount
    fetchAnalyticsData(filters);
  }, [fetchAnalyticsData, filters, isAuthenticated, toast]);

  // Update filters when timeRange changes
  useEffect(() => {
    if (timeRange && timeRange !== filters.timeRange) {
      const newFilters = { ...filters, timeRange: timeRange as '7d' | '30d' | '90d' | '1y' };
      setFilters(newFilters);
      updateFilters(newFilters);
    }
  }, [timeRange, filters, updateFilters]);

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      const newFilters = { ...filters, timeRange: range as '7d' | '30d' | '90d' | '1y' };
      setFilters(newFilters);
      updateFilters(newFilters);
      onTimeRangeChange?.(range);
    }
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      await exportAnalytics({
        format,
        includeCharts: true,
        includeMetrics: true,
        filters,
      });
      toast({
        title: 'Export successful',
        description: `Analytics data has been exported as ${format.toUpperCase()}.`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export analytics',
        status: 'error',
      });
    }
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access analytics features.
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
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Use analytics data if available, otherwise fall back to leads/buyers data
  const data = analyticsData || {
    leads,
    buyers,
    metrics: {
      totalLeads: leads.length,
      totalBuyers: buyers.length,
      conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0,
      averageLeadValue: leads.length > 0 ? (leads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / leads.length) : 0,
      totalPipelineValue: leads.reduce((sum, lead) => sum + lead.estimatedValue, 0),
      activeBuyers: buyers.filter(b => b.isActive).length,
      monthlyGrowth: 0,
      averageResponseTime: 0,
    },
    charts: {
      leadStatusDistribution: [
        { name: 'New', value: leads.filter(l => l.status === 'new').length },
        { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
        { name: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
        { name: 'Converted', value: leads.filter(l => l.status === 'converted').length },
        { name: 'Lost', value: leads.filter(l => l.status === 'lost').length },
      ],
      propertyTypeDistribution: [
        { name: 'Single Family', value: leads.filter(l => l.propertyType === 'single_family').length },
        { name: 'Multi Family', value: leads.filter(l => l.propertyType === 'multi_family').length },
        { name: 'Commercial', value: leads.filter(l => l.propertyType === 'commercial').length },
        { name: 'Land', value: leads.filter(l => l.propertyType === 'land').length },
      ],
      buyerTypeDistribution: [
        { name: 'Individual', value: buyers.filter(b => b.buyerType === 'individual').length },
        { name: 'Company', value: buyers.filter(b => b.buyerType === 'company').length },
        { name: 'Investor', value: buyers.filter(b => b.buyerType === 'investor').length },
      ],
      monthlyLeadGrowth: [] as ChartDataPoint[],
      conversionRateOverTime: [] as ChartDataPoint[],
      teamPerformance: [] as TeamPerformanceData[],
      revenueByMonth: [] as ChartDataPoint[],
    },
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return '#3182CE';
      case 'contacted': return '#D69E2E';
      case 'qualified': return '#38A169';
      case 'converted': return '#805AD5';
      case 'lost': return '#E53E3E';
      default: return '#718096';
    }
  };

  const getPropertyTypeColor = (type: PropertyType) => {
    switch (type) {
      case 'single_family': return '#3182CE';
      case 'multi_family': return '#38A169';
      case 'commercial': return '#D69E2E';
      case 'land': return '#805AD5';
      default: return '#718096';
    }
  };

  const getBuyerTypeColor = (type: BuyerType) => {
    switch (type) {
      case 'individual': return '#3182CE';
      case 'company': return '#38A169';
      case 'investor': return '#D69E2E';
      default: return '#718096';
    }
  };

  return (
    <ErrorBoundary>
      <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Analytics Dashboard</Heading>
            <Text color="gray.600">
              {data.metrics.totalLeads} leads • {data.metrics.conversionRate.toFixed(1)}% conversion rate
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Select
              value={filters.timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              maxW="150px"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </Select>
            <Select
              placeholder="Export Format"
              onChange={(e) => {
                if (e.target.value) {
                  handleExport(e.target.value as 'pdf' | 'csv' | 'excel');
                }
              }}
              maxW="120px"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </Select>
          </HStack>
        </HStack>

        {/* Key Metrics */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Total Leads</Text>
              <Text fontSize="2xl" fontWeight="bold">{data.metrics.totalLeads}</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Conversion Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">{data.metrics.conversionRate.toFixed(1)}%</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Avg Lead Value</Text>
              <Text fontSize="2xl" fontWeight="bold">${data.metrics.averageLeadValue.toLocaleString()}</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Pipeline Value</Text>
              <Text fontSize="2xl" fontWeight="bold">${data.metrics.totalPipelineValue.toLocaleString()}</Text>
            </VStack>
          </Card>
        </Grid>

        {/* Charts Grid */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Lead Status Distribution */}
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Lead Status Distribution</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type="pie"
                  data={data.charts.leadStatusDistribution}
                  colors={data.charts.leadStatusDistribution.map(item => getStatusColor(item.name.toLowerCase() as LeadStatus))}
                  showLegend={true}
                />
              )}
            </VStack>
          </Card>

          {/* Property Type Distribution */}
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Property Type Distribution</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type="pie"
                  data={data.charts.propertyTypeDistribution}
                  colors={data.charts.propertyTypeDistribution.map(item => getPropertyTypeColor(item.name.toLowerCase().replace(' ', '_') as PropertyType))}
                  showLegend={true}
                />
              )}
            </VStack>
          </Card>

          {/* Buyer Type Distribution */}
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Buyer Type Distribution</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type="bar"
                  data={data.charts.buyerTypeDistribution}
                  colors={data.charts.buyerTypeDistribution.map(item => getBuyerTypeColor(item.name.toLowerCase() as BuyerType))}
                  showGrid={true}
                />
              )}
            </VStack>
          </Card>

          {/* Monthly Lead Growth */}
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Monthly Lead Growth</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type="line"
                  data={data.charts.monthlyLeadGrowth.length > 0 ? data.charts.monthlyLeadGrowth : [
                    { name: 'Jan', value: 45 },
                    { name: 'Feb', value: 52 },
                    { name: 'Mar', value: 48 },
                    { name: 'Apr', value: 67 },
                    { name: 'May', value: 73 },
                    { name: 'Jun', value: 89 },
                  ]}
                  showGrid={true}
                />
              )}
            </VStack>
          </Card>
        </Grid>
      </VStack>
    </ErrorBoundary>
  );
};
