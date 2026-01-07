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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Progress,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiEye,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
} from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { atsService } from '../../../services/atsService';

interface ReviewCandidate {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    contact: {
      email: string;
      phone?: string;
    };
    status: string;
  };
  interview: {
    id: string;
    totalScore?: number;
    baseScore?: number;
    bonusScore?: number;
    recommendation?: string;
    overallNotes?: string;
    highlights?: string[];
    redFlags?: string[];
    interviewer: {
      name: string;
      userId: string;
    };
    completedAt?: string;
  };
  application: {
    id: string;
    applicationDate: string;
    source: string;
  };
  jobPosting?: {
    title: string;
  };
}

const TeamReviewPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCandidate, setSelectedCandidate] = useState<ReviewCandidate | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState<string>('');

  const [candidates, setCandidates] = useState<ReviewCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>('score');
  const [filterBy, setFilterBy] = useState<string>('all');

  useEffect(() => {
    loadCandidates();
  }, [sortBy, filterBy]);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      // Get top candidates for review (those with completed phone screens)
      const response = await atsService.getTopCandidatesForReview({
        limit: 50,
        sortBy: sortBy === 'score' ? 'totalScore' : sortBy,
        sortOrder: 'desc',
      });
      setCandidates(response || []);
    } catch (error: any) {
      console.error('Error loading candidates for review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load candidates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAction = async (action: string, candidate: ReviewCandidate) => {
    setSelectedCandidate(candidate);
    setReviewAction(action);
    setReviewNote('');
    onOpen();
  };

  const submitReview = async () => {
    if (!selectedCandidate) return;

    try {
      // Update candidate status based on action
      const statusMap: Record<string, string> = {
        approve: 'video_interview_scheduled',
        reject: 'rejected',
        request_info: 'resume_review',
      };

      const newStatus = statusMap[reviewAction] || selectedCandidate.candidate.status;

      await atsService.updateCandidate(selectedCandidate.candidate.id, {
        status: newStatus,
        notes: reviewNote,
      });

      toast({
        title: 'Success',
        description: `Candidate ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'flagged for more info'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      loadCandidates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getRecommendationColor = (recommendation?: string) => {
    const colors: Record<string, string> = {
      strong_yes: 'green',
      maybe: 'yellow',
      no: 'red',
    };
    return colors[recommendation || ''] || 'gray';
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 20) return 'green';
    if (score >= 15) return 'yellow';
    return 'red';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredCandidates = candidates.filter((item) => {
    if (filterBy === 'all') return true;
    if (filterBy === 'strong_yes') {
      return item.interview.recommendation === 'strong_yes';
    }
    if (filterBy === 'high_score') {
      return (item.interview.totalScore || 0) >= 20;
    }
    return true;
  });

  const stats = {
    total: candidates.length,
    strongYes: candidates.filter((c) => c.interview.recommendation === 'strong_yes').length,
    highScore: candidates.filter((c) => (c.interview.totalScore || 0) >= 20).length,
    averageScore:
      candidates.length > 0
        ? Math.round(
            candidates.reduce((sum, c) => sum + (c.interview.totalScore || 0), 0) /
              candidates.length
          )
        : 0,
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
                <Heading size="lg">Team Review Dashboard</Heading>
                <Text color="gray.600">
                  Review top candidates from phone screenings and make hiring decisions
                </Text>
              </VStack>
            </HStack>

            {/* Stats Cards */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Pending Review</StatLabel>
                    <StatNumber>{stats.total}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Strong Yes</StatLabel>
                    <StatNumber>{stats.strongYes}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>High Score (≥20)</StatLabel>
                    <StatNumber>{stats.highScore}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <Stat>
                    <StatLabel>Average Score</StatLabel>
                    <StatNumber>{stats.averageScore}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    width="200px"
                  >
                    <option value="score">Sort by Score</option>
                    <option value="date">Sort by Interview Date</option>
                    <option value="application">Sort by Application Date</option>
                  </Select>
                  <Select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    width="200px"
                  >
                    <option value="all">All Candidates</option>
                    <option value="strong_yes">Strong Yes Only</option>
                    <option value="high_score">High Score (≥20)</option>
                  </Select>
                </HStack>
              </CardBody>
            </Card>

            {/* Candidates List */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Text>Loading candidates...</Text>
                ) : filteredCandidates.length === 0 ? (
                  <VStack spacing={4} py={8}>
                    <FiUsers size={48} color="gray" />
                    <Text color="gray.500">No candidates pending review</Text>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {filteredCandidates.map((item) => (
                      <Card key={item.candidate.id} bg="gray.50" borderWidth="1px">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <HStack>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {item.candidate.firstName} {item.candidate.lastName}
                                  </Text>
                                  <Badge
                                    colorScheme={getRecommendationColor(
                                      item.interview.recommendation
                                    )}
                                  >
                                    {item.interview.recommendation?.replace('_', ' ').toUpperCase() ||
                                      'NO RECOMMENDATION'}
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {item.candidate.contact.email} •{' '}
                                  {item.jobPosting?.title || 'Unknown Role'}
                                </Text>
                              </VStack>
                              <HStack>
                                <VStack spacing={0} align="end">
                                  <Text fontSize="2xl" fontWeight="bold">
                                    {item.interview.totalScore || 0}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    / 27
                                  </Text>
                                </VStack>
                                <Badge
                                  colorScheme={getScoreColor(item.interview.totalScore)}
                                  fontSize="md"
                                  p={2}
                                >
                                  Score
                                </Badge>
                              </HStack>
                            </HStack>

                            <Divider />

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                  Interview Score
                                </Text>
                                <Text fontWeight="bold">
                                  Base: {item.interview.baseScore || 0}/24 • Bonus:{' '}
                                  {item.interview.bonusScore || 0}/3
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                  Interviewer
                                </Text>
                                <Text fontWeight="bold">{item.interview.interviewer.name}</Text>
                                <Text fontSize="xs" color="gray.600">
                                  {formatDate(item.interview.completedAt)}
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                  Application
                                </Text>
                                <Text fontWeight="bold">{item.application.source}</Text>
                                <Text fontSize="xs" color="gray.600">
                                  {formatDate(item.application.applicationDate)}
                                </Text>
                              </VStack>
                            </SimpleGrid>

                            {item.interview.highlights && item.interview.highlights.length > 0 && (
                              <Alert status="success">
                                <AlertIcon />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">Highlights:</Text>
                                  {item.interview.highlights.map((highlight, idx) => (
                                    <Text key={idx} fontSize="sm">
                                      • {highlight}
                                    </Text>
                                  ))}
                                </VStack>
                              </Alert>
                            )}

                            {item.interview.redFlags && item.interview.redFlags.length > 0 && (
                              <Alert status="error">
                                <AlertIcon />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">Red Flags:</Text>
                                  {item.interview.redFlags.map((flag, idx) => (
                                    <Text key={idx} fontSize="sm">
                                      • {flag}
                                    </Text>
                                  ))}
                                </VStack>
                              </Alert>
                            )}

                            {item.interview.overallNotes && (
                              <Box>
                                <Text fontSize="sm" fontWeight="bold" mb={2}>
                                  Interview Notes:
                                </Text>
                                <Text fontSize="sm" color="gray.700">
                                  {item.interview.overallNotes}
                                </Text>
                              </Box>
                            )}

                            <Divider />

                            <HStack justify="space-between">
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<FiEye />}
                                onClick={() =>
                                  router.push(`/ats/candidates/${item.candidate.id}`)
                                }
                              >
                                View Full Profile
                              </Button>
                              <HStack>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  leftIcon={<FiCheckCircle />}
                                  onClick={() => handleReviewAction('approve', item)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="yellow"
                                  leftIcon={<FiMessageSquare />}
                                  onClick={() => handleReviewAction('request_info', item)}
                                >
                                  Request Info
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  leftIcon={<FiXCircle />}
                                  onClick={() => handleReviewAction('reject', item)}
                                >
                                  Reject
                                </Button>
                              </HStack>
                            </HStack>
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

      {/* Review Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {reviewAction === 'approve'
              ? 'Approve Candidate'
              : reviewAction === 'reject'
              ? 'Reject Candidate'
              : 'Request Additional Information'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCandidate && (
              <VStack spacing={4} align="stretch">
                <Text>
                  <strong>
                    {selectedCandidate.candidate.firstName}{' '}
                    {selectedCandidate.candidate.lastName}
                  </strong>
                </Text>
                <FormControl>
                  <Textarea
                    placeholder="Add your review notes..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={6}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={submitReview}>
              Submit Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeamReviewPage;

