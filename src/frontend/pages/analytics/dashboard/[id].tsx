import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { ErrorBoundary, Card, Loading } from '../../../components/ui';
import { AnalyticsDashboard, DashboardBuilder } from '../../../features/analytics';
import { useAnalytics } from '../../../features/analytics/hooks/useAnalytics';

interface DashboardConfigPageProps {
  dashboardId?: string;
}

const DashboardConfigPage: React.FC<DashboardConfigPageProps> = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { loading, error, fetchAnalyticsData } = useAnalytics();
  
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<any>(null);

  const handleTimeRangeChange = (range: string) => {
    if (range === '7d' || range === '30d' || range === '90d' || range === '1y') {
      setTimeRange(range);
    }
  };

  const handleSaveDashboard = () => {
    toast({
      title: 'Dashboard saved',
      description: 'Dashboard configuration has been saved successfully.',
      status: 'success',
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original configuration
  };

  useEffect(() => {
    if (id) {
      // Fetch dashboard configuration based on ID
      fetchAnalyticsData({ timeRange });
    }
  }, [id, fetchAnalyticsData, timeRange]);

  if (!id) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Dashboard Not Found</AlertTitle>
              <AlertDescription>
                The requested dashboard could not be found.
              </AlertDescription>
            </Alert>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (loading && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Loading variant="spinner" size="lg" />
          </Box>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error Loading Dashboard</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              {/* Dashboard Header */}
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg">Dashboard Configuration</Heading>
                  <Text color="gray.600">
                    Dashboard ID: {id} • {isEditing ? 'Editing' : 'Viewing'}
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button colorScheme="blue" onClick={handleSaveDashboard}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button colorScheme="blue" onClick={() => setIsEditing(true)}>
                      Edit Dashboard
                    </Button>
                  )}
                </HStack>
              </HStack>

              {/* Dashboard Content */}
              <Card>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Dashboard Preview</Heading>
                  {isEditing ? (
                    <DashboardBuilder
                      dashboardId={id as string}
                      onSave={handleSaveDashboard}
                      onShare={(dashboardId) => console.log('Share dashboard:', dashboardId)}
                      onExport={(dashboardId) => console.log('Export dashboard:', dashboardId)}
                    />
                  ) : (
                    <AnalyticsDashboard
                      timeRange={timeRange}
                      onTimeRangeChange={handleTimeRangeChange}
                    />
                  )}
                </VStack>
              </Card>

              {/* Configuration Options */}
              {isEditing && (
                <Card>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="md">Dashboard Settings</Heading>
                    <Text color="gray.600">
                      Configure dashboard layout, widgets, and display options.
                    </Text>
                    {/* Widget configuration options would go here */}
                    <HStack justify="end" spacing={3}>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button colorScheme="blue" onClick={handleSaveDashboard}>
                        Save Changes
                      </Button>
                    </HStack>
                  </VStack>
                </Card>
              )}
            </VStack>
          </Box>
        </HStack>
      </Box>
    </ErrorBoundary>
  );
};

export default DashboardConfigPage;
