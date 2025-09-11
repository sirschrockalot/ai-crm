import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
  useColorModeValue,
  IconButton,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { RepeatIcon, TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Card, ErrorBoundary } from '../../components/ui';

interface DashboardStats {
  totalLeads: number;
  conversionRate: number;
  activeBuyers: number;
  revenue: number;
  leadGrowth: number;
  conversionGrowth: number;
  buyerGrowth: number;
  revenueGrowth: number;
  pipelineValue?: number;
  averageLeadValue?: number;
  responseTime?: number;
  qualityScore?: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
  realtimeEnabled?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  loading = false,
  onRefresh,
  lastUpdated,
  realtimeEnabled = false,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast({
        title: 'Dashboard refreshed',
        description: 'Latest data has been loaded',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getGrowthArrow = (growth: number) => {
    return growth >= 0 ? 'increase' : 'decrease';
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'green.500' : 'red.500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor}>
        <VStack spacing={4} align="center" justify="center" minH="200px">
          <Text color={textColor}>Loading dashboard data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box p={6} bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor}>
        <VStack align="stretch" spacing={6}>
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color={textColor}>Dashboard Overview</Heading>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  Last updated: {formatTime(lastUpdated)}
                </Text>
                {realtimeEnabled && (
                  <Badge colorScheme="green" size="sm">
                    Live
                  </Badge>
                )}
              </HStack>
            </VStack>
            <HStack spacing={3}>
              {onRefresh && (
                <Tooltip label="Refresh dashboard data">
                  <IconButton
                    aria-label="Refresh dashboard"
                    icon={<RepeatIcon />}
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    isLoading={loading}
                  />
                </Tooltip>
              )}
            </HStack>
          </HStack>

          {/* Key Metrics Grid */}
          <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
            {/* Total Leads */}
            <Card>
              <Stat>
                <StatLabel color="gray.600">Total Leads</StatLabel>
                <StatNumber color={textColor}>
                  {stats.totalLeads.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.leadGrowth)} />
                  <Text as="span" color={getGrowthColor(stats.leadGrowth)}>
                    {Math.abs(stats.leadGrowth).toFixed(1)}%
                  </Text>
                  <Text as="span" color="gray.500" ml={2}>
                    vs last period
                  </Text>
                </StatHelpText>
              </Stat>
            </Card>

            {/* Conversion Rate */}
            <Card>
              <Stat>
                <StatLabel color="gray.600">Conversion Rate</StatLabel>
                <StatNumber color={textColor}>
                  {stats.conversionRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.conversionGrowth)} />
                  <Text as="span" color={getGrowthColor(stats.conversionGrowth)}>
                    {Math.abs(stats.conversionGrowth).toFixed(1)}%
                  </Text>
                  <Text as="span" color="gray.500" ml={2}>
                    vs last period
                  </Text>
                </StatHelpText>
              </Stat>
            </Card>

            {/* Active Buyers */}
            <Card>
              <Stat>
                <StatLabel color="gray.600">Active Buyers</StatLabel>
                <StatNumber color={textColor}>
                  {stats.activeBuyers.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.buyerGrowth)} />
                  <Text as="span" color={getGrowthColor(stats.buyerGrowth)}>
                    {Math.abs(stats.buyerGrowth).toFixed(1)}%
                  </Text>
                  <Text as="span" color="gray.500" ml={2}>
                    vs last period
                  </Text>
                </StatHelpText>
              </Stat>
            </Card>

            {/* Revenue */}
            <Card>
              <Stat>
                <StatLabel color="gray.600">Total Revenue</StatLabel>
                <StatNumber color={textColor}>
                  {formatCurrency(stats.revenue)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.revenueGrowth)} />
                  <Text as="span" color={getGrowthColor(stats.revenueGrowth)}>
                    {Math.abs(stats.revenueGrowth).toFixed(1)}%
                  </Text>
                  <Text as="span" color="gray.500" ml={2}>
                    vs last period
                  </Text>
                </StatHelpText>
              </Stat>
            </Card>

            {/* Pipeline Value */}
            {stats.pipelineValue && (
              <Card>
                <Stat>
                  <StatLabel color="gray.600">Pipeline Value</StatLabel>
                  <StatNumber color={textColor}>
                    {formatCurrency(stats.pipelineValue)}
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    Total value in pipeline
                  </StatHelpText>
                </Stat>
              </Card>
            )}

            {/* Average Lead Value */}
            {stats.averageLeadValue && (
              <Card>
                <Stat>
                  <StatLabel color="gray.600">Avg Lead Value</StatLabel>
                  <StatNumber color={textColor}>
                    {formatCurrency(stats.averageLeadValue)}
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    Average value per lead
                  </StatHelpText>
                </Stat>
              </Card>
            )}

            {/* Response Time */}
            {stats.responseTime && (
              <Card>
                <Stat>
                  <StatLabel color="gray.600">Avg Response Time</StatLabel>
                  <StatNumber color={textColor}>
                    {stats.responseTime.toFixed(1)}h
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    Average time to respond
                  </StatHelpText>
                </Stat>
              </Card>
            )}

            {/* Quality Score */}
            {stats.qualityScore && (
              <Card>
                <Stat>
                  <StatLabel color="gray.600">Lead Quality Score</StatLabel>
                  <StatNumber color={textColor}>
                    {stats.qualityScore.toFixed(1)}/10
                  </StatNumber>
                  <StatHelpText color="gray.500">
                    Average lead quality
                  </StatHelpText>
                </Stat>
              </Card>
            )}
          </Grid>

          {/* Performance Indicators */}
          <Card header="Performance Indicators">
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Best Performing Metric</Text>
                <HStack>
                  <TriangleUpIcon color="green.500" />
                  <Text fontWeight="bold" fontSize="lg" color="green.500">
                    Lead Growth
                  </Text>
                </HStack>
                <Text fontSize="sm" color="green.500">+{stats.leadGrowth.toFixed(1)}%</Text>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Needs Attention</Text>
                <HStack>
                  <TriangleDownIcon color="red.500" />
                  <Text fontWeight="bold" fontSize="lg" color="red.500">
                    Buyer Growth
                  </Text>
                </HStack>
                <Text fontSize="sm" color="red.500">{stats.buyerGrowth.toFixed(1)}%</Text>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Conversion Efficiency</Text>
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  {stats.conversionRate.toFixed(1)}%
                </Text>
                <Text fontSize="sm" color={getGrowthColor(stats.conversionGrowth)}>
                  {stats.conversionGrowth >= 0 ? '+' : ''}{stats.conversionGrowth.toFixed(1)}% vs target
                </Text>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">Revenue Performance</Text>
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  {formatCurrency(stats.revenue)}
                </Text>
                <Text fontSize="sm" color={getGrowthColor(stats.revenueGrowth)}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% vs target
                </Text>
              </VStack>
            </Grid>
          </Card>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}; 