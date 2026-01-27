import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Select,
  Spinner,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { TaskList, Task } from '../../components/leads/TaskList';
import { useAuth } from '../../contexts/AuthContext';

const TasksPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'next_7_days'>('all');

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      const headers: Record<string, string> = {};
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!bypassAuth) {
        return;
      }

      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('filter', filter);
      }

      const queryString = queryParams.toString();
      const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load tasks');
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error loading tasks',
        description: error.message || 'Failed to load tasks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      const headers: Record<string, string> = {};
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!bypassAuth) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers,
      });

      if (response.ok) {
        await fetchTasks();
        toast({
          title: 'Task completed',
          description: 'Task has been marked as done',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete task');
      }
    } catch (error: any) {
      toast({
        title: 'Error completing task',
        description: error.message || 'Failed to complete task',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openTasks = tasks.filter(t => t.status === 'OPEN');
  const overdueTasks = openTasks.filter(t => new Date(t.dueAt) < new Date());

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
                <Heading size="lg">My Tasks</Heading>
                <Text color="gray.600">Manage your assigned tasks</Text>
              </VStack>
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                onClick={fetchTasks}
                isLoading={isLoading}
              >
                Refresh
              </Button>
            </HStack>

            {/* Stats */}
            <HStack spacing={4}>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Open Tasks</Text>
                    <Text fontSize="2xl" fontWeight="bold">{openTasks.length}</Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg={cardBg}>
                <CardBody>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.600">Overdue</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.500">{overdueTasks.length}</Text>
                  </VStack>
                </CardBody>
              </Card>
            </HStack>

            {/* Filters */}
            <Card bg={cardBg}>
              <CardBody>
                <HStack spacing={4}>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    w="200px"
                  >
                    <option value="all">All Tasks</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Today</option>
                    <option value="next_7_days">Next 7 Days</option>
                  </Select>
                </HStack>
              </CardBody>
            </Card>

            {/* Tasks List */}
            <Card bg={cardBg}>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" p={8}>
                    <Spinner size="xl" />
                  </Flex>
                ) : tasks.length === 0 ? (
                  <Text textAlign="center" p={8} color="gray.500">
                    No tasks found
                  </Text>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onComplete={handleCompleteTask}
                    showLead={true}
                  />
                )}
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default TasksPage;
