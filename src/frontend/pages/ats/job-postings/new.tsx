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
  Textarea,
  Select,
  IconButton,
  Checkbox,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

const JobPostingFormPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    employmentType: '',
    salaryRange: '',
    status: 'draft',
    scriptId: '',
    requirements: [] as string[],
    benefits: [] as string[],
  });

  const [currentRequirement, setCurrentRequirement] = useState('');
  const [currentBenefit, setCurrentBenefit] = useState('');

  useEffect(() => {
    loadScripts();
    if (id && typeof id === 'string') {
      loadJobPosting(id);
    }
  }, [id]);

  const loadScripts = async () => {
    try {
      const response = await atsService.listScripts({ limit: 100 });
      setScripts(response.scripts || []);
    } catch (error) {
      console.error('Error loading scripts:', error);
    }
  };

  const loadJobPosting = async (postingId: string) => {
    setIsLoading(true);
    try {
      const data = await atsService.getJobPosting(postingId);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        department: data.department || '',
        location: data.location || '',
        employmentType: data.employmentType || '',
        salaryRange: data.salaryRange || '',
        status: data.status || 'draft',
        scriptId: data.scriptId || '',
        requirements: data.requirements || [],
        benefits: data.benefits || [],
      });
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

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Job title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (id && typeof id === 'string') {
        await atsService.updateJobPosting(id, formData);
        toast({
          title: 'Success',
          description: 'Job posting updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await atsService.createJobPosting(formData);
        toast({
          title: 'Success',
          description: 'Job posting created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      router.push('/ats/job-postings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save job posting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, currentRequirement.trim()],
      });
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const addBenefit = () => {
    if (currentBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, currentBenefit.trim()],
      });
      setCurrentBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

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
                <Heading size="lg">
                  {id ? 'Edit Job Posting' : 'Create Job Posting'}
                </Heading>
                <Text color="gray.600">Define job details and requirements</Text>
              </VStack>
              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<FiSave />}
              >
                Save Job Posting
              </Button>
            </HStack>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Job Title</FormLabel>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Acquisitions Specialist"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Department</FormLabel>
                      <Input
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g., Sales"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Remote, New York, NY"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                        value={formData.employmentType}
                        onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Salary Range</FormLabel>
                      <Input
                        value={formData.salaryRange}
                        onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                        placeholder="e.g., $50,000 - $75,000"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Default Interview Script</FormLabel>
                    <Select
                      value={formData.scriptId}
                      onChange={(e) => setFormData({ ...formData, scriptId: e.target.value })}
                      placeholder="Select a script (optional)"
                    >
                      {scripts.map((script) => (
                        <option key={script.id} value={script.id}>
                          {script.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Job Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={8}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Requirements</FormLabel>
                    <HStack mb={2}>
                      <Input
                        value={currentRequirement}
                        onChange={(e) => setCurrentRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                        placeholder="Add a requirement..."
                      />
                      <Button onClick={addRequirement}>Add</Button>
                    </HStack>
                    <VStack align="stretch" spacing={2}>
                      {formData.requirements.map((req, index) => (
                        <HStack key={index} bg="gray.50" p={2} borderRadius="md">
                          <Text flex={1}>{req}</Text>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeRequirement(index)}
                          >
                            Remove
                          </Button>
                        </HStack>
                      ))}
                    </VStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Benefits</FormLabel>
                    <HStack mb={2}>
                      <Input
                        value={currentBenefit}
                        onChange={(e) => setCurrentBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                        placeholder="Add a benefit..."
                      />
                      <Button onClick={addBenefit}>Add</Button>
                    </HStack>
                    <VStack align="stretch" spacing={2}>
                      {formData.benefits.map((benefit, index) => (
                        <HStack key={index} bg="gray.50" p={2} borderRadius="md">
                          <Text flex={1}>{benefit}</Text>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeBenefit(index)}
                          >
                            Remove
                          </Button>
                        </HStack>
                      ))}
                    </VStack>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default JobPostingFormPage;

