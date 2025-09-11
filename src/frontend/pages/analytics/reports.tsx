import React, { useState, useEffect } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui';
import { CustomReports, AnalyticsErrorBoundary, AnalyticsLoading } from '../../features/analytics';
import { useAnalytics } from '../../features/analytics/hooks/useAnalytics';

const CustomReportsPage: React.FC = () => {
  const { loading, error, createCustomReport, exportAnalytics } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  };

  useEffect(() => {
    // Initialize reports data on mount
    // This would typically fetch existing reports
  }, []);

  if (loading && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <AnalyticsLoading variant="skeleton" message="Loading custom reports..." />
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
            <CustomReports
              timeRange={timeRange}
            />
          </Box>
        </HStack>
      </Box>
    </AnalyticsErrorBoundary>
  );
};

export default CustomReportsPage;
