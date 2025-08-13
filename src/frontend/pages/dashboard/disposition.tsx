import React from 'react';
import { Box, Text, Heading, SimpleGrid, Card, CardBody, HStack, VStack, Button, Badge, Icon, Grid } from '@chakra-ui/react';
import { DashboardLayout } from '../../components/dashboard';
import { 
  FaHandshake, 
  FaExclamationTriangle, 
  FaCalendarAlt, 
  FaPhone, 
  FaFileContract, 
  FaCheckCircle,
  FaUsers,
  FaSearch,
  FaFilter,
  FaPlus
} from 'react-icons/fa';

const DispositionDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <Box mb={8}>
        <HStack spacing={3} mb={2}>
          <Icon as={FaHandshake} color="purple.500" boxSize={6} />
          <Heading size="lg" color="gray.800">Disposition Dashboard</Heading>
        </HStack>
        <Text fontSize="lg" color="gray.600">
          Manage deals, connect with buyers, and close transactions
        </Text>
      </Box>

      {/* Priority Alerts Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaExclamationTriangle} color="red.500" boxSize={5} />
              <Heading size="md" color="gray.800">Priority Alerts</Heading>
            </HStack>
            <Text fontSize="sm" color="gray.500">December 18, 2024</Text>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {/* Urgent Alert */}
            <Card bg="red.50" border="1px" borderColor="red.200" cursor="pointer" _hover={{ bg: 'red.100' }}>
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaExclamationTriangle} color="white" boxSize={6} bg="red.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Inspection Period Ending</Text>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">3 deals</Text>
                    <Text fontSize="sm" color="gray.600">123 Oak St - expires today</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Warning Alert */}
            <Card bg="gray.50" border="1px" borderColor="gray.200" cursor="pointer" _hover={{ bg: 'gray.100' }}>
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaCalendarAlt} color="white" boxSize={6} bg="blue.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Closing This Week</Text>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">2 deals</Text>
                    <Text fontSize="sm" color="gray.600">456 Pine Ave - Friday</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Info Alert */}
            <Card bg="gray.50" border="1px" borderColor="gray.200" cursor="pointer" _hover={{ bg: 'gray.100' }}>
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaPhone} color="white" boxSize={6} bg="blue.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Buyer Follow-ups</Text>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">8 calls</Text>
                    <Text fontSize="sm" color="gray.600">High interest buyers</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Quick Actions Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack spacing={3} mb={6}>
            <Icon as={FaHandshake} color="purple.500" boxSize={5} />
            <Heading size="md" color="gray.800">Quick Actions</Heading>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card bg="gray.50" border="1px" borderColor="gray.200" cursor="pointer" _hover={{ bg: 'gray.100', borderColor: 'purple.500', transform: 'translateY(-2px)' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaFileContract} color="white" boxSize={7} bg="purple.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Get Next Deal</Text>
                    <Text fontSize="sm" color="gray.600">Start working on next priority deal</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card bg="gray.50" border="1px" borderColor="gray.200" cursor="pointer" _hover={{ bg: 'gray.100', borderColor: 'purple.500', transform: 'translateY(-2px)' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaPhone} color="white" boxSize={7} bg="purple.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Call Buyers</Text>
                    <Text fontSize="sm" color="gray.600">Contact interested buyers</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card bg="gray.50" border="1px" borderColor="gray.200" cursor="pointer" _hover={{ bg: 'gray.100', borderColor: 'purple.500', transform: 'translateY(-2px)' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaHandshake} color="white" boxSize={7} bg="purple.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Assign Deal</Text>
                    <Text fontSize="sm" color="gray.600">Match buyer to property</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card bg="gray.50" border="1px" borderColor="gray.200" cursor="pointer" _hover={{ bg: 'gray.100', borderColor: 'purple.500', transform: 'translateY(-2px)' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaCheckCircle} color="white" boxSize={7} bg="purple.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.800">Schedule Closing</Text>
                    <Text fontSize="sm" color="gray.600">Set up deal closing</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Deal Pipeline Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Icon as={FaFileContract} color="purple.500" boxSize={5} />
              <Heading size="md" color="gray.800">Deal Pipeline</Heading>
            </HStack>
            
            <HStack spacing={2} flexWrap="wrap">
              <Button size="sm" variant="outline" leftIcon={<Icon as={FaFilter} />}>
                All Statuses
              </Button>
              <Button size="sm" variant="outline" leftIcon={<Icon as={FaFilter} />}>
                All Priorities
              </Button>
              <Button size="sm" variant="outline" leftIcon={<Icon as={FaSearch} />}>
                Search deals...
              </Button>
            </HStack>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* Deal Card 1 */}
            <Card border="1px" borderColor="gray.200" _hover={{ borderColor: 'purple.500', shadow: 'md' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack justify="space-between" mb={3} p={2} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" color="gray.800">123 Oak St, Austin</Text>
                    <Badge colorScheme="blue" variant="solid">New Contract</Badge>
                  </VStack>
                  <Badge colorScheme="red" variant="solid">HIGH</Badge>
                </HStack>
                
                <VStack align="start" spacing={2} mb={4}>
                  <Text fontSize="sm" color="gray.600">$450k ARV • 3 bed, 2 bath • 1,800 sq ft</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge variant="subtle" colorScheme="gray">Contract: 12/15/2024</Badge>
                    <Badge variant="subtle" colorScheme="red">Inspection: 12/20/2024</Badge>
                    <Badge variant="subtle" colorScheme="blue">Closing: 01/15/2025</Badge>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontSize="sm" color="gray.600">Acquisition: $320k</Text>
                    <Text fontSize="sm" color="gray.600">Listing: $450k</Text>
                    <Text fontSize="sm" fontWeight="600" color="green.500">Profit: $122k</Text>
                  </HStack>
                </VStack>
                
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="purple">View</Button>
                  <Button size="sm" variant="outline">Call</Button>
                  <Button size="sm" variant="outline">Assign</Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Deal Card 2 */}
            <Card border="1px" borderColor="gray.200" _hover={{ borderColor: 'purple.500', shadow: 'md' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack justify="space-between" mb={3} p={2} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" color="gray.800">456 Pine Ave, Dallas</Text>
                    <Badge colorScheme="orange" variant="solid">Active Disposition</Badge>
                  </VStack>
                  <Badge colorScheme="orange" variant="solid">MEDIUM</Badge>
                </HStack>
                
                <VStack align="start" spacing={2} mb={4}>
                  <Text fontSize="sm" color="gray.600">$380k ARV • 2 bed, 1 bath • 1,200 sq ft</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge variant="subtle" colorScheme="gray">Contract: 12/14/2024</Badge>
                    <Badge variant="subtle" colorScheme="orange">Inspection: 12/19/2024</Badge>
                    <Badge variant="subtle" colorScheme="blue">Closing: 01/10/2025</Badge>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontSize="sm" color="gray.600">Acquisition: $280k</Text>
                    <Text fontSize="sm" color="gray.600">Listing: $380k</Text>
                    <Text fontSize="sm" fontWeight="600" color="green.500">Profit: $94k</Text>
                  </HStack>
                </VStack>
                
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="purple">View</Button>
                  <Button size="sm" variant="outline">Call</Button>
                  <Button size="sm" variant="outline">Assign</Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Deal Card 3 */}
            <Card border="1px" borderColor="gray.200" _hover={{ borderColor: 'purple.500', shadow: 'md' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack justify="space-between" mb={3} p={2} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" color="gray.800">789 Elm Dr, Houston</Text>
                    <Badge colorScheme="green" variant="solid">Assigned</Badge>
                  </VStack>
                  <Badge colorScheme="red" variant="solid">HIGH</Badge>
                </HStack>
                
                <VStack align="start" spacing={2} mb={4}>
                  <Text fontSize="sm" color="gray.600">$520k ARV • 4 bed, 2.5 bath • 2,100 sq ft</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge variant="subtle" colorScheme="gray">Contract: 12/13/2024</Badge>
                    <Badge variant="subtle" colorScheme="green">Inspection: 12/18/2024</Badge>
                    <Badge variant="subtle" colorScheme="blue">Closing: 01/05/2025</Badge>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    <Text fontSize="sm" color="gray.600">Acquisition: $380k</Text>
                    <Text fontSize="sm" color="gray.600">Listing: $520k</Text>
                    <Text fontSize="sm" fontWeight="600" color="green.500">Profit: $130k</Text>
                  </HStack>
                  <Text fontSize="sm" color="purple.600" fontWeight="500">Assigned to: David Chen</Text>
                </VStack>
                
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="purple">View</Button>
                  <Button size="sm" variant="outline">Call</Button>
                  <Button size="sm" variant="outline">Schedule</Button>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Buyer Management Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaUsers} color="purple.500" boxSize={5} />
              <Heading size="md" color="gray.800">Buyer Management</Heading>
            </HStack>
            <Button size="sm" colorScheme="purple" leftIcon={<Icon as={FaPlus} />}>
              Add Buyer
            </Button>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* Buyer Card 1 */}
            <Card bg="blue.50" border="1px" borderColor="blue.200" _hover={{ bg: 'blue.100' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" color="gray.800">David Chen</Text>
                    <Text fontSize="sm" color="gray.600">Cash Buyer</Text>
                  </VStack>
                  <Badge colorScheme="green" variant="solid">High Interest</Badge>
                </HStack>
                
                <VStack align="start" spacing={2} mb={4}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Budget:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">$400k - $600k</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Areas:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">Austin, Dallas</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Last Contact:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">2 days ago</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Interested In:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">3 bed, 2 bath</Text>
                  </HStack>
                </VStack>
                
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="purple">Call</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </HStack>
              </CardBody>
            </Card>

            {/* Buyer Card 2 */}
            <Card bg="gray.50" border="1px" borderColor="gray.200" _hover={{ bg: 'gray.100' }} transition="all 0.3s">
              <CardBody p={4}>
                <HStack justify="space-between" mb={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" color="gray.800">Lisa Thompson</Text>
                    <Text fontSize="sm" color="gray.600">Investor</Text>
                  </VStack>
                  <Badge colorScheme="orange" variant="solid">Medium Interest</Badge>
                </HStack>
                
                <VStack align="start" spacing={2} mb={4}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Budget:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">$300k - $500k</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Areas:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">Houston</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Last Contact:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">1 week ago</Text>
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Interested In:</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">Fixer uppers</Text>
                  </HStack>
                </VStack>
                
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="purple">Call</Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Performance Metrics */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaHandshake} color="purple.500" boxSize={5} />
              <Heading size="md" color="gray.800">Today&apos;s Performance</Heading>
            </HStack>
            <Button size="sm" colorScheme="purple">View Full Report</Button>
          </HStack>
          
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaFileContract} color="white" boxSize={6} bg="purple.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">16</Text>
                    <Text fontSize="sm" color="gray.600">Active Deals</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaPhone} color="white" boxSize={6} bg="green.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">12</Text>
                    <Text fontSize="sm" color="gray.600">Buyer Calls</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaHandshake} color="white" boxSize={6} bg="orange.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">3</Text>
                    <Text fontSize="sm" color="gray.600">Deals Assigned</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaCheckCircle} color="white" boxSize={6} bg="green.600" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">2</Text>
                    <Text fontSize="sm" color="gray.600">Closings This Week</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Activity Section */}
      <Card bg="white" shadow="md">
        <CardBody p={6}>
          <HStack justify="space-between" mb={6}>
            <Heading size="md" color="gray.800">Recent Activity</Heading>
            <Button size="sm" variant="outline">View All</Button>
          </HStack>
          
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} p={3} borderBottom="1px" borderColor="gray.100">
              <Icon as={FaPhone} color="white" boxSize={4} bg="green.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">Called David Chen about 123 Oak St property</Text>
                <Text fontSize="xs" color="gray.500">30 minutes ago</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={4} p={3} borderBottom="1px" borderColor="gray.100">
              <Icon as={FaHandshake} color="white" boxSize={4} bg="purple.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">Assigned 456 Pine Ave to Lisa Thompson</Text>
                <Text fontSize="xs" color="gray.500">2 hours ago</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={4} p={3} borderBottom="1px" borderColor="gray.100">
              <Icon as={FaCheckCircle} color="white" boxSize={4} bg="orange.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">Scheduled closing for 789 Elm St</Text>
                <Text fontSize="xs" color="gray.500">4 hours ago</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={4} p={3}>
              <Icon as={FaFileContract} color="white" boxSize={4} bg="blue.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">New contract received for 321 Maple Rd</Text>
                <Text fontSize="xs" color="gray.500">1 day ago</Text>
              </VStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default DispositionDashboard;
