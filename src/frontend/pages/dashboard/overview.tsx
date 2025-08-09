import React, { useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiUsers, FiDollarSign, FiTarget } from 'react-icons/fi';
import { DashboardLayout } from '../../components/dashboard';
import { Card } from '../../components/ui';
import { useDashboard } from '../../hooks/useDashboard';

const DashboardOverviewPage: React.FC = () => {
  const {
    dashboardData,
    loading,
    error,
    isAuthenticated,
    user,
    fetchDashboardData,
    refreshDashboard,
  } = useDashboard();
  
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleRefresh = () => {
    refreshDashboard();
    toast({
      title: 'Dashboard Refreshed',
      description: 'Latest data has been loaded',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Mock data for demonstration
  const overviewStats = {
    totalLeads: 1234,
    conversionRate: 12.5,
    activeBuyers: 89,
    revenue: 45678,
    leadGrowth: 23.36,
    conversionGrowth: 5.2,
    buyerGrowth: -2.1,
    revenueGrowth: 18.7,
    avgDealSize: 12500,
    salesCycle: 45,
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? FiTrendingUp : FiTrendingDown;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'green.500' : 'red.500';
  };

  return (
    <DashboardLayout
      loading={loading}
      error={error}
      isAuthenticated={isAuthenticated}
      loadingMessage="Loading dashboard overview..."
    >
      {/* Page Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Dashboard Overview</Heading>
          <Text color="gray.600">
            Key performance indicators and business metrics
          </Text>
        </VStack>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={handleRefresh}
          isLoading={loading}
          loadingText="Refreshing..."
        >
          Refresh
        </Button>
      </HStack>

      {/* Key Metrics Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Card>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Total Leads</Text>
              <Box as={FiUsers} color="blue.500" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {overviewStats.totalLeads.toLocaleString()}
            </Text>
            <HStack spacing={1}>
              <Box as={getGrowthIcon(overviewStats.leadGrowth)} color={getGrowthColor(overviewStats.leadGrowth)} />
              <Text fontSize="sm" color={getGrowthColor(overviewStats.leadGrowth)}>
                {overviewStats.leadGrowth}%
              </Text>
            </HStack>
          </VStack>
        </Card>

        <Card>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Conversion Rate</Text>
              <Box as={FiTarget} color="green.500" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {overviewStats.conversionRate}%
            </Text>
            <HStack spacing={1}>
              <Box as={getGrowthIcon(overviewStats.conversionGrowth)} color={getGrowthColor(overviewStats.conversionGrowth)} />
              <Text fontSize="sm" color={getGrowthColor(overviewStats.conversionGrowth)}>
                {overviewStats.conversionGrowth}%
              </Text>
            </HStack>
          </VStack>
        </Card>

        <Card>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Active Buyers</Text>
              <Box as={FiUsers} color="purple.500" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {overviewStats.activeBuyers}
            </Text>
            <HStack spacing={1}>
              <Box as={getGrowthIcon(overviewStats.buyerGrowth)} color={getGrowthColor(overviewStats.buyerGrowth)} />
              <Text fontSize="sm" color={getGrowthColor(overviewStats.buyerGrowth)}>
                {overviewStats.buyerGrowth}%
              </Text>
            </HStack>
          </VStack>
        </Card>

        <Card>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Revenue</Text>
              <Box as={FiDollarSign} color="green.500" />
            </HStack>
            <Text fontSize="2xl" fontWeight="bold">
              ${overviewStats.revenue.toLocaleString()}
            </Text>
            <HStack spacing={1}>
              <Box as={getGrowthIcon(overviewStats.revenueGrowth)} color={getGrowthColor(overviewStats.revenueGrowth)} />
              <Text fontSize="sm" color={getGrowthColor(overviewStats.revenueGrowth)}>
                {overviewStats.revenueGrowth}%
              </Text>
            </HStack>
          </VStack>
        </Card>
      </SimpleGrid>

      {/* Additional Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <VStack align="start" spacing={4}>
            <Heading size="md">Sales Performance</Heading>
            <SimpleGrid columns={2} spacing={4} w="full">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Avg Deal Size</Text>
                <Text fontSize="lg" fontWeight="bold">
                  ${overviewStats.avgDealSize.toLocaleString()}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Sales Cycle</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {overviewStats.salesCycle} days
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Card>

        <Card>
          <VStack align="start" spacing={4}>
            <Heading size="md">Quick Actions</Heading>
            <VStack spacing={3} w="full">
              <Button size="sm" colorScheme="blue" w="full">
                View All Leads
              </Button>
              <Button size="sm" colorScheme="green" w="full">
                Create New Lead
              </Button>
              <Button size="sm" colorScheme="purple" w="full">
                Generate Report
              </Button>
            </VStack>
          </VStack>
        </Card>
      </SimpleGrid>
    </DashboardLayout>
  );
};

export default DashboardOverviewPage;
