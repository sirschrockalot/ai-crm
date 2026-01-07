import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Heading,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  IconButton,
  Spinner,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiCalendar, FiUser, FiClock, FiEdit, FiEye } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

const InterviewsListPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadInterviews();
  }, [page, statusFilter, typeFilter]);

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const data = await atsService.listInterviews(params);
      setInterviews(data.interviews || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      console.error('Error loading interviews:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load interviews',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'in_progress':
        return 'yellow';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'no_show':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phone_screen':
        return 'Phone Screen';
      case 'video_interview':
        return 'Video Interview';
      case 'panel_interview':
        return 'Panel Interview';
      case 'technical_assessment':
        return 'Technical Assessment';
      case 'final_round':
        return 'Final Round';
      default:
        return type;
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = {
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    inProgress: interviews.filter(i => i.status === 'in_progress').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    total: total,
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <Heading size="lg">Interviews</Heading>
              <Button
                colorScheme="blue"
                leftIcon={<FiPlus />}
                onClick={() => router.push('/ats/interviews/new')}
              >
                Schedule Interview
              </Button>
            </HStack>

            {/* Stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Scheduled</StatLabel>
                    <StatNumber>{stats.scheduled}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>In Progress</StatLabel>
                    <StatNumber>{stats.inProgress}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Completed</StatLabel>
                    <StatNumber>{stats.completed}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total</StatLabel>
                    <StatNumber>{stats.total}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4} flexWrap="wrap">
                  <Box flex={1} minW="200px">
                    <Input
                      placeholder="Search by candidate name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Box>
                  <Select
                    placeholder="All Statuses"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    w="200px"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </Select>
                  <Select
                    placeholder="All Types"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    w="200px"
                  >
                    <option value="phone_screen">Phone Screen</option>
                    <option value="video_interview">Video Interview</option>
                    <option value="panel_interview">Panel Interview</option>
                    <option value="technical_assessment">Technical Assessment</option>
                    <option value="final_round">Final Round</option>
                  </Select>
                  <Button onClick={loadInterviews}>Apply Filters</Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Interviews Table */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" p={8}>
                    <Spinner size="xl" />
                  </Flex>
                ) : interviews.length === 0 ? (
                  <Text textAlign="center" p={8} color="gray.500">
                    No interviews found
                  </Text>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Candidate</Th>
                          <Th>Type</Th>
                          <Th>Status</Th>
                          <Th>Scheduled</Th>
                          <Th>Interviewer</Th>
                          <Th>Score</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {interviews.map((interview) => (
                          <Tr key={interview.id}>
                            <Td>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => interview.candidateId && router.push(`/ats/candidates/${interview.candidateId}`)}
                              >
                                {interview.candidateId ? `Candidate ${interview.candidateId.substring(0, 8)}` : 'N/A'}
                              </Button>
                            </Td>
                            <Td>
                              <Badge>{getTypeLabel(interview.type)}</Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(interview.status)}>
                                {interview.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm">{formatDate(interview.scheduledStartTime)}</Text>
                                {interview.actualStartTime && (
                                  <Text fontSize="xs" color="gray.500">
                                    Started: {formatDate(interview.actualStartTime)}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm">{interview.primaryInterviewer?.name || 'N/A'}</Text>
                            </Td>
                            <Td>
                              {interview.totalScore !== undefined ? (
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold">{interview.totalScore}/27</Text>
                                  {interview.recommendation && (
                                    <Text fontSize="xs" color="gray.500">
                                      {interview.recommendation.replace('_', ' ').toUpperCase()}
                                    </Text>
                                  )}
                                </VStack>
                              ) : (
                                <Text color="gray.400">-</Text>
                              )}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="View Interview"
                                  icon={<FiEye />}
                                  size="sm"
                                  onClick={() => router.push(`/ats/interviews/${interview.id}`)}
                                />
                                {interview.status === 'scheduled' && (
                                  <IconButton
                                    aria-label="Edit Interview"
                                    icon={<FiEdit />}
                                    size="sm"
                                    onClick={() => router.push(`/ats/interviews/${interview.id}/edit`)}
                                  />
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}

                {/* Pagination */}
                {total > limit && (
                  <HStack justify="space-between" mt={4}>
                    <Text fontSize="sm" color="gray.600">
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} interviews
                    </Text>
                    <HStack>
                      <Button
                        size="sm"
                        isDisabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Text fontSize="sm">Page {page}</Text>
                      <Button
                        size="sm"
                        isDisabled={page * limit >= total}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </HStack>
                  </HStack>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default InterviewsListPage;

