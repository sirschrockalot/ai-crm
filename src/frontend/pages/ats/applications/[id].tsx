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
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
} from '@chakra-ui/react';
import { FiArrowLeft, FiMail, FiPhone, FiFileText, FiUser, FiBriefcase } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

const ApplicationDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [application, setApplication] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [jobPosting, setJobPosting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadApplication(id);
    }
  }, [id]);

  const loadApplication = async (applicationId: string) => {
    setIsLoading(true);
    try {
      const data = await atsService.getApplication(applicationId);
      setApplication(data);

      // Load candidate
      if (data.candidateId) {
        try {
          const candidateData = await atsService.getCandidate(data.candidateId);
          setCandidate(candidateData);
        } catch (err) {
          console.error('Error loading candidate:', err);
        }
      }

      // Load job posting
      if (data.jobPostingId) {
        try {
          const jobData = await atsService.getJobPosting(data.jobPostingId);
          setJobPosting(jobData);
        } catch (err) {
          console.error('Error loading job posting:', err);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load application',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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

  if (!application) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box p={6}>
          <Text>Application not found</Text>
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
                onClick={() => router.push('/ats/applications')}
              />
              <VStack align="start" spacing={1} flex={1}>
                <Heading size="lg">Application Details</Heading>
                <Text color="gray.600">
                  Application from {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown'}
                </Text>
              </VStack>
              <Badge colorScheme={getStatusColor(application.status)} fontSize="md" p={2}>
                {application.status}
              </Badge>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      Application Date
                    </Text>
                    <Text fontWeight="bold">{formatDate(application.applicationDate)}</Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      Source
                    </Text>
                    <Badge>{application.source || 'Unknown'}</Badge>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      Job Posting
                    </Text>
                    {jobPosting ? (
                      <Button
                        variant="link"
                        onClick={() => router.push(`/ats/job-postings/${jobPosting.id}`)}
                      >
                        {jobPosting.title}
                      </Button>
                    ) : (
                      <Text>Unknown</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Tabs>
              <TabList>
                <Tab>Candidate Information</Tab>
                <Tab>Application Documents</Tab>
                <Tab>Application History</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  {candidate ? (
                    <Card bg={cardBg}>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading size="md">Candidate Profile</Heading>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/ats/candidates/${candidate.id}`)}
                            >
                              View Full Profile
                            </Button>
                          </HStack>
                          <Divider />
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontSize="sm" color="gray.600">
                                Name
                              </Text>
                              <Text fontWeight="bold">
                                {candidate.firstName} {candidate.lastName}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize="sm" color="gray.600">
                                Email
                              </Text>
                              <HStack>
                                <FiMail />
                                <Text>{candidate.contact?.email || '-'}</Text>
                              </HStack>
                            </Box>
                            <Box>
                              <Text fontSize="sm" color="gray.600">
                                Phone
                              </Text>
                              <HStack>
                                <FiPhone />
                                <Text>{candidate.contact?.phone || '-'}</Text>
                              </HStack>
                            </Box>
                            <Box>
                              <Text fontSize="sm" color="gray.600">
                                Status
                              </Text>
                              <Badge>{candidate.status}</Badge>
                            </Box>
                          </SimpleGrid>
                          {candidate.workExperience && candidate.workExperience.length > 0 && (
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" mb={2}>
                                Work Experience
                              </Text>
                              <VStack align="stretch" spacing={2}>
                                {candidate.workExperience.map((exp: any, index: number) => (
                                  <Box key={index} bg="gray.50" p={3} borderRadius="md">
                                    <Text fontWeight="bold">{exp.title}</Text>
                                    <Text fontSize="sm">{exp.company}</Text>
                                    <Text fontSize="xs" color="gray.600">
                                      {exp.startDate} - {exp.endDate || 'Present'}
                                    </Text>
                                  </Box>
                                ))}
                              </VStack>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    <Card bg={cardBg}>
                      <CardBody>
                        <Text color="gray.500">Candidate information not available</Text>
                      </CardBody>
                    </Card>
                  )}
                </TabPanel>

                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Documents</Heading>
                        <Divider />
                        {application.resumeUrl ? (
                          <Box>
                            <HStack>
                              <FiFileText />
                              <Link href={application.resumeUrl} isExternal>
                                View Resume
                              </Link>
                            </HStack>
                          </Box>
                        ) : (
                          <Text color="gray.500">No resume uploaded</Text>
                        )}
                        {application.coverLetterUrl && (
                          <Box>
                            <HStack>
                              <FiFileText />
                              <Link href={application.coverLetterUrl} isExternal>
                                View Cover Letter
                              </Link>
                            </HStack>
                          </Box>
                        )}
                        {application.resumeText && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Resume Text (Extracted)
                            </Text>
                            <Box
                              bg="gray.50"
                              p={4}
                              borderRadius="md"
                              maxH="400px"
                              overflowY="auto"
                            >
                              <Text fontSize="sm" whiteSpace="pre-wrap">
                                {application.resumeText}
                              </Text>
                            </Box>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">Application Timeline</Heading>
                        <Divider />
                        <VStack align="stretch" spacing={3}>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Application Received
                            </Text>
                            <Text fontWeight="bold">{formatDate(application.applicationDate)}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Created
                            </Text>
                            <Text fontWeight="bold">{formatDate(application.createdAt)}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Last Updated
                            </Text>
                            <Text fontWeight="bold">{formatDate(application.updatedAt)}</Text>
                          </Box>
                        </VStack>
                        {application.notes && (
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Notes
                            </Text>
                            <Text whiteSpace="pre-wrap">{application.notes}</Text>
                          </Box>
                        )}
                      </VStack>
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

export default ApplicationDetailPage;

