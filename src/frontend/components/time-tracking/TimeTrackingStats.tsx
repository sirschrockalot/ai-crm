import React from 'react';
import {
  Grid,
  GridItem,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
} from '@chakra-ui/react';

interface TimeTrackingStatsProps {
  stats?: {
    thisWeek: number;
    billableHours: number;
    activeProjects: number;
    timesheetStatus: string;
  };
}

export const TimeTrackingStats: React.FC<TimeTrackingStatsProps> = ({ stats }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const defaultStats = {
    thisWeek: 0,
    billableHours: 0,
    activeProjects: 0,
    timesheetStatus: 'draft',
  };

  const currentStats = stats || defaultStats;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green.500';
      case 'submitted':
        return 'blue.500';
      case 'rejected':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'submitted':
        return 'Submitted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Draft';
    }
  };

  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
      {/* This Week Hours */}
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
              This Week
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {currentStats.thisWeek.toFixed(1)}h
            </StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>
        </Box>
      </GridItem>

      {/* Billable Hours */}
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
              {currentStats.billableHours.toFixed(1)}h
            </StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              12.5%
            </StatHelpText>
          </Stat>
        </Box>
      </GridItem>

      {/* Active Projects */}
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
              Active Projects
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {currentStats.activeProjects}
            </StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              2.1%
            </StatHelpText>
          </Stat>
        </Box>
      </GridItem>

      {/* Timesheet Status */}
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
              Timesheet Status
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color={getStatusColor(currentStats.timesheetStatus)}>
              {getStatusText(currentStats.timesheetStatus)}
            </StatNumber>
            <StatHelpText>
              Due in 2 days
            </StatHelpText>
          </Stat>
        </Box>
      </GridItem>
    </Grid>
  );
};
