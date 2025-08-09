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

const TeamMemberDashboardPage: React.FC = () => {
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

  // Team member-specific mock data
  const teamMemberStats = {
    tasksCompleted: 45,
    taskGrowth: 12.5,
    performanceScore: 87.3,
    performanceGrowth: 3.2,
    timeTracked: 156,
    timeGrowth: 8.7,
    goalsAchieved: 8,
    goalGrowth: 14.3,
    responseTime: 1.2,
    responseTimeGrowth: -0.5,
    qualityScore: 9.1,
    qualityGrowth: 1.8,
    productivity: 92.5,
    productivityGrowth: 5.2,
  };

  const teamMemberChartData = {
    weeklyTasks: [
      { name: 'Mon', value: 8, target: 10 },
      { name: 'Tue', value: 12, target: 10 },
      { name: 'Wed', value: 9, target: 10 },
      { name: 'Thu', value: 11, target: 10 },
      { name: 'Fri', value: 7, target: 10 },
    ],
    taskCategories: [
      { name: 'Lead Follow-up', value: 25, color: '#2196f3', percentage: 35 },
      { name: 'Data Entry', value: 20, color: '#ff9800', percentage: 28 },
      { name: 'Reports', value: 15, color: '#4caf50', percentage: 21 },
      { name: 'Meetings', value: 10, color: '#9c27b0', percentage: 16 },
    ],
    monthlyPerformance: [
      { name: 'Jan', value: 82 },
      { name: 'Feb', value: 85 },
      { name: 'Mar', value: 88 },
      { name: 'Apr', value: 86 },
      { name: 'May', value: 90 },
      { name: 'Jun', value: 87 },
    ],
  };

  const quickActions = [
    { name: 'Start Timer', action: 'start-timer', icon: 'play' },
    { name: 'Add Task', action: 'add-task', icon: 'plus' },
    { name: 'Log Activity', action: 'log-activity', icon: 'edit' },
    { name: 'View Goals', action: 'view-goals', icon: 'target' },
  ];

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest team member data has been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh team member dashboard data',
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
          <Text color="red.500">Error loading team member dashboard: {error}</Text>
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
              Team Member Dashboard
            </Text>
            <Text fontSize="md" color="gray.600">
              Individual performance and task tracking for managing your workload
            </Text>
          </Box>

          {/* Quick Actions */}
          <QuickActions 
            actions={quickActions}
            variant="team-member"
          />

          {/* Team Member KPI Stats */}
          <DashboardStats 
            stats={teamMemberStats}
            variant="team-member"
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
          />

          {/* Charts Grid */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Weekly Tasks Chart */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Weekly Tasks
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">vs. daily target</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={teamMemberChartData.weeklyTasks}
                type="bar"
                height={300}
                color="blue"
              />
            </Box>

            {/* Task Categories */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Task Categories
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">This week</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={teamMemberChartData.taskCategories}
                type="doughnut"
                height={300}
              />
            </Box>
          </Box>

          {/* Monthly Performance and Activity Feed */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Monthly Performance */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Monthly Performance
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Last 6 months</Text>
                </HStack>
              </HStack>
              <PerformanceCharts 
                data={teamMemberChartData.monthlyPerformance}
                type="line"
                height={300}
                color="green"
              />
            </Box>

            {/* Activity Feed */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  My Activity
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Recent updates</Text>
                </HStack>
              </HStack>
              <ActivityFeed 
                activities={dashboardData?.activities || []}
                variant="team-member"
              />
            </Box>
          </Box>

          {/* Goals and Notifications */}
          <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            {/* Personal Goals */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  Personal Goals
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.500">Progress tracking</Text>
                </HStack>
              </HStack>
              <VStack spacing={3} align="stretch">
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Complete 50 tasks this month</Text>
                    <Text fontSize="sm" color="green.500">90%</Text>
                  </HStack>
                  <Box bg="gray.200" h={2} borderRadius="full" overflow="hidden">
                    <Box bg="green.500" h="100%" w="90%" />
                  </Box>
                </Box>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Maintain 90% quality score</Text>
                    <Text fontSize="sm" color="green.500">91%</Text>
                  </HStack>
                  <Box bg="gray.200" h={2} borderRadius="full" overflow="hidden">
                    <Box bg="green.500" h="100%" w="91%" />
                  </Box>
                </Box>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">Track 160 hours this month</Text>
                    <Text fontSize="sm" color="blue.500">97.5%</Text>
                  </HStack>
                  <Box bg="gray.200" h={2} borderRadius="full" overflow="hidden">
                    <Box bg="blue.500" h="100%" w="97.5%" />
                  </Box>
                </Box>
              </VStack>
            </Box>

            {/* Notifications */}
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  My Notifications
                </Text>
              </HStack>
              <NotificationCenter 
                notifications={dashboardData?.notifications || []}
                variant="team-member"
              />
            </Box>
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default TeamMemberDashboardPage;
