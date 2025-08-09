import React, { useEffect, useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Select,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiBarChart, FiTrendingUp, FiCalendar, FiFilter } from 'react-icons/fi';
import { DashboardLayout } from '../../components/dashboard';
import { Card } from '../../components/ui';
import { useDashboard } from '../../hooks/useDashboard';

const DashboardAnalyticsPage: React.FC = () => {
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
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('leads');

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    toast({
      title: 'Time Range Updated',
      description: `Analytics data updated for ${value}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Mock analytics data
  const analyticsData = {
    leads: {
      total: 1234,
      growth: 23.36,
      trend: [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 89],
    },
    conversions: {
      total: 156,
      rate: 12.5,
      growth: 5.2,
      trend: [8, 12, 10, 15, 13, 18, 16, 20, 22, 19, 25, 28],
    },
    revenue: {
      total: 45678,
      growth: 18.7,
      trend: [32000, 35000, 33000, 42000, 38000, 45000, 43000, 48000, 52000, 49000, 55000, 58000],
    },
    buyers: {
      total: 89,
      growth: -2.1,
      trend: [95, 92, 88, 85, 87, 84, 86, 83, 89, 91, 88, 89],
    },
  };

  const getMetricData = () => {
    return analyticsData[selectedMetric as keyof typeof analyticsData];
  };

  return (
    <DashboardLayout
      loading={loading}
      error={error}
      isAuthenticated={isAuthenticated}
      loadingMessage="Loading analytics..."
    >
      {/* Page Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Dashboard Analytics</Heading>
          <Text color="gray.600">
            Detailed analytics and performance metrics
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            size="sm"
            w="150px"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>
          <Button
            leftIcon={<FiFilter />}
            size="sm"
            variant="outline"
          >
            Filters
          </Button>
        </HStack>
      </HStack>

      {/* Analytics Tabs */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Trends</Tab>
          <Tab>Performance</Tab>
          <Tab>Reports</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={6}>
              {/* Key Metrics */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Card>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.500">Total Leads</Text>
                      <Box as={FiBarChart} color="blue.500" />
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {analyticsData.leads.total.toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="green.500">
                      +{analyticsData.leads.growth}% from last period
                    </Text>
                  </VStack>
                </Card>

                <Card>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.500">Conversions</Text>
                      <Box as={FiTrendingUp} color="green.500" />
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {analyticsData.conversions.total}
                    </Text>
                    <Text fontSize="sm" color="green.500">
                      +{analyticsData.conversions.growth}% from last period
                    </Text>
                  </VStack>
                </Card>

                <Card>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.500">Revenue</Text>
                      <Box as={FiBarChart} color="purple.500" />
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      ${analyticsData.revenue.total.toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="green.500">
                      +{analyticsData.revenue.growth}% from last period
                    </Text>
                  </VStack>
                </Card>

                <Card>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.500">Active Buyers</Text>
                      <Box as={FiBarChart} color="orange.500" />
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      {analyticsData.buyers.total}
                    </Text>
                    <Text fontSize="sm" color={analyticsData.buyers.growth >= 0 ? 'green.500' : 'red.500'}>
                      {analyticsData.buyers.growth >= 0 ? '+' : ''}{analyticsData.buyers.growth}% from last period
                    </Text>
                  </VStack>
                </Card>
              </SimpleGrid>

              {/* Metric Selection */}
              <Card>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Detailed Analytics</Heading>
                  <HStack spacing={4}>
                    <Select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      size="sm"
                      w="200px"
                    >
                      <option value="leads">Leads</option>
                      <option value="conversions">Conversions</option>
                      <option value="revenue">Revenue</option>
                      <option value="buyers">Buyers</option>
                    </Select>
                    <Text fontSize="sm" color="gray.500">
                      Current metric: {selectedMetric}
                    </Text>
                  </HStack>
                  <Box w="full" h="200px" bg="gray.100" borderRadius="md" p={4}>
                    <Text color="gray.500" textAlign="center">
                      Chart visualization for {selectedMetric} would go here
                    </Text>
                  </Box>
                </VStack>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6}>
              <Card>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Trend Analysis</Heading>
                  <Text color="gray.600">
                    Analyze trends over time for better decision making
                  </Text>
                  <Box w="full" h="300px" bg="gray.100" borderRadius="md" p={4}>
                    <Text color="gray.500" textAlign="center">
                      Trend charts and analysis would be displayed here
                    </Text>
                  </Box>
                </VStack>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6}>
              <Card>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Performance Metrics</Heading>
                  <Text color="gray.600">
                    Detailed performance breakdown and insights
                  </Text>
                  <Box w="full" h="300px" bg="gray.100" borderRadius="md" p={4}>
                    <Text color="gray.500" textAlign="center">
                      Performance metrics and KPIs would be displayed here
                    </Text>
                  </Box>
                </VStack>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6}>
              <Card>
                <VStack align="start" spacing={4}>
                  <Heading size="md">Reports</Heading>
                  <Text color="gray.600">
                    Generate and download detailed reports
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <Button colorScheme="blue" leftIcon={<FiCalendar />}>
                      Generate Monthly Report
                    </Button>
                    <Button colorScheme="green" leftIcon={<FiBarChart />}>
                      Export Analytics Data
                    </Button>
                  </SimpleGrid>
                </VStack>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DashboardLayout>
  );
};

export default DashboardAnalyticsPage;
