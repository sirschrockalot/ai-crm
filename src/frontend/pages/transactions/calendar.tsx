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
import { Sidebar, Header, Navigation } from '../../components/layout';
import { Calendar, CalendarEvent } from '../../components/shared/Calendar';
import { appointmentsService, Appointment } from '../../services/appointmentsService';
import { NotificationService } from '../../utils/notifications';

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadAppointments();
  }, [currentDate, view]);

  // Check for appointment reminders every minute
  useEffect(() => {
    const checkReminders = async () => {
      if (appointments.length > 0) {
        await NotificationService.checkAppointmentReminders(appointments);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [appointments]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();
      const data = await appointmentsService.getCalendar(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setAppointments(data);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast({
        title: 'Error loading appointments',
        description: error.message || 'Failed to load calendar data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const getAppointmentColor = (type: Appointment['type']): string => {
    const colors: Record<string, string> = {
      call_back_buyer: 'blue',
      call_back_seller: 'green',
      call_back_title_company: 'purple',
      call_back_lender: 'orange',
      document_follow_up: 'yellow',
      closing_date_reminder: 'red',
      inspection_deadline: 'cyan',
      emd_deadline: 'pink',
      meeting: 'teal',
      custom: 'gray',
    };
    return colors[type] || 'gray';
  };

  const convertToCalendarEvents = (appointments: Appointment[]): CalendarEvent[] => {
    return appointments.map(apt => ({
      id: apt.id || apt._id || '',
      title: apt.title,
      startDate: apt.startDate,
      endDate: apt.endDate,
      type: apt.type,
      color: getAppointmentColor(apt.type),
      metadata: {
        transactionId: apt.transactionId,
        contactPerson: apt.contactPerson,
        type: apt.type,
        status: apt.status,
      },
    }));
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.metadata?.transactionId) {
      router.push(`/transactions/${event.metadata.transactionId}`);
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
                  onClick={() => router.push('/transactions')}
                />
                <VStack align="start" spacing={1}>
                  <Heading size="lg">Calendar</Heading>
                  <Text color="gray.600">Manage appointments and schedule follow-ups</Text>
                </VStack>
              </HStack>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={() => router.push('/transactions')}
              >
                New Appointment
              </Button>
            </HStack>

            <Card bg={cardBg}>
              <CardBody>
                <Calendar
                  events={convertToCalendarEvents(appointments)}
                  isLoading={isLoading}
                  view={view}
                  onViewChange={(newView) => setView(newView)}
                  onEventClick={handleEventClick}
                  onNavigate={handleNavigate}
                  getEventColor={(event) => event.color || 'blue'}
                  emptyStateMessage="No appointments scheduled"
                />
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default CalendarPage;
