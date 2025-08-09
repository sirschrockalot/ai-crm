import React, { useState, useEffect, useCallback } from 'react';
import { Box, HStack, Text, VStack, Heading, useColorModeValue } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary, Loading } from '../../components/ui';
import { AnalyticsDashboard, AnalyticsNavigation } from '../../features/analytics';
import { useLeads } from '../../hooks/services/useLeads';
import { useBuyers } from '../../hooks/services/useBuyers';
import { useAnalytics } from '../../features/analytics/hooks/useAnalytics';

const AnalyticsPage: React.FC = () => {
  const { leads, loading: leadsLoading, fetchLeads, error: leadsError } = useLeads();
  const { buyers, loading: buyersLoading, fetchBuyers, error: buyersError } = useBuyers();
  const { loading: analyticsLoading, fetchAnalyticsData, error: analyticsError } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleTimeRangeChange = useCallback((range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLeads(), 
        fetchBuyers(),
        fetchAnalyticsData({ timeRange })
      ]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchLeads, fetchBuyers, fetchAnalyticsData, timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle errors
  const hasError = leadsError || buyersError || analyticsError;
  if (hasError) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <VStack spacing={4} align="center" justify="center" minH="400px">
              <Heading size="md" color="red.500">Error Loading Analytics</Heading>
              <Text color={textColor} textAlign="center">
                {leadsError && `Leads: ${leadsError}`}
                {buyersError && `Buyers: ${buyersError}`}
                {analyticsError && `Analytics: ${analyticsError}`}
              </Text>
            </VStack>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (loading || leadsLoading || buyersLoading || analyticsLoading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <VStack spacing={4} align="center" justify="center" minH="400px">
              <Loading size="lg" />
              <Text color={textColor}>Loading analytics data...</Text>
            </VStack>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg={bgColor}>
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <Box p={6}>
              <AnalyticsNavigation />
              <Box mt={6}>
                <AnalyticsDashboard
                  leads={leads || []}
                  buyers={buyers || []}
                  loading={loading}
                  timeRange={timeRange}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </Box>
            </Box>
          </Box>
        </HStack>
      </Box>
    </ErrorBoundary>
  );
};

export default AnalyticsPage; 