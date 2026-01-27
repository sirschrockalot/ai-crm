import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiMessageSquare, FiUser, FiCheckCircle, FiClock, FiX, FiFileText } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export interface LeadEvent {
  _id: string;
  type: 'NOTE_ADDED' | 'STATUS_CHANGED' | 'ASSIGNED' | 'TASK_CREATED' | 'TASK_COMPLETED' | 'SKIPPED';
  createdAt: string;
  createdByUserId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  payload: Record<string, any>;
}

interface LeadTimelineProps {
  events: LeadEvent[];
}

const getEventIcon = (type: LeadEvent['type']) => {
  switch (type) {
    case 'NOTE_ADDED':
      return FiMessageSquare;
    case 'STATUS_CHANGED':
      return FiCheckCircle;
    case 'ASSIGNED':
      return FiUser;
    case 'TASK_CREATED':
      return FiFileText;
    case 'TASK_COMPLETED':
      return FiCheckCircle;
    case 'SKIPPED':
      return FiX;
    default:
      return FiClock;
  }
};

const getEventColor = (type: LeadEvent['type']) => {
  switch (type) {
    case 'NOTE_ADDED':
      return 'blue';
    case 'STATUS_CHANGED':
      return 'green';
    case 'ASSIGNED':
      return 'purple';
    case 'TASK_CREATED':
      return 'orange';
    case 'TASK_COMPLETED':
      return 'green';
    case 'SKIPPED':
      return 'red';
    default:
      return 'gray';
  }
};

const formatEventMessage = (event: LeadEvent): string => {
  const userName = event.createdByUserId
    ? `${event.createdByUserId.firstName} ${event.createdByUserId.lastName}`
    : 'Unknown User';

  switch (event.type) {
    case 'NOTE_ADDED':
      return `${userName} added a note`;
    case 'STATUS_CHANGED':
      const { oldStatus, newStatus } = event.payload;
      return `${userName} changed status from ${oldStatus || 'N/A'} to ${newStatus || 'N/A'}`;
    case 'ASSIGNED':
      const { oldAssignedTo, newAssignedTo } = event.payload;
      if (!newAssignedTo) {
        return `${userName} unassigned this lead`;
      }
      if (!oldAssignedTo) {
        return `${userName} assigned this lead`;
      }
      return `${userName} reassigned this lead`;
    case 'TASK_CREATED':
      return `${userName} created a task`;
    case 'TASK_COMPLETED':
      return `${userName} completed a task`;
    case 'SKIPPED':
      return `${userName} skipped this lead`;
    default:
      return `${userName} performed an action`;
  }
};

const formatEventDetails = (event: LeadEvent): string | null => {
  switch (event.type) {
    case 'NOTE_ADDED':
      return event.payload.note || null;
    case 'TASK_CREATED':
      return event.payload.taskTitle || event.payload.title || null;
    case 'TASK_COMPLETED':
      return event.payload.taskTitle || event.payload.title || null;
    default:
      return null;
  }
};

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ events }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  if (events.length === 0) {
    return (
      <Box p={4} textAlign="center" color={textColor}>
        <Text>No timeline events yet</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={0}>
      {events.map((event, index) => {
        const Icon = getEventIcon(event.type);
        const color = getEventColor(event.type);
        const message = formatEventMessage(event);
        const details = formatEventDetails(event);
        const userName = event.createdByUserId
          ? `${event.createdByUserId.firstName} ${event.createdByUserId.lastName}`
          : 'Unknown';
        const userInitials = event.createdByUserId
          ? `${event.createdByUserId.firstName[0]}${event.createdByUserId.lastName[0]}`
          : '??';

        return (
          <React.Fragment key={event._id}>
            <HStack align="start" spacing={4} py={3}>
              <Avatar size="sm" name={userName} bg={`${color}.500`}>
                <Icon />
              </Avatar>
              <Box flex={1}>
                <HStack spacing={2} mb={1}>
                  <Text fontWeight="medium" fontSize="sm">
                    {message}
                  </Text>
                  <Badge colorScheme={color} size="sm">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </HStack>
                {details && (
                  <Box
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    p={2}
                    borderRadius="md"
                    mb={2}
                  >
                    <Text fontSize="sm" color={textColor}>
                      {details}
                    </Text>
                  </Box>
                )}
                <Text fontSize="xs" color={textColor}>
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                </Text>
              </Box>
            </HStack>
            {index < events.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </VStack>
  );
};
