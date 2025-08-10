import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

interface ApprovalWorkflowProps {
  onApprovalComplete?: () => void;
}

interface PendingTimesheet {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  billableHours: number;
  status: string;
  submittedAt: string;
  entries: any[];
}

interface ApprovalAction {
  timesheetId: string;
  approved: boolean;
  comments?: string;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ onApprovalComplete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { execute } = useApi();
  const toast = useToast();
  
  const [pendingTimesheets, setPendingTimesheets] = useState<PendingTimesheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<PendingTimesheet | null>(null);
  const [approvalAction, setApprovalAction] = useState<ApprovalAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadPendingTimesheets();
  }, []);

  const loadPendingTimesheets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await execute({ method: 'GET', url: '/api/time-tracking/pending-timesheets' });
      setPendingTimesheets(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending timesheets');
      toast({
        title: 'Error',
        description: 'Failed to load pending timesheets',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTimesheet = (timesheet: PendingTimesheet) => {
    setSelectedTimesheet(timesheet);
    onOpen();
  };

  const handleApprove = async (timesheetId: string, comments?: string) => {
    try {
      setIsApproving(true);

      await execute({ 
        method: 'POST', 
        url: `/api/time-tracking/timesheets/${timesheetId}/approve`,
        data: {
          approved: true,
          comments,
        }
      });

      toast({
        title: 'Timesheet Approved',
        description: 'Timesheet has been approved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Remove from pending list
      setPendingTimesheets(prev => prev.filter(ts => ts._id !== timesheetId));
      onApprovalComplete?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (timesheetId: string, comments: string) => {
    if (!comments.trim()) {
      toast({
        title: 'Comments Required',
        description: 'Please provide comments when rejecting a timesheet',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsApproving(true);

      await execute({ 
        method: 'POST', 
        url: `/api/time-tracking/timesheets/${timesheetId}/approve`,
        data: {
          approved: false,
          comments,
        }
      });

      toast({
        title: 'Timesheet Rejected',
        description: 'Timesheet has been rejected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Remove from pending list
      setPendingTimesheets(prev => prev.filter(ts => ts._id !== timesheetId));
      onApprovalComplete?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject timesheet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkApprove = async () => {
    try {
      setIsApproving(true);

      // Approve all pending timesheets
      for (const timesheet of pendingTimesheets) {
        await execute({ 
          method: 'POST', 
          url: `/api/time-tracking/timesheets/${timesheet._id}/approve`,
          data: {
            approved: true,
          }
        });
      }

      toast({
        title: 'Bulk Approval Complete',
        description: `Approved ${pendingTimesheets.length} timesheets`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setPendingTimesheets([]);
      onApprovalComplete?.();
    } catch (error: any) {
      toast({
        title: 'Bulk Approval Failed',
        description: error.message || 'Failed to approve timesheets',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  if (pendingTimesheets.length === 0) {
    return (
      <Box
        p={6}
        bg={cardBg}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <Text color="gray.500">No pending timesheets for approval</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="medium">
          Pending Timesheets ({pendingTimesheets.length})
        </Text>
        <Button
          colorScheme="green"
          size="sm"
          onClick={handleBulkApprove}
          isLoading={isApproving}
          loadingText="Approving..."
        >
          Approve All
        </Button>
      </HStack>

      {/* Timesheets Table */}
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
              <Th>Employee</Th>
              <Th>Week</Th>
              <Th>Total Hours</Th>
              <Th>Billable Hours</Th>
              <Th>Submitted</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pendingTimesheets.map((timesheet) => (
              <Tr key={timesheet._id}>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">
                      {timesheet.userId.firstName} {timesheet.userId.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {timesheet.userId.email}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Text fontSize="sm">
                    {formatDate(timesheet.weekStartDate)} - {formatDate(timesheet.weekEndDate)}
                  </Text>
                </Td>
                <Td>
                  <Text fontWeight="medium">{timesheet.totalHours}h</Text>
                </Td>
                <Td>
                  <Text fontWeight="medium">{timesheet.billableHours}h</Text>
                </Td>
                <Td>
                  <Text fontSize="sm">{formatDate(timesheet.submittedAt)}</Text>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<ViewIcon />}
                      onClick={() => handleViewTimesheet(timesheet)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<CheckIcon />}
                      onClick={() => handleApprove(timesheet._id)}
                      isLoading={isApproving}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<CloseIcon />}
                      onClick={() => {
                        setSelectedTimesheet(timesheet);
                        setApprovalAction({ timesheetId: timesheet._id, approved: false });
                        onOpen();
                      }}
                      isLoading={isApproving}
                    >
                      Reject
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Timesheet Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Timesheet Details - {selectedTimesheet?.userId.firstName} {selectedTimesheet?.userId.lastName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTimesheet && (
              <VStack spacing={4} align="stretch">
                {/* Timesheet Summary */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Week of {formatDate(selectedTimesheet.weekStartDate)}</Text>
                    <Badge colorScheme="blue">{selectedTimesheet.status}</Badge>
                  </HStack>
                  <HStack mt={2} spacing={6}>
                    <Text>Total Hours: <strong>{selectedTimesheet.totalHours}h</strong></Text>
                    <Text>Billable Hours: <strong>{selectedTimesheet.billableHours}h</strong></Text>
                  </HStack>
                </Box>

                {/* Time Entries */}
                <Box>
                  <Text fontWeight="medium" mb={3}>Time Entries</Text>
                  <VStack spacing={2} align="stretch">
                    {selectedTimesheet.entries.map((entry: any, index: number) => (
                      <Box key={index} p={3} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">{entry.description}</Text>
                          <Text>{entry.hours}h</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {entry.projectId} • {entry.taskId || 'No task'}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Approval Actions */}
                {approvalAction && !approvalAction.approved && (
                  <FormControl>
                    <FormLabel>Rejection Comments (Required)</FormLabel>
                    <Textarea
                      placeholder="Please provide a reason for rejection..."
                      value={approvalAction.comments || ''}
                      onChange={(e) => setApprovalAction(prev => prev ? { ...prev, comments: e.target.value } : null)}
                    />
                  </FormControl>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              {approvalAction && !approvalAction.approved ? (
                <Button
                  colorScheme="red"
                  onClick={() => handleReject(approvalAction.timesheetId, approvalAction.comments || '')}
                  isLoading={isApproving}
                  loadingText="Rejecting..."
                >
                  Reject Timesheet
                </Button>
              ) : (
                <Button
                  colorScheme="green"
                  onClick={() => handleApprove(selectedTimesheet?._id || '')}
                  isLoading={isApproving}
                  loadingText="Approving..."
                >
                  Approve Timesheet
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
