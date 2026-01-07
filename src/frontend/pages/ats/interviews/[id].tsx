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
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Textarea,
  Checkbox,
  Select,
  Progress,
  Spinner,
  IconButton,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  ScrollArea,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlay, FiPause, FiSave, FiClock, FiUser, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

// Acquisitions Specialist Scorecard Categories
const SCORECARD_CATEGORIES = [
  {
    id: 'call-presence',
    name: 'Call Presence & Professionalism',
    description: 'Tone, pacing, clarity, confidence without arrogance, comfortable being led',
    question: 'How did the candidate show up on the phone?',
  },
  {
    id: 'company-awareness',
    name: 'Company Awareness & Preparation',
    description: 'Did they do any homework? Can they articulate why this role/company?',
    question: 'What do you know about Presidential Digs Real Estate?',
  },
  {
    id: 'sales-identity',
    name: 'Sales Identity & Role Fit',
    description: 'Ownership, metrics, numbers, structure, comfort with commission & phones',
    question: 'What qualifies you for this role? How do you describe yourself as a salesperson?',
  },
  {
    id: 'organization',
    name: 'Organization & Pressure Response',
    description: 'Defensive vs confident, coachability, emotional control under light pressure',
    question: 'How do you organize your week? And that works?',
  },
  {
    id: 'sales-mindset',
    name: 'Sales Mindset & Beliefs',
    description: 'Consistency, follow-up, discipline vs blame, market excuses',
    question: 'Most salespeople fail because...',
  },
  {
    id: 'role-play',
    name: 'Live Prospecting / Role Play',
    description: 'Opening confidence, flow and tone, ability to handle silence, natural vs robotic',
    question: 'Role-play: Prospect just picked up the phone and said hello... Go.',
  },
  {
    id: 'self-awareness',
    name: 'Self-Awareness & Coachability',
    description: 'Self-aware, not defensive, open to improvement',
    question: 'How do you think that went? Was that a fair reflection of you?',
  },
  {
    id: 'best-sale',
    name: 'Best Sale Story',
    description: 'Ownership vs luck, clear process, emotional intelligence, authenticity',
    question: 'Describe your best sale from initial contact to close.',
  },
];

const PhoneScreeningPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const [interview, setInterview] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [script, setScript] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentScriptQuestionIndex, setCurrentScriptQuestionIndex] = useState(0);

  // Scoring state
  const [categoryScores, setCategoryScores] = useState<Record<string, { score: number; notes: string }>>({});
  const [bonusPoints, setBonusPoints] = useState({
    enjoyedCall: false,
    askedThoughtfulQuestions: false,
    triedToKeepOnCall: false,
  });
  const [recommendation, setRecommendation] = useState<string>('');
  const [overallNotes, setOverallNotes] = useState('');
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const currentCategory = SCORECARD_CATEGORIES[currentCategoryIndex];

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadInterview(id);
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewStarted && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInterviewStarted, startTime]);

  const loadInterview = async (interviewId: string) => {
    setIsLoading(true);
    try {
      const data = await atsService.getInterview(interviewId);
      setInterview(data);
      
      // Load candidate info
      if (data.candidateId) {
        try {
          const candidateData = await atsService.getCandidate(data.candidateId);
          setCandidate(candidateData);
        } catch (err) {
          console.error('Error loading candidate:', err);
        }
      }

      // Load script if available
      if (data.scriptId) {
        try {
          const scriptData = await atsService.getScript(data.scriptId);
          setScript(scriptData);
        } catch (err) {
          console.error('Error loading script:', err);
        }
      }

      // If interview is in progress, restore state
      if (data.status === 'in_progress' && data.actualStartTime) {
        setIsInterviewStarted(true);
        setStartTime(new Date(data.actualStartTime));
      }

      // Restore scores if interview was already started
      if (data.categoryScores && data.categoryScores.length > 0) {
        const scores: Record<string, { score: number; notes: string }> = {};
        data.categoryScores.forEach((cat: any) => {
          scores[cat.category] = { score: cat.score, notes: cat.notes || '' };
        });
        setCategoryScores(scores);
      }

      if (data.bonusPoints) {
        setBonusPoints(data.bonusPoints);
      }

      if (data.recommendation) {
        setRecommendation(data.recommendation);
      }

      if (data.overallNotes) {
        setOverallNotes(data.overallNotes);
      }

      if (data.redFlags) {
        setRedFlags(data.redFlags);
      }

      if (data.highlights) {
        setHighlights(data.highlights);
      }
    } catch (error: any) {
      console.error('Error loading interview:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load interview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      const updated = await atsService.startInterview(id);
      setInterview(updated);
      setIsInterviewStarted(true);
      setStartTime(new Date());
      toast({
        title: 'Interview Started',
        description: 'Timer has started. Good luck!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start interview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const autoSaveInterview = async () => {
    if (!id || typeof id !== 'string' || !isInterviewStarted) return;
    
    try {
      const categoryScoresArray = SCORECARD_CATEGORIES.map((cat) => ({
        category: cat.name,
        score: categoryScores[cat.id]?.score || 0,
        notes: categoryScores[cat.id]?.notes || '',
      }));

      // Auto-save progress (silent, no toast)
      await atsService.updateInterview(id, {
        categoryScores: categoryScoresArray,
        bonusPoints,
        recommendation: recommendation || undefined,
        overallNotes: overallNotes || undefined,
        redFlags: redFlags.length > 0 ? redFlags : undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
      });
    } catch (error) {
      // Silent fail for auto-save
      console.error('Auto-save failed:', error);
    }
  };

  const handleScoreChange = (categoryId: string, score: number) => {
    setCategoryScores({
      ...categoryScores,
      [categoryId]: {
        ...categoryScores[categoryId],
        score,
      },
    });
    // Auto-save after a short delay
    setTimeout(() => autoSaveInterview(), 1000);
  };

  const handleNotesChange = (categoryId: string, notes: string) => {
    setCategoryScores({
      ...categoryScores,
      [categoryId]: {
        score: categoryScores[categoryId]?.score || 0,
        notes,
      },
    });
    // Auto-save after a short delay
    setTimeout(() => autoSaveInterview(), 2000);
  };

  const calculateScores = () => {
    const baseScore = Object.values(categoryScores).reduce(
      (sum, cat) => sum + (cat.score || 0),
      0
    );
    let bonusScore = 0;
    if (bonusPoints.enjoyedCall) bonusScore += 3;
    if (bonusPoints.askedThoughtfulQuestions) bonusScore += 1;
    if (bonusPoints.triedToKeepOnCall) bonusScore += 1;
    const totalScore = baseScore + bonusScore;
    return { baseScore, bonusScore, totalScore };
  };

  const handleCompleteInterview = async () => {
    if (!id || typeof id !== 'string') return;

    const { baseScore, bonusScore, totalScore } = calculateScores();

    if (baseScore === 0) {
      toast({
        title: 'Warning',
        description: 'Please score all categories before completing the interview',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!recommendation) {
      toast({
        title: 'Warning',
        description: 'Please select a recommendation before completing',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const categoryScoresArray = SCORECARD_CATEGORIES.map((cat) => ({
        category: cat.name,
        score: categoryScores[cat.id]?.score || 0,
        notes: categoryScores[cat.id]?.notes || '',
      }));

      const completed = await atsService.completeInterview(id, {
        categoryScores: categoryScoresArray,
        bonusPoints,
        recommendation,
        overallNotes,
        redFlags,
        highlights,
      });

      setInterview(completed);
      toast({
        title: 'Interview Completed',
        description: `Total Score: ${totalScore}/27. Recommendation: ${recommendation}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to interview list after a delay
      setTimeout(() => {
        router.push('/ats/interviews');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete interview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { baseScore, bonusScore, totalScore } = calculateScores();
  const allCategoriesScored = Object.keys(categoryScores).length === SCORECARD_CATEGORIES.length &&
    Object.values(categoryScores).every(cat => cat.score > 0);

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

  if (!interview) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box p={6}>
          <Text>Interview not found</Text>
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
                onClick={() => router.push('/ats/interviews')}
              />
              <VStack align="start" spacing={1} flex={1}>
                <Heading size="lg">Phone Screening Interview</Heading>
                {candidate && (
                  <Text color="gray.600">
                    {candidate.firstName} {candidate.lastName} • {candidate.contact.email}
                  </Text>
                )}
              </VStack>
              <HStack>
                {!isInterviewStarted && interview.status === 'scheduled' && (
                  <Button colorScheme="green" onClick={handleStartInterview}>
                    <FiPlay style={{ marginRight: '8px' }} />
                    Start Interview
                  </Button>
                )}
                {isInterviewStarted && (
                  <HStack>
                    <Badge colorScheme="green" fontSize="lg" p={2}>
                      <FiClock style={{ marginRight: '4px', display: 'inline' }} />
                      {formatTime(elapsedTime)}
                    </Badge>
                  </HStack>
                )}
              </HStack>
            </HStack>

            {!isInterviewStarted && interview.status === 'scheduled' && (
              <Alert status="info">
                <AlertIcon />
                Click "Start Interview" to begin the phone screening. The timer will start automatically.
              </Alert>
            )}

            {isInterviewStarted && (
              <>
                {/* Score Summary */}
                <Card bg={cardBg}>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Base Score</Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          {baseScore}/24
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Bonus Points</Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          +{bonusScore}/3
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Total Score</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {totalScore}/27
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Split View: Script on Left, Scorecard on Right */}
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                  {/* Left Side: Interview Script */}
                  <GridItem>
                    <Card bg={cardBg} h="100%">
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading size="md">
                              <FiFileText style={{ display: 'inline', marginRight: '8px' }} />
                              Interview Script
                            </Heading>
                            {script && (
                              <Badge colorScheme="blue">{script.name}</Badge>
                            )}
                          </HStack>
                          <Divider />
                          
                          {script && script.questions && script.questions.length > 0 ? (
                            <Box maxH="calc(100vh - 400px)" overflowY="auto">
                              <VStack align="stretch" spacing={4}>
                                {script.questions
                                  .sort((a: any, b: any) => a.order - b.order)
                                  .map((question: any, index: number) => {
                                    const isCurrent = index === currentScriptQuestionIndex;
                                    return (
                                      <Card
                                        key={question.id}
                                        bg={isCurrent ? 'blue.50' : 'gray.50'}
                                        borderWidth={isCurrent ? 2 : 1}
                                        borderColor={isCurrent ? 'blue.500' : 'gray.200'}
                                        cursor="pointer"
                                        onClick={() => {
                                          setCurrentScriptQuestionIndex(index);
                                          // Auto-navigate to corresponding scorecard category if linked
                                          if (question.category) {
                                            // Try to match by category name or ID
                                            const categoryIndex = SCORECARD_CATEGORIES.findIndex(
                                              (cat) => 
                                                cat.name.toLowerCase().includes(question.category.toLowerCase()) ||
                                                cat.id.toLowerCase().includes(question.category.toLowerCase()) ||
                                                question.category.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0]) ||
                                                question.category.toLowerCase().includes(cat.id.toLowerCase())
                                            );
                                            if (categoryIndex !== -1) {
                                              setCurrentCategoryIndex(categoryIndex);
                                            }
                                          }
                                        }}
                                      >
                                        <CardBody>
                                          <VStack align="stretch" spacing={2}>
                                            <HStack>
                                              <Badge colorScheme={isCurrent ? 'blue' : 'gray'}>
                                                Question {question.order}
                                              </Badge>
                                              {question.estimatedTime && (
                                                <Badge variant="outline">
                                                  ~{question.estimatedTime} min
                                                </Badge>
                                              )}
                                              {question.category && (
                                                <Badge variant="outline" colorScheme="purple">
                                                  {question.category}
                                                </Badge>
                                              )}
                                            </HStack>
                                            <Text fontWeight="bold" fontSize="md">
                                              {question.questionText}
                                            </Text>
                                            {question.notes && (
                                              <Box bg="yellow.50" p={2} borderRadius="md">
                                                <Text fontSize="xs" fontWeight="bold" color="yellow.800">
                                                  Interviewer Notes:
                                                </Text>
                                                <Text fontSize="xs" color="yellow.900">
                                                  {question.notes}
                                                </Text>
                                              </Box>
                                            )}
                                            {question.expectedAnswerGuidance && (
                                              <Box bg="green.50" p={2} borderRadius="md">
                                                <Text fontSize="xs" fontWeight="bold" color="green.800">
                                                  Look for:
                                                </Text>
                                                <Text fontSize="xs" color="green.900">
                                                  {question.expectedAnswerGuidance}
                                                </Text>
                                              </Box>
                                            )}
                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    );
                                  })}
                              </VStack>
                            </Box>
                          ) : (
                            <VStack spacing={4} py={8}>
                              <Text color="gray.500">No script loaded for this interview</Text>
                              <Text fontSize="sm" color="gray.600">
                                Using default scorecard categories
                              </Text>
                            </VStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* Right Side: Scorecard */}
                  <GridItem>
                    <Card bg={cardBg} h="100%">
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Heading size="md">Scorecard</Heading>
                          <Divider />

                          {/* Category Navigation */}
                          <Box>
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                              Categories:
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                              {SCORECARD_CATEGORIES.map((cat, index) => {
                                const score = categoryScores[cat.id]?.score || 0;
                                const isCurrent = index === currentCategoryIndex;
                                return (
                                  <Button
                                    key={cat.id}
                                    size="sm"
                                    variant={isCurrent ? 'solid' : 'outline'}
                                    colorScheme={score > 0 ? 'green' : 'gray'}
                                    onClick={() => setCurrentCategoryIndex(index)}
                                  >
                                    {index + 1}
                                    {score > 0 && ` (${score})`}
                                  </Button>
                                );
                              })}
                            </HStack>
                          </Box>

                          <Divider />

                          {/* Current Category Scoring */}
                          <Box maxH="calc(100vh - 500px)" overflowY="auto">
                            <VStack align="stretch" spacing={4}>
                              <Heading size="sm">
                                {currentCategoryIndex + 1}. {currentCategory.name}
                              </Heading>
                              <Text fontSize="sm" color="gray.600">
                                {currentCategory.description}
                              </Text>
                              <Divider />
                              {/* Show matching script question if available */}
                              {script && script.questions && (() => {
                                const matchingQuestion = script.questions.find((q: any) => 
                                  q.category && (
                                    currentCategory.name.toLowerCase().includes(q.category.toLowerCase()) ||
                                    q.category.toLowerCase().includes(currentCategory.name.toLowerCase().split(' ')[0]) ||
                                    currentCategory.id.toLowerCase().includes(q.category.toLowerCase())
                                  )
                                );
                                return matchingQuestion ? (
                                  <Box bg="blue.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                                    <Text fontSize="xs" fontWeight="bold" color="blue.800" mb={1}>
                                      Script Question {matchingQuestion.order}:
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                                      {matchingQuestion.questionText}
                                    </Text>
                                    {matchingQuestion.expectedAnswerGuidance && (
                                      <Box bg="white" p={2} borderRadius="sm" mt={2}>
                                        <Text fontSize="xs" fontWeight="bold" color="green.800" mb={1}>
                                          Look for:
                                        </Text>
                                        <Text fontSize="xs" color="green.900">
                                          {matchingQuestion.expectedAnswerGuidance}
                                        </Text>
                                      </Box>
                                    )}
                                  </Box>
                                ) : (
                                  <Box bg="blue.50" p={3} borderRadius="md">
                                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                                      Script Question:
                                    </Text>
                                    <Text fontSize="sm">{currentCategory.question}</Text>
                                  </Box>
                                );
                              })()}
                              {!script && (
                                <Box bg="blue.50" p={3} borderRadius="md">
                                  <Text fontSize="sm" fontWeight="bold" mb={1}>
                                    Script Question:
                                  </Text>
                                  <Text fontSize="sm">{currentCategory.question}</Text>
                                </Box>
                              )}
                              <Divider />
                              <FormControl>
                                <FormLabel fontSize="sm">
                                  Score (1 = Weak, 2 = Average, 3 = Strong)
                                </FormLabel>
                                <RadioGroup
                                  value={categoryScores[currentCategory.id]?.score?.toString() || ''}
                                  onChange={(value) =>
                                    handleScoreChange(currentCategory.id, parseInt(value, 10))
                                  }
                                >
                                  <HStack spacing={4}>
                                    <Radio value="1" size="sm">
                                      1 - Weak
                                    </Radio>
                                    <Radio value="2" size="sm">
                                      2 - Average
                                    </Radio>
                                    <Radio value="3" size="sm">
                                      3 - Strong
                                    </Radio>
                                  </HStack>
                                </RadioGroup>
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="sm">Notes</FormLabel>
                                <Textarea
                                  value={categoryScores[currentCategory.id]?.notes || ''}
                                  onChange={(e) =>
                                    handleNotesChange(currentCategory.id, e.target.value)
                                  }
                                  placeholder="Add notes about the candidate's response..."
                                  rows={3}
                                  size="sm"
                                />
                              </FormControl>
                              <HStack>
                                <Button
                                  size="sm"
                                  isDisabled={currentCategoryIndex === 0}
                                  onClick={() => setCurrentCategoryIndex(currentCategoryIndex - 1)}
                                >
                                  Previous
                                </Button>
                                <Button
                                  size="sm"
                                  isDisabled={
                                    currentCategoryIndex === SCORECARD_CATEGORIES.length - 1
                                  }
                                  onClick={() => setCurrentCategoryIndex(currentCategoryIndex + 1)}
                                >
                                  Next
                                </Button>
                              </HStack>
                            </VStack>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>

                {/* Bonus Points */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Bonus Points</Heading>
                    <VStack align="stretch" spacing={3}>
                      <Checkbox
                        isChecked={bonusPoints.enjoyedCall}
                        onChange={(e) => setBonusPoints({ ...bonusPoints, enjoyedCall: e.target.checked })}
                      >
                        Enjoyed the call / good rapport (+3 points)
                      </Checkbox>
                      <Checkbox
                        isChecked={bonusPoints.askedThoughtfulQuestions}
                        onChange={(e) => setBonusPoints({ ...bonusPoints, askedThoughtfulQuestions: e.target.checked })}
                      >
                        Asked thoughtful questions (+1 point)
                      </Checkbox>
                      <Checkbox
                        isChecked={bonusPoints.triedToKeepOnCall}
                        onChange={(e) => setBonusPoints({ ...bonusPoints, triedToKeepOnCall: e.target.checked })}
                      >
                        Tried to keep interviewer on the call (+1 point)
                      </Checkbox>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Recommendation and Final Notes */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md">Final Assessment</Heading>
                      <FormControl isRequired>
                        <FormLabel>Recommendation</FormLabel>
                        <Select
                          value={recommendation}
                          onChange={(e) => setRecommendation(e.target.value)}
                          placeholder="Select recommendation"
                        >
                          <option value="strong_yes">STRONG YES - Advance immediately</option>
                          <option value="maybe">MAYBE - Hold / compare</option>
                          <option value="no">NO - Reject</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Overall Notes / Gut Check</FormLabel>
                        <Textarea
                          value={overallNotes}
                          onChange={(e) => setOverallNotes(e.target.value)}
                          placeholder="Add final notes about the candidate..."
                          rows={5}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Red Flags (one per line)</FormLabel>
                        <Textarea
                          value={redFlags.join('\n')}
                          onChange={(e) => setRedFlags(e.target.value.split('\n').filter(Boolean))}
                          placeholder="List any concerns or red flags..."
                          rows={3}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Highlights (one per line)</FormLabel>
                        <Textarea
                          value={highlights.join('\n')}
                          onChange={(e) => setHighlights(e.target.value.split('\n').filter(Boolean))}
                          placeholder="List key highlights or strengths..."
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Complete Button */}
                <Card bg={cardBg}>
                  <CardBody>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">Ready to Complete Interview</Text>
                        <Text fontSize="sm" color="gray.600">
                          {allCategoriesScored
                            ? 'All categories scored. Review and complete when ready.'
                            : `Please score all ${SCORECARD_CATEGORIES.length} categories before completing.`}
                        </Text>
                      </VStack>
                      <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={handleCompleteInterview}
                        isDisabled={!allCategoriesScored || !recommendation}
                      >
                        <FiCheckCircle style={{ marginRight: '8px' }} />
                        Complete Interview
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              </>
            )}

            {interview.status === 'completed' && (
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="md">Interview Completed</Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Base Score</Text>
                        <Text fontSize="2xl" fontWeight="bold">{interview.baseScore || 0}/24</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Bonus Points</Text>
                        <Text fontSize="2xl" fontWeight="bold">+{interview.bonusScore || 0}/3</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Total Score</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {interview.totalScore || 0}/27
                        </Text>
                      </Box>
                    </SimpleGrid>
                    <Divider />
                    <Text fontWeight="bold">Recommendation: {interview.recommendation?.toUpperCase() || 'N/A'}</Text>
                    {interview.overallNotes && (
                      <>
                        <Text fontWeight="bold">Notes:</Text>
                        <Text whiteSpace="pre-wrap">{interview.overallNotes}</Text>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default PhoneScreeningPage;

