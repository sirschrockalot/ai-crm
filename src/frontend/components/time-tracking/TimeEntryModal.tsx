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
} from '@chakra-ui/react';
import { useApi } from '../../hooks/useApi';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  entry?: any; // For editing existing entries
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

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entry,
}) => {
  const { execute } = useApi();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    startTime: '',
    endTime: '',
    description: '',
    billable: true,
    hourlyRate: '',
  });

  const isEditMode = !!entry;

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      if (entry) {
        // Populate form for editing
        setFormData({
          projectId: entry.projectId || '',
          taskId: entry.taskId || '',
          startTime: entry.startTime ? new Date(entry.startTime).toISOString().slice(0, 16) : '',
          endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : '',
          description: entry.description || '',
          billable: entry.billable !== false,
          hourlyRate: entry.hourlyRate?.toString() || '',
        });
        if (entry.projectId) {
          loadTasks(entry.projectId);
        }
      } else {
        // Reset form for new entry
        setFormData({
          projectId: '',
          taskId: '',
          startTime: '',
          endTime: '',
          description: '',
          billable: true,
          hourlyRate: '',
        });
        setTasks([]);
      }
    }
  }, [isOpen, entry]);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // If project changed, load tasks for that project
    if (field === 'projectId') {
      loadTasks(value);
      // Clear task selection when project changes
      setFormData(prev => ({
        ...prev,
        [field]: value,
        taskId: '',
      }));
    }
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const durationMs = end.getTime() - start.getTime();
    return durationMs / (1000 * 60 * 60); // Convert to hours
  };

  const validateForm = () => {
    if (!formData.projectId) {
      return 'Project is required';
    }
    if (!formData.startTime) {
      return 'Start time is required';
    }
    if (!formData.endTime) {
      return 'End time is required';
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      return 'End time must be after start time';
    }
    if (!formData.description.trim()) {
      return 'Description is required';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
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
      setIsLoading(true);

      const timeEntry = {
        projectId: formData.projectId,
        taskId: formData.taskId || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        duration: calculateDuration(),
        description: formData.description.trim(),
        billable: formData.billable,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
      };

      if (isEditMode) {
        await execute({
          method: 'PUT',
          url: `/api/time-tracking/entries/${entry._id}`,
          data: timeEntry,
        });
        toast({
          title: 'Success',
          description: 'Time entry updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await execute({
          method: 'POST',
          url: '/api/time-tracking/entries',
          data: timeEntry,
        });
        toast({
          title: 'Success',
          description: 'Time entry created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save time entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const duration = calculateDuration();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? 'Edit Time Entry' : 'Add Time Entry'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            {/* Project Selection */}
            <FormControl isRequired>
              <FormLabel>Project</FormLabel>
              <Select
                placeholder="Select Project"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
              >
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Task Selection */}
            <FormControl>
              <FormLabel>Task (Optional)</FormLabel>
              <Select
                placeholder="Select Task"
                value={formData.taskId}
                onChange={(e) => handleInputChange('taskId', e.target.value)}
                isDisabled={!formData.projectId}
              >
                {tasks.map(task => (
                  <option key={task._id} value={task._id}>
                    {task.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Time Range */}
            <HStack spacing={4} width="100%">
              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </FormControl>
            </HStack>

            {/* Duration Display */}
            {duration > 0 && (
              <Box
                p={3}
                bg="blue.50"
                borderRadius="md"
                border="1px"
                borderColor="blue.200"
                width="100%"
              >
                <Text fontSize="sm" color="blue.700">
                  Duration: <strong>{duration.toFixed(2)} hours</strong>
                </Text>
              </Box>
            )}

            {/* Description */}
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="What did you work on?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </FormControl>

            {/* Billable Settings */}
            <FormControl>
              <FormLabel>Billable</FormLabel>
              <HStack spacing={4}>
                <Switch
                  isChecked={formData.billable}
                  onChange={(e) => handleInputChange('billable', e.target.checked)}
                />
                <Text fontSize="sm">
                  {formData.billable ? 'Billable' : 'Non-billable'}
                </Text>
              </HStack>
            </FormControl>

            {/* Hourly Rate */}
            {formData.billable && (
              <FormControl>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  step="0.01"
                  min="0"
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Saving..."
          >
            {isEditMode ? 'Update' : 'Save'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
