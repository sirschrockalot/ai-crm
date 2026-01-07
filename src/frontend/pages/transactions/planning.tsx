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
  IconButton,
  Checkbox,
  Progress,
  Icon,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus, FiCheckCircle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { appointmentsService, Appointment } from '../../services/appointmentsService';
import { tasksService, Task } from '../../services/tasksService';

const DailyPlanningPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const cardBg = useColorModeValue('white', 'gray.800');
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const [appointmentsData, tasksData, overdueData] = await Promise.all([
        appointmentsService.getCalendar(startDate.toISOString(), endDate.toISOString()),
        tasksService.getToday(),
        tasksService.getOverdue(),
      ]);

      setAppointments(appointmentsData);
      setTasks(tasksData);
      setOverdueTasks(overdueData);
    } catch (error: any) {
      console.error('Error loading planning data:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to load planning data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await tasksService.update(taskId, { status: 'completed' });
      await loadData();
      toast({
        title: 'Task completed',
        status: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: 'Error completing task',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleAppointmentComplete = async (appointmentId: string) => {
    try {
      await appointmentsService.update(appointmentId, { status: 'completed' });
      await loadData();
      toast({
        title: 'Appointment completed',
        status: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: 'Error completing appointment',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority] || 'gray';
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

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
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
                  <Heading size="lg">Daily Planning</Heading>
                  <Text color="gray.600">Plan your day and track tasks and appointments</Text>
                </VStack>
              </HStack>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous day"
                  icon={<FiClock />}
                  onClick={() => navigateDate('prev')}
                />
                <Button variant="ghost" onClick={goToToday} isDisabled={isToday}>
                  Today
                </Button>
                <IconButton
                  aria-label="Next day"
                  icon={<FiClock />}
                  onClick={() => navigateDate('next')}
                />
                <Text fontWeight="semibold" minW="150px" textAlign="center">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
              </HStack>
            </HStack>

            {/* Overview Stats */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">Appointments</Text>
                    <Text fontSize="2xl" fontWeight="bold">{appointments.length}</Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">Tasks</Text>
                    <Text fontSize="2xl" fontWeight="bold">{totalTasks}</Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">Completed</Text>
                    <Text fontSize="2xl" fontWeight="bold">{completedTasks}</Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">Progress</Text>
                    <Progress value={completionRate} colorScheme="blue" w="100%" />
                    <Text fontSize="sm" fontWeight="semibold">{completionRate.toFixed(0)}%</Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Overdue Tasks Alert */}
            {overdueTasks.length > 0 && (
              <Card bg="red.50" borderColor="red.200" borderWidth={2}>
                <CardBody>
                  <HStack spacing={2} mb={2}>
                    <Icon as={FiAlertCircle} color="red.500" />
                    <Heading size="sm" color="red.700">Overdue Tasks</Heading>
                  </HStack>
                  <VStack align="stretch" spacing={2}>
                    {overdueTasks.map(task => (
                      <HStack key={task.id || task._id} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{task.title}</Text>
                          {task.dueDate && (
                            <Text fontSize="xs" color="gray.600">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                          )}
                        </VStack>
                        <Badge colorScheme={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Appointments */}
              <Card bg={cardBg}>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Appointments</Heading>
                    <Button
                      size="sm"
                      leftIcon={<FiPlus />}
                      onClick={() => router.push('/transactions')}
                    >
                      New
                    </Button>
                  </HStack>
                  {isLoading ? (
                    <Text color="gray.500">Loading...</Text>
                  ) : appointments.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No appointments scheduled for this day
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {appointments.map(apt => (
                        <Card
                          key={apt.id || apt._id}
                          size="sm"
                          bg={`${getAppointmentColor(apt.type)}.50`}
                          borderLeft="4px"
                          borderColor={`${getAppointmentColor(apt.type)}.500`}
                          cursor="pointer"
                          onClick={() => router.push(`/transactions/${apt.transactionId}`)}
                        >
                          <CardBody p={3}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="semibold" fontSize="sm">
                                  {apt.title}
                                </Text>
                                <HStack spacing={2}>
                                  <Text fontSize="xs" color="gray.600">
                                    {formatTime(apt.startDate)}
                                  </Text>
                                  {apt.contactPerson && (
                                    <>
                                      <Text fontSize="xs" color="gray.400">•</Text>
                                      <Text fontSize="xs" color="gray.600">
                                        {apt.contactPerson}
                                      </Text>
                                    </>
                                  )}
                                </HStack>
                              </VStack>
                              <IconButton
                                aria-label="Mark complete"
                                icon={<FiCheckCircle />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAppointmentComplete(apt.id || apt._id || '');
                                }}
                              />
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* Tasks */}
              <Card bg={cardBg}>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Tasks</Heading>
                    <Button
                      size="sm"
                      leftIcon={<FiPlus />}
                      onClick={() => router.push('/transactions')}
                    >
                      New
                    </Button>
                  </HStack>
                  {isLoading ? (
                    <Text color="gray.500">Loading...</Text>
                  ) : tasks.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No tasks for today
                    </Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {tasks.map(task => (
                        <Card
                          key={task.id || task._id}
                          size="sm"
                          opacity={task.status === 'completed' ? 0.6 : 1}
                        >
                          <CardBody p={3}>
                            <HStack spacing={3}>
                              <Checkbox
                                isChecked={task.status === 'completed'}
                                onChange={() => handleTaskComplete(task.id || task._id || '')}
                                colorScheme="green"
                              />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text
                                  fontWeight="medium"
                                  fontSize="sm"
                                  textDecoration={task.status === 'completed' ? 'line-through' : 'none'}
                                >
                                  {task.title}
                                </Text>
                                {task.dueDate && (
                                  <Text fontSize="xs" color="gray.600">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </Text>
                                )}
                              </VStack>
                              <Badge colorScheme={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default DailyPlanningPage;

