import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Input,
  FormControl,
  FormLabel,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from '@chakra-ui/react';
import { DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

interface TeamAnalyticsProps {
  onRefresh?: () => void;
}

interface TeamMember {
  _id: string;
  userName: string;
  userEmail: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalEntries: number;
  billableEntries: number;
}

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ onRefresh }) => {
  const { execute } = useApi();
  const toast = useToast();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [projects, setProjects] = useState<any[]>([]);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadTeamAnalytics();
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      // This would integrate with the actual project management system
      // For now, using mock data
      const mockProjects = [
        { _id: '1', name: 'Project Alpha' },
        { _id: '2', name: 'Project Beta' },
        { _id: '3', name: 'Project Gamma' },
        { _id: '4', name: 'Internal Development' },
      ];
      setProjects(mockProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadTeamAnalytics = async () => {
    try {
      setIsLoading(true);

      const response = await execute({
        method: 'GET',
        url: '/api/time-tracking/team-analytics',
        params: filters,
      });

      setTeamMembers(response.data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load team analytics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async () => {
    try {
      const response = await execute({
        method: 'POST',
        url: '/api/time-tracking/export',
        data: {
          format: 'csv',
          startDate: filters.startDate,
          endDate: filters.endDate,
          projectId: filters.projectId,
          includeStatus: true,
        },
      });

      if (response.data && response.data.format === 'csv') {
        const csvContent = response.data.data.map((row: any[]) => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Export Successful',
          description: 'Team analytics exported to CSV',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export team analytics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const calculateTotals = () => {
    return teamMembers.reduce(
      (acc, member) => ({
        totalHours: acc.totalHours + member.totalHours,
        billableHours: acc.billableHours + member.billableHours,
        nonBillableHours: acc.nonBillableHours + member.nonBillableHours,
        totalEntries: acc.totalEntries + member.totalEntries,
        billableEntries: acc.billableEntries + member.billableEntries,
      }),
      {
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0,
        totalEntries: 0,
        billableEntries: 0,
      }
    );
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Filters */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <HStack spacing={4} align="end">
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Project</FormLabel>
            <Select
              placeholder="All Projects"
              value={filters.projectId || ''}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
            >
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button
                            leftIcon={<RepeatIcon />}
            onClick={loadTeamAnalytics}
            size="md"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={handleExport}
            size="md"
          >
            Export
          </Button>
        </HStack>
      </Box>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel>Total Hours</StatLabel>
            <StatNumber>{totals.totalHours.toFixed(1)}h</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              This period
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel>Billable Hours</StatLabel>
            <StatNumber>{totals.billableHours.toFixed(1)}h</StatNumber>
            <StatHelpText>
              {((totals.billableHours / totals.totalHours) * 100).toFixed(1)}% of total
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel>Total Entries</StatLabel>
            <StatNumber>{totals.totalEntries}</StatNumber>
            <StatHelpText>
              Across {teamMembers.length} team members
            </StatHelpText>
          </Stat>
        </Box>
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Stat>
            <StatLabel>Avg Hours/Person</StatLabel>
            <StatNumber>
              {teamMembers.length > 0 ? (totals.totalHours / teamMembers.length).toFixed(1) : 0}h
            </StatNumber>
            <StatHelpText>
              Per team member
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Team Members Table */}
      <Box
        bg={cardBg}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">
            Team Performance ({teamMembers.length} members)
          </Text>
        </Box>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Team Member</Th>
              <Th>Total Hours</Th>
              <Th>Billable Hours</Th>
              <Th>Non-Billable</Th>
              <Th>Total Entries</Th>
              <Th>Billable %</Th>
              <Th>Avg Hours/Day</Th>
            </Tr>
          </Thead>
          <Tbody>
            {teamMembers.map((member) => {
              const billablePercentage = member.totalHours > 0 
                ? ((member.billableHours / member.totalHours) * 100).toFixed(1)
                : '0.0';
              
              const avgHoursPerDay = member.totalHours / 7; // Assuming 7-day week

              return (
                <Tr key={member._id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{member.userName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {member.userEmail}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">{member.totalHours.toFixed(1)}h</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">{member.billableHours.toFixed(1)}h</Text>
                  </Td>
                  <Td>
                    <Text>{member.nonBillableHours.toFixed(1)}h</Text>
                  </Td>
                  <Td>
                    <Text>{member.totalEntries}</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={parseFloat(billablePercentage) >= 80 ? 'green' : 'yellow'}
                      size="sm"
                    >
                      {billablePercentage}%
                    </Badge>
                  </Td>
                  <Td>
                    <Text>{avgHoursPerDay.toFixed(1)}h</Text>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      {teamMembers.length === 0 && (
        <Alert status="info">
          <AlertIcon />
          No team data available for the selected filters. Try adjusting your date range or project selection.
        </Alert>
      )}
    </VStack>
  );
};
