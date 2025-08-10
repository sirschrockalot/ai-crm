import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { TimeTrackingDashboard } from '../../components/time-tracking/TimeTrackingDashboard';
import { TimeTrackingStats } from '../../components/time-tracking/TimeTrackingStats';
import { WeeklyTimesheetGrid } from '../../components/time-tracking/WeeklyTimesheetGrid';
import { TimeTrackingSidebar } from '../../components/time-tracking/TimeTrackingSidebar';
import { ApprovalWorkflow } from '../../components/time-tracking/ApprovalWorkflow';
import { TeamAnalytics } from '../../components/time-tracking/TeamAnalytics';

interface TimeTrackingData {
  weeklyStats: {
    thisWeek: number;
    billableHours: number;
    activeProjects: number;
    timesheetStatus: string;
  };
  recentEntries: any[];
  pendingApprovals: any[];
}

const TimeTrackingPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { apiCall } = useApi();
  const router = useRouter();
  const toast = useToast();
  
  const [timeTrackingData, setTimeTrackingData] = useState<TimeTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      loadTimeTrackingData();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadTimeTrackingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load analytics data
      const analyticsResponse = await apiCall('/api/time-tracking/analytics', 'GET');
      
      // Load recent time entries
      const entriesResponse = await apiCall('/api/time-tracking/entries?limit=10', 'GET');
      
      // Load pending approvals (if user is manager/admin)
      let pendingApprovals = [];
      if (user?.role === 'manager' || user?.role === 'admin') {
        try {
          const approvalsResponse = await apiCall('/api/time-tracking/pending-timesheets', 'GET');
          pendingApprovals = approvalsResponse.data || [];
        } catch (err) {
          // User might not have permission, ignore this error
          console.log('No permission to view pending approvals');
        }
      }

      // Calculate weekly stats
      const thisWeek = analyticsResponse.data?.totalHours || 0;
      const billableHours = analyticsResponse.data?.billableHours || 0;
      const activeProjects = entriesResponse.data?.length || 0;
      const timesheetStatus = 'draft'; // Default status

      setTimeTrackingData({
        weeklyStats: {
          thisWeek,
          billableHours,
          activeProjects,
          timesheetStatus,
        },
        recentEntries: entriesResponse.data || [],
        pendingApprovals,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load time tracking data');
      toast({
        title: 'Error',
        description: 'Failed to load time tracking data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTimeTrackingData();
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={handleRefresh}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Time Tracking Dashboard
          </Heading>
          <Text color="gray.600">
            Track your time, manage timesheets, and monitor productivity
          </Text>
        </Box>

        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={8}>
          {/* Left Column - Main Dashboard */}
          <VStack spacing={6} align="stretch">
            {/* Statistics Cards */}
            <TimeTrackingStats stats={timeTrackingData?.weeklyStats} />

            {/* Weekly Timesheet Grid */}
            <Box>
              <Heading size="md" mb={4}>
                Weekly Timesheet
              </Heading>
              <WeeklyTimesheetGrid onRefresh={handleRefresh} />
            </Box>

            {/* Approval Workflow for Managers */}
            {(user?.role === 'manager' || user?.role === 'admin') && (
              <Box>
                <Heading size="md" mb={4}>
                  Approval Workflow
                </Heading>
                <ApprovalWorkflow onApprovalComplete={handleRefresh} />
              </Box>
            )}
          </VStack>

          {/* Right Column - Sidebar */}
          <TimeTrackingSidebar
            recentEntries={timeTrackingData?.recentEntries || []}
            pendingApprovals={timeTrackingData?.pendingApprovals || []}
            onRefresh={handleRefresh}
          />
        </Grid>
      </VStack>
    </Container>
  );
};

export default TimeTrackingPage;
