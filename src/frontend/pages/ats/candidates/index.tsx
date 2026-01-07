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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService, Candidate, CandidateStatus, QueryCandidatesParams } from '../../../services/atsService';

const CandidatesListPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadCandidates();
  }, [statusFilter, page]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const params: QueryCandidatesParams = {
        limit,
        page,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter as CandidateStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await atsService.listCandidates(params);
      setCandidates(response.candidates);
      setTotal(response.total);
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
    setPage(1);
    loadCandidates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      await atsService.deleteCandidate(id);
      toast({
        title: 'Success',
        description: 'Candidate deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadCandidates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete candidate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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
                <Heading size="lg">Candidates</Heading>
                <Text color="gray.600">Manage all candidate applications</Text>
              </VStack>
              <Button colorScheme="blue" onClick={() => router.push('/ats/candidates/new')}>
                <FiPlus style={{ marginRight: '8px' }} />
                Add Candidate
              </Button>
            </HStack>

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

            {/* Candidates Table */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Text>Loading candidates...</Text>
                ) : candidates.length === 0 ? (
                  <Text color="gray.500">No candidates found</Text>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Phone</Th>
                          <Th>Status</Th>
                          <Th>Source</Th>
                          <Th>Application Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {candidates.map((candidate) => (
                          <Tr key={candidate.id} _hover={{ bg: 'gray.50' }}>
                            <Td fontWeight="medium">
                              {candidate.firstName} {candidate.lastName}
                            </Td>
                            <Td>{candidate.contact.email}</Td>
                            <Td>{candidate.contact.phone || '-'}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(candidate.status)}>
                                {formatStatus(candidate.status)}
                              </Badge>
                            </Td>
                            <Td>{candidate.source || '-'}</Td>
                            <Td>
                              {candidate.applicationDate
                                ? new Date(candidate.applicationDate).toLocaleDateString()
                                : '-'}
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="View candidate"
                                  icon={<FiEye />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/ats/candidates/${candidate.id}`)}
                                />
                                <IconButton
                                  aria-label="Edit candidate"
                                  icon={<FiEdit />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push(`/ats/candidates/${candidate.id}?edit=true`)}
                                />
                                <IconButton
                                  aria-label="Delete candidate"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDelete(candidate.id)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
                {total > limit && (
                  <HStack justify="space-between" mt={4}>
                    <Text fontSize="sm" color="gray.600">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} candidates
                    </Text>
                    <HStack>
                      <Button
                        size="sm"
                        isDisabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
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

export default CandidatesListPage;

