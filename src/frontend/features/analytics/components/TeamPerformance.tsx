import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Select,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  Avatar,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { Card, Chart, ErrorBoundary, Loading, Table } from '../../../components/ui';
import { useAnalytics } from '../hooks/useAnalytics';
import { AnalyticsFilters, TeamPerformanceData } from '../types/analytics';

interface TeamPerformanceProps {
  timeRange?: string;
  onMemberSelect?: (memberId: string) => void;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({
  timeRange = '30d',
  onMemberSelect,
}) => {
  const toast = useToast();
  const {
    analyticsData,
    loading,
    error,
    isAuthenticated,
    updateFilters,
  } = useAnalytics();

  const [selectedMember, setSelectedMember] = useState<string>('');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: timeRange as '7d' | '30d' | '90d' | '1y',
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access team performance analytics.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Fetch team performance data on mount
    // fetchTeamPerformance(filters);
  }, [filters, isAuthenticated, toast]);

  // Handle member selection
  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
    onMemberSelect?.(memberId);
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access team performance analytics.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (loading && !analyticsData) {
    return <Loading variant="spinner" size="lg" />;
  }

  // Show error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Team Performance</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Mock team performance data (in real app, this would come from analyticsData)
  const teamData: TeamPerformanceData[] = [
    {
      memberId: '1',
      memberName: 'John Smith',
      leadsAssigned: 45,
      leadsConverted: 12,
      conversionRate: 26.7,
      averageValue: 285000,
      totalRevenue: 3420000,
    },
    {
      memberId: '2',
      memberName: 'Sarah Johnson',
      leadsAssigned: 38,
      leadsConverted: 15,
      conversionRate: 39.5,
      averageValue: 320000,
      totalRevenue: 4800000,
    },
    {
      memberId: '3',
      memberName: 'Mike Davis',
      leadsAssigned: 52,
      leadsConverted: 18,
      conversionRate: 34.6,
      averageValue: 295000,
      totalRevenue: 5310000,
    },
    {
      memberId: '4',
      memberName: 'Lisa Wilson',
      leadsAssigned: 41,
      leadsConverted: 14,
      conversionRate: 34.1,
      averageValue: 310000,
      totalRevenue: 4340000,
    },
    {
      memberId: '5',
      memberName: 'David Brown',
      leadsAssigned: 35,
      leadsConverted: 10,
      conversionRate: 28.6,
      averageValue: 275000,
      totalRevenue: 2750000,
    },
  ];

  const performanceChartData = teamData.map(member => ({
    name: member.memberName,
    value: member.conversionRate,
  }));

  const revenueChartData = teamData.map(member => ({
    name: member.memberName,
    value: member.totalRevenue / 1000000, // Convert to millions
  }));

  const tableColumns = [
    {
      key: 'member',
      header: 'Team Member',
      accessor: (member: TeamPerformanceData) => (
        <HStack spacing={3}>
          <Avatar size="sm" name={member.memberName} />
          <VStack align="start" spacing={0}>
            <Text fontWeight="semibold">{member.memberName}</Text>
            <Text fontSize="sm" color="gray.500">ID: {member.memberId}</Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: 'leads',
      header: 'Leads',
      accessor: (member: TeamPerformanceData) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="semibold">{member.leadsAssigned}</Text>
          <Text fontSize="sm" color="gray.500">Assigned</Text>
        </VStack>
      ),
    },
    {
      key: 'conversions',
      header: 'Conversions',
      accessor: (member: TeamPerformanceData) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="semibold">{member.leadsConverted}</Text>
          <Text fontSize="sm" color="gray.500">Converted</Text>
        </VStack>
      ),
    },
    {
      key: 'conversionRate',
      header: 'Conversion Rate',
      accessor: (member: TeamPerformanceData) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="semibold">{member.conversionRate.toFixed(1)}%</Text>
          <Progress value={member.conversionRate} size="sm" colorScheme="blue" />
        </VStack>
      ),
    },
    {
      key: 'averageValue',
      header: 'Avg Value',
      accessor: (member: TeamPerformanceData) => (
        <Text fontWeight="semibold">${member.averageValue.toLocaleString()}</Text>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      accessor: (member: TeamPerformanceData) => (
        <Text fontWeight="semibold">${(member.totalRevenue / 1000000).toFixed(1)}M</Text>
      ),
    },
    {
      key: 'performance',
      header: 'Performance',
      accessor: (member: TeamPerformanceData) => {
        const performance = member.conversionRate;
        let colorScheme: string;
        if (performance >= 35) colorScheme = 'green';
        else if (performance >= 25) colorScheme = 'yellow';
        else colorScheme = 'red';
        
        return (
          <Badge colorScheme={colorScheme}>
            {performance >= 35 ? 'High' : performance >= 25 ? 'Medium' : 'Low'}
          </Badge>
        );
      },
    },
  ];

  return (
    <ErrorBoundary>
      <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Team Performance</Heading>
            <Text color="gray.600">
              Track individual and team performance metrics
            </Text>
          </VStack>
          <Select
            placeholder="Select Team Member"
            value={selectedMember}
            onChange={(e) => handleMemberSelect(e.target.value)}
            maxW="200px"
          >
            {teamData.map((member) => (
              <option key={member.memberId} value={member.memberId}>
                {member.memberName}
              </option>
            ))}
          </Select>
        </HStack>

        {/* Performance Charts */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Conversion Rate by Team Member</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type="bar"
                  data={performanceChartData}
                  title="Conversion Rate by Team Member"
                  showGrid={true}
                  colors={['#3182CE']}
                />
              )}
            </VStack>
          </Card>

          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Revenue by Team Member</Heading>
              {loading ? (
                <Loading variant="skeleton" />
              ) : (
                <Chart
                  type="bar"
                  data={revenueChartData}
                  title="Revenue by Team Member"
                  showGrid={true}
                  colors={['#38A169']}
                />
              )}
            </VStack>
          </Card>
        </Grid>

        {/* Team Performance Table */}
        <Card>
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Team Performance Details</Heading>
            {loading ? (
              <Loading variant="skeleton" />
            ) : (
              <Table
                data={teamData}
                columns={tableColumns}
                onRowClick={(member) => handleMemberSelect(member.memberId)}
              />
            )}
          </VStack>
        </Card>

        {/* Team Summary Metrics */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Total Team Members</Text>
              <Text fontSize="2xl" fontWeight="bold">{teamData.length}</Text>
              <Text fontSize="sm" color="gray.500">Active team</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Avg Conversion Rate</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {(teamData.reduce((sum, member) => sum + member.conversionRate, 0) / teamData.length).toFixed(1)}%
              </Text>
              <Text fontSize="sm" color="green.500">+2.1% from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Total Revenue</Text>
              <Text fontSize="2xl" fontWeight="bold">
                ${(teamData.reduce((sum, member) => sum + member.totalRevenue, 0) / 1000000).toFixed(1)}M
              </Text>
              <Text fontSize="sm" color="green.500">+$1.2M from last month</Text>
            </VStack>
          </Card>
          <Card>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Top Performer</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {teamData.reduce((top, member) => 
                  member.conversionRate > top.conversionRate ? member : top
                ).memberName}
              </Text>
              <Text fontSize="sm" color="gray.500">39.5% conversion rate</Text>
            </VStack>
          </Card>
        </Grid>
      </VStack>
    </ErrorBoundary>
  );
};
