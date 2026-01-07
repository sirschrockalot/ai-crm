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
  IconButton,
  SimpleGrid,
  Select,
  Divider,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { appointmentsService, Appointment } from '../../services/appointmentsService';
import { NotificationService } from '../../utils/notifications';

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  const cardBg = useColorModeValue('white', 'gray.800');

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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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

  const formatDateRange = (): string => {
    const start = getStartDate();
    const end = getEndDate();
    
    if (view === 'day') {
      return start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (view === 'week') {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startDate);
      return aptDate.toDateString() === currentDate.toDateString();
    });

    return (
      <VStack align="stretch" spacing={0}>
        {hours.map(hour => {
          const hourAppointments = dayAppointments.filter(apt => {
            const aptDate = new Date(apt.startDate);
            return aptDate.getHours() === hour;
          });

          return (
            <Box key={hour} borderBottom="1px" borderColor="gray.200" minH="60px" p={2}>
              <HStack align="start" spacing={4}>
                <Text fontSize="sm" color="gray.500" w="60px" flexShrink={0}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
                <VStack align="stretch" spacing={1} flex={1}>
                  {hourAppointments.map(apt => (
                    <Card
                      key={apt.id || apt._id}
                      size="sm"
                      bg={`${getAppointmentColor(apt.type)}.100`}
                      borderLeft="4px"
                      borderColor={`${getAppointmentColor(apt.type)}.500`}
                      cursor="pointer"
                      onClick={() => router.push(`/transactions/${apt.transactionId}`)}
                    >
                      <CardBody p={2}>
                        <Text fontSize="xs" fontWeight="bold">
                          {apt.title}
                        </Text>
                        {apt.contactPerson && (
                          <Text fontSize="xs" color="gray.600">
                            {apt.contactPerson}
                          </Text>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    );
  };

  const renderWeekView = () => {
    const start = getStartDate();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });

    return (
      <SimpleGrid columns={7} spacing={2}>
        {days.map((day, idx) => {
          const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.startDate);
            return aptDate.toDateString() === day.toDateString();
          });

          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Box key={idx} border="1px" borderColor="gray.200" borderRadius="md" p={2} minH="400px">
              <VStack align="stretch" spacing={2}>
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={isToday ? 'blue.500' : 'gray.700'}
                  textAlign="center"
                >
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight={isToday ? 'bold' : 'normal'}
                  color={isToday ? 'blue.500' : 'gray.700'}
                  textAlign="center"
                >
                  {day.getDate()}
                </Text>
                <Divider />
                <VStack align="stretch" spacing={1} flex={1}>
                  {dayAppointments.map(apt => (
                    <Card
                      key={apt.id || apt._id}
                      size="sm"
                      bg={`${getAppointmentColor(apt.type)}.100`}
                      borderLeft="3px"
                      borderColor={`${getAppointmentColor(apt.type)}.500`}
                      cursor="pointer"
                      onClick={() => router.push(`/transactions/${apt.transactionId}`)}
                    >
                      <CardBody p={2}>
                        <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                          {apt.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {new Date(apt.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    );
  };

  const renderMonthView = () => {
    const start = getStartDate();
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = Array.from({ length: 42 }, (_, i) => {
      const day = i - startingDayOfWeek + 1;
      const date = new Date(start.getFullYear(), start.getMonth(), day);
      return { date, day };
    });

    return (
      <SimpleGrid columns={7} spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Box key={day} p={2} textAlign="center" fontWeight="bold" fontSize="sm" color="gray.600">
            {day}
          </Box>
        ))}
        {days.map(({ date, day }, idx) => {
          const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.startDate);
            return aptDate.toDateString() === date.toDateString();
          });

          const isToday = date.toDateString() === new Date().toDateString();
          const isCurrentMonth = date.getMonth() === start.getMonth();

          return (
            <Box
              key={idx}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              p={1}
              minH="100px"
              bg={!isCurrentMonth ? 'gray.50' : 'white'}
            >
              <Text
                fontSize="sm"
                fontWeight={isToday ? 'bold' : 'normal'}
                color={isToday ? 'blue.500' : !isCurrentMonth ? 'gray.400' : 'gray.700'}
                mb={1}
              >
                {isCurrentMonth ? day : ''}
              </Text>
              <VStack align="stretch" spacing={0.5}>
                {dayAppointments.slice(0, 3).map(apt => (
                  <Box
                    key={apt.id || apt._id}
                    bg={`${getAppointmentColor(apt.type)}.200`}
                    borderRadius="sm"
                    p={0.5}
                    fontSize="xs"
                    cursor="pointer"
                    onClick={() => router.push(`/transactions/${apt.transactionId}`)}
                    title={apt.title}
                  >
                    <Text noOfLines={1} fontSize="xs">
                      {new Date(apt.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </Box>
                ))}
                {dayAppointments.length > 3 && (
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    +{dayAppointments.length - 3} more
                  </Text>
                )}
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="ghost"
                  onClick={() => router.push('/transactions')}
                >
                  Back to Transactions
                </Button>
                <Divider orientation="vertical" h={6} />
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

            {/* Calendar Controls */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Previous"
                      icon={<FiChevronLeft />}
                      onClick={() => navigateDate('prev')}
                    />
                    <Button variant="ghost" onClick={goToToday}>
                      Today
                    </Button>
                    <IconButton
                      aria-label="Next"
                      icon={<FiChevronRight />}
                      onClick={() => navigateDate('next')}
                    />
                    <Text fontWeight="semibold" minW="200px" textAlign="center">
                      {formatDateRange()}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Select
                      value={view}
                      onChange={(e) => setView(e.target.value as 'day' | 'week' | 'month')}
                      w="120px"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                    </Select>
                  </HStack>
                </HStack>

                {/* Calendar View */}
                {isLoading ? (
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500">Loading calendar...</Text>
                  </Box>
                ) : (
                  <Box>
                    {view === 'day' && renderDayView()}
                    {view === 'week' && renderWeekView()}
                    {view === 'month' && renderMonthView()}
                  </Box>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default CalendarPage;

