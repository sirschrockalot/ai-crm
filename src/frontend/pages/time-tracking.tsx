import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Text, 
  Heading, 
  SimpleGrid, 
  Card, 
  CardBody, 
  HStack, 
  VStack, 
  Button, 
  Badge, 
  Icon, 
  Grid, 
  Input, 
  Spinner, 
  Alert, 
  AlertIcon,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Select,
  Flex,
  useToast
} from '@chakra-ui/react';
import { DashboardLayout } from '../components/dashboard';
import { useTimesheet } from '../hooks/useTimesheet';
import { timesheetService, TimeEntry } from '../services/timesheetService';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaChartBar, 
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaDownload,
  FaSave,
  FaPaperPlane,
  FaDollarSign,
  FaSearch,
  FaEye,
  FaFilter,
  FaTrash
} from 'react-icons/fa';

const TimeTrackingPage: React.FC = () => {
  // For demo purposes, using a hardcoded user ID
  // In a real app, this would come from authentication context
  const userId = 'demo-user-123';
  const toast = useToast();
  
  const {
    timesheet,
    drafts,
    approvedTimesheets,
    weekDates,
    totalHours,
    isLoading,
    error,
    saveTimesheet,
    submitTimesheet,
    submitDraft,
    deleteTimesheet,
    updateHours,
    getHoursForDay,
    weekDisplayText,
    statusColor,
    canSubmit,
    loadTimesheet,
    loadDrafts,
    loadApprovedTimesheets,
  } = useTimesheet({ userId });

  const [notes, setNotes] = useState(timesheet?.notes || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [localTimesheet, setLocalTimesheet] = useState(timesheet);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
  
  // Approved timesheets search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimeEntry | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear'>('all');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [timesheetToDelete, setTimesheetToDelete] = useState<TimeEntry | null>(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Check if there's already a draft for the current week that we're NOT currently editing
  // This prevents creating a new draft when one already exists
  const shouldDisableSaveDraft = useMemo(() => {
    if (!weekDates.start) return false;
    
    const currentWeekStart = weekDates.start.toISOString();
    
    // If we're currently editing a draft for this week, allow saving
    if (timesheet && timesheet.status === 'draft' && timesheet._id && timesheet._id !== 'temp') {
      const timesheetWeekStart = new Date(timesheet.weekStart).toISOString();
      if (timesheetWeekStart === currentWeekStart) {
        // We're editing the existing draft - allow saving
        return false;
      }
    }
    
    // Check if there's a draft in the drafts array for this week that we're NOT editing
    if (drafts && drafts.length > 0) {
      const draftForThisWeek = drafts.find(draft => {
        const draftWeekStart = new Date(draft.weekStart).toISOString();
        return draftWeekStart === currentWeekStart;
      });
      
      if (draftForThisWeek) {
        // There's a draft for this week
        // Only disable if we're NOT currently editing it (timesheet is null, temp, or different ID)
        if (!timesheet || timesheet._id === 'temp' || timesheet._id !== draftForThisWeek._id) {
          return true; // Disable - draft exists but we're not editing it
        }
      }
    }
    
    return false; // No draft exists or we're editing the existing one
  }, [timesheet, drafts, weekDates.start]);

  // Check for duplicate timesheets on load and when timesheet changes
  // Disabled during save operations and with longer delays to prevent rate limiting
  useEffect(() => {
    if (!userId || isLoading || saveStatus === 'saving' || saveStatus === 'success') return;
    
    // Add a much longer delay to prevent rapid successive calls
    const timeoutId = setTimeout(async () => {
      try {
        const weekStart = weekDates.start.toISOString();
        const allTimesheets = await timesheetService.getTimeEntries({ 
          userId, 
          weekStart,
          limit: 100 
        });
        
        // Find all timesheets for the current week
        const weekStartDate = new Date(weekStart);
        const weekTimesheets = allTimesheets.data?.filter((entry: TimeEntry) => {
          const entryWeekStart = new Date(entry.weekStart);
          return entryWeekStart.getTime() === weekStartDate.getTime();
        }) || [];
        
        if (weekTimesheets.length > 1) {
          const warningMessage = `Warning: Multiple timesheets (${weekTimesheets.length}) found for the week of ${formatDate(weekStart)}. Please use the existing timesheet to avoid duplicates.`;
          setDuplicateWarning(warningMessage);
          console.warn('Duplicate timesheets detected:', weekTimesheets);
          
          // Don't call loadTimesheet here - it will cause rate limiting
          // Just show the warning
        } else {
          setDuplicateWarning(null);
        }
      } catch (error: any) {
        // Silently handle all errors in background checks - don't log rate limits
        if (error?.response?.status !== 429 && 
            !error?.message?.includes('429') && 
            !error?.message?.includes('Too many requests')) {
          console.error('Error checking for duplicate timesheets:', error);
        }
      }
    }, 2000); // Increased delay to 2 seconds to prevent rate limiting
    
    return () => clearTimeout(timeoutId);
  }, [userId, weekDates.start, isLoading, timesheet?._id, saveStatus]);

  // Load existing timesheet for current week on mount and week change
  // Disabled during save operations and with longer delays to prevent rate limiting
  useEffect(() => {
    if (!userId || isLoading || saveStatus === 'saving' || saveStatus === 'success') return;
    
    const loadExistingTimesheet = async () => {
      try {
        const weekStart = weekDates.start.toISOString();
        const existingTimesheet = await timesheetService.checkTimesheetExistsForWeek(userId, weekStart);
        
        if (existingTimesheet && (!timesheet || timesheet._id !== existingTimesheet._id)) {
          // Only load if we don't already have this timesheet
          // Add delay before loading to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          await loadTimesheet();
        }
      } catch (error: any) {
        // Silently handle all errors - no timesheet existing is a valid state
        // Don't log rate limit errors
        if (error?.response?.status !== 404 && 
            error?.response?.status !== 429 && 
            !error?.message?.includes('not found') &&
            !error?.message?.includes('Too many requests') &&
            !error?.message?.includes('429')) {
          console.error('Error loading existing timesheet:', error);
        }
      }
    };
    
    // Add longer delay to prevent rapid calls
    const timeoutId = setTimeout(loadExistingTimesheet, 2000);
    return () => clearTimeout(timeoutId);
  }, [userId, weekDates.start, isLoading, saveStatus]);

  // Sync local timesheet with timesheet from hook
  useEffect(() => {
    if (timesheet) {
      setLocalTimesheet(timesheet);
      setNotes(timesheet.notes || '');
      
      // Initialize input values from timesheet hours
      const initialInputValues: { [key: number]: string } = {};
      timesheet.hours.forEach((hour, index) => {
        initialInputValues[index] = hour > 0 ? hour.toString() : '';
      });
      setInputValues(initialInputValues);
    } else {
      // If no timesheet exists, clear local timesheet (but don't create temp yet)
      // Temp will be created only when user starts entering data
      if (localTimesheet && localTimesheet._id !== 'temp') {
        setLocalTimesheet(null);
      }
    }
  }, [timesheet?._id, timesheet?.weekStart]); // Only sync when timesheet ID or week changes, not on every update

  const handleNotesChange = async (value: string) => {
    setNotes(value);
    
    // Before creating a temp timesheet, check if one already exists for this week
    if (!localTimesheet || localTimesheet._id === 'temp') {
      const weekStart = weekDates.start.toISOString();
      const existingTimesheet = await timesheetService.checkTimesheetExistsForWeek(userId, weekStart);
      
      if (existingTimesheet) {
        // Load the existing timesheet instead of creating a temp one
        await loadTimesheet();
        // Update notes on the loaded timesheet
        if (timesheet) {
          setLocalTimesheet({
            ...timesheet,
            notes: value
          });
        }
        return;
      }
    }
    
    // If there's no timesheet, create a temporary one to store the notes
    if (!localTimesheet) {
      setLocalTimesheet({
        _id: 'temp',
        userId: userId,
        weekStart: weekDates.start.toISOString(),
        weekEnd: weekDates.end.toISOString(),
        hours: [0, 0, 0, 0, 0, 0, 0],
        notes: value,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing local timesheet
      setLocalTimesheet({
        ...localTimesheet,
        notes: value
      });
    }
  };

  // Helper function to check for duplicates and prevent creation
  const checkAndPreventDuplicates = async (): Promise<{ hasDuplicate: boolean; existingTimesheet: TimeEntry | null; errorMessage: string | null }> => {
    const weekStart = weekDates.start.toISOString();
    const existingTimesheet = await timesheetService.checkTimesheetExistsForWeek(userId, weekStart);
    
    if (existingTimesheet) {
      const isEditingExisting = localTimesheet && 
                               localTimesheet._id !== 'temp' && 
                               existingTimesheet._id === localTimesheet._id;
      
      if (!isEditingExisting) {
        const errorMessage = `A timesheet already exists for the week of ${formatDate(weekStart)}. Please update the existing timesheet instead of creating a new one.`;
        return { hasDuplicate: true, existingTimesheet, errorMessage };
      }
    }
    
    return { hasDuplicate: false, existingTimesheet, errorMessage: null };
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Get current hours from the local timesheet or create empty array
      const currentHours = localTimesheet?.hours || [0, 0, 0, 0, 0, 0, 0];
      
      // Get existing ID if we have one (don't do duplicate check - saveCurrentWeekTimesheet handles it)
      const existingId = localTimesheet && localTimesheet._id !== 'temp' ? localTimesheet._id : undefined;
      
      console.log('Saving timesheet with data:', {
        userId,
        hours: currentHours,
        notes,
        localTimesheet,
        existingTimesheetId: existingId
      });
      
      // Save the timesheet - saveCurrentWeekTimesheet already handles duplicate checking
      await saveTimesheet(currentHours, notes, existingId);
      
      // Clear any duplicate warnings after successful save
      setDuplicateWarning(null);
      
      setSaveStatus('success');
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving timesheet:', error);
      const errorMessage = error?.message || 'Failed to save timesheet. Please try again.';
      setSaveStatus('error');
      
      // Handle rate limiting specifically
      if (error?.response?.status === 429 || errorMessage.includes('429') || errorMessage.includes('Too many requests')) {
        setDuplicateWarning('Too many requests. Please wait a moment and try again.');
        toast({
          title: 'Rate Limit',
          description: 'Too many requests. Please wait a moment before trying again.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      } else if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        setDuplicateWarning(errorMessage);
        // Load the existing timesheet with delay
        setTimeout(async () => {
          try {
            await loadTimesheet();
          } catch (loadError) {
            // Silently handle load errors
          }
        }, 500);
      }
      
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleSubmit = async () => {
    try {
      // Check for duplicates before submitting
      const duplicateCheck = await checkAndPreventDuplicates();
      
      if (duplicateCheck.hasDuplicate) {
        setSaveStatus('error');
        setDuplicateWarning(duplicateCheck.errorMessage || 'Duplicate timesheet detected');
        // Load the existing timesheet so user can edit it
        await loadTimesheet();
        setTimeout(() => setSaveStatus('idle'), 5000);
        return;
      }
      
      // If we have unsaved changes, save first before submitting
      if (!localTimesheet || localTimesheet._id === 'temp') {
        // Need to save first - but check again for duplicates before saving
        const saveDuplicateCheck = await checkAndPreventDuplicates();
        
        if (saveDuplicateCheck.hasDuplicate) {
          setSaveStatus('error');
          setDuplicateWarning(saveDuplicateCheck.errorMessage || 'Duplicate timesheet detected');
          await loadTimesheet();
          setTimeout(() => setSaveStatus('idle'), 5000);
          return;
        }
        
        const currentHours = localTimesheet?.hours || [0, 0, 0, 0, 0, 0, 0];
        const existingId = saveDuplicateCheck.existingTimesheet?._id;
        
        // Save the timesheet first
        await saveTimesheet(currentHours, notes, existingId);
        // Reload to get the saved timesheet
        await loadTimesheet();
      }
      
      // Now submit the timesheet
      await submitTimesheet();
      setSaveStatus('success');
      // Clear any duplicate warnings after successful submit
      setDuplicateWarning(null);
      // Reload timesheet to get updated status
      await loadTimesheet();
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error submitting timesheet:', error);
      const errorMessage = error?.message || 'Failed to submit timesheet. Please try again.';
      setSaveStatus('error');
      
      // If error is about duplicate, set warning
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('No timesheet found')) {
        setDuplicateWarning(errorMessage);
        // Load the existing timesheet
        await loadTimesheet();
      }
      
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleHoursChange = (dayIndex: number, hours: number) => {
    updateHours(dayIndex, hours);
    
    // Update local timesheet
    if (localTimesheet) {
      const newHours = [...localTimesheet.hours];
      newHours[dayIndex] = hours;
      setLocalTimesheet({
        ...localTimesheet,
        hours: newHours
      });
    }
    
    // Update input values to reflect the change
    setInputValues(prev => ({
      ...prev,
      [dayIndex]: hours > 0 ? hours.toString() : ''
    }));
  };

  // Filter approved timesheets based on search and date filter
  const filteredApprovedTimesheets = approvedTimesheets.filter((ts) => {
    // Search filter
    if (searchTerm) {
      const weekStart = new Date(ts.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const weekEnd = new Date(ts.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const searchLower = searchTerm.toLowerCase();
      if (
        !weekStart.toLowerCase().includes(searchLower) &&
        !weekEnd.toLowerCase().includes(searchLower) &&
        !ts._id.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Date filter
    if (dateFilter !== 'all') {
      const weekStartDate = new Date(ts.weekStart);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);

      switch (dateFilter) {
        case 'thisMonth':
          if (weekStartDate < thisMonth) return false;
          break;
        case 'lastMonth':
          if (weekStartDate < lastMonth || weekStartDate >= thisMonth) return false;
          break;
        case 'last3Months':
          if (weekStartDate < last3Months) return false;
          break;
        case 'thisYear':
          if (weekStartDate < thisYear) return false;
          break;
      }
    }

    return true;
  });

  // Handle viewing timesheet details
  const handleViewTimesheet = (timesheet: TimeEntry) => {
    setSelectedTimesheet(timesheet);
    onDetailOpen();
  };

  // Handle delete confirmation
  const handleDeleteClick = (timesheet: TimeEntry) => {
    // Only allow deletion of drafts
    if (timesheet.status !== 'draft') {
      return;
    }
    setTimesheetToDelete(timesheet);
    onDeleteOpen();
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!timesheetToDelete) return;
    
    try {
      await deleteTimesheet(timesheetToDelete._id);
      setTimesheetToDelete(null);
      onDeleteClose();
      
      // Clear local timesheet if we're deleting the current one
      if (localTimesheet && localTimesheet._id === timesheetToDelete._id) {
        setLocalTimesheet(null);
        setNotes('');
        setInputValues({});
      }
      
      // Reload timesheet only if we deleted the current one, with a small delay
      if (localTimesheet && localTimesheet._id === timesheetToDelete._id) {
        setTimeout(async () => {
          await loadTimesheet();
        }, 200);
      }
    } catch (error: any) {
      console.error('Error deleting timesheet:', error);
      // Error is already handled by the hook's toast
      // Don't close modal on error so user can try again
      if (error?.response?.status !== 429) {
        onDeleteClose();
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Get day names for timesheet display
  const getDayNames = (weekStart: string) => {
    const start = new Date(weekStart);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  // Calculate total hours from input values or local timesheet
  // Use useMemo to recalculate when inputValues or localTimesheet changes
  const currentTotalHours = useMemo(() => {
    // First, try to calculate from input values (most up-to-date)
    const hoursFromInputs = Array.from({ length: 7 }, (_, index) => {
      const inputVal = inputValues[index];
      if (inputVal !== undefined && inputVal !== '') {
        const num = parseFloat(inputVal);
        return isNaN(num) ? 0 : Math.max(0, Math.min(24, num));
      }
      // Fallback to local timesheet hours
      if (localTimesheet && localTimesheet.hours && localTimesheet.hours[index] !== undefined) {
        return localTimesheet.hours[index];
      }
      // Fallback to timesheet from hook
      if (timesheet && timesheet.hours && timesheet.hours[index] !== undefined) {
        return timesheet.hours[index];
      }
      return 0;
    });
    
    return timesheetService.calculateTotalHours(hoursFromInputs);
  }, [inputValues, localTimesheet, timesheet]);

  // Check if submit should be enabled based on current input state
  const canSubmitCurrent = useMemo(() => {
    const currentStatus = localTimesheet?.status || timesheet?.status || 'draft';
    return currentStatus === 'draft' && currentTotalHours > 0;
  }, [currentTotalHours, localTimesheet, timesheet]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading time tracking data...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  if (error && !error.includes('No timesheet found')) {
    // Don't show error for "not found" - that's a valid state when creating new timesheet
    return (
      <DashboardLayout>
        <Alert status="error">
          <AlertIcon />
          Error loading time tracking data: {error}
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box p={6}>
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.800">
              Time Tracking
            </Heading>
            <Text color="gray.600">
              Track your time and manage timesheets
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FaDownload />}
              variant="outline"
              size="sm"
            >
              Export
            </Button>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              size="sm"
            >
              Add Entry
            </Button>
          </HStack>
        </HStack>

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <Alert status="warning" mb={6}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Duplicate Timesheet Detected</AlertTitle>
              <AlertDescription>{duplicateWarning}</AlertDescription>
            </Box>
            <Button
              size="sm"
              colorScheme="orange"
              variant="outline"
              onClick={async () => {
                await loadTimesheet();
                setDuplicateWarning(null);
              }}
            >
              Reload Timesheet
            </Button>
          </Alert>
        )}

        {/* Draft Timesheets Section */}
        {drafts && drafts.length > 0 && (
          <Box mb={6}>
            <Heading size="md" mb={3}>Draft Timesheets</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {drafts.map((entry) => (
                <Card key={entry._id} variant="outline" borderColor="yellow.300">
                  <CardBody>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Badge colorScheme="yellow">Draft</Badge>
                        <Text fontSize="sm" color="gray.600">
                          Week of {new Date(entry.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Total Hours</Text>
                        <Text>{timesheetService.calculateTotalHours(entry.hours)}h</Text>
                      </HStack>
                      <HStack justify="flex-end" spacing={3} mt={2}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => submitDraft(entry._id)}
                        >
                          Submit
                        </Button>
                        <Button 
                          size="sm" 
                          colorScheme="red" 
                          variant="outline"
                          leftIcon={<FaTrash />}
                          onClick={() => handleDeleteClick(entry)}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Approved Timesheets Section */}
        <Box mb={6}>
          <Heading size="md" mb={4}>Approved Timesheets</Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            View and search your previously approved timesheets for dispute resolution
          </Text>
          
          {/* Search and Filter Controls */}
          <HStack spacing={4} mb={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by week date or timesheet ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              maxW="200px"
              bg="white"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
            </Select>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FaFilter />}
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </HStack>

          {/* Approved Timesheets List */}
          {filteredApprovedTimesheets.length === 0 ? (
            <Card>
              <CardBody>
                <VStack spacing={2} py={8}>
                  <Icon as={FaCheckCircle} boxSize={8} color="gray.400" />
                  <Text color="gray.600">
                    {approvedTimesheets.length === 0 
                      ? 'No approved timesheets found' 
                      : 'No timesheets match your search criteria'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredApprovedTimesheets.map((entry) => (
                <Card key={entry._id} variant="outline" borderColor="green.300" _hover={{ shadow: 'md' }}>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Badge colorScheme="green" fontSize="sm">Approved</Badge>
                        <Text fontSize="xs" color="gray.500">
                          ID: {entry._id.substring(0, 8)}...
                        </Text>
                      </HStack>
                      
                      <VStack align="stretch" spacing={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                          Week of {formatDate(entry.weekStart)}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {formatDate(entry.weekStart)} - {formatDate(entry.weekEnd)}
                        </Text>
                      </VStack>

                      <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.200">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" color="gray.600">Total Hours</Text>
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">
                            {timesheetService.calculateTotalHours(entry.hours)}h
                          </Text>
                        </VStack>
                        {entry.approvedAt && (
                          <VStack align="end" spacing={0}>
                            <Text fontSize="xs" color="gray.600">Approved</Text>
                            <Text fontSize="xs" color="gray.700">
                              {formatDate(entry.approvedAt)}
                            </Text>
                          </VStack>
                        )}
                      </HStack>

                      {entry.notes && (
                        <Box pt={2} borderTop="1px solid" borderColor="gray.200">
                          <Text fontSize="xs" color="gray.600" noOfLines={2}>
                            {entry.notes}
                          </Text>
                        </Box>
                      )}

                      <HStack justify="flex-end" spacing={2} mt={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FaEye />}
                          onClick={() => handleViewTimesheet(entry)}
                        >
                          View Details
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">This Week</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {totalHours.toFixed(1)}h
                  </Text>
                </VStack>
                <Icon as={FaClock} boxSize={8} color="blue.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Billable Hours</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {(totalHours * 0.8).toFixed(1)}h
                  </Text>
                </VStack>
                <Icon as={FaDollarSign} boxSize={8} color="green.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Active Projects</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    3
                  </Text>
                </VStack>
                <Icon as={FaChartBar} boxSize={8} color="purple.500" />
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Status</Text>
                  <Badge colorScheme={statusColor} fontSize="sm" px={3} py={1}>
                    {timesheet?.status || 'Draft'}
                  </Badge>
                </VStack>
                <Icon as={FaCheckCircle} boxSize={8} color={statusColor === 'green' ? 'green.500' : 'yellow.500'} />
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr' }} gap={6}>
          {/* Weekly Timesheet */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <HStack justify="space-between">
                  <Heading size="md">Weekly Timesheet</Heading>
                  <Text color="gray.600">{weekDisplayText}</Text>
                </HStack>

                {/* Days Grid */}
                <Grid templateColumns="repeat(7, 1fr)" gap={3}>
                  {weekDates.days.map((day, index) => {
                    const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const hours = getHoursForDay(index);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const hasHours = hours > 0;
                    
                    return (
                      <Box
                        key={index}
                        p={4}
                        bg={isToday ? 'blue.50' : 'white'}
                        border="1px solid"
                        borderColor={isToday ? 'blue.200' : 'gray.200'}
                        borderRadius="lg"
                        shadow={isToday ? 'md' : 'sm'}
                        transition="all 0.2s"
                        _hover={{
                          shadow: 'md',
                          borderColor: isToday ? 'blue.300' : 'gray.300'
                        }}
                      >
                        <VStack spacing={3} align="stretch">
                          {/* Day Header */}
                          <Box textAlign="center">
                            <Text 
                              fontSize="sm" 
                              fontWeight="bold" 
                              color={isToday ? 'blue.700' : 'gray.700'}
                              mb={1}
                            >
                              {dayName}
                            </Text>
                            <Text 
                              fontSize="xs" 
                              color={isToday ? 'blue.600' : 'gray.500'}
                              fontWeight="medium"
                            >
                              {dayDate}
                            </Text>
                          </Box>

                          {/* Hours Input Section */}
                          <VStack spacing={2} align="stretch">
                            <Text 
                              fontSize="xs" 
                              color={isToday ? 'blue.600' : 'gray.600'} 
                              fontWeight="semibold"
                              textAlign="center"
                            >
                              Hours
                            </Text>
                            <Input
                              size="md"
                              type="number"
                              min="0"
                              max="24"
                              step="0.25"
                              value={inputValues[index] !== undefined ? inputValues[index] : (hours > 0 ? hours.toString() : '')}
                              onChange={async (e) => {
                                const value = e.target.value;
                                setInputValues(prev => ({ ...prev, [index]: value }));
                                
                                // Update local timesheet immediately for button state
                                const numValue = value === '' ? 0 : parseFloat(value);
                                const validHours = isNaN(numValue) ? 0 : Math.max(0, Math.min(24, numValue));
                                
                                if (localTimesheet) {
                                  const newHours = [...localTimesheet.hours];
                                  newHours[index] = validHours;
                                  setLocalTimesheet({
                                    ...localTimesheet,
                                    hours: newHours
                                  });
                                } else {
                                  // Before creating temp, check if timesheet exists for this week
                                  try {
                                    const weekStart = weekDates.start.toISOString();
                                    const existingTimesheet = await timesheetService.checkTimesheetExistsForWeek(userId, weekStart);
                                    
                                    if (existingTimesheet) {
                                      // Load existing timesheet instead of creating temp
                                      await loadTimesheet();
                                      // Update the loaded timesheet with new hours
                                      if (timesheet) {
                                        const newHours = [...timesheet.hours];
                                        newHours[index] = validHours;
                                        setLocalTimesheet({
                                          ...timesheet,
                                          hours: newHours
                                        });
                                      }
                                    } else {
                                      // No existing timesheet, create temporary one
                                      const tempHours = Array.from({ length: 7 }, (_, i) => i === index ? validHours : 0);
                                      setLocalTimesheet({
                                        _id: 'temp',
                                        userId: userId,
                                        weekStart: weekDates.start.toISOString(),
                                        weekEnd: weekDates.end.toISOString(),
                                        hours: tempHours,
                                        notes: notes,
                                        status: 'draft',
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString()
                                      });
                                    }
                                  } catch (error) {
                                    console.error('Error checking for existing timesheet:', error);
                                    // On error, still create temp to allow user to continue
                                    const tempHours = Array.from({ length: 7 }, (_, i) => i === index ? validHours : 0);
                                    setLocalTimesheet({
                                      _id: 'temp',
                                      userId: userId,
                                      weekStart: weekDates.start.toISOString(),
                                      weekEnd: weekDates.end.toISOString(),
                                      hours: tempHours,
                                      notes: notes,
                                      status: 'draft',
                                      createdAt: new Date().toISOString(),
                                      updatedAt: new Date().toISOString()
                                    });
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                const numValue = value === '' ? 0 : parseFloat(value);
                                handleHoursChange(index, isNaN(numValue) ? 0 : numValue);
                              }}
                              placeholder="0"
                              textAlign="center"
                              fontWeight="bold"
                              fontSize="lg"
                              bg={hasHours ? (isToday ? 'blue.100' : 'green.50') : 'white'}
                              borderColor={hasHours ? (isToday ? 'blue.300' : 'green.300') : 'gray.300'}
                              _focus={{
                                borderColor: isToday ? 'blue.400' : 'blue.400',
                                boxShadow: `0 0 0 1px ${isToday ? '#3182ce' : '#3182ce'}`
                              }}
                              _hover={{
                                borderColor: hasHours ? (isToday ? 'blue.400' : 'green.400') : 'gray.400'
                              }}
                            />
                            {hasHours && (
                              <Text 
                                fontSize="xs" 
                                color={isToday ? 'blue.600' : 'green.600'} 
                                fontWeight="medium"
                                textAlign="center"
                              >
                                {hours}h
                              </Text>
                            )}
                          </VStack>
                        </VStack>
                      </Box>
                    );
                  })}
                </Grid>

                {/* Notes Section */}
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Weekly Notes
                  </Text>
                  <Input
                    placeholder="Add notes for this week..."
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                  />
                </VStack>

                {/* Action Buttons */}
                <HStack spacing={3} justify="flex-end">
                  <Button
                    leftIcon={<FaSave />}
                    variant="outline"
                    onClick={handleSave}
                    isLoading={saveStatus === 'saving'}
                    loadingText="Saving..."
                    isDisabled={shouldDisableSaveDraft}
                    title={shouldDisableSaveDraft 
                      ? 'A draft already exists for this week. Please edit the existing draft from the "Draft Timesheets" section below.' 
                      : undefined}
                  >
                    Save Draft
                  </Button>
                  <Button
                    leftIcon={<FaPaperPlane />}
                    colorScheme="blue"
                    onClick={handleSubmit}
                    isDisabled={!canSubmitCurrent}
                  >
                    Submit for Approval
                  </Button>
                </HStack>

                {/* Status Messages */}
                {saveStatus === 'success' && (
                  <Alert status="success">
                    <AlertIcon />
                    Timesheet saved successfully!
                  </Alert>
                )}
                {saveStatus === 'error' && (
                  <Alert status="error">
                    <AlertIcon />
                    Failed to save timesheet. Please try again.
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Sidebar removed to allow Weekly Timesheet to span full width */}
        </Grid>

        {/* Timesheet Detail Modal */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <VStack align="start" spacing={1}>
                <Text>Timesheet Details</Text>
                {selectedTimesheet && (
                  <Text fontSize="sm" color="gray.600" fontWeight="normal">
                    Week of {formatDate(selectedTimesheet.weekStart)}
                  </Text>
                )}
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTimesheet && (
                <VStack align="stretch" spacing={6}>
                  {/* Timesheet Info */}
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>Week Start</Text>
                      <Text fontWeight="medium">{formatDate(selectedTimesheet.weekStart)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>Week End</Text>
                      <Text fontWeight="medium">{formatDate(selectedTimesheet.weekEnd)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>Total Hours</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        {timesheetService.calculateTotalHours(selectedTimesheet.hours)}h
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>Status</Text>
                      <Badge colorScheme="green" fontSize="sm">Approved</Badge>
                    </Box>
                    {selectedTimesheet.approvedAt && (
                      <>
                        <Box>
                          <Text fontSize="xs" color="gray.600" mb={1}>Approved At</Text>
                          <Text fontWeight="medium">{formatDateTime(selectedTimesheet.approvedAt)}</Text>
                        </Box>
                        {selectedTimesheet.approvedBy && (
                          <Box>
                            <Text fontSize="xs" color="gray.600" mb={1}>Approved By</Text>
                            <Text fontWeight="medium">{selectedTimesheet.approvedBy}</Text>
                          </Box>
                        )}
                      </>
                    )}
                    <Box>
                      <Text fontSize="xs" color="gray.600" mb={1}>Submitted At</Text>
                      <Text fontWeight="medium">
                        {selectedTimesheet.submittedAt ? formatDateTime(selectedTimesheet.submittedAt) : 'N/A'}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Daily Hours Breakdown */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={3}>Daily Hours Breakdown</Text>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Day</Th>
                          <Th>Date</Th>
                          <Th isNumeric>Hours</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getDayNames(selectedTimesheet.weekStart).map((dayName, index) => {
                          const dayDate = new Date(selectedTimesheet.weekStart);
                          dayDate.setDate(dayDate.getDate() + index);
                          const hours = selectedTimesheet.hours[index] || 0;
                          return (
                            <Tr key={index}>
                              <Td fontWeight="medium">{dayName}</Td>
                              <Td>{formatDate(dayDate.toISOString())}</Td>
                              <Td isNumeric fontWeight={hours > 0 ? 'bold' : 'normal'} color={hours > 0 ? 'blue.600' : 'gray.400'}>
                                {hours > 0 ? `${hours}h` : '-'}
                              </Td>
                            </Tr>
                          );
                        })}
                        <Tr bg="gray.50" fontWeight="bold">
                          <Td colSpan={2}>Total</Td>
                          <Td isNumeric color="blue.600">
                            {timesheetService.calculateTotalHours(selectedTimesheet.hours)}h
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>

                  {/* Notes */}
                  {selectedTimesheet.notes && (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>Notes</Text>
                      <Box p={3} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                          {selectedTimesheet.notes}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  {/* Timesheet ID for reference */}
                  <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Text fontSize="xs" color="gray.500">
                      Timesheet ID: {selectedTimesheet._id}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Created: {formatDateTime(selectedTimesheet.createdAt)} | 
                      Updated: {formatDateTime(selectedTimesheet.updatedAt)}
                    </Text>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDetailClose}>
                Close
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<FaDownload />}
                onClick={() => {
                  // TODO: Implement export functionality
                  alert('Export functionality coming soon');
                }}
              >
                Export
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Timesheet</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {timesheetToDelete && (
                <VStack align="stretch" spacing={4}>
                  <Text>
                    Are you sure you want to delete this draft timesheet?
                  </Text>
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Week of {formatDate(timesheetToDelete.weekStart)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Total Hours: {timesheetService.calculateTotalHours(timesheetToDelete.hours)}h
                    </Text>
                  </Box>
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertDescription>
                      This action cannot be undone. The timesheet will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;
