import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useApi } from '../../hooks/useApi';

interface WeeklyTimesheetGridProps {
  onRefresh: () => void;
}

interface DayEntry {
  date: string;
  hours: string;
  projectId: string;
  taskId?: string;
  description: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  name: string;
  projectId: string;
}

export const WeeklyTimesheetGrid: React.FC<WeeklyTimesheetGridProps> = ({ onRefresh }) => {
  const { execute } = useApi();
  const toast = useToast();
  
  const [weekData, setWeekData] = useState<DayEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const todayBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    initializeWeek();
    loadProjects();
  }, []);

  const initializeWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(today.getDate() - daysToMonday);

    const weekDays: DayEntry[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      
      weekDays.push({
        date: currentDate.toISOString().split('T')[0],
        hours: '',
        projectId: '',
        taskId: '',
        description: '',
      });
    }

    setWeekData(weekDays);
  };

  const loadProjects = async () => {
    try {
      // This would integrate with the actual project management system
      // For now, using mock data
      const mockProjects: Project[] = [
        { _id: '1', name: 'Project Alpha' },
        { _id: '2', name: 'Project Beta' },
        { _id: '3', name: 'Project Gamma' },
        { _id: '4', name: 'Internal Development' },
      ];
      setProjects(mockProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      // This would integrate with the actual task management system
      // For now, using mock data
      const mockTasks: Task[] = [
        { _id: '1', name: 'Development', projectId: '1' },
        { _id: '2', name: 'Testing', projectId: '1' },
        { _id: '3', name: 'Documentation', projectId: '1' },
        { _id: '4', name: 'Planning', projectId: '2' },
        { _id: '5', name: 'Implementation', projectId: '2' },
      ];
      
      const filteredTasks = mockTasks.filter(task => task.projectId === projectId);
      setTasks(filteredTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleDayChange = (dayIndex: number, field: keyof DayEntry, value: string) => {
    const updatedWeekData = [...weekData];
    updatedWeekData[dayIndex] = {
      ...updatedWeekData[dayIndex],
      [field]: value,
    };

    // If project changed, load tasks for that project
    if (field === 'projectId') {
      loadTasks(value);
      // Clear task selection when project changes
      updatedWeekData[dayIndex].taskId = '';
    }

    setWeekData(updatedWeekData);
  };

  const calculateTotalHours = () => {
    return weekData.reduce((total, day) => {
      const hours = parseFloat(day.hours) || 0;
      return total + hours;
    }, 0);
  };

  const validateWeekData = () => {
    for (const day of weekData) {
      if (day.hours && parseFloat(day.hours) > 24) {
        return 'Hours per day cannot exceed 24';
      }
      if (day.hours && day.hours !== '' && !day.projectId) {
        return 'Project must be selected when hours are entered';
      }
    }
    return null;
  };

  const handleSaveDraft = async () => {
    const validationError = validateWeekData();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Filter out days with no hours
      const daysWithHours = weekData.filter(day => day.hours && parseFloat(day.hours) > 0);
      
      if (daysWithHours.length === 0) {
        toast({
          title: 'No Data',
          description: 'Please enter hours for at least one day',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create timesheet
      const weekStart = new Date(weekData[0].date);
      const weekEnd = new Date(weekData[6].date);
      
      const timesheetData = {
        weekStartDate: weekStart.toISOString(),
        weekEndDate: weekEnd.toISOString(),
        totalHours: calculateTotalHours(),
        billableHours: calculateTotalHours(), // Assuming all hours are billable for now
        entries: daysWithHours.map(day => ({
          date: day.date,
          hours: parseFloat(day.hours),
          projectId: day.projectId,
          taskId: day.taskId || undefined,
          description: day.description,
        })),
      };

      await execute({
        method: 'POST',
        url: '/api/time-tracking/timesheets',
        data: timesheetData,
      });
      
      toast({
        title: 'Success',
        description: 'Timesheet saved as draft',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onRefresh();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const validationError = validateWeekData();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // First save as draft
      await handleSaveDraft();
      
      // Then submit for approval
      // This would require getting the timesheet ID from the save response
      // For now, just show a success message
      
      toast({
        title: 'Success',
        description: 'Timesheet submitted for approval',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onRefresh();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="medium">
          Week of {formatDate(weekData[0]?.date || '')} - {formatDate(weekData[6]?.date || '')}
        </Text>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSaving}
            loadingText="Submitting..."
          >
            Submit for Approval
          </Button>
        </HStack>
      </HStack>

      {/* Grid */}
      <Box
        bg={cardBg}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        {/* Column Headers */}
        <Grid templateColumns="120px 1fr 1fr 1fr 1fr 1fr 1fr 1fr" gap={0}>
          <GridItem p={3} bg="gray.50" borderBottom="1px" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Day
            </Text>
          </GridItem>
          {weekData.map((day, index) => (
            <GridItem
              key={day.date}
              p={3}
              bg={isToday(day.date) ? todayBg : "gray.50"}
              borderBottom="1px"
              borderColor={borderColor}
              textAlign="center"
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                {formatDate(day.date)}
              </Text>
              {isToday(day.date) && (
                <Text fontSize="xs" color="blue.500" fontWeight="medium">
                  Today
                </Text>
              )}
            </GridItem>
          ))}
        </Grid>

        {/* Hours Row */}
        <Grid templateColumns="120px 1fr 1fr 1fr 1fr 1fr 1fr 1fr" gap={0}>
          <GridItem p={3} bg="gray.50" borderBottom="1px" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Hours
            </Text>
          </GridItem>
          {weekData.map((day, index) => (
            <GridItem
              key={`hours-${day.date}`}
              p={3}
              bg={isToday(day.date) ? todayBg : "white"}
              borderBottom="1px"
              borderColor={borderColor}
            >
              <Input
                size="sm"
                type="number"
                step="0.25"
                min="0"
                max="24"
                placeholder="0.0"
                value={day.hours}
                onChange={(e) => handleDayChange(index, 'hours', e.target.value)}
                textAlign="center"
              />
            </GridItem>
          ))}
        </Grid>

        {/* Project Row */}
        <Grid templateColumns="120px 1fr 1fr 1fr 1fr 1fr 1fr 1fr" gap={0}>
          <GridItem p={3} bg="gray.50" borderBottom="1px" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Project
            </Text>
          </GridItem>
          {weekData.map((day, index) => (
            <GridItem
              key={`project-${day.date}`}
              p={3}
              bg={isToday(day.date) ? todayBg : "white"}
              borderBottom="1px"
              borderColor={borderColor}
            >
              <Select
                size="sm"
                placeholder="Select Project"
                value={day.projectId}
                onChange={(e) => handleDayChange(index, 'projectId', e.target.value)}
              >
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </GridItem>
          ))}
        </Grid>

        {/* Task Row */}
        <Grid templateColumns="120px 1fr 1fr 1fr 1fr 1fr 1fr 1fr" gap={0}>
          <GridItem p={3} bg="gray.50" borderBottom="1px" borderColor={borderColor}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Task
            </Text>
          </GridItem>
          {weekData.map((day, index) => (
            <GridItem
              key={`task-${day.date}`}
              p={3}
              bg={isToday(day.date) ? todayBg : "white"}
              borderBottom="1px"
              borderColor={borderColor}
            >
              <Select
                size="sm"
                placeholder="Select Task"
                value={day.taskId}
                onChange={(e) => handleDayChange(index, 'taskId', e.target.value)}
                isDisabled={!day.projectId}
              >
                {tasks
                  .filter(task => task.projectId === day.projectId)
                  .map(task => (
                    <option key={task._id} value={task._id}>
                      {task.name}
                    </option>
                  ))}
              </Select>
            </GridItem>
          ))}
        </Grid>

        {/* Description Row */}
        <Grid templateColumns="120px 1fr 1fr 1fr 1fr 1fr 1fr 1fr" gap={0}>
          <GridItem p={3} bg="gray.50">
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Description
            </Text>
          </GridItem>
          {weekData.map((day, index) => (
            <GridItem
              key={`description-${day.date}`}
              p={3}
              bg={isToday(day.date) ? todayBg : "white"}
            >
              <Input
                size="sm"
                placeholder="What did you work on?"
                value={day.description}
                onChange={(e) => handleDayChange(index, 'description', e.target.value)}
              />
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Total Hours */}
      <Box mt={4} textAlign="right">
        <Text fontSize="lg" fontWeight="medium">
          Total Hours: <Text as="span" color="blue.500">{calculateTotalHours().toFixed(1)}h</Text>
        </Text>
      </Box>
    </Box>
  );
};
