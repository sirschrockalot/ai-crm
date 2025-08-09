import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Lead } from '../types/lead';

interface LeadAnalyticsProps {
  leads: Lead[];
  dateRange: string;
  loading?: boolean;
}

export const LeadAnalytics: React.FC<LeadAnalyticsProps> = ({
  leads,
  dateRange,
  loading = false,
}) => {
  // Calculate time-based data
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
        return leadDate === dateStr;
      });
      
      data.push({
        date: dateStr,
        new: dayLeads.filter(lead => lead.status === 'new').length,
        contacted: dayLeads.filter(lead => lead.status === 'contacted').length,
        qualified: dayLeads.filter(lead => lead.status === 'qualified').length,
        converted: dayLeads.filter(lead => lead.status === 'converted').length,
        lost: dayLeads.filter(lead => lead.status === 'lost').length,
        total: dayLeads.length,
        value: dayLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0),
      });
    }
    
    return data;
  }, [leads, dateRange]);

  // Calculate conversion funnel
  const conversionFunnel = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter(lead => lead.status === 'contacted' || lead.status === 'qualified' || lead.status === 'converted').length;
    const qualified = leads.filter(lead => lead.status === 'qualified' || lead.status === 'converted').length;
    const converted = leads.filter(lead => lead.status === 'converted').length;
    
    return [
      { stage: 'Total Leads', count: total, percentage: 100 },
      { stage: 'Contacted', count: contacted, percentage: total > 0 ? (contacted / total) * 100 : 0 },
      { stage: 'Qualified', count: qualified, percentage: total > 0 ? (qualified / total) * 100 : 0 },
      { stage: 'Converted', count: converted, percentage: total > 0 ? (converted / total) * 100 : 0 },
    ];
  }, [leads]);

  // Calculate lead sources (mock data for now)
  const leadSources = useMemo(() => {
    const sources = [
      { name: 'Website', count: Math.floor(leads.length * 0.4), color: '#3B82F6' },
      { name: 'Referral', count: Math.floor(leads.length * 0.25), color: '#10B981' },
      { name: 'Social Media', count: Math.floor(leads.length * 0.2), color: '#F59E0B' },
      { name: 'Direct', count: Math.floor(leads.length * 0.1), color: '#EF4444' },
      { name: 'Other', count: Math.floor(leads.length * 0.05), color: '#8B5CF6' },
    ];
    return sources;
  }, [leads]);

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading analytics...</Text>
      </Box>
    );
  }

  if (leads.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        No lead data available for the selected time period.
      </Alert>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Lead Activity Over Time
          </Text>
        </CardHeader>
        <CardBody>
          <Box h="300px" position="relative">
            {/* Simple bar chart representation */}
            <HStack spacing={2} align="end" h="250px">
              {timeSeriesData.map((day, index) => (
                <Box
                  key={day.date}
                  flex={1}
                  bg="blue.500"
                  minH="20px"
                  h={`${Math.max((day.total / Math.max(...timeSeriesData.map(d => d.total))) * 200, 20)}px`}
                  borderRadius="sm"
                  position="relative"
                  _hover={{ bg: 'blue.600' }}
                >
                  <Box
                    position="absolute"
                    bottom="-20px"
                    left="50%"
                    transform="translateX(-50%)"
                    fontSize="xs"
                    color="gray.600"
                    whiteSpace="nowrap"
                  >
                    {index % Math.ceil(timeSeriesData.length / 7) === 0 ? 
                      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                      ''
                    }
                  </Box>
                </Box>
              ))}
            </HStack>
            <Text fontSize="sm" color="gray.600" mt={4} textAlign="center">
              Lead volume over the last {dateRange === '7d' ? '7 days' : 
                                       dateRange === '30d' ? '30 days' : 
                                       dateRange === '90d' ? '90 days' : 'year'}
            </Text>
          </Box>
        </CardBody>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Conversion Funnel
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {conversionFunnel.map((stage, index) => (
              <Box key={stage.stage} w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">{stage.stage}</Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      {stage.count} leads
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {stage.percentage.toFixed(1)}%
                    </Text>
                  </HStack>
                </HStack>
                <Box
                  w="full"
                  h="8px"
                  bg="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    bg={index === 0 ? 'blue.500' : 
                        index === 1 ? 'yellow.500' : 
                        index === 2 ? 'orange.500' : 'green.500'}
                    w={`${stage.percentage}%`}
                    transition="width 0.3s ease"
                  />
                </Box>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Lead Sources */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Lead Sources
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {leadSources.map((source) => (
                <Box key={source.name} w="full">
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Box
                        w="3"
                        h="3"
                        borderRadius="full"
                        bg={source.color}
                      />
                      <Text fontSize="sm" fontWeight="medium">
                        {source.name}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="semibold">
                      {source.count}
                    </Text>
                  </HStack>
                  <Box
                    w="full"
                    h="6px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      bg={source.color}
                      w={`${(source.count / leads.length) * 100}%`}
                      transition="width 0.3s ease"
                    />
                  </Box>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Value Distribution */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Lead Value Distribution
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {[
                { range: 'Under $100k', min: 0, max: 100000, color: 'red.500' },
                { range: '$100k - $250k', min: 100000, max: 250000, color: 'orange.500' },
                { range: '$250k - $500k', min: 250000, max: 500000, color: 'yellow.500' },
                { range: '$500k - $1M', min: 500000, max: 1000000, color: 'green.500' },
                { range: 'Over $1M', min: 1000000, max: Infinity, color: 'blue.500' },
              ].map((range) => {
                const count = leads.filter(lead => 
                  lead.estimatedValue >= range.min && lead.estimatedValue < range.max
                ).length;
                const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                
                return (
                  <Box key={range.range} w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {range.range}
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {count} ({percentage.toFixed(1)}%)
                      </Text>
                    </HStack>
                    <Box
                      w="full"
                      h="6px"
                      bg="gray.200"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box
                        h="full"
                        bg={range.color}
                        w={`${percentage}%`}
                        transition="width 0.3s ease"
                      />
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Performance Summary
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {leads.length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Total Leads
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {leads.filter(lead => lead.status === 'converted').length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Conversions
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                ${leads.reduce((sum, lead) => sum + lead.estimatedValue, 0).toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Total Value
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {leads.length > 0 ? 
                  (leads.filter(lead => lead.status === 'converted').length / leads.length * 100).toFixed(1) : 
                  '0'
                }%
              </Text>
              <Text fontSize="sm" color="gray.600">
                Conversion Rate
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  );
};
