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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiCalendar } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

const ScheduleInterviewPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: '',
    applicationId: '',
    jobPostingId: '',
    type: 'phone_screen',
    primaryInterviewer: {
      userId: '',
      name: '',
      email: '',
      role: '',
    },
    scheduledStartTime: '',
    scheduledEndTime: '',
    scriptId: '',
  });

  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadCandidates();
    // Get current user info for default interviewer
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          primaryInterviewer: {
            userId: user.id || user._id || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
            email: user.email || '',
            role: user.role || 'interviewer',
          },
        }));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const loadCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      const data = await atsService.listCandidates({ limit: 100 });
      setCandidates(data.candidates || []);
    } catch (error: any) {
      console.error('Error loading candidates:', error);
      toast({
        title: 'Warning',
        description: 'Could not load candidates. You can still proceed with manual entry.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate end time (default: 15 minutes after start)
      let endTime = formData.scheduledEndTime;
      if (!endTime && formData.scheduledStartTime) {
        const start = new Date(formData.scheduledStartTime);
        start.setMinutes(start.getMinutes() + 15);
        endTime = start.toISOString();
      }

      const interviewData = {
        ...formData,
        scheduledStartTime: formData.scheduledStartTime ? new Date(formData.scheduledStartTime).toISOString() : undefined,
        scheduledEndTime: endTime ? new Date(endTime).toISOString() : undefined,
      };

      const created = await atsService.createInterview(interviewData);
      
      toast({
        title: 'Success',
        description: 'Interview scheduled successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push(`/ats/interviews/${created.id}`);
    } catch (error: any) {
      console.error('Error creating interview:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule interview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('primaryInterviewer.')) {
      const subField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        primaryInterviewer: {
          ...prev.primaryInterviewer,
          [subField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const selectedCandidate = candidates.find(c => c.id === formData.candidateId);

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
                onClick={() => router.push('/ats/interviews')}
              />
              <Heading size="lg">Schedule Interview</Heading>
            </HStack>

            <form onSubmit={handleSubmit}>
              <VStack align="stretch" spacing={6}>
                {/* Candidate Selection */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Candidate Information</Heading>
                      <FormControl isRequired>
                        <FormLabel>Candidate</FormLabel>
                        {isLoadingCandidates ? (
                          <Spinner />
                        ) : (
                          <Select
                            value={formData.candidateId}
                            onChange={(e) => handleChange('candidateId', e.target.value)}
                            placeholder="Select candidate"
                          >
                            {candidates.map((candidate) => (
                              <option key={candidate.id} value={candidate.id}>
                                {candidate.firstName} {candidate.lastName} - {candidate.contact.email}
                              </option>
                            ))}
                          </Select>
                        )}
                        {selectedCandidate && (
                          <Text fontSize="sm" color="gray.600" mt={2}>
                            Phone: {selectedCandidate.contact.phone} | 
                            Status: {selectedCandidate.status}
                          </Text>
                        )}
                      </FormControl>
                      <FormControl>
                        <FormLabel>Application ID (optional)</FormLabel>
                        <Input
                          value={formData.applicationId}
                          onChange={(e) => handleChange('applicationId', e.target.value)}
                          placeholder="Application ID"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Job Posting ID (optional)</FormLabel>
                        <Input
                          value={formData.jobPostingId}
                          onChange={(e) => handleChange('jobPostingId', e.target.value)}
                          placeholder="Job Posting ID"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Interview Details */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Interview Details</Heading>
                      <FormControl isRequired>
                        <FormLabel>Interview Type</FormLabel>
                        <Select
                          value={formData.type}
                          onChange={(e) => handleChange('type', e.target.value)}
                        >
                          <option value="phone_screen">Phone Screen</option>
                          <option value="video_interview">Video Interview</option>
                          <option value="panel_interview">Panel Interview</option>
                          <option value="technical_assessment">Technical Assessment</option>
                          <option value="final_round">Final Round</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Script ID (optional)</FormLabel>
                        <Input
                          value={formData.scriptId}
                          onChange={(e) => handleChange('scriptId', e.target.value)}
                          placeholder="Interview script ID"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Scheduling */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Schedule</Heading>
                      <FormControl isRequired>
                        <FormLabel>Start Time</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledStartTime}
                          onChange={(e) => handleChange('scheduledStartTime', e.target.value)}
                          required
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>End Time (optional, defaults to 15 minutes after start)</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledEndTime}
                          onChange={(e) => handleChange('scheduledEndTime', e.target.value)}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Interviewer Information */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Primary Interviewer</Heading>
                      <FormControl isRequired>
                        <FormLabel>Interviewer User ID</FormLabel>
                        <Input
                          value={formData.primaryInterviewer.userId}
                          onChange={(e) => handleChange('primaryInterviewer.userId', e.target.value)}
                          placeholder="User ID"
                          required
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Interviewer Name</FormLabel>
                        <Input
                          value={formData.primaryInterviewer.name}
                          onChange={(e) => handleChange('primaryInterviewer.name', e.target.value)}
                          placeholder="Full name"
                          required
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={formData.primaryInterviewer.email}
                          onChange={(e) => handleChange('primaryInterviewer.email', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Role</FormLabel>
                        <Input
                          value={formData.primaryInterviewer.role}
                          onChange={(e) => handleChange('primaryInterviewer.role', e.target.value)}
                          placeholder="e.g., interviewer, hiring_manager"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Actions */}
                <HStack justify="flex-end" spacing={4}>
                  <Button
                    onClick={() => router.push('/ats/interviews')}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    leftIcon={<FiSave />}
                    isLoading={isLoading}
                    loadingText="Scheduling..."
                  >
                    Schedule Interview
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default ScheduleInterviewPage;

