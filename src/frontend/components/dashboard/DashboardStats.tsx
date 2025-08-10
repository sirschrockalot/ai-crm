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
  Button,
  IconButton,
  Tooltip,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import { RepeatIcon, TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Card, ErrorBoundary } from '../ui';

interface DashboardStatsProps {
  stats: Record<string, any>;
  variant?: 'executive' | 'acquisitions' | 'disposition' | 'team-member' | 'mobile';
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
  realtimeEnabled?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  variant = 'executive',
  loading = false,
  onRefresh,
  lastUpdated,
  realtimeEnabled = false,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const statBgColor = useColorModeValue('gray.50', 'gray.700');
  const statBorderColor = useColorModeValue('gray.200', 'gray.600');
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4 });

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast({
        title: 'Stats refreshed',
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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

  const getStatConfig = (key: string, value: any) => {
    const configs = {
      executive: {
        totalRevenue: { label: 'Total Revenue', format: formatCurrency, icon: '💰' },
        totalDeals: { label: 'Total Deals', format: formatNumber, icon: '🤝' },
        averageDealValue: { label: 'Avg Deal Value', format: formatCurrency, icon: '📊' },
        conversionRate: { label: 'Conversion Rate', format: formatPercentage, icon: '📈' },
        pipelineValue: { label: 'Pipeline Value', format: formatCurrency, icon: '🏗️' },
        teamPerformance: { label: 'Team Performance', format: formatPercentage, icon: '👥' },
        leadQuality: { label: 'Lead Quality', format: (v: number) => `${v}/10`, icon: '⭐' },
      },
      acquisitions: {
        totalLeads: { label: 'Total Leads', format: formatNumber, icon: '📋' },
        conversionRate: { label: 'Conversion Rate', format: formatPercentage, icon: '📈' },
        averageLeadValue: { label: 'Avg Lead Value', format: formatCurrency, icon: '💰' },
        responseTime: { label: 'Response Time', format: (v: number) => `${v}h`, icon: '⏱️' },
        qualityScore: { label: 'Quality Score', format: (v: number) => `${v}/10`, icon: '⭐' },
        pipelineValue: { label: 'Pipeline Value', format: formatCurrency, icon: '🏗️' },
        followUpRate: { label: 'Follow-up Rate', format: formatPercentage, icon: '📞' },
      },
      disposition: {
        totalBuyers: { label: 'Total Buyers', format: formatNumber, icon: '👥' },
        dealConversionRate: { label: 'Deal Conversion', format: formatPercentage, icon: '📈' },
        averageDealValue: { label: 'Avg Deal Value', format: formatCurrency, icon: '💰' },
        buyerEngagement: { label: 'Buyer Engagement', format: formatPercentage, icon: '🤝' },
        pipelineValue: { label: 'Pipeline Value', format: formatCurrency, icon: '🏗️' },
        responseTime: { label: 'Response Time', format: (v: number) => `${v}h`, icon: '⏱️' },
        dealCycleTime: { label: 'Cycle Time', format: (v: number) => `${v} days`, icon: '🔄' },
      },
      'team-member': {
        tasksCompleted: { label: 'Tasks Completed', format: formatNumber, icon: '✅' },
        performanceScore: { label: 'Performance', format: formatPercentage, icon: '📊' },
        timeTracked: { label: 'Hours Tracked', format: formatNumber, icon: '⏱️' },
        goalsAchieved: { label: 'Goals Achieved', format: formatNumber, icon: '🎯' },
        responseTime: { label: 'Response Time', format: (v: number) => `${v}h`, icon: '⚡' },
        qualityScore: { label: 'Quality Score', format: (v: number) => `${v}/10`, icon: '⭐' },
        productivity: { label: 'Productivity', format: formatPercentage, icon: '📈' },
      },
      mobile: {
        todayLeads: { label: 'Today\'s Leads', format: formatNumber, icon: '📱' },
        todayTasks: { label: 'Today\'s Tasks', format: formatNumber, icon: '✅' },
        responseTime: { label: 'Response Time', format: (v: number) => `${v}h`, icon: '⚡' },
        qualityScore: { label: 'Quality Score', format: (v: number) => `${v}/10`, icon: '⭐' },
        locationUpdates: { label: 'Location Updates', format: formatNumber, icon: '📍' },
        photosUploaded: { label: 'Photos Uploaded', format: formatNumber, icon: '📸' },
      },
    };

    return (configs as any)[variant]?.[key] || { label: key, format: formatNumber, icon: '📊' };
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading stats...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="md" color={textColor}>
              Key Performance Metrics
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Last updated: {formatTime(lastUpdated)}
            </Text>
          </VStack>
          <HStack spacing={2}>
            {realtimeEnabled && (
              <Badge colorScheme="green" variant="subtle">
                Real-time
              </Badge>
            )}
            {onRefresh && (
              <Tooltip label="Refresh stats">
                <IconButton
                  aria-label="Refresh stats"
                  icon={<RepeatIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                  isLoading={loading}
                />
              </Tooltip>
            )}
          </HStack>
        </HStack>

        {/* Stats Grid */}
        <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={6}>
          {Object.entries(stats).map(([key, value]) => {
            const config = getStatConfig(key, value);
            const growthKey = `${key}Growth`;
            const growth = stats[growthKey];
            
            return (
              <Stat key={key}>
                <Box
                  p={4}
                  borderRadius="md"
                  bg={statBgColor}
                  border="1px"
                  borderColor={statBorderColor}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'md',
                    transition: 'all 0.2s',
                  }}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                      {config.icon} {config.label}
                    </Text>
                  </HStack>
                  <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
                    {config.format(value)}
                  </StatNumber>
                  {growth !== undefined && (
                    <StatHelpText mb={0}>
                      <HStack spacing={1}>
                        <StatArrow type={getGrowthArrow(growth)} color={getGrowthColor(growth)} />
                        <Text color={getGrowthColor(growth)} fontSize="sm">
                          {Math.abs(growth).toFixed(1)}%
                        </Text>
                      </HStack>
                    </StatHelpText>
                  )}
                </Box>
              </Stat>
            );
          })}
        </Grid>
      </VStack>
    </Box>
  );
};
