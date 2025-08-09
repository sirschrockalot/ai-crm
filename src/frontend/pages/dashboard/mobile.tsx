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

const MobileDashboardPage: React.FC = () => {
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

  // Mobile-specific mock data
  const mobileStats = {
    todayLeads: 12,
    leadGrowth: 15.2,
    todayTasks: 8,
    taskGrowth: 8.7,
    responseTime: 1.5,
    responseTimeGrowth: -0.2,
    qualityScore: 8.8,
    qualityGrowth: 1.5,
    locationUpdates: 5,
    locationGrowth: 12.3,
    photosUploaded: 23,
    photoGrowth: 18.7,
  };

  const mobileChartData = {
    todayActivity: [
      { name: 'Leads', value: 12, color: '#2196f3' },
      { name: 'Tasks', value: 8, color: '#ff9800' },
      { name: 'Photos', value: 23, color: '#4caf50' },
      { name: 'Updates', value: 5, color: '#9c27b0' },
    ],
    weeklyProgress: [
      { name: 'Mon', value: 85 },
      { name: 'Tue', value: 92 },
      { name: 'Wed', value: 88 },
      { name: 'Thu', value: 95 },
      { name: 'Fri', value: 90 },
    ],
  };

  const quickActions = [
    { name: 'Add Lead', action: 'add-lead', icon: 'plus' },
    { name: 'Take Photo', action: 'take-photo', icon: 'camera' },
    { name: 'Update Location', action: 'update-location', icon: 'location' },
    { name: 'Log Activity', action: 'log-activity', icon: 'edit' },
  ];

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest mobile data has been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh mobile dashboard data',
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
          <Text color="red.500">Error loading mobile dashboard: {error}</Text>
        </Box>
      </ErrorBoundary>
    );
  }

  return (
    <DashboardLayout>
      <Box bg={bgColor} minH="100vh" p={4}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Mobile Dashboard
            </Text>
            <Text fontSize="sm" color="gray.600">
              Quick access to key information while on the go
            </Text>
          </Box>

          {/* Quick Actions */}
          <QuickActions 
            actions={quickActions}
            variant="mobile"
          />

          {/* Mobile KPI Stats */}
          <DashboardStats 
            stats={mobileStats}
            variant="mobile"
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />

          {/* Today's Activity */}
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Today's Activity
              </Text>
              <Text fontSize="sm" color="gray.500">Summary</Text>
            </HStack>
            <PerformanceCharts 
              data={mobileChartData.todayActivity}
              type="doughnut"
              height={200}
            />
          </Box>

          {/* Weekly Progress */}
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Weekly Progress
              </Text>
              <Text fontSize="sm" color="gray.500">Performance</Text>
            </HStack>
            <PerformanceCharts 
              data={mobileChartData.weeklyProgress}
              type="line"
              height={200}
              color="green"
            />
          </Box>

          {/* Recent Activity */}
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Recent Activity
              </Text>
              <Text fontSize="sm" color="gray.500">Latest updates</Text>
            </HStack>
            <ActivityFeed 
              activities={dashboardData?.activities || []}
              variant="mobile"
            />
          </Box>

          {/* Notifications */}
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Notifications
              </Text>
            </HStack>
            <NotificationCenter 
              notifications={dashboardData?.notifications || []}
              variant="mobile"
            />
          </Box>

          {/* Offline Status */}
          <Box bg="blue.50" p={4} borderRadius="lg" border="1px" borderColor="blue.200">
            <HStack spacing={3}>
              <Box w={3} h={3} bg="green.500" borderRadius="full" />
              <Text fontSize="sm" color="blue.800">
                Online - Data synced 2 minutes ago
              </Text>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default MobileDashboardPage;
