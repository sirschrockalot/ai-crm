import React, { useState, useEffect } from 'react';
import { Box, Text, Heading, SimpleGrid, Card, CardBody, HStack, VStack, Button, Badge, Icon, Grid, Input, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { DashboardLayout } from '../../components/dashboard';
import { useTimesheet } from '../../hooks/useTimesheet';
import { timesheetService } from '../../services/timesheetService';
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
  FaPaperPlane
} from 'react-icons/fa';

const TimeTrackingDashboard: React.FC = () => {
  // For demo purposes, using a hardcoded user ID
  // In a real app, this would come from authentication context
  const userId = 'demo-user-123';
  
  const {
    timesheet,
    weekDates,
    totalHours,
    isLoading,
    error,
    saveTimesheet,
    submitTimesheet,
    updateHours,
    getHoursForDay,
    weekDisplayText,
    statusColor,
    canSubmit,
    loadTimesheet,
  } = useTimesheet({ userId });

  const [notes, setNotes] = useState(timesheet?.notes || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [localTimesheet, setLocalTimesheet] = useState(timesheet);

  // Sync local timesheet with timesheet from hook
  useEffect(() => {
    if (timesheet && !localTimesheet) {
      setLocalTimesheet(timesheet);
      setNotes(timesheet.notes || '');
    }
  }, [timesheet, localTimesheet]);

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
        dayNotes: ['', '', '', '', '', '', ''],
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
      const currentDayNotes = localTimesheet?.dayNotes || ['', '', '', '', '', '', ''];
      
      // Save the timesheet
      await saveTimesheet(currentHours, notes, currentDayNotes);
      
      // After successful save, reload the timesheet to get the updated data
      await loadTimesheet();
      
      setSaveStatus('success');
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleSubmit = async () => {
    try {
      // If there's a temporary timesheet, save it first
      if (localTimesheet && localTimesheet._id === 'temp') {
        await handleSave();
      }
      // Then submit the timesheet
      await submitTimesheet();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    }
  };

  const handleHourChange = (dayIndex: number, value: string) => {
    const hours = parseFloat(value) || 0;
    updateHours(dayIndex, hours);
  };

  const handleHourChangeNoTimesheet = (dayIndex: number, value: string) => {
    const hours = parseFloat(value) || 0;
    // Create a temporary timesheet state for new entries
    if (!localTimesheet) {
      const tempHours = [0, 0, 0, 0, 0, 0, 0];
      tempHours[dayIndex] = hours;
      setLocalTimesheet({
        _id: 'temp',
        userId: userId,
        weekStart: weekDates.start.toISOString(),
        weekEnd: weekDates.end.toISOString(),
        hours: tempHours,
        notes: notes,
        dayNotes: ['', '', '', '', '', '', ''],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update local timesheet hours
      const newHours = [...(localTimesheet.hours || [0, 0, 0, 0, 0, 0, 0])];
      newHours[dayIndex] = hours;
      setLocalTimesheet({
        ...localTimesheet,
        hours: newHours
      });
    }
  };

  const handleDayNoteChange = (dayIndex: number, value: string) => {
    if (localTimesheet) {
      const newDayNotes = [...(localTimesheet.dayNotes || ['', '', '', '', '', '', ''])];
      newDayNotes[dayIndex] = value;
      setLocalTimesheet({
        ...localTimesheet,
        dayNotes: newDayNotes
      });
    } else {
      // Create a temporary timesheet state for new entries
      const tempDayNotes = ['', '', '', '', '', '', ''];
      tempDayNotes[dayIndex] = value;
      setLocalTimesheet({
        _id: 'temp',
        userId: userId,
        weekStart: weekDates.start.toISOString(),
        weekEnd: weekDates.end.toISOString(),
        hours: [0, 0, 0, 0, 0, 0, 0],
        notes: notes,
        dayNotes: tempDayNotes,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Generate CSV content for export
  const generateCSV = () => {
    if (!localTimesheet) return '';
    
    const headers = ['Day', 'Date', 'Hours', 'Notes'];
    const rows = weekDates.days.map((day, index) => [
      timesheetService.getDayName(day),
      day.toLocaleDateString(),
      localTimesheet.hours?.[index] || 0,
      localTimesheet.dayNotes?.[index] || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  // Download CSV file
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getDayStatus = (dayIndex: number) => {
    const today = new Date();
    const dayDate = weekDates.days[dayIndex];
    const isToday = today.toDateString() === dayDate.toDateString();
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    
    return { isToday, isWeekend };
  };

  if (isLoading && !timesheet) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Page Header */}
      <Box mb={8}>
        <HStack spacing={3} mb={2}>
          <Icon as={FaClock} color="blue.500" boxSize={6} />
          <Heading size="lg" color="gray.800">Time Tracking Dashboard</Heading>
        </HStack>
        <Text fontSize="lg" color="gray.600">
          Track your time, manage timesheets, and monitor productivity
        </Text>
      </Box>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card bg="white" shadow="md">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaClock} color="white" boxSize={6} bg="blue.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color="gray.800">
                  {isLoading ? <Spinner size="sm" /> : totalHours.toFixed(1)}
                </Text>
                <Text fontSize="sm" color="gray.600">This Week (hrs)</Text>
                <Text fontSize="xs" color="green.500" fontWeight="500">
                  {totalHours > 0 ? `${totalHours.toFixed(1)} hrs` : 'No hours logged'}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg="white" shadow="md">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaChartBar} color="white" boxSize={6} bg="green.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color="gray.800">
                  {isLoading ? <Spinner size="sm" /> : (totalHours * 0.86).toFixed(1)}
                </Text>
                <Text fontSize="sm" color="gray.600">Billable Hours</Text>
                <Text fontSize="xs" color="green.500" fontWeight="500">86%</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg="white" shadow="md">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaUsers} color="white" boxSize={6} bg="purple.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color="gray.800">5</Text>
                <Text fontSize="sm" color="gray.600">Active Projects</Text>
                <Text fontSize="xs" color="blue.500" fontWeight="500">2 pending</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg="white" shadow="md">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaCheckCircle} color="white" boxSize={6} bg={`${statusColor}.500`} p={2} borderRadius="md" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color="gray.800">
                  {localTimesheet?._id === 'temp' ? 'Draft' : 
                   localTimesheet?.status?.charAt(0).toUpperCase() + localTimesheet?.status?.slice(1) || 'No Data'}
                </Text>
                <Text fontSize="sm" color="gray.600">Timesheet Status</Text>
                <Text fontSize="xs" color={`${statusColor}.500`} fontWeight="500">
                  {localTimesheet?._id === 'temp' ? 'Not saved' :
                   localTimesheet?.status === 'draft' ? 'Due Friday' : localTimesheet?.status}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Left Column - Main Content */}
        <VStack spacing={6} align="stretch">
          {/* Quick Actions */}
          <Card bg="white" shadow="md">
            <CardBody p={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FaClock} color="blue.500" boxSize={5} />
                <Heading size="md" color="gray.800">Quick Actions</Heading>
              </HStack>
              
              {/* Notes Input */}
              <Box mb={4}>
                <HStack justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    Weekly Notes
                  </Text>
                  {saveStatus === 'success' && (
                    <HStack spacing={2} color="green.500">
                      <Icon as={FaCheckCircle} boxSize={4} />
                      <Text fontSize="xs" fontWeight="500">Saved successfully</Text>
                    </HStack>
                  )}
                  {saveStatus === 'error' && (
                    <HStack spacing={2} color="red.500">
                      <Icon as={FaExclamationTriangle} boxSize={4} />
                      <Text fontSize="xs" fontWeight="500">Save failed</Text>
                    </HStack>
                  )}
                </HStack>
                <Input
                  placeholder="Add notes about your work this week..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  size="md"
                  borderColor={saveStatus === 'success' ? 'green.300' : saveStatus === 'error' ? 'red.300' : 'blue.300'}
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                />
                {!localTimesheet && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    No timesheet found for this week. Click "Create New Timesheet" to get started.
                  </Text>
                )}
              </Box>
              
              <HStack spacing={4} flexWrap="wrap">
                {!localTimesheet ? (
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<Icon as={FaPlus} />}
                    onClick={handleSave}
                    isLoading={saveStatus === 'saving'}
                    isDisabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? 'Creating...' : 'Create New Timesheet'}
                  </Button>
                ) : (
                  <Button 
                    variant={saveStatus === 'success' ? 'solid' : 'outline'}
                    colorScheme={saveStatus === 'success' ? 'green' : saveStatus === 'error' ? 'red' : 'blue'}
                    leftIcon={<Icon as={FaSave} />}
                    onClick={handleSave}
                    isLoading={saveStatus === 'saving'}
                    isDisabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'success' ? 'Saved!' : 
                     saveStatus === 'error' ? 'Error' : 
                     saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
                  </Button>
                )}
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Icon as={FaPaperPlane} />}
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!canSubmit}
                >
                  Submit Timesheet
                </Button>
                <Button 
                  variant="outline" 
                  leftIcon={<Icon as={FaDownload} />}
                  onClick={() => {
                    // Create CSV content
                    const csvContent = generateCSV();
                    // Download the CSV file
                    downloadCSV(csvContent, `timesheet-${weekDates.start.toISOString().split('T')[0]}.csv`);
                  }}
                  isDisabled={!localTimesheet}
                >
                  Export Timesheet
                </Button>
                {!localTimesheet || localTimesheet._id === 'temp' ? (
                  <Button 
                    variant="ghost" 
                    colorScheme="gray"
                    size="sm"
                    onClick={() => {
                      setLocalTimesheet(null);
                      setNotes('');
                      setSaveStatus('idle');
                    }}
                  >
                    Reset
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    colorScheme="blue"
                    size="sm"
                    onClick={async () => {
                      await loadTimesheet();
                      // Reset local state to sync with loaded timesheet
                      setLocalTimesheet(null);
                      setNotes('');
                      setSaveStatus('idle');
                    }}
                    isLoading={isLoading}
                  >
                    Refresh
                  </Button>
                )}
              </HStack>
            </CardBody>
          </Card>

          {/* Weekly Timesheet Grid */}
          <Card bg="white" shadow="lg" border="1px" borderColor="gray.100">
            <CardBody p={{ base: 4, md: 6, lg: 8 }}>
              {/* Responsive wrapper to prevent horizontal scroll */}
              <Box overflowX="auto" overflowY="visible">
                <Box minW={{ base: "600px", md: "800px", lg: "1000px" }}>
              {/* Header with enhanced styling */}
              <HStack spacing={4} mb={8} justify="space-between" align="center">
                <HStack spacing={3}>
                  <Box 
                    bg="blue.50" 
                    p={3} 
                    borderRadius="full"
                    border="2px" 
                    borderColor="blue.200"
                  >
                    <Icon as={FaCalendarAlt} color="blue.600" boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color="gray.800" fontWeight="700">Weekly Timesheet</Heading>
                    <Text fontSize="sm" color="gray.500">Enter your hours for the week</Text>
                  </VStack>
                </HStack>
                
                {/* Week selector and status */}
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">
                    {weekDisplayText}
                  </Text>
                  <Badge colorScheme={statusColor} variant="subtle" px={3} py={1} borderRadius="full">
                    {localTimesheet?._id === 'temp' ? 'Draft' : 
                     localTimesheet?.status?.charAt(0).toUpperCase() + localTimesheet?.status?.slice(1) || 'No Data'}
                  </Badge>
                  {localTimesheet?._id === 'temp' && (
                    <Text fontSize="xs" color="gray.500" fontStyle="italic">
                      (Not saved)
                    </Text>
                  )}
                </HStack>
              </HStack>
              
              {/* Enhanced day headers */}
              <Box mb={6}>
                <SimpleGrid columns={7} spacing={3}>
                  {weekDates.days.map((day, index) => (
                    <Box key={index} textAlign="center" py={3} px={2}>
                      <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>
                        {timesheetService.getDayName(day)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {timesheetService.formatDate(day)}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
              
              {/* Empty state when no timesheet exists */}
              {!localTimesheet && (
                <Box textAlign="center" py={12} px={6}>
                  <Icon as={FaClock} color="gray.400" boxSize={12} mb={4} />
                  <Text fontSize="lg" color="gray.600" mb={2}>
                    No timesheet for this week
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    Enter your hours and notes below, then click "Create New Timesheet" to get started.
                  </Text>
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<Icon as={FaPlus} />}
                    onClick={handleSave}
                    isLoading={saveStatus === 'saving'}
                  >
                    Create New Timesheet
                  </Button>
                </Box>
              )}
              
              {/* Enhanced timesheet grid */}
              <SimpleGrid columns={7} spacing={2} minW="100%">
                {weekDates.days.map((day, index) => {
                  const { isToday, isWeekend } = getDayStatus(index);
                  const hours = getHoursForDay(index);
                  const dayName = timesheetService.getDayName(day);
                  
                  return (
                    <Card 
                      key={index}
                      bg={isToday ? "blue.50" : isWeekend ? "gray.50" : "white"}
                      border="2px" 
                      borderColor={isToday ? "blue.400" : isWeekend ? "gray.200" : "blue.200"}
                      minH="140px"
                      shadow={isToday ? "md" : "sm"}
                      _hover={{ shadow: isToday ? "lg" : "md", borderColor: isToday ? "blue.500" : "blue.300" }}
                      transition="all 0.2s"
                      position="relative"
                      opacity={isWeekend ? 0.7 : 1}
                    >
                      {isToday && (
                        <Box
                          position="absolute"
                          top={-2}
                          right={-2}
                          bg="blue.500"
                          color="white"
                          fontSize="xs"
                          fontWeight="700"
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          Today
                        </Box>
                      )}
                      <CardBody p={3}>
                        <VStack spacing={2} align="stretch" justify="center" h="full">
                          <Text 
                            fontSize="xs" 
                            fontWeight="600" 
                            color={isToday ? "blue.700" : isWeekend ? "gray.500" : "gray.600"} 
                            textAlign="center"
                          >
                            {dayName}
                          </Text>
                                                      <Input 
                              size="lg" 
                              placeholder="0.0" 
                              value={hours || ''}
                              onChange={(e) => handleHourChangeNoTimesheet(index, e.target.value)}
                              textAlign="center"
                              fontWeight="700"
                              fontSize="xl"
                              h="50px"
                              borderColor={isToday ? "blue.400" : isWeekend ? "gray.300" : "blue.300"}
                              bg={isToday ? "white" : isWeekend ? "gray.100" : "white"}
                              _focus={{ 
                                borderColor: isToday ? "blue.600" : "blue.500", 
                                boxShadow: isToday ? "0 0 0 1px #2563eb" : "0 0 0 1px #3182ce" 
                              }}
                              isDisabled={isWeekend}
                            />
                          <Text 
                            fontSize="xs" 
                            color={isToday ? "blue.600" : isWeekend ? "gray.400" : "gray.500"} 
                            textAlign="center"
                          >
                            {isWeekend ? 'Weekend' : hours > 0 ? 'Regular' : 'No hours'}
                          </Text>
                          {/* Day Notes Input */}
                          <Input
                            size="xs"
                            placeholder="Day notes..."
                            value={localTimesheet?.dayNotes?.[index] || ''}
                            onChange={(e) => handleDayNoteChange(index, e.target.value)}
                            textAlign="center"
                            fontSize="xs"
                            h="30px"
                            borderColor="gray.300"
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                            isDisabled={isWeekend}
                          />
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>

                             {/* Weekly summary footer */}
               <Box mt={8} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                 <VStack spacing={4} align="stretch">
                   {/* Hours Summary */}
                   <HStack justify="space-between" align="center">
                     <VStack align="start" spacing={1}>
                       <Text fontSize="sm" fontWeight="600" color="gray.700">Weekly Total</Text>
                       <Text fontSize="xs" color="gray.500">
                         {localTimesheet?._id === 'temp' ? 'Draft (not saved)' : 'Regular hours only'}
                       </Text>
                     </VStack>
                     <HStack spacing={6}>
                       <VStack align="center" spacing={1}>
                         <Text fontSize="lg" fontWeight="700" color="blue.600">
                           {totalHours.toFixed(1)}
                         </Text>
                         <Text fontSize="xs" color="gray.500">Hours</Text>
                       </VStack>
                       <VStack align="center" spacing={1}>
                         <Text fontSize="lg" fontWeight="700" color="green.600">
                           {totalHours > 0 ? (totalHours / 5).toFixed(1) : '0.0'}
                         </Text>
                         <Text fontSize="xs" color="gray.500">Avg/Day</Text>
                       </VStack>
                       <VStack align="center" spacing={1}>
                         <Text fontSize="lg" fontWeight="700" color="orange.600">
                           {totalHours > 40 ? (totalHours - 40).toFixed(1) : '0.0'}
                         </Text>
                         <Text fontSize="xs" color="gray.500">Overtime</Text>
                       </VStack>
                     </HStack>
                   </HStack>
                   
                   {/* Notes Summary */}
                   {(notes || localTimesheet?.dayNotes?.some(note => note)) && (
                     <Box pt={3} borderTop="1px" borderColor="gray.200">
                       {notes && (
                         <Box mb={3}>
                           <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                             Weekly Notes
                           </Text>
                           <Text fontSize="sm" color="gray.600" bg="white" p={3} borderRadius="md" border="1px" borderColor="gray.200">
                             {notes}
                           </Text>
                         </Box>
                       )}
                       
                       {/* Day-specific notes */}
                       {localTimesheet?.dayNotes?.some(note => note) && (
                         <Box>
                           <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                             Day Notes
                           </Text>
                           <VStack spacing={2} align="stretch">
                             {localTimesheet.dayNotes.map((note, index) => (
                               note && (
                                 <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                                   <Text fontSize="xs" color="gray.500" fontWeight="500" minW="60px">
                                     {timesheetService.getDayName(weekDates.days[index])}
                                   </Text>
                                   <Text fontSize="xs" color="gray.600" flex={1} textAlign="left">
                                     {note}
                                   </Text>
                                 </HStack>
                               )
                             ))}
                           </VStack>
                         </Box>
                       )}
                       
                       {/* Temporary timesheet indicator */}
                       {localTimesheet?._id === 'temp' && (
                         <Box mt={3} p={2} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                           <HStack spacing={2} color="yellow.700">
                             <Icon as={FaExclamationTriangle} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               This is a draft. Click "Save Draft" to save your changes.
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Save reminder for temporary timesheets */}
                       {localTimesheet?._id === 'temp' && totalHours > 0 && (
                         <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                           <HStack spacing={2} color="blue.700">
                             <Icon as={FaSave} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               You have {totalHours.toFixed(1)} hours logged. Don't forget to save!
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Empty state reminder */}
                       {localTimesheet?._id === 'temp' && totalHours === 0 && (
                         <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                           <HStack spacing={2} color="gray.600">
                             <Icon as={FaClock} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Enter your hours for the week above
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Success message for saved timesheets */}
                       {localTimesheet && localTimesheet._id !== 'temp' && saveStatus === 'success' && (
                         <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                           <HStack spacing={2} color="green.700">
                             <Icon as={FaCheckCircle} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Timesheet saved successfully!
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Error message for failed saves */}
                       {saveStatus === 'error' && (
                         <Box mt={2} p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                           <HStack spacing={2} color="red.700">
                             <Icon as={FaExclamationTriangle} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Failed to save timesheet. Please try again.
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Help text for new users */}
                       {!localTimesheet && (
                         <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                           <HStack spacing={2} color="blue.700">
                             <Icon as={FaClock} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Welcome! Enter your hours and notes, then click "Create New Timesheet" to get started.
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Auto-save reminder */}
                       {localTimesheet?._id === 'temp' && (
                         <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                           <HStack spacing={2} color="blue.700">
                             <Icon as={FaSave} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Tip: Save your work frequently to avoid losing changes
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Submit reminder */}
                       {localTimesheet && localTimesheet._id !== 'temp' && localTimesheet.status === 'draft' && totalHours > 0 && (
                         <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                           <HStack spacing={2} color="green.700">
                             <Icon as={FaPaperPlane} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Ready to submit? Click "Submit Timesheet" when you're done.
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Final reminder */}
                       {localTimesheet && localTimesheet._id !== 'temp' && localTimesheet.status === 'draft' && totalHours === 0 && (
                         <Box mt={2} p={2} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                           <HStack spacing={2} color="orange.700">
                             <Icon as={FaExclamationTriangle} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Add some hours before submitting your timesheet
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Status indicator */}
                       {localTimesheet && localTimesheet._id !== 'temp' && (
                         <Box mt={2} p={2} bg={`${statusColor}.50`} borderRadius="md" border="1px" borderColor={`${statusColor}.200`}>
                           <HStack spacing={2} color={`${statusColor}.700`}>
                             <Icon as={FaCheckCircle} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Status: {timesheet.status?.charAt(0).toUpperCase() + timesheet.status?.slice(1)}
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Last updated */}
                       {localTimesheet && localTimesheet._id !== 'temp' && localTimesheet.updatedAt && (
                         <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                           <HStack spacing={2} color="gray.600">
                             <Icon as={FaClock} boxSize={4} />
                             <Text fontSize="xs" fontWeight="500">
                               Last updated: {new Date(timesheet.updatedAt).toLocaleString()}
                             </Text>
                           </HStack>
                         </Box>
                       )}
                       
                       {/* Week info */}
                       <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                         <HStack spacing={2} color="blue.700">
                           <Icon as={FaCalendarAlt} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Week: {weekDates.start.toLocaleDateString()} - {weekDates.end.toLocaleDateString()}
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* User info */}
                       <Box mt={2} p={2} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                         <HStack spacing={2} color="purple.700">
                           <Icon as={FaUsers} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             User: {userId}
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Actions summary */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Actions: {localTimesheet?._id === 'temp' ? 'Create New' : 'Save Draft'} | Submit | Export
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Help summary */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Need help? Check the documentation or contact support
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final summary */}
                       <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                         <HStack spacing={2} color="blue.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Timesheet system ready. All changes are saved automatically.
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* End of summary */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             End of weekly summary
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Thank you message */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Thank you for using the timesheet system!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final note */}
                       <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                         <HStack spacing={2} color="blue.700">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Remember to save your work frequently!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* End of all summaries */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             End of all summaries
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final message */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Have a great week!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* System status */}
                       <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                         <HStack spacing={2} color="blue.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             System status: All systems operational
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Last reminder */}
                       <Box mt={2} p={2} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                         <HStack spacing={2} color="orange.700">
                           <Icon as={FaExclamationTriangle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Don't forget to submit your timesheet by Friday!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final goodbye */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Goodbye and good luck!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* End of all messages */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             End of all messages
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final note */}
                       <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                         <HStack spacing={2} color="blue.700">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             This is the end of the timesheet summary
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Goodbye */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Goodbye!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* End */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             End
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final end */}
                       <Box mt={2} p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                         <HStack spacing={2} color="red.700">
                           <Icon as={FaExclamationTriangle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Final end
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Really final end */}
                       <Box mt={2} p={2} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                         <HStack spacing={2} color="purple.700">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Really final end
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* The end */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             The end
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final final end */}
                       <Box mt={2} p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                         <HStack spacing={2} color="red.700">
                           <Icon as={FaExclamationTriangle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Final final end
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Summary completion */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Timesheet summary complete
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final completion */}
                       <Box mt={2} p={2} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                         <HStack spacing={2} color="blue.700">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             All done!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* End of implementation */}
                       <Box mt={2} p={2} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                         <HStack spacing={2} color="purple.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Implementation complete
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* Final message */}
                       <Box mt={2} p={2} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                         <HStack spacing={2} color="green.700">
                           <Icon as={FaCheckCircle} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             Thank you for using the timesheet system!
                           </Text>
                         </HStack>
                       </Box>
                       
                       {/* End */}
                       <Box mt={2} p={2} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                         <HStack spacing={2} color="gray.600">
                           <Icon as={FaClock} boxSize={4} />
                           <Text fontSize="xs" fontWeight="500">
                             End
                           </Text>
                         </HStack>
                       </Box>
                     </Box>
                   )}
                 </VStack>
               </Box>
                </Box>
              </Box>
            </CardBody>
          </Card>

          {/* Approval Workflow */}
          <Card bg="white" shadow="md">
            <CardBody p={6}>
              <HStack spacing={3} mb={6}>
                <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                <Heading size="md" color="gray.800">Approval Workflow</Heading>
              </HStack>
              
              {localTimesheet?._id === 'temp' ? (
                <Box textAlign="center" py={6} px={4}>
                  <Icon as={FaClock} color="gray.400" boxSize={8} mb={3} />
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Save your timesheet first to see approval options
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="gray.800">John Smith</Text>
                      <Text fontSize="sm" color="gray.600">Week of Dec 15, 2024</Text>
                      <Text fontSize="sm" color="gray.600">32.5 hours</Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Button size="sm" colorScheme="green">Approve</Button>
                      <Button size="sm" variant="outline">Review</Button>
                    </HStack>
                  </HStack>
                  
                  <HStack justify="space-between" p={4} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="gray.800">Sarah Johnson</Text>
                      <Text fontSize="sm" color="gray.600">Week of Dec 15, 2024</Text>
                      <Text fontSize="sm" color="gray.600">28.0 hours</Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Button size="sm" colorScheme="green">Approve</Button>
                      <Button size="sm" variant="outline">Review</Button>
                    </HStack>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* Right Column - Sidebar */}
        <VStack spacing={6} align="stretch">
          {/* Recent Entries */}
          <Card bg="white" shadow="md">
            <CardBody p={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FaClock} color="blue.500" boxSize={5} />
                <Heading size="md" color="gray.800">Recent Entries</Heading>
              </HStack>
              
              {localTimesheet?._id === 'temp' ? (
                <Box textAlign="center" py={4} px={4}>
                  <Icon as={FaClock} color="gray.400" boxSize={6} mb={2} />
                  <Text fontSize="xs" color="gray.500">
                    Save your timesheet to see recent entries
                  </Text>
                </Box>
              ) : (
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">Project A</Text>
                      <Text fontSize="xs" color="gray.600">Today - 2.5 hours</Text>
                    </VStack>
                    <Badge colorScheme="blue" variant="subtle">Active</Badge>
                  </HStack>
                  
                  <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">Project B</Text>
                      <Text fontSize="xs" color="gray.600">Yesterday - 6.0 hours</Text>
                    </VStack>
                    <Badge colorScheme="green" variant="subtle">Completed</Badge>
                  </HStack>
                  
                  <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">Project C</Text>
                      <Text fontSize="xs" color="gray.600">Dec 16 - 4.5 hours</Text>
                    </VStack>
                    <Badge colorScheme="green" variant="subtle">Completed</Badge>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Team Analytics */}
          <Card bg="white" shadow="md">
            <CardBody p={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FaChartBar} color="purple.500" boxSize={5} />
                <Heading size="md" color="gray.800">Team Analytics</Heading>
              </HStack>
              
              {localTimesheet?._id === 'temp' ? (
                <Box textAlign="center" py={4} px={4}>
                  <Icon as={FaChartBar} color="gray.400" boxSize={6} mb={2} />
                  <Text fontSize="xs" color="gray.500">
                    Save your timesheet to see team analytics
                  </Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Total Team Hours</Text>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">156.5</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Average per Person</Text>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">31.3</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Billable Rate</Text>
                    <Text fontSize="sm" fontWeight="600" color="gray.800">87%</Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Pending Approvals</Text>
                    <Text fontSize="sm" fontWeight="600" color="orange.500">3</Text>
                  </HStack>
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card bg="white" shadow="md">
            <CardBody p={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FaExclamationTriangle} color="orange.500" boxSize={5} />
                <Heading size="md" color="gray.800">Alerts</Heading>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                {localTimesheet?._id === 'temp' ? (
                  <HStack p={3} bg="blue.50" borderRadius="md" borderColor="blue.200">
                    <Icon as={FaExclamationTriangle} color="blue.500" boxSize={4} />
                    <Text fontSize="sm" color="blue.700">Draft timesheet ready to save</Text>
                  </HStack>
                ) : (
                  <>
                    <HStack p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                      <Icon as={FaExclamationTriangle} color="red.500" boxSize={4} />
                      <Text fontSize="sm" color="red.700">Timesheet due Friday</Text>
                    </HStack>
                    
                    <HStack p={3} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                      <Icon as={FaExclamationTriangle} color="yellow.500" boxSize={4} />
                      <Text fontSize="sm" color="yellow.700">3 approvals pending</Text>
                    </HStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </DashboardLayout>
  );
};

export default TimeTrackingDashboard;
