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
  Divider,
  Badge,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';
import { v4 as uuidv4 } from 'uuid';

interface ScriptQuestion {
  id: string;
  order: number;
  questionText: string;
  type: 'open_ended' | 'yes_no' | 'rating_scale' | 'behavioral' | 'role_play';
  estimatedTime?: number;
  category?: string;
  weight?: number;
  followUpQuestions?: string[];
  notes?: string;
  expectedAnswerGuidance?: string;
}

const EditScriptPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('general');
  const [jobRole, setJobRole] = useState('');
  const [questions, setQuestions] = useState<ScriptQuestion[]>([]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadScript(id);
    }
  }, [id]);

  const loadScript = async (scriptId: string) => {
    setIsLoading(true);
    try {
      const data = await atsService.getScript(scriptId);
      setName(data.name || '');
      setDescription(data.description || '');
      setCategory(data.category || 'general');
      setJobRole(data.jobRole || '');
      setQuestions(
        (data.questions || []).map((q: any) => ({
          id: q.id || uuidv4(),
          order: q.order || 0,
          questionText: q.questionText || '',
          type: q.type || 'open_ended',
          estimatedTime: q.estimatedTime || 2,
          category: q.category || '',
          weight: q.weight || 1,
          followUpQuestions: q.followUpQuestions || [],
          notes: q.notes || '',
          expectedAnswerGuidance: q.expectedAnswerGuidance || '',
        }))
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load script',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: ScriptQuestion = {
      id: uuidv4(),
      order: questions.length + 1,
      questionText: '',
      type: 'open_ended',
      estimatedTime: 2,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<ScriptQuestion>) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (questionId: string) => {
    const newQuestions = questions
      .filter((q) => q.id !== questionId)
      .map((q, index) => ({ ...q, order: index + 1 }));
    setQuestions(newQuestions);
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const index = questions.findIndex((q) => q.id === questionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    newQuestions.forEach((q, i) => {
      q.order = i + 1;
    });
    setQuestions(newQuestions);
  };

  const calculateDuration = () => {
    return questions.reduce((sum, q) => sum + (q.estimatedTime || 0), 0);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Script name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one question is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (questions.some((q) => !q.questionText.trim())) {
      toast({
        title: 'Error',
        description: 'All questions must have text',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!id || typeof id !== 'string') return;

    setIsSaving(true);
    try {
      const script = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        jobRole: jobRole.trim() || undefined,
        questions: questions.map((q) => ({
          id: q.id,
          order: q.order,
          questionText: q.questionText.trim(),
          type: q.type,
          estimatedTime: q.estimatedTime,
          category: q.category || undefined,
          weight: q.weight || 1,
          followUpQuestions: q.followUpQuestions || undefined,
          notes: q.notes || undefined,
          expectedAnswerGuidance: q.expectedAnswerGuidance || undefined,
        })),
        estimatedDuration: calculateDuration(),
        isActive: true,
      };

      await atsService.updateScript(id, script);
      toast({
        title: 'Success',
        description: 'Script updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/ats/scripts');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update script',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
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
                onClick={() => router.push('/ats/scripts')}
              />
              <VStack align="start" spacing={1} flex={1}>
                <Heading size="lg">Edit Interview Script</Heading>
                <Text color="gray.600">Update script questions and structure</Text>
              </VStack>
              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<FiSave />}
              >
                Save Script
              </Button>
            </HStack>

            {/* Script Details */}
            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Script Name</FormLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Acquisitions Specialist Phone Screen"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this script's purpose..."
                      rows={3}
                    />
                  </FormControl>

                  <HStack>
                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="technical">Technical</option>
                        <option value="sales">Sales</option>
                        <option value="customer_service">Customer Service</option>
                        <option value="general">General</option>
                        <option value="acquisitions">Acquisitions</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Job Role</FormLabel>
                      <Input
                        value={jobRole}
                        onChange={(e) => setJobRole(e.target.value)}
                        placeholder="e.g., Acquisitions Specialist"
                      />
                    </FormControl>
                  </HStack>

                  <HStack>
                    <Text fontSize="sm" color="gray.600">
                      Total Questions: <strong>{questions.length}</strong>
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Estimated Duration: <strong>{calculateDuration()} minutes</strong>
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Questions */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">Questions</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={addQuestion}
                    colorScheme="blue"
                    size="sm"
                  >
                    Add Question
                  </Button>
                </HStack>

                {questions.length === 0 ? (
                  <VStack spacing={4} py={8}>
                    <Text color="gray.500">No questions yet. Add your first question to get started.</Text>
                    <Button leftIcon={<FiPlus />} onClick={addQuestion} colorScheme="blue">
                      Add Question
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {questions.map((question, index) => (
                      <Card key={question.id} bg="gray.50" borderWidth="1px">
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <Badge colorScheme="blue">Question {question.order}</Badge>
                              <HStack>
                                <IconButton
                                  icon={<FiArrowUp />}
                                  aria-label="Move up"
                                  size="sm"
                                  onClick={() => moveQuestion(question.id, 'up')}
                                  isDisabled={index === 0}
                                />
                                <IconButton
                                  icon={<FiArrowDown />}
                                  aria-label="Move down"
                                  size="sm"
                                  onClick={() => moveQuestion(question.id, 'down')}
                                  isDisabled={index === questions.length - 1}
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  aria-label="Delete"
                                  size="sm"
                                  colorScheme="red"
                                  onClick={() => deleteQuestion(question.id)}
                                />
                              </HStack>
                            </HStack>

                            <FormControl isRequired>
                              <FormLabel>Question Text</FormLabel>
                              <Textarea
                                value={question.questionText}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    questionText: e.target.value,
                                  })
                                }
                                placeholder="Enter the question..."
                                rows={2}
                              />
                            </FormControl>

                            <HStack>
                              <FormControl isRequired>
                                <FormLabel>Question Type</FormLabel>
                                <Select
                                  value={question.type}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      type: e.target.value as any,
                                    })
                                  }
                                >
                                  <option value="open_ended">Open Ended</option>
                                  <option value="yes_no">Yes/No</option>
                                  <option value="rating_scale">Rating Scale</option>
                                  <option value="behavioral">Behavioral (STAR)</option>
                                  <option value="role_play">Role Play</option>
                                </Select>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Estimated Time (minutes)</FormLabel>
                                <NumberInput
                                  value={question.estimatedTime || 2}
                                  min={1}
                                  max={10}
                                  onChange={(_, value) =>
                                    updateQuestion(question.id, {
                                      estimatedTime: isNaN(value) ? 2 : value,
                                    })
                                  }
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Category (for scoring)</FormLabel>
                                <Input
                                  value={question.category || ''}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      category: e.target.value || undefined,
                                    })
                                  }
                                  placeholder="e.g., Call Presence"
                                />
                              </FormControl>
                            </HStack>

                            <FormControl>
                              <FormLabel>Notes for Interviewer</FormLabel>
                              <Textarea
                                value={question.notes || ''}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    notes: e.target.value || undefined,
                                  })
                                }
                                placeholder="Instructions or guidance for the interviewer..."
                                rows={2}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Expected Answer Guidance</FormLabel>
                              <Textarea
                                value={question.expectedAnswerGuidance || ''}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    expectedAnswerGuidance: e.target.value || undefined,
                                  })
                                }
                                placeholder="What to look for in the candidate's answer..."
                                rows={2}
                              />
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default EditScriptPage;

