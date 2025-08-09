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
  NotificationCenter,
  QuickActions
} from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';

const DispositionDashboardPage: React.FC = () => {
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

  // Disposition-specific mock data
  const dispositionStats = {
    totalBuyers: 89,
    buyerGrowth: -2.1,
    dealConversionRate: 18.7,
    conversionGrowth: 3.2,
    averageDealValue: 125000,
    dealValueGrowth: 12.5,
    buyerEngagement: 76.3,
    engagementGrowth: 5.8,
    pipelineValue: 2500000,
    pipelineGrowth: 15.2,
    responseTime: 1.8,
    responseTimeGrowth: -0.5,
    dealCycleTime: 45,
    cycleTimeGrowth: -8.2,
  };

  const dispositionChartData = {
    dealPipeline: [
      { name: 'New Deals', value: 25, color: '#2196f3', percentage: 30 },
      { name: 'In Negotiation', value: 35, color: '#ff9800', percentage: 40 },
      { name: 'Under Contract', value: 15, color: '#4caf50', percentage: 20 },
      { name: 'Closed', value: 10, color: '#9c27b0', percentage: 10 },
    ],
    buyerPerformance: [
      { name: 'Active Buyers', value: 65, target: 60 },
      { name: 'New Buyers', value: 24, target: 20 },
      { name: 'Repeat Buyers', value: 41, target: 35 },
      { name: 'Inactive Buyers', value: 12, target: 15 },
    ],
    monthlyRevenue: [
      { name: 'Jan', value: 180000 },
      { name: 'Feb', value: 220000 },
      { name: 'Mar', value: 195000 },
      { name: 'Apr', value: 280000 },
      { name: 'May', value: 240000 },
      { name: 'Jun', value: 320000 },
    ],
  };

  const quickActions = [
    { name: 'Add New Buyer', action: 'add-buyer', icon: 'plus' },
    { name: 'Create Deal', action: 'create-deal', icon: 'handshake' },
    { name: 'Send Proposal', action: 'send-proposal', icon: 'mail' },
    { name: 'Generate Report', action: 'report', icon: 'chart' },
  ];

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest disposition data has been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh disposition dashboard data',
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
          <Text color="red.500">Error loading disposition dashboard: {error}</Text>
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
              Disposition Dashboard
            </Text>
            <Text fontSize="md" color="gray.600">
              Buyer management and deal disposition metrics for optimizing relationships
            </Text>
          </Box>

          {/* Quick Actions */}
          <QuickActions 
            actions={quickActions}
            variant="disposition"
          />

          {/* Disposition KPI Stats */}
          <DashboardStats 
            stats={dispositionStats}
            variant="disposition"
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />

          {/* Charts Grid */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Deal Pipeline Chart */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Deal Pipeline
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Current status</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={dispositionChartData.dealPipeline}
                type="doughnut"
                height={300}
              />
            </Box>

            {/* Buyer Performance */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Buyer Performance
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">vs. targets</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={dispositionChartData.buyerPerformance}
                type="bar"
                height={300}
                color="green"
              />
            </Box>
          </Box>

          {/* Monthly Revenue and Activity Feed */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Monthly Revenue */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Monthly Revenue
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Last 6 months</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={dispositionChartData.monthlyRevenue}
                type="line"
                height={300}
                color="blue"
              />
            </Box>

            {/* Activity Feed */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Deal Activity
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Recent updates</Text>
                </HStack>
              </HStack>
              <ActivityFeed 
                activities={dashboardData?.activities || []}
                variant="disposition"
              />
            </Box>
          </Box>

          {/* Notifications */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Disposition Notifications
              </Text>
            </HStack>
            <NotificationCenter 
              notifications={dashboardData?.notifications || []}
              variant="disposition"
            />
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default DispositionDashboardPage;
