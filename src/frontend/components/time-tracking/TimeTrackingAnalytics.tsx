import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Select,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { DownloadIcon, CalendarIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

interface TimeTrackingAnalyticsProps {
  onRefresh: () => void;
}

interface AnalyticsData {
  weeklyHours: number[];
  billableVsNonBillable: {
    billable: number;
    nonBillable: number;
  };
  projectAllocation: {
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
  }[];
  timeTrends: {
    date: string;
    hours: number;
  }[];
  productivityMetrics: {
    averageHoursPerDay: number;
    mostProductiveDay: string;
    totalBillableHours: number;
    totalNonBillableHours: number;
  };
}

export const TimeTrackingAnalytics: React.FC<TimeTrackingAnalyticsProps> = ({
  onRefresh,
}) => {
  const { execute } = useApi();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('thisWeek');
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedProject]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // This would integrate with the actual analytics API
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      const mockData: AnalyticsData = {
        weeklyHours: [8.5, 7.2, 9.1, 6.8, 8.0, 4.5, 0],
        billableVsNonBillable: {
          billable: 32.1,
          nonBillable: 12.0,
        },
        projectAllocation: [
          { projectId: '1', projectName: 'Project Alpha', hours: 18.5, percentage: 42 },
          { projectId: '2', projectName: 'Project Beta', hours: 12.0, percentage: 27 },
          { projectId: '3', projectName: 'Project Gamma', hours: 8.0, percentage: 18 },
          { projectId: '4', projectName: 'Internal Development', hours: 5.6, percentage: 13 },
        ],
        timeTrends: [
          { date: '2024-01-01', hours: 8.5 },
          { date: '2024-01-02', hours: 7.2 },
          { date: '2024-01-03', hours: 9.1 },
          { date: '2024-01-04', hours: 6.8 },
          { date: '2024-01-05', hours: 8.0 },
          { date: '2024-01-06', hours: 4.5 },
          { date: '2024-01-07', hours: 0 },
        ],
        productivityMetrics: {
          averageHoursPerDay: 6.3,
          mostProductiveDay: 'Wednesday',
          totalBillableHours: 32.1,
          totalNonBillableHours: 12.0,
        },
      };

      setAnalyticsData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      // This would integrate with the actual export API
      console.log(`Exporting analytics data in ${format} format`);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show a success message
      alert(`Analytics data exported successfully in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case 'thisWeek':
        return 'This Week';
      case 'lastWeek':
        return 'Last Week';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      case 'custom':
        return 'Custom Range';
      default:
        return 'This Week';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with Controls */}
      <HStack justify="space-between" align="center">
        <Heading size="md">Time Tracking Analytics</Heading>
        <HStack spacing={3}>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="sm"
            width="150px"
          >
            <option value="thisWeek">This Week</option>
            <option value="lastWeek">Last Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </Select>
          
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            size="sm"
            width="150px"
          >
            <option value="all">All Projects</option>
            {analyticsData.projectAllocation.map(project => (
              <option key={project.projectId} value={project.projectId}>
                {project.projectName}
              </option>
            ))}
          </Select>

          <Button
            leftIcon={<CalendarIcon />}
            size="sm"
            variant="outline"
            onClick={loadAnalyticsData}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      {/* Productivity Metrics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
        <GridItem>
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Average Hours/Day
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold">
                {analyticsData.productivityMetrics.averageHoursPerDay.toFixed(1)}h
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12.5%
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Most Productive Day
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold">
                {analyticsData.productivityMetrics.mostProductiveDay}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                9.1h average
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Billable Hours
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">
                {analyticsData.productivityMetrics.totalBillableHours.toFixed(1)}h
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                73% of total
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>

        <GridItem>
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                Non-Billable Hours
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.500">
                {analyticsData.productivityMetrics.totalNonBillableHours.toFixed(1)}h
              </StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                27% of total
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>
      </Grid>

      {/* Weekly Hours Chart */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>
          Weekly Hours Distribution
        </Heading>
        <Box height="200px" display="flex" alignItems="end" justifyContent="space-around">
          {analyticsData.weeklyHours.map((hours, index) => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const maxHeight = 150;
            const height = (hours / 10) * maxHeight; // Assuming 10 hours is max
            
            return (
              <Box key={index} textAlign="center">
                <Box
                  bg="blue.500"
                  height={`${height}px`}
                  width="40px"
                  borderRadius="md"
                  mb={2}
                  transition="all 0.3s"
                  _hover={{ bg: 'blue.600' }}
                />
                <Text fontSize="xs" color="gray.600">
                  {dayNames[index]}
                </Text>
                <Text fontSize="xs" fontWeight="medium">
                  {hours.toFixed(1)}h
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Project Allocation */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>
          Project Time Allocation
        </Heading>
        <VStack spacing={3} align="stretch">
          {analyticsData.projectAllocation.map((project) => (
            <Box key={project.projectId}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">
                  {project.projectName}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {project.hours.toFixed(1)}h ({project.percentage}%)
                </Text>
              </HStack>
              <Box
                bg="gray.200"
                height="8px"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  bg="blue.500"
                  height="100%"
                  width={`${project.percentage}%`}
                  borderRadius="full"
                  transition="width 0.3s"
                />
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Export Actions */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            Export analytics data for {getDateRangeLabel(dateRange)}
          </Text>
          <HStack spacing={2}>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              variant="outline"
              onClick={() => handleExport('csv')}
            >
              CSV
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              variant="outline"
              onClick={() => handleExport('pdf')}
            >
              PDF
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              variant="outline"
              onClick={() => handleExport('excel')}
            >
              Excel
            </Button>
          </HStack>
        </HStack>
      </Box>
    </VStack>
  );
};
