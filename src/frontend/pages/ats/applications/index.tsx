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
import { FiPlus, FiSearch, FiEye, FiFileText } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

interface Application {
  id: string;
  candidateId: string;
  jobPostingId: string;
  source: string;
  status: string;
  applicationDate: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  candidate?: {
    firstName: string;
    lastName: string;
    contact: {
      email: string;
      phone?: string;
    };
  };
  jobPosting?: {
    title: string;
    department?: string;
  };
}

const ApplicationsListPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadApplications();
  }, [statusFilter, sourceFilter, page]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        limit,
        page,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (sourceFilter !== 'all') {
        params.source = sourceFilter;
      }

      const response = await atsService.listApplications(params);
      setApplications(response.applications || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load applications',
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
    loadApplications();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'yellow',
      review: 'blue',
      shortlisted: 'green',
      rejected: 'red',
      hired: 'green',
      withdrawn: 'gray',
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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
                <Heading size="lg">Applications</Heading>
                <Text color="gray.600">View and manage job applications</Text>
              </VStack>
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
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </InputGroup>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    width="180px"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="review">Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                    <option value="withdrawn">Withdrawn</option>
                  </Select>
                  <Select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    width="180px"
                  >
                    <option value="all">All Sources</option>
                    <option value="indeed">Indeed</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="manual">Manual</option>
                    <option value="referral">Referral</option>
                  </Select>
                  <Button colorScheme="blue" onClick={handleSearch}>
                    Search
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Applications Table */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Text>Loading applications...</Text>
                ) : applications.length === 0 ? (
                  <VStack spacing={4} py={8}>
                    <FiFileText size={48} color="gray" />
                    <Text color="gray.500">No applications found</Text>
                  </VStack>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Candidate</Th>
                        <Th>Job Posting</Th>
                        <Th>Source</Th>
                        <Th>Status</Th>
                        <Th>Application Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {applications.map((application) => (
                        <Tr key={application.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            {application.candidate ? (
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">
                                  {application.candidate.firstName}{' '}
                                  {application.candidate.lastName}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {application.candidate.contact.email}
                                </Text>
                              </VStack>
                            ) : (
                              <Text color="gray.500">Unknown Candidate</Text>
                            )}
                          </Td>
                          <Td>
                            {application.jobPosting ? (
                              <Text>{application.jobPosting.title}</Text>
                            ) : (
                              <Text color="gray.500">Unknown Job</Text>
                            )}
                          </Td>
                          <Td>
                            <Badge>{application.source || 'Unknown'}</Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </Td>
                          <Td>{formatDate(application.applicationDate)}</Td>
                          <Td>
                            <IconButton
                              icon={<FiEye />}
                              aria-label="View"
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/ats/applications/${application.id}`)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default ApplicationsListPage;

