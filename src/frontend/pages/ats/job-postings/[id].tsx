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
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiUsers, FiTrendingUp, FiEye } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

const JobPostingDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [jobPosting, setJobPosting] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadJobPosting(id);
      loadApplications(id);
    }
  }, [id]);

  const loadJobPosting = async (postingId: string) => {
    setIsLoading(true);
    try {
      const data = await atsService.getJobPosting(postingId);
      setJobPosting(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load job posting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async (postingId: string) => {
    try {
      const response = await atsService.listApplications({ jobPostingId: postingId });
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
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

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box p={6}>
          <Text>Loading...</Text>
        </Box>
      </Box>
    );
  }

  if (!jobPosting) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box p={6}>
          <Text>Job posting not found</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            <HStack>
              <IconButton
                icon={<FiArrowLeft />}
                aria-label="Back"
                onClick={() => router.push('/ats/job-postings')}
              />
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Heading size="lg">{jobPosting.title}</Heading>
                  <Badge colorScheme={getStatusColor(jobPosting.status)}>
                    {jobPosting.status}
                  </Badge>
                </HStack>
                <Text color="gray.600">
                  {jobPosting.department && `${jobPosting.department} • `}
                  {jobPosting.location || 'Location not specified'}
                </Text>
              </VStack>
              <Button
                colorScheme="blue"
                leftIcon={<FiEdit />}
                onClick={() => router.push(`/ats/job-postings/${id}?edit=true`)}
              >
                Edit
              </Button>
            </HStack>

            {/* Stats */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Views</StatLabel>
                    <StatNumber>{jobPosting.metrics?.views || 0}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Applications</StatLabel>
                    <StatNumber>{applications.length}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Clicks</StatLabel>
                    <StatNumber>{jobPosting.metrics?.clicks || 0}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Conversion Rate</StatLabel>
                    <StatNumber>
                      {jobPosting.metrics?.views
                        ? `${Math.round((applications.length / jobPosting.metrics.views) * 100)}%`
                        : '0%'}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Tabs>
              <TabList>
                <Tab>Details</Tab>
                <Tab>Applications ({applications.length})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Employment Type
                            </Text>
                            <Text fontWeight="bold">
                              {jobPosting.employmentType || 'Not specified'}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Salary Range
                            </Text>
                            <Text fontWeight="bold">
                              {jobPosting.salaryRange || 'Not specified'}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        <Divider />

                        {jobPosting.description && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Description
                            </Text>
                            <Text whiteSpace="pre-wrap">{jobPosting.description}</Text>
                          </Box>
                        )}

                        {jobPosting.requirements && jobPosting.requirements.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Requirements
                            </Text>
                            <VStack align="stretch" spacing={1}>
                              {jobPosting.requirements.map((req: string, index: number) => (
                                <Text key={index}>• {req}</Text>
                              ))}
                            </VStack>
                          </Box>
                        )}

                        {jobPosting.benefits && jobPosting.benefits.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Benefits
                            </Text>
                            <VStack align="stretch" spacing={1}>
                              {jobPosting.benefits.map((benefit: string, index: number) => (
                                <Text key={index}>• {benefit}</Text>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      {applications.length === 0 ? (
                        <VStack spacing={4} py={8}>
                          <FiUsers size={48} color="gray" />
                          <Text color="gray.500">No applications yet</Text>
                        </VStack>
                      ) : (
                        <VStack align="stretch" spacing={2}>
                          {applications.map((app) => (
                            <Box
                              key={app.id}
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              cursor="pointer"
                              _hover={{ bg: 'gray.50' }}
                              onClick={() => router.push(`/ats/applications/${app.id}`)}
                            >
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">
                                    {app.candidate?.firstName} {app.candidate?.lastName}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {app.candidate?.contact?.email}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    Applied: {new Date(app.applicationDate).toLocaleDateString()}
                                  </Text>
                                </VStack>
                                <Badge>{app.status}</Badge>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default JobPostingDetailPage;

