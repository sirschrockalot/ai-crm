import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Grid,
  Button,
  useColorModeValue,
  Divider,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ExternalLinkIcon } from '@chakra-ui/icons';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'away';
  metrics: {
    callsMade?: number;
    offersMade?: number;
    contractsLeads?: string;
    conversionRate?: number;
    dialsMade?: number;
    newBuyersAdded?: number;
    dealsAssigned?: number;
    avgBuyersPerDeal?: number;
  };
  team: 'acquisitions' | 'disposition' | 'support' | 'management';
}

interface TeamPerformanceProps {
  teamMembers: TeamMember[];
  variant?: 'executive' | 'acquisitions' | 'disposition';
  onMemberClick?: (member: TeamMember) => void;
  onViewDetails?: (team: string) => void;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({
  teamMembers,
  variant = 'executive',
  onMemberClick,
  onViewDetails,
}) => {
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month'>('week');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'red',
      away: 'yellow',
    };
    return (colors as any)[status] || 'gray';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Active',
      inactive: 'Inactive',
      away: 'Away',
    };
    return (texts as any)[status] || status;
  };

  const getTeamIcon = (team: string) => {
    const icons = {
      acquisitions: '🎯',
      disposition: '🤝',
      support: '🛠️',
      management: '👔',
    };
    return (icons as any)[team] || '👥';
  };

  const getTeamTitle = (team: string) => {
    const titles = {
      acquisitions: 'Acquisition Team',
      disposition: 'Disposition Team',
      support: 'Support Team',
      management: 'Management Team',
    };
    return (titles as any)[team] || team;
  };

  const formatMetric = (value: any, type: string) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    if (type === 'ratio') {
      return value;
    }
    return value?.toLocaleString() || '0';
  };

  const getMetricHighlight = (value: number | string, type: string) => {
    if (type === 'percentage') {
      if (typeof value === 'number' && value >= 50) return 'highlight';
      if (typeof value === 'number' && value >= 30) return 'warning';
      return 'danger';
    }
    if (type === 'ratio') {
      if (typeof value === 'string') {
        const [contracts, leads] = value.split('/').map(Number);
        const rate = (contracts / leads) * 100;
        if (rate >= 50) return 'highlight';
        if (rate >= 30) return 'warning';
        return 'danger';
      }
    }
    return 'normal';
  };

  const groupedMembers = teamMembers.reduce((acc, member) => {
    if (!acc[member.team]) {
      acc[member.team] = [];
    }
    acc[member.team].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const handleTimePeriodChange = (period: 'today' | 'week' | 'month') => {
    setTimePeriod(period);
    // In a real app, this would trigger data refresh
  };

  const handleMemberClick = (member: TeamMember) => {
    if (onMemberClick) {
      onMemberClick(member);
    }
  };

  const handleViewDetails = (team: string) => {
    if (onViewDetails) {
      onViewDetails(team);
    }
  };

  return (
    <Box bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor} p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Team Performance
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant={timePeriod === 'today' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => handleTimePeriodChange('today')}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={timePeriod === 'week' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => handleTimePeriodChange('week')}
          >
            This Week
          </Button>
          <Button
            size="sm"
            variant={timePeriod === 'month' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => handleTimePeriodChange('month')}
          >
            This Month
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        {Object.entries(groupedMembers).map(([team, members]) => (
          <Box key={team}>
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Text fontSize="lg">{getTeamIcon(team)}</Text>
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  {getTeamTitle(team)}
                </Text>
              </HStack>
              <IconButton
                size="sm"
                icon={<ExternalLinkIcon />}
                aria-label={`View ${team} details`}
                variant="ghost"
                onClick={() => handleViewDetails(team)}
              />
            </HStack>
            
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(auto-fit, minmax(350px, 1fr))',
              }}
              gap={4}
            >
              {members.map((member) => (
                <Box
                  key={member.id}
                  bg={hoverBg}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  p={4}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    shadow: 'md',
                    borderColor: 'blue.300',
                  }}
                  onClick={() => handleMemberClick(member)}
                >
                  <HStack justify="space-between" mb={4}>
                    <HStack>
                      <Avatar
                        size="md"
                        name={member.name}
                        src={member.avatar}
                        bg="blue.500"
                        color="white"
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold" color={textColor}>
                          {member.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {member.role}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorScheme={getStatusColor(member.status)}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getStatusText(member.status)}
                    </Badge>
                  </HStack>

                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    {member.team === 'acquisitions' ? (
                      <>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Calls Made
                          </Text>
                          <Text fontWeight="semibold" color={textColor}>
                            {formatMetric(member.metrics.callsMade, 'number')}
                          </Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Offers Made
                          </Text>
                          <Text fontWeight="semibold" color={textColor}>
                            {formatMetric(member.metrics.offersMade, 'number')}
                          </Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Contracts/Leads
                          </Text>
                          <Text fontWeight="semibold" color={textColor}>
                            {formatMetric(member.metrics.contractsLeads, 'ratio')}
                          </Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Conversion Rate
                          </Text>
                          <Text
                            fontWeight="semibold"
                            color={getMetricHighlight(member.metrics.conversionRate || 0, 'percentage') === 'highlight' ? 'green.500' : 
                                   getMetricHighlight(member.metrics.conversionRate || 0, 'percentage') === 'warning' ? 'orange.500' : 'red.500'}
                          >
                            {formatMetric(member.metrics.conversionRate, 'percentage')}
                          </Text>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Dials Made
                          </Text>
                          <Text fontWeight="semibold" color={textColor}>
                            {formatMetric(member.metrics.dialsMade, 'number')}
                          </Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            New Buyers Added
                          </Text>
                          <Text fontWeight="semibold" color={textColor}>
                            {formatMetric(member.metrics.newBuyersAdded, 'number')}
                          </Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Deals Assigned
                          </Text>
                          <Text fontWeight="semibold" color={textColor}>
                            {formatMetric(member.metrics.dealsAssigned, 'number')}
                          </Text>
                        </Box>
                        <Box bg="white" p={3} borderRadius="md" border="1px" borderColor={borderColor}>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Avg Buyers/Deal
                          </Text>
                          <Text
                            fontWeight="semibold"
                            color={getMetricHighlight(member.metrics.avgBuyersPerDeal || 0, 'number') === 'highlight' ? 'green.500' : 
                                   getMetricHighlight(member.metrics.avgBuyersPerDeal || 0, 'number') === 'warning' ? 'orange.500' : 'red.500'}
                          >
                            {formatMetric(member.metrics.avgBuyersPerDeal, 'number')}
                          </Text>
                        </Box>
                      </>
                    )}
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
