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
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { TimeEntryFormData, Project, Task } from '../../types/timeTracking';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: TimeEntryFormData) => Promise<void>;
  projects: Project[];
  tasks: Task[];
  initialData?: Partial<TimeEntryFormData>;
  isLoading?: boolean;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  tasks,
  initialData,
  isLoading = false,
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  const [formData, setFormData] = useState<TimeEntryFormData>({
    projectId: '',
    taskId: '',
    startTime: '',
    endTime: '',
    description: '',
    isBillable: true,
    hourlyRate: 0,
  });

  const [duration, setDuration] = useState<number>(0);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.projectId) {
      const filtered = tasks.filter(task => task.projectId === formData.projectId);
      setFilteredTasks(filtered);
      if (formData.taskId && !filtered.find(t => t.id === formData.taskId)) {
        setFormData(prev => ({ ...prev, taskId: '' }));
      }
    } else {
      setFilteredTasks([]);
      setFormData(prev => ({ ...prev, taskId: '' }));
    }
  }, [formData.projectId, tasks]);

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      setDuration(Math.max(0, diffHours));
    } else {
      setDuration(0);
    }
  }, [formData.startTime, formData.endTime]);

  const handleInputChange = (field: keyof TimeEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.startTime || !formData.endTime || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (duration <= 0) {
      toast({
        title: 'Validation Error',
        description: 'End time must be after start time',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        projectId: '',
        taskId: '',
        startTime: '',
        endTime: '',
        description: '',
        isBillable: true,
        hourlyRate: 0,
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      projectId: '',
      taskId: '',
      startTime: '',
      endTime: '',
      description: '',
      isBillable: true,
      hourlyRate: 0,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Add Time Entry</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Project Selection */}
            <FormControl isRequired>
              <FormLabel>Project</FormLabel>
              <Select
                placeholder="Select Project"
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
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
                {filteredTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Time Inputs */}
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </FormControl>
            </HStack>

            {/* Duration Display */}
            {duration > 0 && (
              <Text fontSize="sm" color="blue.600" fontWeight="medium">
                Duration: {duration.toFixed(2)} hours
              </Text>
            )}

            {/* Description */}
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe the work performed..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </FormControl>

            {/* Billable Toggle */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isBillable" mb="0">
                Billable
              </FormLabel>
              <Switch
                id="isBillable"
                isChecked={formData.isBillable}
                onChange={(e) => handleInputChange('isBillable', e.target.checked)}
                colorScheme="green"
              />
            </FormControl>

            {/* Hourly Rate */}
            {formData.isBillable && (
              <FormControl>
                <FormLabel>Hourly Rate ($)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Saving..."
          >
            Save Entry
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TimeEntryModal;
