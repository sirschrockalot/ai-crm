import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Button,
  Text,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, TriangleUpIcon, CloseIcon } from '@chakra-ui/icons';
import { TimeTrackingStats } from './TimeTrackingStats';
import { WeeklyTimesheetGrid } from './WeeklyTimesheetGrid';
import { TimeTrackingSidebar } from './TimeTrackingSidebar';
import { TimeEntryModal } from './TimeEntryModal';
import { TimeTrackingExport } from './TimeTrackingExport';
import { BulkTimeEntryModal } from './BulkTimeEntryModal';
import { useApi } from '../../hooks/useApi';

interface TimeTrackingDashboardProps {
  stats?: {
    thisWeek: number;
    billableHours: number;
    activeProjects: number;
    timesheetStatus: string;
  };
  recentEntries: any[];
  pendingApprovals: any[];
  onRefresh: () => void;
}

export const TimeTrackingDashboard: React.FC<TimeTrackingDashboardProps> = ({
  stats,
  recentEntries,
  pendingApprovals,
  onRefresh,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { execute } = useApi();
  const toast = useToast();
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<{
    startTime: Date;
    projectId: string;
    taskId?: string;
    description: string;
  } | null>(null);
  const [showBulkTimeEntryModal, setShowBulkTimeEntryModal] = useState(false);

  const handleStartTimer = () => {
    if (!currentTimer?.projectId) {
      toast({
        title: 'Project Required',
        description: 'Please select a project before starting the timer',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTimerRunning(true);
    setCurrentTimer({
      startTime: new Date(),
      projectId: currentTimer.projectId,
      taskId: currentTimer.taskId,
      description: currentTimer.description,
    });

    toast({
      title: 'Timer Started',
      description: 'Time tracking has begun',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleStopTimer = async () => {
    if (!currentTimer || !isTimerRunning) return;

    try {
      const endTime = new Date();
      const duration = (endTime.getTime() - currentTimer.startTime.getTime()) / (1000 * 60 * 60); // hours

      const timeEntry = {
        projectId: currentTimer.projectId,
        taskId: currentTimer.taskId,
        startTime: currentTimer.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        description: currentTimer.description,
        billable: true,
      };

      await execute({
        method: 'POST',
        url: '/api/time-tracking/entries',
        data: timeEntry,
      });

      setIsTimerRunning(false);
      setCurrentTimer(null);
      onRefresh();

      toast({
        title: 'Timer Stopped',
        description: `Time entry saved: ${duration.toFixed(2)} hours`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save time entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddEntry = () => {
    onOpen();
  };

  const handleSaveDraft = () => {
    // This will be handled by the WeeklyTimesheetGrid component
    onRefresh();
  };

  const handleSubmitForApproval = () => {
    // This will be handled by the WeeklyTimesheetGrid component
    onRefresh();
  };

  return (
    <Box>
      {/* Quick Actions */}
      <Box mb={6}>
        <HStack spacing={4} mb={4}>
          <Button
                            leftIcon={isTimerRunning ? <CloseIcon /> : <TriangleUpIcon />}
            colorScheme={isTimerRunning ? 'red' : 'green'}
            onClick={isTimerRunning ? handleStopTimer : handleStartTimer}
            size="lg"
          >
            {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
          </Button>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddEntry}
            size="lg"
          >
            Add Entry
          </Button>
          <TimeTrackingExport onExportComplete={onRefresh} />
          <Button
            leftIcon={<AddIcon />}
            colorScheme="purple"
            onClick={() => setShowBulkTimeEntryModal(true)}
            size="lg"
          >
            Bulk Entry
          </Button>
        </HStack>

        {isTimerRunning && currentTimer && (
          <Box
            p={4}
            bg="blue.50"
            border="1px"
            borderColor="blue.200"
            borderRadius="md"
            mb={4}
          >
            <Text fontSize="sm" color="blue.700">
              Timer running for: {currentTimer.description || 'No description'}
            </Text>
            <Text fontSize="xs" color="blue.600">
              Started at: {currentTimer.startTime.toLocaleTimeString()}
            </Text>
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={8}>
        {/* Left Column - Main Dashboard */}
        <VStack spacing={6} align="stretch">
          {/* Statistics Cards */}
          <TimeTrackingStats stats={stats} />

          {/* Weekly Timesheet Grid */}
          <Box>
            <Text fontSize="lg" fontWeight="medium" mb={4}>
              Weekly Timesheet
            </Text>
            <WeeklyTimesheetGrid onRefresh={onRefresh} />
          </Box>
        </VStack>

        {/* Right Column - Sidebar */}
        <TimeTrackingSidebar
          recentEntries={recentEntries}
          pendingApprovals={pendingApprovals}
          onRefresh={onRefresh}
        />
      </Grid>

      {/* Time Entry Modal */}
      <TimeEntryModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={onRefresh}
      />

      {/* Bulk Time Entry Modal */}
      <BulkTimeEntryModal
        isOpen={showBulkTimeEntryModal}
        onClose={() => setShowBulkTimeEntryModal(false)}
        onSave={onRefresh}
      />
    </Box>
  );
};
