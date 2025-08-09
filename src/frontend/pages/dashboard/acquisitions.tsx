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
  RecentLeads,
  QuickActions
} from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';

const AcquisitionsDashboardPage: React.FC = () => {
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

  // Acquisitions-specific mock data
  const acquisitionsStats = {
    totalLeads: 234,
    leadGrowth: 23.6,
    conversionRate: 12.5,
    conversionGrowth: 5.2,
    averageLeadValue: 37000,
    leadValueGrowth: 8.1,
    responseTime: 2.5,
    responseTimeGrowth: -0.3,
    qualityScore: 8.2,
    qualityGrowth: 1.2,
    pipelineValue: 125000,
    pipelineGrowth: 15.7,
    followUpRate: 94.3,
    followUpGrowth: 2.1,
  };

  const acquisitionsChartData = {
    leadPipeline: [
      { name: 'New Leads', value: 45, color: '#2196f3', percentage: 35 },
      { name: 'Contacted', value: 32, color: '#ff9800', percentage: 25 },
      { name: 'Qualified', value: 28, color: '#4caf50', percentage: 22 },
      { name: 'Converted', value: 15, color: '#9c27b0', percentage: 18 },
    ],
    leadSourcePerformance: [
      { name: 'Direct Mail', value: 35, target: 30 },
      { name: 'Online Ads', value: 28, target: 25 },
      { name: 'Referrals', value: 42, target: 35 },
      { name: 'Cold Calls', value: 18, target: 20 },
    ],
    monthlyLeadGrowth: [
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 52 },
      { name: 'Mar', value: 48 },
      { name: 'Apr', value: 67 },
      { name: 'May', value: 58 },
      { name: 'Jun', value: 72 },
    ],
  };

  const recentLeadsData = [
    {
      id: '1',
      name: 'John Smith',
      address: '123 Main St, City, State',
      status: 'New',
      value: 45000,
      source: 'Direct Mail',
      lastContact: '2 hours ago',
      priority: 'high',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      address: '456 Oak Ave, City, State',
      status: 'Contacted',
      value: 38000,
      source: 'Online Ads',
      lastContact: '4 hours ago',
      priority: 'medium',
    },
    {
      id: '3',
      name: 'Mike Davis',
      address: '789 Pine Rd, City, State',
      status: 'Qualified',
      value: 52000,
      source: 'Referrals',
      lastContact: '1 day ago',
      priority: 'high',
    },
  ];

  const quickActions = [
    { name: 'Add New Lead', action: 'add-lead', icon: 'plus' },
    { name: 'Import Leads', action: 'import-leads', icon: 'upload' },
    { name: 'Send Follow-up', action: 'follow-up', icon: 'mail' },
    { name: 'Generate Report', action: 'report', icon: 'chart' },
  ];

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest acquisitions data has been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh acquisitions dashboard data',
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
          <Text color="red.500">Error loading acquisitions dashboard: {error}</Text>
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
              Acquisitions Dashboard
            </Text>
            <Text fontSize="md" color="gray.600">
              Lead management and acquisition metrics for optimizing your process
            </Text>
          </Box>

          {/* Quick Actions */}
          <QuickActions 
            actions={quickActions}
            variant="acquisitions"
          />

          {/* Acquisitions KPI Stats */}
          <DashboardStats 
            stats={acquisitionsStats}
            variant="acquisitions"
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />

          {/* Charts Grid */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Lead Pipeline Chart */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Lead Pipeline
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Current status</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={acquisitionsChartData.leadPipeline}
                type="doughnut"
                height={300}
              />
            </Box>

            {/* Lead Source Performance */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Lead Source Performance
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">vs. targets</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={acquisitionsChartData.leadSourcePerformance}
                type="bar"
                height={300}
                color="blue"
              />
            </Box>
          </Box>

          {/* Monthly Growth and Recent Leads */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Monthly Lead Growth */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Monthly Lead Growth
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Last 6 months</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={acquisitionsChartData.monthlyLeadGrowth}
                type="line"
                height={300}
                color="green"
              />
            </Box>

            {/* Recent Leads */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Recent Leads
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Latest additions</Text>
                </HStack>
              </HStack>
              <RecentLeads 
                leads={recentLeadsData}
                variant="acquisitions"
              />
            </Box>
          </Box>

          {/* Activity Feed and Notifications */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            {/* Activity Feed */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Lead Activity
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Recent updates</Text>
                </HStack>
              </HStack>
              <ActivityFeed 
                activities={dashboardData?.activities || []}
                variant="acquisitions"
              />
            </Box>

            {/* Notifications */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Acquisitions Notifications
                </Text>
              </HStack>
              <NotificationCenter 
                notifications={dashboardData?.notifications || []}
                variant="acquisitions"
              />
            </Box>
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default AcquisitionsDashboardPage;
