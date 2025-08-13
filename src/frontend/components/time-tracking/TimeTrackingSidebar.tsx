import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  HStack,
  Divider,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
// Define interfaces that match the actual data structure being used
interface TimeEntryData {
  _id: string;
  project?: {
    name: string;
  };
  duration: number;
  description: string;
  startTime: string | Date | null | undefined;
  status: string;
}

interface ApprovalData {
  _id: string;
  user?: {
    name: string;
  };
  totalHours: number;
  weekStartDate: string | Date;
}

interface TimeTrackingSidebarProps {
  recentEntries: TimeEntryData[];
  pendingApprovals: ApprovalData[];
  onRefresh: () => void;
}

export const TimeTrackingSidebar: React.FC<TimeTrackingSidebarProps> = ({
  recentEntries,
  pendingApprovals,
  onRefresh,
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const formatDuration = (duration: number | undefined | null) => {
    if (duration === null || duration === undefined) return '0.00h';
    return `${duration.toFixed(2)}h`;
  };

  const formatDate = (dateInput: string | Date | null | undefined) => {
    // Handle null/undefined cases
    if (dateInput === null || dateInput === undefined) {
      return 'No Date';
    }
    
    let date: Date;
    
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
      // Check if the parsed date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
    } else {
      date = dateInput;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'submitted':
        return 'blue';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleApprove = async (entryId: string) => {
    // This would call the approval API
    console.log('Approving entry:', entryId);
    onRefresh();
  };

  const handleReject = async (entryId: string) => {
    // This would call the rejection API
    console.log('Rejecting entry:', entryId);
    onRefresh();
  };

  const handleViewDetails = (entryId: string) => {
    // This would open a detailed view modal
    console.log('Viewing entry:', entryId);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Recent Time Entries */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>
          Recent Entries
        </Heading>
        <VStack spacing={3} align="stretch">
          {recentEntries.length > 0 ? (
            recentEntries.slice(0, 5).map((entry) => (
              <Box
                key={entry._id}
                p={3}
                bg="gray.50"
                borderRadius="md"
                border="1px"
                borderColor="gray.200"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {entry.project?.name || 'Unknown Project'}
                  </Text>
                  <Badge colorScheme="blue" size="sm">
                    {formatDuration(entry.duration)}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.600" mb={2}>
                  {entry.description || 'No description'}
                </Text>
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.500">
                    {formatDate(entry.startTime)}
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(entry.status)}
                    size="sm"
                  >
                    {entry.status}
                  </Badge>
                </HStack>
              </Box>
            ))
          ) : (
            <Text fontSize="sm" color="gray.500" textAlign="center">
              No recent entries
            </Text>
          )}
        </VStack>
        {recentEntries.length > 5 && (
          <Button
            size="sm"
            variant="outline"
            mt={3}
            width="100%"
            onClick={onRefresh}
          >
            View All Entries
          </Button>
        )}
      </Box>

      {/* Approval Queue */}
      {pendingApprovals.length > 0 && (
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Heading size="sm" mb={4}>
            Pending Approvals
          </Heading>
          <VStack spacing={3} align="stretch">
            {pendingApprovals.map((approval) => (
              <Box
                key={approval._id}
                p={3}
                bg="yellow.50"
                borderRadius="md"
                border="1px"
                borderColor="yellow.200"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    {approval.user?.name || 'Unknown User'}
                  </Text>
                  <Badge colorScheme="yellow" size="sm">
                    {formatDuration(approval.totalHours)}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="gray.600" mb={2}>
                  Week of {formatDate(approval.weekStartDate)}
                </Text>
                <HStack spacing={2}>
                  <Tooltip label="Approve">
                    <IconButton
                      aria-label="Approve"
                      icon={<CheckIcon />}
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleApprove(approval._id)}
                    />
                  </Tooltip>
                  <Tooltip label="Reject">
                    <IconButton
                      aria-label="Reject"
                      icon={<CloseIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleReject(approval._id)}
                    />
                  </Tooltip>
                  <Tooltip label="View Details">
                    <IconButton
                      aria-label="View Details"
                      icon={<ViewIcon />}
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(approval._id)}
                    />
                  </Tooltip>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Quick Actions */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>
          Quick Actions
        </Heading>
        <VStack spacing={3} align="stretch">

          <Button
            size="sm"
            colorScheme="green"
            variant="outline"
            onClick={onRefresh}
          >
            Add Entry
          </Button>
          <Button
            size="sm"
            colorScheme="purple"
            variant="outline"
            onClick={onRefresh}
          >
            Export Timesheet
          </Button>
          <Button
            size="sm"
            colorScheme="orange"
            variant="outline"
            onClick={onRefresh}
          >
            View Reports
          </Button>
        </VStack>
      </Box>

      {/* Team Status */}
      <Box
        bg={cardBg}
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>
          Team Status
        </Heading>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm">Timesheets Submitted</Text>
            <Badge colorScheme="green" size="sm">
              {pendingApprovals.length}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">Pending Approval</Text>
            <Badge colorScheme="yellow" size="sm">
              {pendingApprovals.length}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm">This Week</Text>
            <Badge colorScheme="blue" size="sm">
              {recentEntries.length}
            </Badge>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
