import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  useColorModeValue,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { FiCheck, FiClock, FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';

export interface Task {
  _id: string;
  leadId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  title: string;
  dueAt: string;
  status: 'OPEN' | 'DONE';
  createdByUserId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assignedToUserId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  showLead?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onComplete,
  onDelete,
  showLead = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isOverdue = (dueAt: string, status: string): boolean => {
    if (status === 'DONE') return false;
    return new Date(dueAt) < new Date();
  };

  const getDueDateColor = (dueAt: string, status: string): string => {
    if (status === 'DONE') return 'gray.500';
    if (isOverdue(dueAt, status)) return 'red.500';
    const daysUntil = Math.ceil((new Date(dueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 1) return 'orange.500';
    return 'gray.600';
  };

  if (tasks.length === 0) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        <Text>No tasks found</Text>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            {showLead && <Th>Lead</Th>}
            <Th>Task</Th>
            <Th>Due Date</Th>
            <Th>Assigned To</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task) => (
            <Tr key={task._id}>
              {showLead && (
                <Td>
                  <Text fontSize="sm">
                    {task.leadId.firstName} {task.leadId.lastName}
                  </Text>
                </Td>
              )}
              <Td>
                <Text fontWeight="medium" fontSize="sm">
                  {task.title}
                </Text>
              </Td>
              <Td>
                <Text
                  fontSize="sm"
                  color={getDueDateColor(task.dueAt, task.status)}
                  fontWeight={isOverdue(task.dueAt, task.status) ? 'bold' : 'normal'}
                >
                  {format(new Date(task.dueAt), 'MMM d, yyyy')}
                  {isOverdue(task.dueAt, task.status) && (
                    <Badge ml={2} colorScheme="red" size="sm">
                      Overdue
                    </Badge>
                  )}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm">
                  {task.assignedToUserId
                    ? `${task.assignedToUserId.firstName} ${task.assignedToUserId.lastName}`
                    : 'Unassigned'}
                </Text>
              </Td>
              <Td>
                <Badge
                  colorScheme={task.status === 'DONE' ? 'green' : 'blue'}
                  size="sm"
                >
                  {task.status}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  {task.status === 'OPEN' && onComplete && (
                    <IconButton
                      aria-label="Mark as done"
                      icon={<FiCheck />}
                      size="sm"
                      colorScheme="green"
                      variant="ghost"
                      onClick={() => onComplete(task._id)}
                    />
                  )}
                  {onDelete && (
                    <IconButton
                      aria-label="Delete task"
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => onDelete(task._id)}
                    />
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
