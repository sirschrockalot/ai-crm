import React from 'react';
import {
  SimpleGrid,
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { TimeTrackingStats as TimeTrackingStatsType } from '../../types/timeTracking';

interface TimeTrackingStatsProps {
  stats: TimeTrackingStatsType | null;
  isLoading: boolean;
}

const TimeTrackingStats: React.FC<TimeTrackingStatsProps> = ({ stats, isLoading }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            bg={bgColor}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Skeleton height="20px" mb={2} />
            <Skeleton height="32px" mb={2} />
            <Skeleton height="16px" width="60%" />
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  if (!stats) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'gray.500';
      case 'submitted':
        return 'blue.500';
      case 'approved':
        return 'green.500';
      case 'rejected':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      {/* This Week */}
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        boxShadow="sm"
        _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
      >
        <Stat>
          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
            This Week
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color="blue.600">
            {stats.thisWeek}h
          </StatNumber>
          <StatHelpText>
            <StatArrow type={stats.weeklyTrend >= 0 ? 'increase' : 'decrease'} />
            {Math.abs(stats.weeklyTrend)}h from last week
          </StatHelpText>
        </Stat>
      </Box>

      {/* Billable Hours */}
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        boxShadow="sm"
        _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
      >
        <Stat>
          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
            Billable Hours
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color="green.600">
            {stats.billableHours}h
          </StatNumber>
          <StatHelpText color="green.500">
            {stats.billablePercentage}% billable
          </StatHelpText>
        </Stat>
      </Box>

      {/* Active Projects */}
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        boxShadow="sm"
        _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
      >
        <Stat>
          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
            Active Projects
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color="purple.600">
            {stats.activeProjects}
          </StatNumber>
          <StatHelpText color="orange.500">
            {stats.pendingApprovals} pending approval
          </StatHelpText>
        </Stat>
      </Box>

      {/* Timesheet Status */}
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        boxShadow="sm"
        _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
      >
        <Stat>
          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
            Timesheet Status
          </StatLabel>
          <StatNumber 
            fontSize="3xl" 
            fontWeight="bold" 
            color={getStatusColor(stats.timesheetStatus)}
          >
            {getStatusText(stats.timesheetStatus)}
          </StatNumber>
          <StatHelpText color="gray.500">
            Due Friday
          </StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
};

export default TimeTrackingStats;
