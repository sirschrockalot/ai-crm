import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  VStack, 
  HStack, 
  Box, 
  Text, 
  useColorModeValue, 
  useToast,
  SimpleGrid,
  Button,
  Heading,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { 
  FiBarChart, 
  FiTrendingUp, 
  FiUsers, 
  FiHome, 
  FiSmartphone,
  FiDollarSign,
  FiTarget,
  FiActivity,
} from 'react-icons/fi';
import { DashboardLayout } from '../../components/dashboard';
import { ErrorBoundary, Loading } from '../../components/ui';
import { 
  DashboardOverview, 
  DashboardCharts
} from '../../components/dashboard';
import { useDashboard } from '../../hooks/useDashboard';

// Dashboard selection interface
interface DashboardOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  features: string[];
}

const dashboardOptions: DashboardOption[] = [
  {
    id: 'overview',
    title: 'Overview Dashboard',
    description: 'General business metrics and insights',
    icon: FiBarChart,
    href: '/dashboard',
    color: 'blue',
    features: ['Key Performance Indicators', 'Business Overview', 'General Analytics'],
  },
  {
    id: 'executive',
    title: 'Executive Dashboard',
    description: 'High-level business metrics and strategic insights',
    icon: FiTrendingUp,
    href: '/dashboard/executive',
    color: 'green',
    features: ['Executive KPIs', 'Strategic Metrics', 'Business Performance'],
  },
  {
    id: 'acquisitions',
    title: 'Acquisitions Dashboard',
    description: 'Lead management and acquisition metrics',
    icon: FiTarget,
    href: '/dashboard/acquisitions',
    color: 'purple',
    features: ['Lead Pipeline', 'Conversion Tracking', 'Acquisition Metrics'],
  },
  {
    id: 'disposition',
    title: 'Dispositions Dashboard',
    description: 'Buyer management and deal disposition tracking',
    icon: FiDollarSign,
    href: '/dashboard/disposition',
    color: 'orange',
    features: ['Buyer Management', 'Deal Pipeline', 'Revenue Tracking'],
  },
  {
    id: 'team-member',
    title: 'Team Member Dashboard',
    description: 'Individual performance and task tracking',
    icon: FiUsers,
    href: '/dashboard/team-member',
    color: 'teal',
    features: ['Personal Metrics', 'Task Management', 'Performance Tracking'],
  },
  {
    id: 'mobile',
    title: 'Mobile Dashboard',
    description: 'Field operations and mobile team metrics',
    icon: FiSmartphone,
    href: '/dashboard/mobile',
    color: 'pink',
    features: ['Field Operations', 'Mobile Metrics', 'Location Tracking'],
  },
];

const DashboardPage: React.FC = () => {
  const router = useRouter();
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
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hasFetchedData = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  // Initialize with null to prevent hydration mismatch
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date());
  }, []);

  // Check if user wants to see overview or dashboard selection
  useEffect(() => {
    const showOverviewParam = router.query.showOverview;
    if (showOverviewParam === 'true') {
      setShowOverview(true);
    }
  }, [router.query]);

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
        duration: 3000,
        isClosable: true,
      });
    }
  }, [refreshDashboard, toast]);

  const handleDashboardSelect = (dashboard: DashboardOption) => {
    router.push(dashboard.href);
  };

  const handleShowOverview = () => {
    setShowOverview(true);
    router.push('/dashboard?showOverview=true', undefined, { shallow: true });
  };

  const handleShowSelection = () => {
    setShowOverview(false);
    router.push('/dashboard', undefined, { shallow: true });
  };

  // If user wants to see overview, show the original dashboard content
  if (showOverview) {
    return (
      <DashboardLayout
        loading={loading}
        error={error}
        isAuthenticated={isAuthenticated}
        loadingMessage="Loading dashboard..."
      >
        <VStack spacing={8} align="stretch">
          {/* Header with toggle */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" color={textColor} mb={2}>
                Dashboard Overview
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Business performance metrics and insights
              </Text>
            </Box>
            <Button
              leftIcon={<Icon as={FiBarChart} />}
              onClick={handleShowSelection}
              variant="outline"
              colorScheme="blue"
            >
              Choose Dashboard
            </Button>
          </HStack>

          {/* Original dashboard content */}
          <DashboardOverview stats={mockStats} />
          <DashboardCharts
            leadPipelineData={mockLeadPipelineData}
            monthlyGrowthData={mockMonthlyGrowthData}
            conversionTrendData={mockConversionTrendData}
            revenueData={mockRevenueData}
          />
        </VStack>
      </DashboardLayout>
    );
  }

  // Dashboard selection interface
  return (
    <DashboardLayout
      loading={loading}
      error={error}
      isAuthenticated={isAuthenticated}
      loadingMessage="Loading dashboard selection..."
    >
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" color={textColor} mb={4}>
            Choose Your Dashboard
          </Heading>
          <Text color="gray.600" fontSize="lg" maxW="2xl" mx="auto">
            Select the dashboard that best fits your role and responsibilities. Each dashboard provides specialized metrics and insights tailored to specific business functions.
          </Text>
        </Box>

        {/* Dashboard Selection Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {dashboardOptions.map((dashboard) => (
            <Box
              key={dashboard.id}
              bg={cardBg}
              p={6}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              shadow="sm"
              _hover={{
                shadow: 'md',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
              }}
              cursor="pointer"
              onClick={() => handleDashboardSelect(dashboard)}
            >
              <VStack spacing={4} align="stretch">
                {/* Icon and Title */}
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg={`${dashboard.color}.100`}
                    color={`${dashboard.color}.600`}
                  >
                    <Icon as={dashboard.icon} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Heading size="md" color={textColor}>
                      {dashboard.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      {dashboard.description}
                    </Text>
                  </VStack>
                </HStack>

                {/* Features */}
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Key Features:
                  </Text>
                  {dashboard.features.map((feature, index) => (
                    <Text key={index} fontSize="sm" color="gray.600">
                      • {feature}
                    </Text>
                  ))}
                </VStack>

                {/* Action Button */}
                <Button
                  colorScheme={dashboard.color}
                  variant="outline"
                  size="sm"
                  w="full"
                  mt={2}
                >
                  Open Dashboard
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Quick Overview Option */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.600">
              Want to see a general overview instead?
            </Text>
            <Button
              leftIcon={<Icon as={FiBarChart} />}
              onClick={handleShowOverview}
              colorScheme="blue"
              variant="outline"
            >
              Show Overview Dashboard
            </Button>
          </VStack>
        </Box>
      </VStack>
    </DashboardLayout>
  );
};

export default DashboardPage;
