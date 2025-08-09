import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Heading, Text, Card, Select, Grid, GridItem, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { useBuyers } from '../../hooks/services/useBuyers';
import { Buyer } from '../../types';

const BuyerAnalyticsPage: React.FC = () => {
  const { buyers, loading, error, fetchBuyers } = useBuyers();
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (!buyers) return null;

    const totalBuyers = buyers.length;
    const activeBuyers = buyers.filter(b => b.isActive).length;
    const inactiveBuyers = totalBuyers - activeBuyers;

    // Buyer type distribution
    const buyerTypes = buyers.reduce((acc, buyer) => {
      acc[buyer.buyerType] = (acc[buyer.buyerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Investment range distribution
    const investmentRanges = buyers.reduce((acc, buyer) => {
      acc[buyer.investmentRange] = (acc[buyer.investmentRange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Property type preferences
    const propertyPreferences = buyers.reduce((acc, buyer) => {
      buyer.preferredPropertyTypes.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBuyers = buyers.filter(buyer => 
      new Date(buyer.createdAt) > thirtyDaysAgo
    ).length;

    return {
      totalBuyers,
      activeBuyers,
      inactiveBuyers,
      buyerTypes,
      investmentRanges,
      propertyPreferences,
      recentBuyers,
      growthRate: totalBuyers > 0 ? ((recentBuyers / totalBuyers) * 100).toFixed(1) : '0'
    };
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Loading analytics...</Text>
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
            <Text color="red.500">Error loading analytics: {error}</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg">Buyer Analytics</Heading>
                <Text color="gray.600">Performance metrics and buyer insights</Text>
              </VStack>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                width="200px"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </Select>
            </HStack>

            {/* Key Metrics */}
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
              <Card>
                <Stat>
                  <StatLabel>Total Buyers</StatLabel>
                  <StatNumber>{analytics?.totalBuyers || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {analytics?.growthRate || 0}% growth
                  </StatHelpText>
                </Stat>
              </Card>

              <Card>
                <Stat>
                  <StatLabel>Active Buyers</StatLabel>
                  <StatNumber>{analytics?.activeBuyers || 0}</StatNumber>
                  <StatHelpText>
                    {analytics?.totalBuyers ? ((analytics.activeBuyers / analytics.totalBuyers) * 100).toFixed(1) : 0}% of total
                  </StatHelpText>
                </Stat>
              </Card>

              <Card>
                <Stat>
                  <StatLabel>New Buyers (30d)</StatLabel>
                  <StatNumber>{analytics?.recentBuyers || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Recent activity
                  </StatHelpText>
                </Stat>
              </Card>

              <Card>
                <Stat>
                  <StatLabel>Inactive Buyers</StatLabel>
                  <StatNumber>{analytics?.inactiveBuyers || 0}</StatNumber>
                  <StatHelpText>
                    Require attention
                  </StatHelpText>
                </Stat>
              </Card>
            </Grid>

            {/* Buyer Type Distribution */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Buyer Type Distribution</Heading>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {analytics?.buyerTypes && Object.entries(analytics.buyerTypes).map(([type, count]) => (
                    <Box key={type} p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="semibold" textTransform="capitalize">{type}</Text>
                      <Text fontSize="2xl" fontWeight="bold">{count}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {analytics.totalBuyers ? ((count / analytics.totalBuyers) * 100).toFixed(1) : 0}% of total
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </VStack>
            </Card>

            {/* Investment Range Distribution */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Investment Range Distribution</Heading>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {analytics?.investmentRanges && Object.entries(analytics.investmentRanges).map(([range, count]) => (
                    <Box key={range} p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="semibold">
                        {range === '0-50k' ? '$0 - $50K' :
                         range === '50k-100k' ? '$50K - $100K' :
                         range === '100k-250k' ? '$100K - $250K' :
                         range === '250k-500k' ? '$250K - $500K' :
                         range === '500k+' ? '$500K+' : range}
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold">{count}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {analytics.totalBuyers ? ((count / analytics.totalBuyers) * 100).toFixed(1) : 0}% of total
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </VStack>
            </Card>

            {/* Property Type Preferences */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Property Type Preferences</Heading>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                  {analytics?.propertyPreferences && Object.entries(analytics.propertyPreferences).map(([type, count]) => (
                    <Box key={type} p={4} bg="gray.50" borderRadius="md">
                      <Text fontWeight="semibold" textTransform="capitalize">
                        {type.replace('_', ' ')}
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold">{count}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {analytics.totalBuyers ? ((count / analytics.totalBuyers) * 100).toFixed(1) : 0}% preference
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </VStack>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default BuyerAnalyticsPage;
