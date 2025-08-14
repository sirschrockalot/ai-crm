import React, { useState } from 'react';
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
  } = useTimesheet({ userId });

  const [notes, setNotes] = useState(timesheet?.notes || '');

  const handleSave = async () => {
    if (!timesheet) return;
    await saveTimesheet(timesheet.hours, notes);
  };

  const handleSubmit = async () => {
    await submitTimesheet();
  };

  const handleHourChange = (dayIndex: number, value: string) => {
    const hours = parseFloat(value) || 0;
    updateHours(dayIndex, hours);
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
                  {timesheet?.status?.charAt(0).toUpperCase() + timesheet?.status?.slice(1) || 'No Data'}
                </Text>
                <Text fontSize="sm" color="gray.600">Timesheet Status</Text>
                <Text fontSize="xs" color={`${statusColor}.500`} fontWeight="500">
                  {timesheet?.status === 'draft' ? 'Due Friday' : timesheet?.status}
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
              
              <HStack spacing={4} flexWrap="wrap">
                <Button 
                  variant="outline" 
                  leftIcon={<Icon as={FaSave} />}
                  onClick={handleSave}
                  isLoading={isLoading}
                  isDisabled={!timesheet}
                >
                  Save Draft
                </Button>
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Icon as={FaPaperPlane} />}
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!canSubmit}
                >
                  Submit Timesheet
                </Button>
                <Button variant="outline" leftIcon={<Icon as={FaDownload} />}>
                  Export Timesheet
                </Button>
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
                    {timesheet?.status?.charAt(0).toUpperCase() + timesheet?.status?.slice(1) || 'No Data'}
                  </Badge>
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
                            onChange={(e) => handleHourChange(index, e.target.value)}
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
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>

                             {/* Weekly summary footer */}
               <Box mt={8} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                 <HStack justify="space-between" align="center">
                   <VStack align="start" spacing={1}>
                     <Text fontSize="sm" fontWeight="600" color="gray.700">Weekly Total</Text>
                     <Text fontSize="xs" color="gray.500">Regular hours only</Text>
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
            </CardBody>
          </Card>

          {/* Team Analytics */}
          <Card bg="white" shadow="md">
            <CardBody p={6}>
              <HStack spacing={3} mb={4}>
                <Icon as={FaChartBar} color="purple.500" boxSize={5} />
                <Heading size="md" color="gray.800">Team Analytics</Heading>
              </HStack>
              
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
                <HStack p={3} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <Icon as={FaExclamationTriangle} color="red.500" boxSize={4} />
                  <Text fontSize="sm" color="red.700">Timesheet due Friday</Text>
                </HStack>
                
                <HStack p={3} bg="yellow.50" borderRadius="md" border="1px" borderColor="yellow.200">
                  <Icon as={FaExclamationTriangle} color="yellow.500" boxSize={4} />
                  <Text fontSize="sm" color="yellow.700">3 approvals pending</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </DashboardLayout>
  );
};

export default TimeTrackingDashboard;
