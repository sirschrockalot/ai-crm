import React, { useState, useEffect } from 'react';
import { Box, Text, Heading, SimpleGrid, Card, CardBody, HStack, VStack, Button, Badge, Icon, Grid, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '../../components/dashboard';
import { leadQueueService, LeadQueueStats } from '../../services/leadQueueService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCalendarAlt, 
  FaPhone, 
  FaClock, 
  FaUserPlus, 
  FaBullseye, 
  FaUsers, 
  FaCrosshairs,
  FaDollarSign,
  FaHandshake,
  FaFileContract,
  FaPercentage,
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';

const AcquisitionsDashboard: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [queueStats, setQueueStats] = useState<LeadQueueStats>({
    totalLeads: 0,
    newLeads: 0,
    callbackLeads: 0,
    followUpLeads: 0,
    avgCallTime: 0,
    todayGoal: 0,
    callsMade: 0,
  });

  useEffect(() => {
    // Set current user for lead assignment
    if (user?.id) {
      leadQueueService.setCurrentUser(user.id);
    }
    
    // Load initial queue stats
    loadQueueStats();
  }, [user]);

  const loadQueueStats = () => {
    const stats = leadQueueService.getQueueStats();
    setQueueStats(stats);
  };

  const handleGetNextLead = async () => {
    setLoading(true);
    try {
      const result = await leadQueueService.getNextLead();
      
      if (result.lead) {
        // Update stats
        setQueueStats(result.stats);
        
        toast({
          title: 'Lead Retrieved',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Navigate to lead detail page
        router.push(`/leads/${result.lead.id}`);
      } else {
        toast({
          title: 'No Leads Available',
          description: result.message,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get next lead',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <Box mb={8}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <HStack spacing={3}>
              <Icon as={FaBullseye} color="blue.500" boxSize={5} />
              <Heading size="lg" color="gray.800">Acquisitions Dashboard</Heading>
            </HStack>
          </VStack>
          <Text fontSize="lg" color="gray.600" fontWeight="medium">
            December 18, 2024
          </Text>
        </HStack>
      </Box>

      {/* Today's Priorities Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {/* Scheduled Callbacks Card */}
        <Card bg="yellow.400" color="white" shadow="md">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Icon as={FaPhone} boxSize={5} />
                <Text fontWeight="semibold" fontSize="lg">Scheduled Callbacks</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">{queueStats.callbackLeads} calls</Text>
              <Text fontSize="sm" opacity={0.9}>Scheduled callbacks pending</Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Follow-up Leads Card */}
        <Card bg="blue.400" color="white" shadow="md">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Icon as={FaClock} boxSize={5} />
                <Text fontWeight="semibold" fontSize="lg">Follow-up Leads</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">{queueStats.followUpLeads} leads</Text>
              <Text fontSize="sm" opacity={0.9}>Last contacted 2+ days ago</Text>
            </VStack>
          </CardBody>
        </Card>

        {/* New Leads Card */}
        <Card bg="blue.500" color="white" shadow="md">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Icon as={FaUserPlus} boxSize={5} />
                <Text fontWeight="semibold" fontSize="lg">New Leads</Text>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">{queueStats.newLeads} leads</Text>
              <Text fontSize="sm" opacity={0.9}>Added in last 24 hours</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Start Making Calls Section */}
      <Card bg="white" shadow="lg" mb={8} bgGradient="linear(to-r, blue.50, blue.100)">
        <CardBody p={8}>
          <VStack spacing={6} align="center">
            <HStack spacing={3}>
              <Icon as={FaBullseye} color="red.500" boxSize={6} />
              <Heading size="lg" color="gray.800">Start Making Calls</Heading>
            </HStack>
            
            <Text fontSize="lg" color="gray.600" textAlign="center" maxW="md">
              Click the button below to get your next lead and begin calling
            </Text>
            
            <Button
              size="lg"
              colorScheme="blue"
              leftIcon={<Icon as={FaPhone} />}
              px={8}
              py={4}
              fontSize="lg"
              fontWeight="semibold"
              onClick={handleGetNextLead}
              isLoading={loading}
              loadingText="Getting Lead..."
            >
              Get Next Lead
            </Button>
            
            {/* Call Statistics */}
            <HStack spacing={8} mt={4}>
              <HStack spacing={2}>
                <Icon as={FaUsers} color="gray.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">{queueStats.totalLeads} leads in your queue</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaClock} color="gray.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Avg call time: {queueStats.avgCallTime} minutes</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaCrosshairs} color="gray.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">Today&apos;s goal: {queueStats.todayGoal} calls</Text>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Callback Calendar Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaCalendarAlt} color="blue.500" boxSize={5} />
              <Heading size="md" color="gray.800">Callback Calendar</Heading>
            </HStack>
            
            <HStack spacing={3}>
              {/* Date Filters */}
              <HStack spacing={2}>
                <Button size="sm" colorScheme="blue" variant="solid">Today</Button>
                <Button size="sm" variant="outline">This Week</Button>
                <Button size="sm" variant="outline">This Month</Button>
              </HStack>
              
              <Button size="sm" colorScheme="blue" variant="outline" leftIcon={<Icon as={FaPlus} />}>
                + Add Callback
              </Button>
            </HStack>
          </HStack>
          
          {/* Upcoming Callbacks */}
          <Box>
            <Text fontWeight="semibold" color="gray.700" mb={4}>Upcoming Callbacks</Text>
            <Box 
              minH="200px" 
              border="2px dashed" 
              borderColor="gray.200" 
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500" fontSize="sm">No upcoming callbacks scheduled</Text>
            </Box>
          </Box>
        </CardBody>
      </Card>

      {/* Quick Status Updates Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <VStack align="start" spacing={4} mb={6}>
            <HStack spacing={3}>
              <Icon as={FaExclamationTriangle} color="blue.500" boxSize={5} />
              <Heading size="md" color="gray.800">Quick Status Updates</Heading>
            </HStack>
            <Text fontSize="sm" color="gray.600">After each call, quickly update the lead status</Text>
            
            {/* Total Active Leads */}
            <HStack spacing={2} p={3} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600" fontWeight="500">Total Active Leads:</Text>
              <Text fontSize="lg" fontWeight="700" color="blue.600">28</Text>
            </HStack>
          </VStack>
          
          {/* Status Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card shadow="sm" cursor="pointer" _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}>
              <CardBody textAlign="center" p={4}>
                <Icon as={FaPhone} color="blue.500" boxSize={5} mb={2} />
                <Text fontSize="sm" color="gray.600" mb={1}>Call Back</Text>
                <Text fontSize="xl" fontWeight="700" color="gray.800">12</Text>
              </CardBody>
            </Card>
            
            <Card shadow="sm" cursor="pointer" _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}>
              <CardBody textAlign="center" p={4}>
                <Icon as={FaDollarSign} color="green.500" boxSize={5} mb={2} />
                <Text fontSize="sm" color="gray.600" mb={1}>Offer Made</Text>
                <Text fontSize="xl" fontWeight="700" color="gray.800">8</Text>
              </CardBody>
            </Card>
            
            <Card shadow="sm" cursor="pointer" _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}>
              <CardBody textAlign="center" p={4}>
                <Icon as={FaHandshake} color="orange.500" boxSize={5} mb={2} />
                <Text fontSize="sm" color="gray.600" mb={1}>Negotiating Offer</Text>
                <Text fontSize="xl" fontWeight="700" color="gray.800">5</Text>
              </CardBody>
            </Card>
            
            <Card shadow="sm" cursor="pointer" _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}>
              <CardBody textAlign="center" p={4}>
                <Icon as={FaFileContract} color="purple.500" boxSize={5} mb={2} />
                <Text fontSize="sm" color="gray.600" mb={1}>Contract Out</Text>
                <Text fontSize="xl" fontWeight="700" color="gray.800">3</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Performance Section */}
      <Card bg="white" shadow="md" mb={8}>
        <CardBody p={6}>
          <HStack justify="space-between" mb={6}>
            <HStack spacing={3}>
              <Icon as={FaBullseye} color="blue.500" boxSize={5} />
              <Heading size="md" color="gray.800">Today&apos;s Progress</Heading>
            </HStack>
            <Button size="sm" colorScheme="blue">View Full Report</Button>
          </HStack>
          
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaPhone} color="white" boxSize={6} bg="blue.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">{queueStats.callsMade}</Text>
                    <Text fontSize="sm" color="gray.600">Calls Made</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaHandshake} color="white" boxSize={6} bg="green.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">7</Text>
                    <Text fontSize="sm" color="gray.600">Offers Made</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaFileContract} color="white" boxSize={6} bg="purple.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">3</Text>
                    <Text fontSize="sm" color="gray.600">Contracts</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card shadow="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={FaPercentage} color="white" boxSize={6} bg="orange.500" p={2} borderRadius="md" />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="700" color="gray.800">42.9%</Text>
                    <Text fontSize="sm" color="gray.600">Conversion Rate</Text>
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
                <Text fontSize="sm" color="gray.800">Called John Smith about 123 Oak St property</Text>
                <Text fontSize="xs" color="gray.500">2 minutes ago</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={4} p={3} borderBottom="1px" borderColor="gray.100">
              <Icon as={FaFileContract} color="white" boxSize={4} bg="purple.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">Contract sent to Mary Johnson for 456 Pine Ave</Text>
                <Text fontSize="xs" color="gray.500">15 minutes ago</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={4} p={3} borderBottom="1px" borderColor="gray.100">
              <Icon as={FaHandshake} color="white" boxSize={4} bg="orange.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">Made offer to Robert Davis for 789 Elm St</Text>
                <Text fontSize="xs" color="gray.500">1 hour ago</Text>
              </VStack>
            </HStack>
            
            <HStack spacing={4} p={3}>
              <Icon as={FaPhone} color="white" boxSize={4} bg="blue.500" p={2} borderRadius="md" />
              <VStack align="start" spacing={1} flex={1}>
                <Text fontSize="sm" color="gray.800">Scheduled callback with Lisa Wilson for tomorrow</Text>
                <Text fontSize="xs" color="gray.500">2 hours ago</Text>
              </VStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default AcquisitionsDashboard;
