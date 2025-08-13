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
import { AddIcon } from '@chakra-ui/icons';
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
  
  const [showBulkTimeEntryModal, setShowBulkTimeEntryModal] = useState(false);



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
