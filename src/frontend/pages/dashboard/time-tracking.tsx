import React from 'react';
import { Box, Text, Heading, SimpleGrid, Card, CardBody, HStack, VStack, Button, Badge, Icon, Grid, Input } from '@chakra-ui/react';
import { DashboardLayout } from '../../components/dashboard';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaChartBar, 
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaDownload
} from 'react-icons/fa';

const TimeTrackingDashboard: React.FC = () => {
  return (
    <DashboardLayout>
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
                <Text fontSize="xl" fontWeight="700" color="gray.800">32.5</Text>
                <Text fontSize="sm" color="gray.600">This Week (hrs)</Text>
                <Text fontSize="xs" color="green.500" fontWeight="500">+2.5 hrs</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg="white" shadow="md">
          <CardBody p={6}>
            <HStack spacing={3}>
              <Icon as={FaChartBar} color="white" boxSize={6} bg="green.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color="gray.800">28.0</Text>
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
              <Icon as={FaCheckCircle} color="white" boxSize={6} bg="orange.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="700" color="gray.800">Draft</Text>
                <Text fontSize="sm" color="gray.600">Timesheet Status</Text>
                <Text fontSize="xs" color="orange.500" fontWeight="500">Due Friday</Text>
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
                <Button variant="outline" leftIcon={<Icon as={FaPlus} />}>
                  Add Entry
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
                    Week of Dec 15, 2024
                  </Text>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                    Draft
                  </Badge>
                </HStack>
              </HStack>
              
              {/* Enhanced day headers */}
              <Box mb={6}>
                <SimpleGrid columns={7} spacing={3}>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Mon</Text>
                    <Text fontSize="xs" color="gray.500">Dec 15</Text>
                  </Box>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Tue</Text>
                    <Text fontSize="xs" color="gray.500">Dec 16</Text>
                  </Box>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Wed</Text>
                    <Text fontSize="xs" color="gray.500">Dec 17</Text>
                  </Box>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Thu</Text>
                    <Text fontSize="xs" color="gray.500">Dec 18</Text>
                  </Box>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Fri</Text>
                    <Text fontSize="xs" color="gray.500">Dec 19</Text>
                  </Box>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Sat</Text>
                    <Text fontSize="xs" color="gray.500">Dec 20</Text>
                  </Box>
                  <Box textAlign="center" py={3} px={2}>
                    <Text fontSize="sm" fontWeight="700" color="gray.700" mb={1}>Sun</Text>
                    <Text fontSize="xs" color="gray.500">Dec 21</Text>
                  </Box>
                </SimpleGrid>
              </Box>
              
              {/* Enhanced timesheet grid */}
              <SimpleGrid columns={7} spacing={2} minW="100%">
                {/* Monday */}
                <Card 
                  bg="white" 
                  border="2px" 
                  borderColor="blue.200" 
                  minH="140px"
                  shadow="sm"
                  _hover={{ shadow: "md", borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="gray.600" textAlign="center">Monday</Text>
                      <Input 
                        size="lg" 
                        placeholder="8.0" 
                        defaultValue="8.0"
                        textAlign="center"
                        fontWeight="700"
                        fontSize="xl"
                        h="50px"
                        borderColor="blue.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                      <Text fontSize="xs" color="gray.500" textAlign="center">Regular</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Tuesday */}
                <Card 
                  bg="white" 
                  border="2px" 
                  borderColor="blue.200" 
                  minH="140px"
                  shadow="sm"
                  _hover={{ shadow: "md", borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="gray.600" textAlign="center">Tuesday</Text>
                      <Input 
                        size="lg" 
                        placeholder="8.0" 
                        defaultValue="7.5"
                        textAlign="center"
                        fontWeight="700"
                        fontSize="xl"
                        h="50px"
                        borderColor="blue.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                      <Text fontSize="xs" color="gray.500" textAlign="center">Regular</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Wednesday */}
                <Card 
                  bg="white" 
                  border="2px" 
                  borderColor="blue.200" 
                  minH="140px"
                  shadow="sm"
                  _hover={{ shadow: "md", borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="gray.600" textAlign="center">Wednesday</Text>
                      <Input 
                        size="lg" 
                        placeholder="8.0" 
                        defaultValue="8.5"
                        textAlign="center"
                        fontWeight="700"
                        fontSize="xl"
                        h="50px"
                        borderColor="blue.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                      <Text fontSize="xs" color="gray.500" textAlign="center">Regular</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Thursday */}
                <Card 
                  bg="white" 
                  border="2px" 
                  borderColor="blue.200" 
                  minH="140px"
                  shadow="sm"
                  _hover={{ shadow: "md", borderColor: "blue.300" }}
                  transition="all 0.2s"
                >
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="gray.600" textAlign="center">Thursday</Text>
                      <Input 
                        size="lg" 
                        placeholder="8.0" 
                        defaultValue="6.5"
                        textAlign="center"
                        fontWeight="700"
                        fontSize="xl"
                        h="50px"
                        borderColor="blue.300"
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                      <Text fontSize="xs" color="gray.500" textAlign="center">Regular</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Friday - Highlighted as current day */}
                <Card 
                  bg="blue.50" 
                  border="2px" 
                  borderColor="blue.400" 
                  minH="140px"
                  shadow="md"
                  _hover={{ shadow: "lg", borderColor: "blue.500" }}
                  transition="all 0.2s"
                  position="relative"
                >
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
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="blue.700" textAlign="center">Friday</Text>
                      <Input 
                        size="lg" 
                        placeholder="8.0" 
                        defaultValue="2.0"
                        textAlign="center"
                        fontWeight="700"
                        fontSize="xl"
                        h="50px"
                        borderColor="blue.400"
                        bg="white"
                        _focus={{ borderColor: "blue.600", boxShadow: "0 0 0 1px #2563eb" }}
                      />
                      <Text fontSize="xs" color="blue.600" textAlign="center">In Progress</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Saturday */}
                <Card 
                  bg="gray.50" 
                  border="2px" 
                  borderColor="gray.200" 
                  minH="140px"
                  shadow="sm"
                  opacity={0.7}
                >
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="gray.500" textAlign="center">Saturday</Text>
                      <Input 
                        size="lg" 
                        placeholder="0.0" 
                        isDisabled
                        textAlign="center"
                        bg="gray.100"
                        borderColor="gray.300"
                        h="50px"
                      />
                      <Text fontSize="xs" color="gray.400" textAlign="center">Weekend</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Sunday */}
                <Card 
                  bg="gray.50" 
                  border="2px" 
                  borderColor="gray.200" 
                  minH="140px"
                  shadow="sm"
                  opacity={0.7}
                >
                  <CardBody p={3}>
                    <VStack spacing={2} align="stretch" justify="center" h="full">
                      <Text fontSize="xs" fontWeight="600" color="gray.500" textAlign="center">Sunday</Text>
                      <Input 
                        size="lg" 
                        placeholder="0.0" 
                        isDisabled
                        textAlign="center"
                        bg="gray.100"
                        borderColor="gray.300"
                        h="50px"
                      />
                      <Text fontSize="xs" color="gray.400" textAlign="center">Weekend</Text>
                    </VStack>
                  </CardBody>
                </Card>
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
                       <Text fontSize="lg" fontWeight="700" color="blue.600">32.5</Text>
                       <Text fontSize="xs" color="gray.500">Hours</Text>
                     </VStack>
                     <VStack align="center" spacing={1}>
                       <Text fontSize="lg" fontWeight="700" color="green.600">6.5</Text>
                       <Text fontSize="xs" color="gray.500">Avg/Day</Text>
                     </VStack>
                     <VStack align="center" spacing={1}>
                       <Text fontSize="lg" fontWeight="700" color="orange.600">0.0</Text>
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
