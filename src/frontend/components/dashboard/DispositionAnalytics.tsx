import React, { useMemo } from 'react';
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
  useColorModeValue,
  useBreakpointValue,
  Icon,
  Progress,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FaChartLine, FaDollarSign, FaClock, FaCheckCircle, FaExclamationTriangle, FaUsers } from 'react-icons/fa';

export interface DispositionMetrics {
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  cancelledDeals: number;
  totalValue: number;
  averageDealSize: number;
  averageDaysToClose: number;
  successRate: number;
  profitMargin: number;
  buyerSatisfaction: number;
  monthlyTrends: {
    month: string;
    deals: number;
    value: number;
    profit: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
    percentage: number;
  }[];
  priorityBreakdown: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  topPerformers: {
    name: string;
    deals: number;
    value: number;
    successRate: number;
  }[];
}

interface DispositionAnalyticsProps {
  metrics: DispositionMetrics;
  loading?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export const DispositionAnalytics: React.FC<DispositionAnalyticsProps> = ({
  metrics,
  loading = false,
  timeRange = '30d',
  onTimeRangeChange,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new contract':
        return 'blue.500';
      case 'active disposition':
        return 'yellow.500';
      case 'assigned':
        return 'pink.500';
      case 'closing':
        return 'green.500';
      case 'closed':
        return 'green.600';
      case 'cancelled':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red.500';
      case 'medium':
        return 'orange.500';
      case 'low':
        return 'gray.500';
      default:
        return 'gray.500';
    }
  };

  const getTrendArrow = (current: number, previous: number) => {
    if (current > previous) return 'increase';
    if (current < previous) return 'decrease';
    return 'increase'; // Default to increase for no change
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'green.500';
    if (current < previous) return 'red.500';
    return 'gray.500';
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading analytics...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={FaChartLine} color="blue.500" boxSize={5} />
            <Heading size="md" color={textColor}>
              Disposition Analytics
            </Heading>
          </HStack>
          
          {/* Time Range Selector */}
          <HStack spacing={2}>
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Badge
                key={range}
                px={3}
                py={1}
                borderRadius="full"
                cursor="pointer"
                bg={timeRange === range ? 'blue.500' : 'gray.100'}
                color={timeRange === range ? 'white' : 'gray.700'}
                onClick={() => onTimeRangeChange?.(range)}
                _hover={{
                  bg: timeRange === range ? 'blue.600' : 'gray.200',
                }}
              >
                {range}
              </Badge>
            ))}
          </HStack>
        </HStack>

        {/* Key Metrics Grid */}
        <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
          {/* Total Deals */}
          <Stat>
            <StatLabel color="gray.600">Total Deals</StatLabel>
            <StatNumber color={textColor} fontSize="2xl">
              {formatNumber(metrics.totalDeals)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={getTrendArrow(metrics.totalDeals, metrics.totalDeals * 0.9)} />
              {formatNumber(metrics.totalDeals)} deals
            </StatHelpText>
          </Stat>

          {/* Active Deals */}
          <Stat>
            <StatLabel color="gray.600">Active Deals</StatLabel>
            <StatNumber color="blue.600" fontSize="2xl">
              {formatNumber(metrics.activeDeals)}
            </StatNumber>
            <StatHelpText>
              {formatPercentage((metrics.activeDeals / metrics.totalDeals) * 100)} of total
            </StatHelpText>
          </Stat>

          {/* Total Value */}
          <Stat>
            <StatLabel color="gray.600">Total Value</StatLabel>
            <StatNumber color="green.600" fontSize="2xl">
              {formatCurrency(metrics.totalValue)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={getTrendArrow(metrics.totalValue, metrics.totalValue * 0.9)} />
              {formatCurrency(metrics.totalValue)}
            </StatHelpText>
          </Stat>

          {/* Success Rate */}
          <Stat>
            <StatLabel color="gray.600">Success Rate</StatLabel>
            <StatNumber color="green.600" fontSize="2xl">
              {formatPercentage(metrics.successRate)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={getTrendArrow(metrics.successRate, metrics.successRate * 0.9)} />
              {formatPercentage(metrics.successRate)}
            </StatHelpText>
          </Stat>
        </Grid>

        {/* Secondary Metrics */}
        <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
          {/* Average Deal Size */}
          <Stat>
            <StatLabel color="gray.600">Avg Deal Size</StatLabel>
            <StatNumber color={textColor} fontSize="lg">
              {formatCurrency(metrics.averageDealSize)}
            </StatNumber>
          </Stat>

          {/* Average Days to Close */}
          <Stat>
            <StatLabel color="gray.600">Days to Close</StatLabel>
            <StatNumber color={textColor} fontSize="lg">
              {metrics.averageDaysToClose.toFixed(1)}
            </StatNumber>
          </Stat>

          {/* Profit Margin */}
          <Stat>
            <StatLabel color="gray.600">Profit Margin</StatLabel>
            <StatNumber color="green.600" fontSize="lg">
              {formatPercentage(metrics.profitMargin)}
            </StatNumber>
          </Stat>

          {/* Buyer Satisfaction */}
          <Stat>
            <StatLabel color="gray.600">Buyer Satisfaction</StatLabel>
            <StatNumber color="blue.600" fontSize="lg">
              {formatPercentage(metrics.buyerSatisfaction)}
            </StatNumber>
          </Stat>
        </Grid>

        <Divider />

        {/* Status and Priority Breakdown */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          {/* Status Breakdown */}
          <Box>
            <Heading size="sm" color={textColor} mb={4}>
              Deal Status Breakdown
            </Heading>
            <VStack spacing={3} align="stretch">
              {metrics.statusBreakdown.map((status) => (
                <Box key={status.status}>
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={getStatusColor(status.status)}
                      />
                      <Text fontSize="sm" color={textColor}>
                        {status.status}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      {status.count} ({formatPercentage(status.percentage)})
                    </Text>
                  </HStack>
                  <Progress
                    value={status.percentage}
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                  />
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Priority Breakdown */}
          <Box>
            <Heading size="sm" color={textColor} mb={4}>
              Priority Breakdown
            </Heading>
            <VStack spacing={3} align="stretch">
              {metrics.priorityBreakdown.map((priority) => (
                <Box key={priority.priority}>
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={getPriorityColor(priority.priority)}
                      />
                      <Text fontSize="sm" color={textColor}>
                        {priority.priority}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      {priority.count} ({formatPercentage(priority.percentage)})
                    </Text>
                  </HStack>
                  <Progress
                    value={priority.percentage}
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                  />
                </Box>
              ))}
            </VStack>
          </Box>
        </Grid>

        <Divider />

        {/* Top Performers */}
        <Box>
          <Heading size="sm" color={textColor} mb={4}>
            Top Performers
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={4}>
            {metrics.topPerformers.map((performer, index) => (
              <Box
                key={performer.name}
                p={4}
                borderRadius="lg"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
              >
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}
                      variant="solid"
                    >
                      #{index + 1}
                    </Badge>
                    <Text fontWeight="semibold" fontSize="sm" color={textColor}>
                      {performer.name}
                    </Text>
                  </HStack>
                </HStack>
                
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="xs" color="gray.500">Deals:</Text>
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                      {performer.deals}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="xs" color="gray.500">Value:</Text>
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                      {formatCurrency(performer.value)}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="xs" color="gray.500">Success Rate:</Text>
                    <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                      {formatPercentage(performer.successRate)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Monthly Trends */}
        <Box>
          <Heading size="sm" color={textColor} mb={4}>
            Monthly Trends
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={4}>
            {metrics.monthlyTrends.slice(-6).map((trend) => (
              <Box
                key={trend.month}
                p={4}
                borderRadius="lg"
                bg="blue.50"
                border="1px"
                borderColor="blue.200"
              >
                <Text fontWeight="semibold" fontSize="sm" color="blue.800" mb={3}>
                  {trend.month}
                </Text>
                
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="xs" color="blue.600">Deals:</Text>
                    <Text fontSize="xs" color="blue.800" fontWeight="semibold">
                      {trend.deals}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="xs" color="blue.600">Value:</Text>
                    <Text fontSize="xs" color="blue.800" fontWeight="semibold">
                      {formatCurrency(trend.value)}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="xs" color="blue.600">Profit:</Text>
                    <Text fontSize="xs" color="blue.800" fontWeight="semibold">
                      {formatCurrency(trend.profit)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
};
