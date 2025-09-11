import React, { useState, useEffect } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui';
import { PerformanceMetrics, AnalyticsErrorBoundary, AnalyticsLoading } from '../../features/analytics';
import { useAnalytics } from '../../features/analytics/hooks/useAnalytics';

const PerformanceAnalyticsPage: React.FC = () => {
  const { loading, error, fetchPerformanceMetrics } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  };

  const handleMetricSelect = (metric: string) => {
    console.log('Selected metric:', metric);
    // Handle metric selection logic
  };

  useEffect(() => {
    // Fetch performance metrics on mount
    fetchPerformanceMetrics({ timeRange });
  }, [fetchPerformanceMetrics, timeRange]);

  if (loading && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <AnalyticsLoading variant="skeleton" message="Loading performance analytics..." />
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <AnalyticsErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <PerformanceMetrics
              timeRange={timeRange}
              onMetricSelect={handleMetricSelect}
            />
          </Box>
        </HStack>
      </Box>
    </AnalyticsErrorBoundary>
  );
};

export default PerformanceAnalyticsPage;
