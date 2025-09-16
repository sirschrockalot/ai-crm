import React, { useState, useEffect } from 'react';
import { Box, Text, Heading, SimpleGrid, Card, CardBody, HStack, VStack, Button, Badge, Icon, Grid, Input, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { DashboardLayout } from '../components/dashboard';
import { useTimesheet } from '../hooks/useTimesheet';
import { timesheetService } from '../services/timesheetService';
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
  FaDollarSign
} from 'react-icons/fa';

const TimeTrackingPage: React.FC = () => {
  // For demo purposes, using a hardcoded user ID
  // In a real app, this would come from authentication context
  const userId = 'demo-user-123';
  
  const {
    timesheet,
    drafts,
    weekDates,
    totalHours,
    isLoading,
    error,
    saveTimesheet,
    submitTimesheet,
    submitDraft,
    updateHours,
    getHoursForDay,
    weekDisplayText,
    statusColor,
    canSubmit,
    loadTimesheet,
    loadDrafts,
  } = useTimesheet({ userId });

  const [notes, setNotes] = useState(timesheet?.notes || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [localTimesheet, setLocalTimesheet] = useState(timesheet);
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});

  // Sync local timesheet with timesheet from hook
  useEffect(() => {
    if (timesheet) {
      setLocalTimesheet(timesheet);
      setNotes(timesheet.notes || '');
      
      // Initialize input values
      const initialInputValues: { [key: number]: string } = {};
      timesheet.hours.forEach((hour, index) => {
        initialInputValues[index] = hour > 0 ? hour.toString() : '';
      });
      setInputValues(initialInputValues);
    }
  }, [timesheet]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
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

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Get current hours from the local timesheet or create empty array
      const currentHours = localTimesheet?.hours || [0, 0, 0, 0, 0, 0, 0];
      
      console.log('Saving timesheet with data:', {
        userId,
        hours: currentHours,
        notes,
        localTimesheet
      });
      
      // Save the timesheet (no daily notes needed)
      await saveTimesheet(currentHours, notes);
      
      // After successful save, reload the timesheet to get the updated data
      await loadTimesheet();
      
      setSaveStatus('success');
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving timesheet:', error);
      setSaveStatus('error');
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitTimesheet();
      setSaveStatus('success');
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
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

  if (error) {
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
                        <Button size="sm" variant="outline" onClick={() => submitDraft(entry._id)}>Submit</Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

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
                              onChange={(e) => {
                                const value = e.target.value;
                                setInputValues(prev => ({ ...prev, [index]: value }));
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
                  >
                    Save Draft
                  </Button>
                  <Button
                    leftIcon={<FaPaperPlane />}
                    colorScheme="blue"
                    onClick={handleSubmit}
                    isDisabled={!canSubmit}
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
      </Box>
    </DashboardLayout>
  );
};

export default TimeTrackingPage;
