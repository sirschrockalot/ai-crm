import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  useToast, 
  Divider, 
  Avatar, 
  Grid, 
  Spinner, 
  Alert, 
  AlertIcon,
  Badge,
  Button,
  SimpleGrid,
  Flex,
  IconButton,
  Textarea,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  InputGroup,
  InputLeftElement,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiPhone, 
  FiMessageSquare, 
  FiMail, 
  FiFileText, 
  FiCalendar, 
  FiX,
  FiEdit,
  FiPlus,
  FiUser,
  FiDollarSign,
  FiFile,
  FiMessageCircle,
  FiClock,
  FiUsers,
  FiZap,
  FiSettings,
  FiBookmark,
  FiChevronRight,
  FiMapPin,
  FiHome,
  FiStar,
  FiCheckCircle,
  FiAlertCircle,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import { LeadsLayout } from '../../components/leads';
import { Card as UICard, Button as UIButton, Badge as UIBadge, Modal as UIModal } from '../../components/ui';
import { LeadForm } from '../../components/forms';
import { useLeads } from '../../hooks/services/useLeads';
import { Lead, LeadStatus, PropertyType } from '../../types';

const LeadDetailPage: React.FC = () => {
  const router = useRouter();
  const { id, tab, action } = router.query;
  const { leads, loading, error, fetchLeads, updateLead } = useLeads();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const toast = useToast();

  // Route guard - redirect if no ID
  useEffect(() => {
    if (router.isReady && !id) {
      router.push('/leads');
    }
  }, [router.isReady, id, router]);

  useEffect(() => {
    if (id && leads.length > 0) {
      const foundLead = leads.find(l => l.id === id);
      setLead(foundLead || null);
    }
  }, [id, leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleUpdateLead = async (data: any) => {
    if (!lead) return;
    setIsLoading(true);
    try {
      await updateLead(lead.id, data);
      toast({
        title: 'Lead updated successfully',
        status: 'success',
        duration: 3000,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error updating lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast({
        title: 'Note added',
        description: 'Note has been added successfully',
        status: 'success',
        duration: 3000,
      });
      setNewNote('');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: 'Message sent',
        description: 'Message has been sent successfully',
        status: 'success',
        duration: 3000,
      });
      setNewMessage('');
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'green';
      case 'converted': return 'purple';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const getPropertyTypeColor = (type: PropertyType) => {
    switch (type) {
      case 'single_family': return 'blue';
      case 'multi_family': return 'green';
      case 'commercial': return 'purple';
      case 'land': return 'orange';
      default: return 'gray';
    }
  };

  if (loading || !router.isReady) {
    return (
      <LeadsLayout loading={true} loadingMessage="Loading lead details...">
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading lead details...</Text>
        </VStack>
      </LeadsLayout>
    );
  }

  if (error) {
    return (
      <LeadsLayout error={error}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="semibold">Error loading lead</Text>
            <Text fontSize="sm">{error}</Text>
            <Button size="sm" onClick={() => router.push('/leads')}>
              Back to Leads
            </Button>
          </VStack>
        </Alert>
      </LeadsLayout>
    );
  }

  if (!lead) {
    return (
      <LeadsLayout>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="semibold">Lead not found</Text>
            <Text fontSize="sm">The requested lead could not be found.</Text>
            <Button size="sm" onClick={() => router.push('/leads')}>
              Back to Leads
            </Button>
          </VStack>
        </Alert>
      </LeadsLayout>
    );
  }

  return (
    <LeadsLayout>
      <Container maxW="1400px" px={8} py={6}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          spacing="8px" 
          separator={<FiChevronRight color="gray.500" />}
          mb={6}
          color="gray.500"
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/leads" color="blue.500">Leads</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Text color="gray.500">{lead.firstName} {lead.lastName} - {lead.address}</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Lead Header */}
        <Box bg="white" borderRadius="12px" p={8} mb={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
          <Flex justify="space-between" align="flex-start" mb={6}>
            <Box>
              <Heading size="lg" mb={2}>
                {lead.firstName} {lead.lastName}
              </Heading>
              <Text color="gray.600" fontSize="lg">
                {lead.address}, {lead.city}, {lead.state} {lead.zipCode}
              </Text>
            </Box>
            <VStack align="end" spacing={2}>
              <Badge 
                colorScheme={getStatusColor(lead.status)} 
                size="lg" 
                px={4} 
                py={2} 
                borderRadius="full"
              >
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
              <Badge colorScheme="red" px={3} py={1} borderRadius="md">
                High Priority
              </Badge>
            </VStack>
          </Flex>

          {/* Lead Meta Information */}
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6} mb={6} p={6} bg="gray.50" borderRadius="8px">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Phone</Text>
              <Text fontWeight="600">{lead.phone}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Email</Text>
              <Text fontWeight="600">{lead.email}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Property Type</Text>
              <Text fontWeight="600">{lead.propertyType.replace('_', ' ')}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Estimated Value</Text>
              <Text fontWeight="600">${lead.estimatedValue.toLocaleString()}</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Motivation</Text>
              <Text fontWeight="600">Relocation</Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="500">Timeline</Text>
              <Text fontWeight="600">30-60 days</Text>
            </VStack>
          </SimpleGrid>

          {/* Quick Actions */}
          <HStack spacing={3} flexWrap="wrap">
            <Button leftIcon={<FiPhone />} colorScheme="blue" size="md">
              Call Lead
            </Button>
            <Button leftIcon={<FiMessageSquare />} variant="outline" size="md">
              Send SMS
            </Button>
            <Button leftIcon={<FiMail />} variant="outline" size="md">
              Send Email
            </Button>
            <Button leftIcon={<FiFileText />} colorScheme="green" size="md">
              Create Offer
            </Button>
            <Button leftIcon={<FiCalendar />} variant="outline" size="md">
              Schedule Follow-up
            </Button>
            <Button leftIcon={<FiX />} colorScheme="red" size="md">
              Mark as Dead
            </Button>
          </HStack>
        </Box>

        {/* Status Banner */}
        <Box 
          bg="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
          border="1px solid"
          borderColor="yellow.400"
          borderRadius="12px"
          p={6}
          mb={6}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Badge bg="yellow.500" color="white" px={4} py={2} borderRadius="full" fontSize="sm">
                Under Contract
              </Badge>
              <Box>
                <Text fontSize="lg" fontWeight="600" color="yellow.800">Active Disposition</Text>
                <Text fontSize="sm" color="yellow.700">Contract signed 7 days ago • Marketing campaign active</Text>
              </Box>
            </HStack>
            <HStack spacing={3}>
              <Button leftIcon={<FiPhone />} variant="outline" size="sm" colorScheme="yellow">
                Launch Campaign
              </Button>
              <Button leftIcon={<FiCalendar />} variant="outline" size="sm" colorScheme="yellow">
                Schedule Showing
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Main Grid Layout */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
          {/* Left Column */}
          <VStack spacing={6} align="stretch">
            {/* Lead Information Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                    <FiUser size="16" />
                  </Box>
                  <Heading size="md">Lead Information</Heading>
                </HStack>
                <Button leftIcon={<FiEdit />} variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </Button>
              </Flex>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Property Address</Text>
                  <Text fontWeight="600">{lead.address}, {lead.city}, {lead.state} {lead.zipCode}</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Lead Source</Text>
                  <Text fontWeight="600">Direct Mail Campaign</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Owner Name</Text>
                  <Text fontWeight="600">{lead.firstName} {lead.lastName}</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Phone Number</Text>
                  <Text fontWeight="600">{lead.phone}</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Email Address</Text>
                  <Text fontWeight="600">{lead.email}</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Property Type</Text>
                  <Text fontWeight="600">{lead.propertyType.replace('_', ' ')}</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Bedrooms/Bathrooms</Text>
                  <Text fontWeight="600">3 bed, 2 bath</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Square Footage</Text>
                  <Text fontWeight="600">1,800 sq ft</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Occupied</Text>
                  <Text fontWeight="600">Yes</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Property Access</Text>
                  <Text fontWeight="600">Owner provides access</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Assigned Agent</Text>
                  <Text fontWeight="600">Sarah Johnson</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Created Date</Text>
                  <Text fontWeight="600">{lead.createdAt.toLocaleDateString()}</Text>
                </VStack>
              </SimpleGrid>

              <HStack spacing={3} mt={4}>
                <Button leftIcon={<FiPhone />} colorScheme="green" size="sm">
                  Call Owner
                </Button>
                <Button leftIcon={<FiMessageSquare />} colorScheme="blue" size="sm">
                  Send SMS
                </Button>
                <Button leftIcon={<FiMail />} variant="outline" size="sm">
                  Send Email
                </Button>
              </HStack>
            </Box>

            {/* Transaction Details Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                    <FiDollarSign size="16" />
                  </Box>
                  <Heading size="md">Transaction Details</Heading>
                </HStack>
                <Button leftIcon={<FiEdit />} variant="outline" size="sm">
                  Edit
                </Button>
              </Flex>

              {/* Financial Summary */}
              <Box 
                bg="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
                border="1px solid"
                borderColor="green.200"
                borderRadius="12px"
                p={6}
                mb={6}
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="lg" fontWeight="600" color="green.800">Financial Summary</Text>
                  <Badge bg="green.500" color="white" px={4} py={2} borderRadius="full" fontSize="sm">
                    $108k Profit
                  </Badge>
                </Flex>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Acquisition Price</Text>
                    <Text fontSize="lg" fontWeight="700">$295,000</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Listing Price</Text>
                    <Text fontSize="lg" fontWeight="700">$410,000</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Commission</Text>
                    <Text fontSize="lg" fontWeight="700">$7,000</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Repair Costs</Text>
                    <Text fontSize="lg" fontWeight="700">$0</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Closing Costs</Text>
                    <Text fontSize="lg" fontWeight="700">$8,000</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="sm" color="green.700">Net Profit</Text>
                    <Text fontSize="lg" fontWeight="700" color="green.600">$100,000</Text>
                  </VStack>
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Contract Date</Text>
                  <Text fontWeight="600">December 10, 2024</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Days Under Contract</Text>
                  <Text fontWeight="600" color="orange.500">7 days</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Inspection Date</Text>
                  <Text fontWeight="600">December 15, 2024</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Closing Date</Text>
                  <Text fontWeight="600">January 10, 2025</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">ARV (After Repair Value)</Text>
                  <Text fontWeight="600">$410,000</Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Estimated Repairs</Text>
                  <Text fontWeight="600">$15,000</Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Documents Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                    <FiFile size="16" />
                  </Box>
                  <Heading size="md">Documents</Heading>
                </HStack>
                <Button leftIcon={<FiPlus />} variant="outline" size="sm">
                  Upload
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                {[
                  { name: 'Purchase Contract', type: 'PDF', size: '2.3 MB', date: 'Dec 10, 2024', icon: FiFileText },
                  { name: 'Property Photos', type: 'ZIP', size: '15.7 MB', date: 'Dec 10, 2024', icon: FiFile },
                  { name: 'Market Analysis', type: 'PDF', size: '1.1 MB', date: 'Dec 11, 2024', icon: FiFile },
                  { name: 'Inspection Report', type: 'PDF', size: '3.2 MB', date: 'Dec 15, 2024', icon: FiFile },
                  { name: 'Repair Estimate', type: 'PDF', size: '0.8 MB', date: 'Dec 12, 2024', icon: FiFile },
                  { name: 'Title Report', type: 'PDF', size: '1.5 MB', date: 'Dec 13, 2024', icon: FiFile }
                ].map((doc, index) => (
                  <Box 
                    key={index}
                    bg="gray.50" 
                    border="1px solid" 
                    borderColor="gray.200" 
                    borderRadius="8px" 
                    p={4} 
                    cursor="pointer"
                    _hover={{ bg: 'gray.100', borderColor: 'gray.300' }}
                    transition="all 0.2s"
                  >
                    <Box 
                      w={10} 
                      h={10} 
                      bg="purple.500" 
                      color="white" 
                      borderRadius="8px" 
                      display="flex" 
                      align="center" 
                      justify="center"
                      mb={3}
                    >
                      <doc.icon size="20" />
                    </Box>
                    <Text fontWeight="600" color="gray.800" mb={1} fontSize="sm">{doc.name}</Text>
                    <Text fontSize="xs" color="gray.600">{doc.type} • {doc.size} • {doc.date}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Communication History Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                    <FiMessageCircle size="16" />
                  </Box>
                  <Heading size="md">Communication History</Heading>
                </HStack>
                <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
                  New Message
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {[
                  { author: 'John Smith', time: '2 hours ago', message: 'Hi, I\'m interested in selling my house quickly. I\'m relocating for work and need to move out by the end of the month. The house needs some repairs but I\'m willing to sell below market value.', type: 'SMS' },
                  { author: 'Sarah Johnson (You)', time: '1 hour ago', message: 'Hi John, thanks for reaching out. I\'d love to help you sell your house quickly. Can you tell me a bit more about the repairs needed and what you\'re hoping to get for the property?', type: 'SMS' },
                  { author: 'John Smith', time: '45 minutes ago', message: 'The kitchen needs new countertops and the master bathroom needs updating. There\'s also some water damage in the basement. I\'m thinking around $400k but I\'m flexible if you can close quickly.', type: 'SMS' }
                ].map((comm, index) => (
                  <HStack key={index} spacing={4} p={4} bg="gray.50" borderRadius="8px">
                    <Avatar size="md" name={comm.author} bg="blue.500" />
                    <Box flex={1}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="600" color="gray.800">{comm.author}</Text>
                        <Text fontSize="sm" color="gray.600">{comm.time}</Text>
                      </Flex>
                      <Text color="gray.700" mb={2} lineHeight="1.5">{comm.message}</Text>
                      <Badge bg="blue.100" color="blue.700" px={2} py={1} borderRadius="4px" fontSize="xs">
                        <FiMessageSquare style={{ display: 'inline', marginRight: '4px' }} />
                        {comm.type}
                      </Badge>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Activity Timeline Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                    <FiClock size="16" />
                  </Box>
                  <Heading size="md">Activity Timeline</Heading>
                </HStack>
              </Flex>

              <VStack spacing={4} align="stretch">
                {[
                  { action: 'Marketing Campaign Launched', description: 'Facebook and Instagram ads started for property listing', time: '2 hours ago', icon: FiPhone },
                  { action: 'Owner Contacted', description: 'Called owner to discuss showing schedule', time: '1 day ago', icon: FiPhone },
                  { action: 'Contract Signed', description: 'Purchase contract executed with owner', time: '7 days ago', icon: FiFileText },
                  { action: 'Property Inspection', description: 'Home inspection completed, minor issues found', time: '7 days ago', icon: FiFile },
                  { action: 'Lead Created', description: 'Lead added to system from direct mail campaign', time: '14 days ago', icon: FiPlus }
                ].map((activity, index) => (
                  <HStack key={index} spacing={4} p={4} borderBottom="1px solid" borderColor="gray.100">
                    <Box 
                      w={8} 
                      h={8} 
                      bg="purple.500" 
                      color="white" 
                      borderRadius="50%" 
                      display="flex" 
                      align="center" 
                      justify="center"
                      flexShrink={0}
                    >
                      <activity.icon size="16" />
                    </Box>
                    <Box flex={1}>
                      <Text fontWeight="600" color="gray.800" mb={1}>{activity.action}</Text>
                      <Text color="gray.600" fontSize="sm" mb={1}>{activity.description}</Text>
                      <Text color="gray.500" fontSize="xs">{activity.time}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>

          {/* Right Column */}
          <VStack spacing={6} align="stretch">
            {/* Buyer Information Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                    <FiUsers size="16" />
                  </Box>
                  <Heading size="md">Buyer Information</Heading>
                </HStack>
                <Button leftIcon={<FiPlus />} variant="outline" size="sm">
                  Add Buyer
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {[
                  { name: 'David Thompson', status: 'Interested', phone: '(555) 987-6543', email: 'david.t@email.com', budget: '$400k - $450k', timeline: '30-60 days', preference: '3+ beds, 2+ baths', matchScore: '95%' },
                  { name: 'Jennifer Lee', status: 'Scheduled', phone: '(555) 456-7890', email: 'jennifer.l@email.com', budget: '$380k - $420k', timeline: '45-90 days', preference: 'Family home, good schools', matchScore: '88%' }
                ].map((buyer, index) => (
                  <Box key={index} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
                    <Flex justify="space-between" align="center" mb={3}>
                      <Text fontWeight="600" color="gray.800">{buyer.name}</Text>
                      <Badge bg="green.100" color="green.700" px={2} py={1} borderRadius="12px" fontSize="xs">
                        {buyer.status}
                      </Badge>
                    </Flex>
                    <SimpleGrid columns={2} spacing={2} fontSize="sm">
                      <Flex justify="space-between">
                        <Text color="gray.600">Phone:</Text>
                        <Text fontWeight="500">{buyer.phone}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Email:</Text>
                        <Text fontWeight="500">{buyer.email}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Budget:</Text>
                        <Text fontWeight="500">{buyer.budget}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Timeline:</Text>
                        <Text fontWeight="500">{buyer.timeline}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Preference:</Text>
                        <Text fontWeight="500">{buyer.preference}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Match Score:</Text>
                        <Text fontWeight="500" color="green.600">{buyer.matchScore}</Text>
                      </Flex>
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* AI Suggestions Section */}
            <Box 
              bg="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
              borderRadius="12px"
              p={6}
              color="white"
            >
              <HStack spacing={3} mb={4}>
                <Box w={8} h={8} bg="rgba(255, 255, 255, 0.2)" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                  <FiZap size="16" />
                </Box>
                <Heading size="md">AI Suggestions</Heading>
              </HStack>

              <VStack spacing={4} align="stretch">
                {[
                  { title: 'Recommended Next Action', content: 'Schedule a property inspection within 24 hours. The lead shows high motivation and the timeline is urgent.', actions: ['Schedule Inspection', 'Dismiss'] },
                  { title: 'Communication Template', content: '"Hi John, I\'d like to schedule a quick property inspection to give you the best offer possible. Would tomorrow work for you?"', actions: ['Use Template', 'Edit'] }
                ].map((suggestion, index) => (
                  <Box key={index} bg="rgba(255, 255, 255, 0.1)" borderRadius="8px" p={4}>
                    <Text fontWeight="600" mb={2}>{suggestion.title}</Text>
                    <Text opacity="0.9" lineHeight="1.5" mb={3}>{suggestion.content}</Text>
                    <HStack spacing={2}>
                      {suggestion.actions.map((action, actionIndex) => (
                        <Button key={actionIndex} variant="outline" size="sm" bg="transparent" borderColor="rgba(255, 255, 255, 0.3)" color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>
                          {action}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Automation Status Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                    <FiSettings size="16" />
                  </Box>
                  <Heading size="md">Automation Status</Heading>
                </HStack>
              </Flex>

              <Box 
                bg="green.100" 
                border="1px solid" 
                borderColor="green.200" 
                borderRadius="8px" 
                p={4} 
                mb={4}
                display="flex"
                alignItems="center"
                gap={3}
              >
                <FiPlay size="20" color="#059669" />
                <Box>
                  <Text fontWeight="600" color="green.800">Follow-up Sequence Active</Text>
                  <Text fontSize="sm" color="green.700">Next message in 2 hours</Text>
                </Box>
              </Box>
              
              <Button variant="outline" size="sm" w="full" leftIcon={<FiPause />}>
                Pause Automation
              </Button>
            </Box>

            {/* Notes Section */}
            <Box bg="white" borderRadius="12px" p={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
              <Flex justify="space-between" align="center" mb={6} pb={4} borderBottom="2px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" align="center" justify="center">
                    <FiBookmark size="16" />
                  </Box>
                  <Heading size="md">Notes</Heading>
                </HStack>
              </Flex>

              <VStack spacing={4} align="stretch">
                <Textarea 
                  placeholder="Add a note about this lead..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  size="sm"
                  minH="100px"
                />
                <Button leftIcon={<FiPlus />} colorScheme="purple" size="sm" onClick={handleAddNote}>
                  Add Note
                </Button>

                <VStack spacing={3} align="stretch">
                  {[
                    { author: 'Sarah Johnson', time: '2 hours ago', content: 'Owner is very motivated to sell quickly. Mentioned they\'re relocating for work and need to close by end of January. This could be a great opportunity for a quick flip.' },
                    { author: 'Mike Rodriguez', time: '1 day ago', content: 'Property is in good condition overall. Minor cosmetic updates needed but nothing major. Perfect for our buyer pool.' },
                    { author: 'Sarah Johnson', time: '3 days ago', content: 'Initial contact made via phone. Owner was receptive to our offer and agreed to meet for contract signing.' }
                  ].map((note, index) => (
                    <Box key={index} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="600" color="gray.800">{note.author}</Text>
                        <Text color="gray.500" fontSize="xs">{note.time}</Text>
                      </Flex>
                      <Text color="gray.700" fontSize="sm" lineHeight="1.5">{note.content}</Text>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Grid>
      </Container>

      {/* Edit Lead Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Lead</ModalHeader>
          <ModalBody>
            <LeadForm 
              onSubmit={handleUpdateLead}
              initialData={lead}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={() => setIsEditModalOpen(false)}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LeadsLayout>
  );
};

export default LeadDetailPage; 