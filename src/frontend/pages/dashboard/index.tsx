import React, { useEffect, useState, useCallback } from 'react';
import { VStack, HStack, Box, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { DashboardLayout } from '../../components/dashboard';
import { ErrorBoundary, Loading } from '../../components/ui';
import { 
  DashboardOverview, 
  DashboardCharts
} from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';

const DashboardPage: React.FC = () => {
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

  // Mock data for demonstration
  const mockStats = {
    totalLeads: 1234,
    conversionRate: 12.5,
    activeBuyers: 89,
    revenue: 45678,
    leadGrowth: 23.36,
    conversionGrowth: 5.2,
    buyerGrowth: -2.1,
    revenueGrowth: 18.7,
    pipelineValue: 125000,
    averageLeadValue: 37000,
    responseTime: 2.5,
    qualityScore: 8.2,
  };

  const mockLeadPipelineData = [
    { name: 'New Leads', value: 45, color: '#2196f3', percentage: 35 },
    { name: 'Contacted', value: 32, color: '#ff9800', percentage: 25 },
    { name: 'Qualified', value: 28, color: '#4caf50', percentage: 22 },
    { name: 'Converted', value: 15, color: '#9c27b0', percentage: 18 },
  ];

  const mockMonthlyGrowthData = [
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 35 },
    { name: 'Apr', value: 60 },
    { name: 'May', value: 50 },
    { name: 'Jun', value: 75 },
  ];

  const mockConversionTrendData = [
    { name: 'Jan', value: 8.5 },
    { name: 'Feb', value: 10.2 },
    { name: 'Mar', value: 12.1 },
    { name: 'Apr', value: 11.8 },
    { name: 'May', value: 13.5 },
    { name: 'Jun', value: 12.5 },
  ];

  const mockRevenueData = [
    { name: 'Jan', value: 25000 },
    { name: 'Feb', value: 32000 },
    { name: 'Mar', value: 28000 },
    { name: 'Apr', value: 45000 },
    { name: 'May', value: 38000 },
    { name: 'Jun', value: 52000 },
  ];

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
      setLastUpdated(new Date());
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest data has been loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [refreshDashboard, toast]);

  const handleChartInteraction = useCallback((chartType: string, data: any) => {
    toast({
      title: 'Chart Interaction',
      description: `Clicked on ${chartType} chart`,
      status: 'info',
      duration: 2000,
    });
  }, [toast]);

  const handleChartExport = useCallback((chartType: string, format: 'png' | 'svg' | 'pdf') => {
    toast({
      title: 'Chart Export',
      description: `${chartType} chart exported as ${format.toUpperCase()}`,
      status: 'success',
      duration: 3000,
    });
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      setLastUpdated(new Date());
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Handle real-time updates
  useEffect(() => {
    if (realtime.isConnected) {
      setRealtimeEnabled(true);
      setLastUpdated(new Date());
    } else {
      setRealtimeEnabled(false);
    }
  }, [realtime.isConnected]);

  // Handle real-time errors
  useEffect(() => {
    if (realtime.error) {
      toast({
        title: 'Real-time Connection Error',
        description: realtime.error,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [realtime.error, toast]);

  if (loading && !dashboardData) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <VStack spacing={8} align="center" justify="center" minH="400px">
          <Loading size="lg" />
          <Text color={textColor}>Loading dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Dashboard Error
          </Text>
          <Text color={textColor} textAlign="center">
            {error}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg={bgColor}>
        <DashboardLayout
          loading={loading}
          error={error}
          isAuthenticated={isAuthenticated}
          loadingMessage="Loading dashboard..."
        >
          {/* Dashboard Overview */}
          <DashboardOverview
            stats={mockStats}
            loading={loading}
            onRefresh={handleRefresh}
            lastUpdated={lastUpdated}
            realtimeEnabled={realtimeEnabled}
          />

          {/* Dashboard Charts */}
          <DashboardCharts
            leadPipelineData={mockLeadPipelineData}
            monthlyGrowthData={mockMonthlyGrowthData}
            conversionTrendData={mockConversionTrendData}
            revenueData={mockRevenueData}
            loading={loading}
            onChartInteraction={handleChartInteraction}
            onExportChart={handleChartExport}
          />

          {/* Real-time Status Indicator */}
          {realtimeEnabled && (
            <Box
              position="fixed"
              bottom={4}
              right={4}
              bg="green.500"
              color="white"
              px={3}
              py={2}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
              zIndex={1000}
            >
              Live Updates
            </Box>
          )}
        </DashboardLayout>
      </Box>
    </ErrorBoundary>
  );
};

export default DashboardPage;
