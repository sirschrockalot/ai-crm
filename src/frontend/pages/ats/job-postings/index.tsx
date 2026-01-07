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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiBriefcase,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

interface JobPosting {
  id: string;
  title: string;
  department?: string;
  location?: string;
  employmentType?: string;
  status: string;
  description?: string;
  requirements?: string[];
  postedDate?: string;
  closingDate?: string;
  metrics?: {
    views?: number;
    applications?: number;
    clicks?: number;
  };
}

const JobPostingsListPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalApplications: 0,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadJobPostings();
  }, [statusFilter, page]);

  const loadJobPostings = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        limit,
        page,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await atsService.listJobPostings(params);
      setJobPostings(response.jobPostings || []);
      setTotal(response.total || 0);

      // Calculate stats
      const active = (response.jobPostings || []).filter(
        (jp: JobPosting) => jp.status === 'active'
      ).length;
      const totalApplications = (response.jobPostings || []).reduce(
        (sum: number, jp: JobPosting) => sum + (jp.metrics?.applications || 0),
        0
      );

      setStats({
        total: response.total || 0,
        active,
        totalApplications,
      });
    } catch (error: any) {
      console.error('Error loading job postings:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load job postings',
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
    loadJobPostings();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await atsService.deleteJobPosting(id);
      toast({
        title: 'Success',
        description: 'Job posting deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadJobPostings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete job posting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'gray',
      active: 'green',
      paused: 'yellow',
      closed: 'red',
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString?: string) => {
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
                <Heading size="lg">Job Postings</Heading>
                <Text color="gray.600">Manage job postings and track performance</Text>
              </VStack>
              <Button
                colorScheme="blue"
                onClick={() => router.push('/ats/job-postings/new')}
              >
                <FiPlus style={{ marginRight: '8px' }} />
                New Job Posting
              </Button>
            </HStack>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Postings</StatLabel>
                    <StatNumber>{stats.total}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Active Postings</StatLabel>
                    <StatNumber>{stats.active}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Applications</StatLabel>
                    <StatNumber>{stats.totalApplications}</StatNumber>
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
                      placeholder="Search job postings..."
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
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </Select>
                  <Button colorScheme="blue" onClick={handleSearch}>
                    Search
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Job Postings Table */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Text>Loading job postings...</Text>
                ) : jobPostings.length === 0 ? (
                  <VStack spacing={4} py={8}>
                    <FiBriefcase size={48} color="gray" />
                    <Text color="gray.500">No job postings found</Text>
                    <Button
                      colorScheme="blue"
                      onClick={() => router.push('/ats/job-postings/new')}
                    >
                      Create Your First Job Posting
                    </Button>
                  </VStack>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Title</Th>
                        <Th>Department</Th>
                        <Th>Location</Th>
                        <Th>Status</Th>
                        <Th>Applications</Th>
                        <Th>Posted Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {jobPostings.map((posting) => (
                        <Tr key={posting.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold">{posting.title}</Text>
                              {posting.employmentType && (
                                <Text fontSize="sm" color="gray.600">
                                  {posting.employmentType}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>{posting.department || '-'}</Td>
                          <Td>{posting.location || '-'}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(posting.status)}>
                              {posting.status}
                            </Badge>
                          </Td>
                          <Td>{posting.metrics?.applications || 0}</Td>
                          <Td>{formatDate(posting.postedDate)}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FiEye />}
                                  onClick={() =>
                                    router.push(`/ats/job-postings/${posting.id}`)
                                  }
                                >
                                  View Details
                                </MenuItem>
                                <MenuItem
                                  icon={<FiEdit />}
                                  onClick={() =>
                                    router.push(`/ats/job-postings/${posting.id}/edit`)
                                  }
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  onClick={() => handleDelete(posting.id)}
                                  color="red.500"
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
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

export default JobPostingsListPage;

