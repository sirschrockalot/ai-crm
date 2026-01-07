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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiUsers, FiBriefcase, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { atsService, Candidate, CandidateStatus, QueryCandidatesParams } from '../../services/atsService';

const AtsDashboardPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    newApplications: 0,
    inReview: 0,
    interviews: 0,
  });

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadCandidates();
  }, [statusFilter]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const params: QueryCandidatesParams = {
        limit: 10,
        page: 1,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter as CandidateStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await atsService.listCandidates(params);
      setCandidates(response.candidates);
      setStats({
        total: response.total,
        newApplications: response.candidates.filter(c => c.status === CandidateStatus.APPLICATION_RECEIVED).length,
        inReview: response.candidates.filter(c => c.status === CandidateStatus.TEAM_REVIEW).length,
        interviews: response.candidates.filter(c => 
          c.status === CandidateStatus.PHONE_SCREEN_SCHEDULED || 
          c.status === CandidateStatus.VIDEO_INTERVIEW_SCHEDULED
        ).length,
      });
    } catch (error: any) {
      console.error('Error loading candidates:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load candidates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadCandidates();
  };

  const getStatusColor = (status: CandidateStatus) => {
    const colors: Record<string, string> = {
      [CandidateStatus.APPLICATION_RECEIVED]: 'blue',
      [CandidateStatus.RESUME_REVIEW]: 'yellow',
      [CandidateStatus.PHONE_SCREEN_SCHEDULED]: 'purple',
      [CandidateStatus.PHONE_SCREEN_COMPLETED]: 'cyan',
      [CandidateStatus.TEAM_REVIEW]: 'orange',
      [CandidateStatus.VIDEO_INTERVIEW_SCHEDULED]: 'pink',
      [CandidateStatus.HIRED]: 'green',
      [CandidateStatus.REJECTED]: 'red',
    };
    return colors[status] || 'gray';
  };

  const formatStatus = (status: CandidateStatus) => {
    return status.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
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
              <VStack align="start" spacing={1}>
                <Heading size="lg">Application Tracking System</Heading>
                <Text color="gray.600">Manage candidates, interviews, and hiring pipeline</Text>
              </VStack>
              <HStack spacing={3}>
                <Button variant="outline" onClick={() => router.push('/ats/interviews')}>
                  Interviews
                </Button>
                <Button variant="outline" onClick={() => router.push('/ats/scripts')}>
                  Scripts
                </Button>
                <Button variant="outline" onClick={() => router.push('/ats/job-postings')}>
                  Job Postings
                </Button>
                <Button variant="outline" onClick={() => router.push('/ats/applications')}>
                  Applications
                </Button>
                <Button variant="outline" onClick={() => router.push('/ats/review')}>
                  Team Review
                </Button>
                <Button variant="outline" onClick={() => router.push('/ats/analytics')}>
                  Analytics
                </Button>
                <Button colorScheme="blue" onClick={() => router.push('/ats/candidates/new')}>
                  <FiPlus style={{ marginRight: '8px' }} />
                  Add Candidate
                </Button>
              </HStack>
            </HStack>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Candidates</StatLabel>
                    <StatNumber>{stats.total}</StatNumber>
                    <StatHelpText>
                      <FiUsers style={{ display: 'inline', marginRight: '4px' }} />
                      All applications
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>New Applications</StatLabel>
                    <StatNumber>{stats.newApplications}</StatNumber>
                    <StatHelpText>
                      <FiTrendingUp style={{ display: 'inline', marginRight: '4px' }} />
                      Pending review
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>In Team Review</StatLabel>
                    <StatNumber>{stats.inReview}</StatNumber>
                    <StatHelpText>
                      <FiBriefcase style={{ display: 'inline', marginRight: '4px' }} />
                      Awaiting decision
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Scheduled Interviews</StatLabel>
                    <StatNumber>{stats.interviews}</StatNumber>
                    <StatHelpText>
                      <FiCalendar style={{ display: 'inline', marginRight: '4px' }} />
                      Upcoming
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Search and Filters */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4}>
                  <InputGroup flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch />
                    </InputLeftElement>
                    <Input
                      placeholder="Search candidates by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </InputGroup>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    width="200px"
                  >
                    <option value="all">All Statuses</option>
                    <option value={CandidateStatus.APPLICATION_RECEIVED}>Application Received</option>
                    <option value={CandidateStatus.RESUME_REVIEW}>Resume Review</option>
                    <option value={CandidateStatus.PHONE_SCREEN_SCHEDULED}>Phone Screen Scheduled</option>
                    <option value={CandidateStatus.PHONE_SCREEN_COMPLETED}>Phone Screen Completed</option>
                    <option value={CandidateStatus.TEAM_REVIEW}>Team Review</option>
                    <option value={CandidateStatus.VIDEO_INTERVIEW_SCHEDULED}>Video Interview Scheduled</option>
                    <option value={CandidateStatus.HIRED}>Hired</option>
                    <option value={CandidateStatus.REJECTED}>Rejected</option>
                  </Select>
                  <Button colorScheme="blue" onClick={handleSearch}>
                    Search
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Candidates List */}
            <Card bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md">Recent Candidates</Heading>
                    <Button variant="link" onClick={() => router.push('/ats/candidates')}>
                      View All
                    </Button>
                  </HStack>
                  {isLoading ? (
                    <Text>Loading candidates...</Text>
                  ) : candidates.length === 0 ? (
                    <Text color="gray.500">No candidates found</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {candidates.map((candidate) => (
                        <Box
                          key={candidate.id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                          cursor="pointer"
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => router.push(`/ats/candidates/${candidate.id}`)}
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Text fontWeight="bold">
                                  {candidate.firstName} {candidate.lastName}
                                </Text>
                                <Badge colorScheme={getStatusColor(candidate.status)}>
                                  {formatStatus(candidate.status)}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {candidate.contact.email} • {candidate.contact.phone || 'No phone'}
                              </Text>
                              {candidate.source && (
                                <Text fontSize="xs" color="gray.500">
                                  Source: {candidate.source}
                                </Text>
                              )}
                            </VStack>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/ats/candidates/${candidate.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default AtsDashboardPage;

