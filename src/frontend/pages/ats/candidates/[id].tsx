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
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiSave, FiX, FiMail, FiPhone, FiMapPin, FiBriefcase, FiBook, FiAward } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService, Candidate, CandidateStatus } from '../../../services/atsService';

const CandidateDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<Partial<Candidate>>({});

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadCandidate(id);
      if (router.query.edit === 'true') {
        setIsEditing(true);
      }
    }
  }, [id, router.query]);

  const loadCandidate = async (candidateId: string) => {
    setIsLoading(true);
    try {
      const data = await atsService.getCandidate(candidateId);
      setCandidate(data);
      setEditedCandidate(data);
    } catch (error: any) {
      console.error('Error loading candidate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load candidate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      const updated = await atsService.updateCandidate(id, editedCandidate);
      setCandidate(updated);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Candidate updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update candidate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (!id || typeof id !== 'string') return;

    try {
      const updated = await atsService.updateCandidateStatus(id, newStatus);
      setCandidate(updated);
      toast({
        title: 'Success',
        description: 'Candidate status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
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

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box p={6}>
          <Spinner size="xl" />
        </Box>
      </Box>
    );
  }

  if (!candidate) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box p={6}>
          <Text>Candidate not found</Text>
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
                aria-label="Back"
                icon={<FiArrowLeft />}
                onClick={() => router.push('/ats/candidates')}
              />
              <VStack align="start" spacing={1} flex={1}>
                <Heading size="lg">
                  {candidate.firstName} {candidate.lastName}
                </Heading>
                <HStack>
                  <Badge colorScheme={getStatusColor(candidate.status)}>
                    {formatStatus(candidate.status)}
                  </Badge>
                  {candidate.source && (
                    <Badge variant="outline">Source: {candidate.source}</Badge>
                  )}
                </HStack>
              </VStack>
              <HStack>
                {isEditing ? (
                  <>
                    <Button onClick={() => { setIsEditing(false); setEditedCandidate(candidate); }}>
                      <FiX style={{ marginRight: '8px' }} />
                      Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave}>
                      <FiSave style={{ marginRight: '8px' }} />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <FiEdit style={{ marginRight: '8px' }} />
                    Edit
                  </Button>
                )}
              </HStack>
            </HStack>

            <Tabs>
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Experience</Tab>
                <Tab>Education</Tab>
                <Tab>Notes</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Card bg={cardBg}>
                      <CardBody>
                        <Heading size="sm" mb={4}>Contact Information</Heading>
                        <VStack align="stretch" spacing={3}>
                          <HStack>
                            <FiMail />
                            <Text>{candidate.contact.email}</Text>
                          </HStack>
                          {candidate.contact.phone && (
                            <HStack>
                              <FiPhone />
                              <Text>{candidate.contact.phone}</Text>
                            </HStack>
                          )}
                          {(candidate.contact.city || candidate.contact.state) && (
                            <HStack>
                              <FiMapPin />
                              <Text>
                                {[candidate.contact.city, candidate.contact.state]
                                  .filter(Boolean)
                                  .join(', ')}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                      <CardBody>
                        <Heading size="sm" mb={4}>Status</Heading>
                        <VStack align="stretch" spacing={3}>
                          <FormControl>
                            <FormLabel>Current Status</FormLabel>
                            {isEditing ? (
                              <Select
                                value={editedCandidate.status || candidate.status}
                                onChange={(e) => setEditedCandidate({
                                  ...editedCandidate,
                                  status: e.target.value as CandidateStatus,
                                })}
                              >
                                {Object.values(CandidateStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {formatStatus(status)}
                                  </option>
                                ))}
                              </Select>
                            ) : (
                              <Badge colorScheme={getStatusColor(candidate.status)} fontSize="md" p={2}>
                                {formatStatus(candidate.status)}
                              </Badge>
                            )}
                          </FormControl>
                          {candidate.applicationDate && (
                            <Text fontSize="sm" color="gray.600">
                              Applied: {new Date(candidate.applicationDate).toLocaleDateString()}
                            </Text>
                          )}
                          {candidate.lastContactDate && (
                            <Text fontSize="sm" color="gray.600">
                              Last Contact: {new Date(candidate.lastContactDate).toLocaleDateString()}
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <Card bg={cardBg} mt={4}>
                      <CardBody>
                        <Heading size="sm" mb={4}>Skills</Heading>
                        <HStack flexWrap="wrap" spacing={2}>
                          {candidate.skills.map((skill, index) => (
                            <Badge key={index} colorScheme="blue">
                              {skill.name} {skill.level && `(${skill.level})`}
                            </Badge>
                          ))}
                        </HStack>
                      </CardBody>
                    </Card>
                  )}

                  {candidate.notes && (
                    <Card bg={cardBg} mt={4}>
                      <CardBody>
                        <Heading size="sm" mb={4}>Notes</Heading>
                        {isEditing ? (
                          <Textarea
                            value={editedCandidate.notes || candidate.notes}
                            onChange={(e) => setEditedCandidate({
                              ...editedCandidate,
                              notes: e.target.value,
                            })}
                            rows={5}
                          />
                        ) : (
                          <Text whiteSpace="pre-wrap">{candidate.notes}</Text>
                        )}
                      </CardBody>
                    </Card>
                  )}
                </TabPanel>

                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      <Heading size="sm" mb={4}>Work Experience</Heading>
                      {candidate.workExperience && candidate.workExperience.length > 0 ? (
                        <VStack align="stretch" spacing={4}>
                          {candidate.workExperience.map((exp, index) => (
                            <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                              <HStack>
                                <FiBriefcase />
                                <VStack align="start" spacing={1} flex={1}>
                                  <Text fontWeight="bold">{exp.position}</Text>
                                  <Text>{exp.company}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {exp.startDate && new Date(exp.startDate).toLocaleDateString()} -{' '}
                                    {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                                  </Text>
                                  {exp.description && (
                                    <Text fontSize="sm" mt={2}>{exp.description}</Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Text color="gray.500">No work experience listed</Text>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>

                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      <Heading size="sm" mb={4}>Education</Heading>
                      {candidate.education && candidate.education.length > 0 ? (
                        <VStack align="stretch" spacing={4}>
                          {candidate.education.map((edu, index) => (
                            <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                              <HStack>
                                <FiBook />
                                <VStack align="start" spacing={1} flex={1}>
                                  <Text fontWeight="bold">{edu.institution}</Text>
                                  {edu.degree && <Text>{edu.degree}</Text>}
                                  {edu.fieldOfStudy && <Text fontSize="sm">{edu.fieldOfStudy}</Text>}
                                  {edu.graduationYear && (
                                    <Text fontSize="sm" color="gray.600">
                                      Graduated: {edu.graduationYear}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Text color="gray.500">No education listed</Text>
                      )}
                    </CardBody>
                  </Card>
                </TabPanel>

                <TabPanel>
                  <Card bg={cardBg}>
                    <CardBody>
                      <Heading size="sm" mb={4}>Notes & Comments</Heading>
                      {isEditing ? (
                        <Textarea
                          value={editedCandidate.notes || candidate.notes || ''}
                          onChange={(e) => setEditedCandidate({
                            ...editedCandidate,
                            notes: e.target.value,
                          })}
                          rows={10}
                          placeholder="Add notes about this candidate..."
                        />
                      ) : (
                        <Text whiteSpace="pre-wrap">
                          {candidate.notes || 'No notes available'}
                        </Text>
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

export default CandidateDetailPage;

