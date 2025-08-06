import React from 'react';
import { Box, VStack, HStack, Heading, Text, Grid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useToast } from '@chakra-ui/react';
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
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  loading?: boolean;
  onRefresh?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  loading = false,
  onRefresh,
}) => {
  const toast = useToast();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      toast({
        title: 'Dashboard refreshed',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'green' : 'red';
  };

  const getGrowthArrow = (growth: number) => {
    return growth >= 0 ? 'increase' : 'decrease';
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading dashboard data...</Text>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box p={6}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Heading size="lg">Dashboard Overview</Heading>
            {onRefresh && (
              <Text
                fontSize="sm"
                color="blue.500"
                cursor="pointer"
                onClick={handleRefresh}
                _hover={{ textDecoration: 'underline' }}
              >
                Refresh Data
              </Text>
            )}
          </HStack>

          {/* Key Metrics Grid */}
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <Card>
              <Stat>
                <StatLabel>Total Leads</StatLabel>
                <StatNumber>{stats.totalLeads.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.leadGrowth)} />
                  {Math.abs(stats.leadGrowth).toFixed(1)}%
                </StatHelpText>
              </Stat>
            </Card>

            <Card>
              <Stat>
                <StatLabel>Conversion Rate</StatLabel>
                <StatNumber>{stats.conversionRate.toFixed(1)}%</StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.conversionGrowth)} />
                  {Math.abs(stats.conversionGrowth).toFixed(1)}%
                </StatHelpText>
              </Stat>
            </Card>

            <Card>
              <Stat>
                <StatLabel>Active Buyers</StatLabel>
                <StatNumber>{stats.activeBuyers}</StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.buyerGrowth)} />
                  {Math.abs(stats.buyerGrowth).toFixed(1)}%
                </StatHelpText>
              </Stat>
            </Card>

            <Card>
              <Stat>
                <StatLabel>Revenue</StatLabel>
                <StatNumber>${stats.revenue.toLocaleString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type={getGrowthArrow(stats.revenueGrowth)} />
                  {Math.abs(stats.revenueGrowth).toFixed(1)}%
                </StatHelpText>
              </Stat>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Card>
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="semibold">Quick Actions</Text>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <Box p={4} bg="blue.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'blue.100' }}>
                  <Text fontWeight="semibold" color="blue.600">Add New Lead</Text>
                  <Text fontSize="sm" color="blue.500">Create a new lead record</Text>
                </Box>
                <Box p={4} bg="green.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'green.100' }}>
                  <Text fontWeight="semibold" color="green.600">View Analytics</Text>
                  <Text fontSize="sm" color="green.500">Check detailed analytics</Text>
                </Box>
                <Box p={4} bg="purple.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'purple.100' }}>
                  <Text fontWeight="semibold" color="purple.600">Manage Workflows</Text>
                  <Text fontSize="sm" color="purple.500">Configure automation</Text>
                </Box>
                <Box p={4} bg="orange.50" borderRadius="md" cursor="pointer" _hover={{ bg: 'orange.100' }}>
                  <Text fontWeight="semibold" color="orange.600">Export Data</Text>
                  <Text fontSize="sm" color="orange.500">Download reports</Text>
                </Box>
              </Grid>
            </VStack>
          </Card>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}; 