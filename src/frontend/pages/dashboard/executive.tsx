import React, { useEffect, useState, useCallback } from 'react';
import { VStack, HStack, Box, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { DashboardLayout } from '../../components/dashboard';
import { ErrorBoundary, Loading } from '../../components/ui';
import { 
  DashboardOverview, 
  DashboardCharts,
  DashboardStats,
  PerformanceCharts,
  ActivityFeed,
  NotificationCenter
} from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';

const ExecutiveDashboardPage: React.FC = () => {
  const {
    dashboardData,
    loading,
    error,
    isAuthenticated,
    user,
    fetchDashboardData,
    refreshDashboard,
    realtime,
  } = useDashboard();

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Executive-specific mock data
  const executiveStats = {
    totalRevenue: 1250000,
    revenueGrowth: 18.7,
    totalDeals: 156,
    dealGrowth: 12.3,
    averageDealValue: 8012,
    dealValueGrowth: 5.8,
    conversionRate: 15.2,
    conversionGrowth: 3.1,
    pipelineValue: 2500000,
    pipelineGrowth: 22.1,
    teamPerformance: 87.5,
    performanceGrowth: 4.2,
    leadQuality: 8.7,
    qualityGrowth: 1.5,
  };

  const executiveChartData = {
    revenueTrend: [
      { name: 'Jan', value: 850000 },
      { name: 'Feb', value: 920000 },
      { name: 'Mar', value: 880000 },
      { name: 'Apr', value: 1100000 },
      { name: 'May', value: 980000 },
      { name: 'Jun', value: 1250000 },
    ],
    dealFlow: [
      { name: 'New', value: 45, color: '#2196f3' },
      { name: 'Qualified', value: 32, color: '#ff9800' },
      { name: 'Negotiation', value: 28, color: '#4caf50' },
      { name: 'Closed', value: 15, color: '#9c27b0' },
    ],
    teamPerformance: [
      { name: 'Acquisitions', value: 92, target: 85 },
      { name: 'Disposition', value: 88, target: 80 },
      { name: 'Support', value: 95, target: 90 },
      { name: 'Management', value: 87, target: 85 },
    ],
  };

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest executive data has been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh executive dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [refreshDashboard, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorBoundary>
        <Box p={4}>
          <Text color="red.500">Error loading executive dashboard: {error}</Text>
        </Box>
      </ErrorBoundary>
    );
  }

  return (
    <DashboardLayout>
      <Box bg={bgColor} minH="100vh" p={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Executive Dashboard
            </Text>
            <Text fontSize="md" color="gray.600">
              High-level KPIs and business overview for strategic decision making
            </Text>
          </Box>

          {/* Executive KPI Stats */}
          <DashboardStats 
            stats={executiveStats}
            variant="executive"
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />

          {/* Charts Grid */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Revenue Trend Chart */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Revenue Trend
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Last 6 months</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={executiveChartData.revenueTrend}
                type="line"
                height={300}
                color="blue"
              />
            </Box>

            {/* Deal Flow Chart */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Deal Flow
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Current pipeline</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={executiveChartData.dealFlow}
                type="doughnut"
                height={300}
              />
            </Box>
          </Box>

          {/* Team Performance and Activity Feed */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            {/* Team Performance */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Team Performance
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">vs. targets</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={executiveChartData.teamPerformance}
                type="bar"
                height={300}
                color="green"
              />
            </Box>

            {/* Activity Feed */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Recent Activity
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Last 24 hours</Text>
                </HStack>
              </HStack>
              <ActivityFeed 
                activities={dashboardData?.activities || []}
                variant="executive"
              />
            </Box>
          </Box>

          {/* Notifications */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Executive Notifications
              </Text>
            </HStack>
            <NotificationCenter 
              notifications={dashboardData?.notifications || []}
              variant="executive"
            />
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default ExecutiveDashboardPage;
