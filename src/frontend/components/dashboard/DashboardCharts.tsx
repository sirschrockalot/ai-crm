import React from 'react';
import { Box, VStack, HStack, Text, Grid, Badge } from '@chakra-ui/react';
import { Card, Chart } from '../../components/ui';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface DashboardChartsProps {
  leadPipelineData: ChartData[];
  monthlyGrowthData: ChartData[];
  conversionTrendData: ChartData[];
  revenueData: ChartData[];
  loading?: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  leadPipelineData,
  monthlyGrowthData,
  conversionTrendData,
  revenueData,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading charts...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Charts Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
          {/* Lead Pipeline */}
          <Card header="Lead Pipeline">
            <VStack align="stretch" spacing={4}>
              {leadPipelineData.map((item) => (
                <HStack key={item.name} justify="space-between">
                  <HStack>
                    <Box w={3} h={3} borderRadius="full" bg={item.color || '#3182CE'} />
                    <Text>{item.name}</Text>
                  </HStack>
                  <Badge variant="subtle" colorScheme="blue">
                    {item.value}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Card>

          {/* Monthly Growth */}
          <Card header="Monthly Lead Growth">
            <Chart
              type="line"
              data={monthlyGrowthData}
              height={250}
              xAxisDataKey="name"
              yAxisDataKey="value"
              colors={['#3182CE']}
            />
          </Card>

          {/* Conversion Trend */}
          <Card header="Conversion Rate Trend">
            <Chart
              type="line"
              data={conversionTrendData}
              height={250}
              xAxisDataKey="name"
              yAxisDataKey="value"
              colors={['#38A169']}
            />
          </Card>

          {/* Revenue Chart */}
          <Card header="Revenue Overview">
            <Chart
              type="bar"
              data={revenueData}
              height={250}
              xAxisDataKey="name"
              yAxisDataKey="value"
              colors={['#805AD5']}
            />
          </Card>
        </Grid>

        {/* Performance Summary */}
        <Card header="Performance Summary">
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Top Performing Month</Text>
              <Text fontWeight="bold" fontSize="lg">March 2024</Text>
              <Text fontSize="sm" color="green.500">+15.3% growth</Text>
            </VStack>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Best Conversion Rate</Text>
              <Text fontWeight="bold" fontSize="lg">18.7%</Text>
              <Text fontSize="sm" color="green.500">+2.1% improvement</Text>
            </VStack>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Highest Revenue</Text>
              <Text fontWeight="bold" fontSize="lg">$67,890</Text>
              <Text fontSize="sm" color="green.500">+12.4% increase</Text>
            </VStack>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.600">Active Workflows</Text>
              <Text fontWeight="bold" fontSize="lg">12</Text>
              <Text fontSize="sm" color="blue.500">3 new this month</Text>
            </VStack>
          </Grid>
        </Card>
      </VStack>
    </Box>
  );
}; 