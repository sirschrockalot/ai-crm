import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Text, Heading, SimpleGrid, Card, CardBody, HStack, VStack, Icon } from '@chakra-ui/react';
import { DashboardLayout } from '../../components/dashboard';
import { 
  FaHandshake, 
  FaExclamationTriangle, 
  FaCalendarAlt, 
  FaPhone
} from 'react-icons/fa';
import { Deal } from '../../components/dashboard/DealPipeline';

// Dynamically import DealPipeline with SSR disabled to avoid AG Grid SSR issues
const DealPipeline = dynamic(
  () => import('../../components/dashboard/DealPipeline').then((mod) => mod.DealPipeline),
  { ssr: false }
);

// Temporary mock data for the disposition deal pipeline table
// Using actual lead IDs so they can be found when editing
const mockDispositionDeals: Deal[] = [
  {
    id: '1', // Matches lead ID '1' from mockLeads
    address: '123 Main Street, Austin',
    status: 'new-contract',
    priority: 'high',
    buyer: 'Primary Buyer Group',
    price: 450000,
    profit: 122000,
    inspectionEnds: new Date('2024-12-20'),
    closingDate: new Date('2025-01-15'),
    lastUpdated: new Date('2024-12-15'),
    assignedTo: 'Dispo Team',
    notes: '$450k ARV • 3 bed, 2 bath • 1,800 sq ft',
  },
  {
    id: '2', // Matches lead ID '2' from mockLeads
    address: '456 Oak Avenue, Dallas',
    status: 'active-disposition',
    priority: 'medium',
    buyer: 'Cash Buyers LLC',
    price: 380000,
    profit: 94000,
    inspectionEnds: new Date('2024-12-19'),
    closingDate: new Date('2025-01-10'),
    lastUpdated: new Date('2024-12-14'),
    assignedTo: 'Dispo Team',
    notes: '$380k ARV • 2 bed, 1 bath • 1,200 sq ft',
  },
  {
    id: '3', // Matches lead ID '3' from mockLeads
    address: '789 Pine Street, Houston',
    status: 'assigned',
    priority: 'high',
    buyer: 'Retail Buyer',
    price: 520000,
    profit: 130000,
    inspectionEnds: new Date('2024-12-18'),
    closingDate: new Date('2025-01-05'),
    lastUpdated: new Date('2024-12-13'),
    assignedTo: 'David Chen',
    notes: '$520k ARV • 4 bed, 2.5 bath • 2,100 sq ft',
  },
];

const DispositionDashboard: React.FC = () => {
  const handleDealEdit = (deal: Deal) => {
    // Open the lead detail page in a new tab
    // Assuming deal.id corresponds to lead.id
    const leadUrl = `/leads/${deal.id}`;
    window.open(leadUrl, '_blank');
  };

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

      {/* Deal Pipeline Section - Main Focus */}
      <Box mb={8}>
        <DealPipeline deals={mockDispositionDeals} onDealClick={handleDealEdit} />
      </Box>
    </DashboardLayout>
  );
};

export default DispositionDashboard;
