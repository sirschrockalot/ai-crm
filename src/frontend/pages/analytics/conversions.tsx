import React, { useState, useEffect } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui';
import { ConversionCharts, AnalyticsErrorBoundary, AnalyticsLoading } from '../../features/analytics';
import { useAnalytics } from '../../features/analytics/hooks/useAnalytics';

const ConversionAnalyticsPage: React.FC = () => {
  const { loading, error, fetchConversionData } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  };

  const handleSegmentClick = (segment: string) => {
    console.log('Selected segment:', segment);
    // Handle segment selection logic
  };

  useEffect(() => {
    // Fetch conversion data on mount
    fetchConversionData({ timeRange });
  }, [fetchConversionData, timeRange]);

  if (loading && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <AnalyticsLoading variant="skeleton" message="Loading conversion analytics..." />
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
            <ConversionCharts
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              onSegmentClick={handleSegmentClick}
            />
          </Box>
        </HStack>
      </Box>
    </AnalyticsErrorBoundary>
  );
};

export default ConversionAnalyticsPage;
