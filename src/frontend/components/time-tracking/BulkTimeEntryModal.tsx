import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

interface BulkTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface TimeEntry {
  projectId: string;
  taskId?: string;
  startTime: string;
  endTime: string;
  description: string;
  billable: boolean;
  hourlyRate?: number;
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

export const BulkTimeEntryModal: React.FC<BulkTimeEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { execute } = useApi();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      projectId: '',
      taskId: '',
      startTime: '',
      endTime: '',
      description: '',
      billable: true,
      hourlyRate: undefined,
    },
  ]);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

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

  const addTimeEntry = () => {
    setTimeEntries(prev => [
      ...prev,
      {
        projectId: '',
        taskId: '',
        startTime: '',
        endTime: '',
        description: '',
        billable: true,
        hourlyRate: undefined,
      },
    ]);
  };

  const removeTimeEntry = (index: number) => {
    if (timeEntries.length > 1) {
      setTimeEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTimeEntry = (index: number, field: keyof TimeEntry, value: any) => {
    const updatedEntries = [...timeEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };

    // If project changed, clear task selection
    if (field === 'projectId') {
      updatedEntries[index].taskId = '';
      loadTasks(value);
    }

    setTimeEntries(updatedEntries);
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  };

  const validateEntries = (): string | null => {
    for (let i = 0; i < timeEntries.length; i++) {
      const entry = timeEntries[i];
      
      if (!entry.projectId) {
        return `Project is required for entry ${i + 1}`;
      }
      if (!entry.startTime) {
        return `Start time is required for entry ${i + 1}`;
      }
      if (!entry.endTime) {
        return `End time is required for entry ${i + 1}`;
      }
      if (!entry.description.trim()) {
        return `Description is required for entry ${i + 1}`;
      }
      
      const duration = calculateDuration(entry.startTime, entry.endTime);
      if (duration <= 0) {
        return `End time must be after start time for entry ${i + 1}`;
      }
      if (duration > 24) {
        return `Duration cannot exceed 24 hours for entry ${i + 1}`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateEntries();
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

      // Add duration to each entry
      const entriesWithDuration = timeEntries.map(entry => ({
        ...entry,
        duration: calculateDuration(entry.startTime, entry.endTime),
      }));

      await execute({
        method: 'POST',
        url: '/api/time-tracking/entries/bulk',
        data: {
          entries: entriesWithDuration,
        },
      });

      toast({
        title: 'Success',
        description: `Created ${timeEntries.length} time entries`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create time entries',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTimeEntries([
      {
        projectId: '',
        taskId: '',
        startTime: '',
        endTime: '',
        description: '',
        billable: true,
        hourlyRate: undefined,
      },
    ]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bulk Time Entry</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Instructions */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Add multiple time entries at once. Each entry will be validated and created individually.
              </Text>
            </Alert>

            {/* Time Entries Table */}
            <Box
              bg={cardBg}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Project</Th>
                    <Th>Task</Th>
                    <Th>Start Time</Th>
                    <Th>End Time</Th>
                    <Th>Duration</Th>
                    <Th>Description</Th>
                    <Th>Billable</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {timeEntries.map((entry, index) => (
                    <Tr key={index}>
                      <Td>
                        <Select
                          size="sm"
                          placeholder="Select Project"
                          value={entry.projectId}
                          onChange={(e) => updateTimeEntry(index, 'projectId', e.target.value)}
                        >
                          {projects.map(project => (
                            <option key={project._id} value={project._id}>
                              {project.name}
                            </option>
                          ))}
                        </Select>
                      </Td>
                      <Td>
                        <Select
                          size="sm"
                          placeholder="Select Task"
                          value={entry.taskId}
                          onChange={(e) => updateTimeEntry(index, 'taskId', e.target.value)}
                          isDisabled={!entry.projectId}
                        >
                          {tasks
                            .filter(task => task.projectId === entry.projectId)
                            .map(task => (
                              <option key={task._id} value={task._id}>
                                {task.name}
                              </option>
                            ))}
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          size="sm"
                          type="datetime-local"
                          value={entry.startTime}
                          onChange={(e) => updateTimeEntry(index, 'startTime', e.target.value)}
                        />
                      </Td>
                      <Td>
                        <Input
                          size="sm"
                          type="datetime-local"
                          value={entry.endTime}
                          onChange={(e) => updateTimeEntry(index, 'endTime', e.target.value)}
                        />
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {calculateDuration(entry.startTime, entry.endTime).toFixed(2)}h
                        </Text>
                      </Td>
                      <Td>
                        <Textarea
                          size="sm"
                          placeholder="What did you work on?"
                          value={entry.description}
                          onChange={(e) => updateTimeEntry(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </Td>
                      <Td>
                        <Switch
                          isChecked={entry.billable}
                          onChange={(e) => updateTimeEntry(index, 'billable', e.target.checked)}
                        />
                      </Td>
                      <Td>
                        <Tooltip label="Remove Entry">
                          <IconButton
                            aria-label="Remove Entry"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => removeTimeEntry(index)}
                            isDisabled={timeEntries.length === 1}
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Add Entry Button */}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={addTimeEntry}
              alignSelf="flex-start"
            >
              Add Another Entry
            </Button>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSaving}
              loadingText="Creating..."
            >
              Create Entries
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
