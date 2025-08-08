import React, { useState, useEffect } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui';
import { AnalyticsDashboard } from '../../components/analytics';
import { useLeads } from '../../hooks/services/useLeads';
import { useBuyers } from '../../hooks/services/useBuyers';
import { useAnalytics } from '../../hooks/useAnalytics';

const AnalyticsPage: React.FC = () => {
  const { leads, loading: leadsLoading, fetchLeads } = useLeads();
  const { buyers, loading: buyersLoading, fetchBuyers } = useBuyers();
  const { loading: analyticsLoading, fetchAnalyticsData } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeads(), 
        fetchBuyers(),
        fetchAnalyticsData({ timeRange })
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchLeads, fetchBuyers, fetchAnalyticsData, timeRange]);

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Loading analytics...</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <AnalyticsDashboard
              leads={leads}
              buyers={buyers}
              loading={loading || leadsLoading || buyersLoading || analyticsLoading}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </Box>
        </HStack>
      </Box>
    </ErrorBoundary>
  );
};

export default AnalyticsPage; 