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
  IconButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../../components/layout';
import { Calendar, CalendarEvent, CalendarView } from '../../../components/shared/Calendar';
import { atsService } from '../../../services/atsService';

const InterviewsCalendarPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');

  useEffect(() => {
    loadInterviews();
  }, [currentDate, view]);

  const getStartDate = (): Date => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setHours(0, 0, 0, 0);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const getEndDate = (): Date => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() + (6 - day));
      date.setHours(23, 59, 59, 999);
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();

      const data = await atsService.getCalendarInterviews(
        startDate.toISOString(),
        endDate.toISOString()
      );

      const calendarEvents: CalendarEvent[] = data.map((interview: any) => ({
        id: interview.id,
        title: `Interview: ${interview.candidate?.firstName || 'Candidate'} ${interview.candidate?.lastName || ''}`,
        startDate: interview.scheduledStartTime || interview.createdAt,
        endDate: interview.scheduledEndTime,
        type: interview.type,
        color: getInterviewColor(interview.type, interview.status),
        metadata: {
          candidateId: interview.candidateId,
          interviewId: interview.id,
          status: interview.status,
          type: interview.type,
          candidateName: `${interview.candidate?.firstName || ''} ${interview.candidate?.lastName || ''}`.trim(),
        },
      }));

      setEvents(calendarEvents);
    } catch (error: any) {
      console.error('Error loading interviews:', error);
      toast({
        title: 'Error loading interviews',
        description: error.message || 'Failed to load calendar data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInterviewColor = (type?: string, status?: string): string => {
    if (status === 'completed') return 'green';
    if (status === 'cancelled' || status === 'no_show') return 'red';
    if (status === 'in_progress') return 'blue';
    
    if (type === 'phone_screen') return 'blue';
    if (type === 'video_interview') return 'purple';
    if (type === 'panel_interview') return 'orange';
    
    return 'gray';
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.metadata?.interviewId) {
      router.push(`/ats/interviews/${event.metadata.interviewId}`);
    }
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
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
              <HStack spacing={4}>
                <IconButton
                  icon={<FiArrowLeft />}
                  aria-label="Back"
                  onClick={() => router.push('/ats/interviews')}
                />
                <VStack align="start" spacing={1}>
                  <Heading size="lg">Interview Calendar</Heading>
                  <Text color="gray.600">View and manage scheduled interviews</Text>
                </VStack>
              </HStack>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={() => router.push('/ats/interviews/new')}
              >
                Schedule Interview
              </Button>
            </HStack>

            <Card bg={cardBg}>
              <CardBody>
                <Calendar
                  events={events}
                  isLoading={isLoading}
                  view={view}
                  onViewChange={(newView) => setView(newView)}
                  onEventClick={handleEventClick}
                  onNavigate={handleNavigate}
                  getEventColor={(event) => event.color || 'blue'}
                  formatEventTitle={(event) => {
                    const time = new Date(event.startDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });
                    return `${time} - ${event.title}`;
                  }}
                  emptyStateMessage="No interviews scheduled"
                />
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default InterviewsCalendarPage;

