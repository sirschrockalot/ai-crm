import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Text,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useApi } from '../../hooks/useApi';

interface ProjectTaskSelectorProps {
  projectId: string;
  taskId?: string;
  onProjectChange: (projectId: string) => void;
  onTaskChange: (taskId: string) => void;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  placeholder?: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
}

interface Task {
  _id: string;
  name: string;
  projectId: string;
  description?: string;
}

export const ProjectTaskSelector: React.FC<ProjectTaskSelectorProps> = ({
  projectId,
  taskId,
  onProjectChange,
  onTaskChange,
  showLabels = true,
  size = 'md',
  isRequired = false,
  placeholder = 'Select Project',
}) => {

  const toast = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadTasks(projectId);
    } else {
      setTasks([]);
      onTaskChange('');
    }
  }, [projectId]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      
      // This would integrate with the actual project management system
      // For now, using mock data
      const mockProjects: Project[] = [
        { _id: '1', name: 'Project Alpha', description: 'Main development project' },
        { _id: '2', name: 'Project Beta', description: 'Testing and QA project' },
        { _id: '3', name: 'Project Gamma', description: 'Documentation project' },
        { _id: '4', name: 'Internal Development', description: 'Internal tools and systems' },
        { _id: '5', name: 'Client Support', description: 'Ongoing client support' },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      setProjects(mockProjects);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      setIsLoadingTasks(true);
      
      // This would integrate with the actual task management system
      // For now, using mock data
      const mockTasks: Task[] = [
        { _id: '1', name: 'Development', projectId: '1', description: 'Core development work' },
        { _id: '2', name: 'Testing', projectId: '1', description: 'Testing and debugging' },
        { _id: '3', name: 'Documentation', projectId: '1', description: 'Code documentation' },
        { _id: '4', name: 'Planning', projectId: '2', description: 'Project planning and design' },
        { _id: '5', name: 'Implementation', projectId: '2', description: 'Feature implementation' },
        { _id: '6', name: 'Code Review', projectId: '3', description: 'Peer code review' },
        { _id: '7', name: 'Deployment', projectId: '4', description: 'System deployment' },
        { _id: '8', name: 'Maintenance', projectId: '4', description: 'System maintenance' },
        { _id: '9', name: 'Support', projectId: '5', description: 'Client support tasks' },
        { _id: '10', name: 'Training', projectId: '5', description: 'Client training sessions' },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const filteredTasks = mockTasks.filter(task => task.projectId === projectId);
      setTasks(filteredTasks);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleProjectChange = (newProjectId: string) => {
    onProjectChange(newProjectId);
    // Task will be cleared automatically in useEffect
  };

  const handleTaskChange = (newTaskId: string) => {
    onTaskChange(newTaskId);
  };

  const getProjectDescription = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    return project?.description || '';
  };

  const getTaskDescription = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    return task?.description || '';
  };

  return (
    <VStack spacing={3} align="stretch">
      {/* Project Selection */}
      <FormControl isRequired={isRequired}>
        {showLabels && <FormLabel>Project</FormLabel>}
        <Select
          placeholder={placeholder}
          value={projectId}
          onChange={(e) => handleProjectChange(e.target.value)}
          size={size}
          isDisabled={isLoadingProjects}
        >
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </Select>
        {isLoadingProjects && (
          <HStack mt={2} spacing={2}>
            <Spinner size="xs" />
            <Text fontSize="xs" color="gray.500">Loading projects...</Text>
          </HStack>
        )}
        {projectId && getProjectDescription(projectId) && (
          <Text fontSize="xs" color="gray.600" mt={1}>
            {getProjectDescription(projectId)}
          </Text>
        )}
      </FormControl>

      {/* Task Selection */}
      {projectId && (
        <FormControl>
          {showLabels && <FormLabel>Task (Optional)</FormLabel>}
          <Select
            placeholder="Select Task"
            value={taskId || ''}
            onChange={(e) => handleTaskChange(e.target.value)}
            size={size}
            isDisabled={isLoadingTasks}
          >
            {tasks.map(task => (
              <option key={task._id} value={task._id}>
                {task.name}
              </option>
            ))}
          </Select>
          {isLoadingTasks && (
            <HStack mt={2} spacing={2}>
              <Spinner size="xs" />
              <Text fontSize="xs" color="gray.500">Loading tasks...</Text>
            </HStack>
          )}
          {taskId && getTaskDescription(taskId) && (
            <Text fontSize="xs" color="gray.600" mt={1}>
              {getTaskDescription(taskId)}
            </Text>
          )}
        </FormControl>
      )}
    </VStack>
  );
};
