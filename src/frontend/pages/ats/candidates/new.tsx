import React, { useState } from 'react';
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
  SimpleGrid,
  IconButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiPlus, FiX } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService, CandidateStatus } from '../../../services/atsService';

interface WorkExperienceForm {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface EducationForm {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

interface SkillForm {
  name: string;
  level: string;
}

const NewCandidatePage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    contact: {
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    workExperience: [] as WorkExperienceForm[],
    education: [] as EducationForm[],
    skills: [] as SkillForm[],
    certifications: [] as string[],
    status: CandidateStatus.APPLICATION_RECEIVED,
    source: 'manual',
    notes: '',
    tags: [] as string[],
  });

  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await atsService.createCandidate(formData);
      toast({
        title: 'Success',
        description: 'Candidate created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/ats/candidates');
    } catch (error: any) {
      console.error('Error creating candidate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create candidate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        { company: '', position: '', startDate: '', endDate: '', current: false, description: '' },
      ],
    });
  };

  const removeWorkExperience = (index: number) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { institution: '', degree: '', fieldOfStudy: '', graduationYear: new Date().getFullYear() },
      ],
    });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: '', level: 'intermediate' }],
    });
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
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
                aria-label="Back"
                icon={<FiArrowLeft />}
                onClick={() => router.push('/ats/candidates')}
              />
              <Heading size="lg">Add New Candidate</Heading>
            </HStack>

            <form onSubmit={handleSubmit}>
              <VStack align="stretch" spacing={6}>
                {/* Basic Information */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Basic Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Middle Name</FormLabel>
                        <Input
                          value={formData.middleName}
                          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                          placeholder="M"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Source</FormLabel>
                        <Select
                          value={formData.source}
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        >
                          <option value="manual">Manual Entry</option>
                          <option value="indeed">Indeed</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="referral">Referral</option>
                          <option value="other">Other</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Contact Information */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Contact Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, email: e.target.value },
                            })
                          }
                          placeholder="john.doe@example.com"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <Input
                          value={formData.contact.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, phone: e.target.value },
                            })
                          }
                          placeholder="555-1234"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Input
                          value={formData.contact.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, address: e.target.value },
                            })
                          }
                          placeholder="123 Main St"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          value={formData.contact.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, city: e.target.value },
                            })
                          }
                          placeholder="New York"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>State</FormLabel>
                        <Input
                          value={formData.contact.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, state: e.target.value },
                            })
                          }
                          placeholder="NY"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>ZIP Code</FormLabel>
                        <Input
                          value={formData.contact.zipCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, zipCode: e.target.value },
                            })
                          }
                          placeholder="10001"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Work Experience */}
                <Card bg={cardBg}>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md">Work Experience</Heading>
                      <Button size="sm" onClick={addWorkExperience}>
                        <FiPlus style={{ marginRight: '8px' }} />
                        Add Experience
                      </Button>
                    </HStack>
                    <VStack align="stretch" spacing={4}>
                      {formData.workExperience.map((exp, index) => (
                        <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                          <HStack justify="flex-end" mb={2}>
                            <IconButton
                              aria-label="Remove"
                              icon={<FiX />}
                              size="sm"
                              onClick={() => removeWorkExperience(index)}
                            />
                          </HStack>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Company</FormLabel>
                              <Input
                                value={exp.company}
                                onChange={(e) => {
                                  const updated = [...formData.workExperience];
                                  updated[index].company = e.target.value;
                                  setFormData({ ...formData, workExperience: updated });
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Position</FormLabel>
                              <Input
                                value={exp.position}
                                onChange={(e) => {
                                  const updated = [...formData.workExperience];
                                  updated[index].position = e.target.value;
                                  setFormData({ ...formData, workExperience: updated });
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Start Date</FormLabel>
                              <Input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => {
                                  const updated = [...formData.workExperience];
                                  updated[index].startDate = e.target.value;
                                  setFormData({ ...formData, workExperience: updated });
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>End Date</FormLabel>
                              <Input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => {
                                  const updated = [...formData.workExperience];
                                  updated[index].endDate = e.target.value;
                                  setFormData({ ...formData, workExperience: updated });
                                }}
                                disabled={exp.current}
                              />
                            </FormControl>
                          </SimpleGrid>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Skills */}
                <Card bg={cardBg}>
                  <CardBody>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md">Skills</Heading>
                      <Button size="sm" onClick={addSkill}>
                        <FiPlus style={{ marginRight: '8px' }} />
                        Add Skill
                      </Button>
                    </HStack>
                    <VStack align="stretch" spacing={4}>
                      {formData.skills.map((skill, index) => (
                        <HStack key={index}>
                          <Input
                            placeholder="Skill name"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = [...formData.skills];
                              updated[index].name = e.target.value;
                              setFormData({ ...formData, skills: updated });
                            }}
                          />
                          <Select
                            value={skill.level}
                            onChange={(e) => {
                              const updated = [...formData.skills];
                              updated[index].level = e.target.value;
                              setFormData({ ...formData, skills: updated });
                            }}
                            width="150px"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </Select>
                          <IconButton
                            aria-label="Remove"
                            icon={<FiX />}
                            onClick={() => removeSkill(index)}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Notes */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Notes</Heading>
                    <FormControl>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional notes about this candidate..."
                        rows={5}
                      />
                    </FormControl>
                  </CardBody>
                </Card>

                {/* Submit Buttons */}
                <HStack justify="flex-end" spacing={4}>
                  <Button onClick={() => router.push('/ats/candidates')}>Cancel</Button>
                  <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
                    <FiSave style={{ marginRight: '8px' }} />
                    Create Candidate
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

export default NewCandidatePage;

