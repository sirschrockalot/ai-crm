import React, { useState, useEffect } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui';
import { TeamPerformance, AnalyticsErrorBoundary, AnalyticsLoading } from '../../features/analytics';
import { useAnalytics } from '../../features/analytics/hooks/useAnalytics';

const TeamPerformancePage: React.FC = () => {
  const { loading, error, fetchTeamPerformance } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    console.log('Selected team member:', memberId);
    // Handle team member selection logic
  };

  useEffect(() => {
    // Fetch team performance data on mount
    fetchTeamPerformance({ timeRange });
  }, [fetchTeamPerformance, timeRange]);

  if (loading && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <AnalyticsLoading variant="skeleton" message="Loading team performance analytics..." />
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
            <TeamPerformance
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              onMemberSelect={handleMemberSelect}
            />
          </Box>
        </HStack>
      </Box>
    </AnalyticsErrorBoundary>
  );
};

export default TeamPerformancePage;
