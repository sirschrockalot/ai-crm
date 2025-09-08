import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Badge,
  Icon,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FaPhone,
  FaUsers,
  FaClock,
  FaBullseye,
  FaPlus,
  FaList,
  FaDownload,
  FaPhoneVolume,
  FaHandshake,
  FaFileContract,
  FaExclamationTriangle,
  FaCalendar,
  FaChartLine,
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { leadQueueService } from '../../services/leadQueueService';
import { useAuth } from '../../contexts/AuthContext';

// Types for the acquisitions dashboard
interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactElement;
  color: string;
}

interface WorkflowLead {
  id: string;
  name: string;
  status: string;
  property: string;
  priority: 'high' | 'medium' | 'low';
  lastContact?: string;
  phone?: string;
  email?: string;
  source?: string;
  notes?: string;
}

interface ActivityItem {
  id: string;
  type: 'call' | 'status_change' | 'contract' | 'offer';
  text: string;
  time: string;
  icon: React.ReactElement;
  color: string;
}

interface PriorityItem {
  title: string;
  count: number;
  time: string;
  urgent?: boolean;
  icon: React.ReactElement;
}

interface PerformanceMetric {
  value: string | number;
  label: string;
  icon: React.ReactElement;
  color: string;
}

interface CallbackItem {
  id: string;
  leadName: string;
  time: string;
  date: string;
  status: 'scheduled' | 'missed' | 'urgent';
  notes?: string;
}

interface StatusUpdate {
  status: string;
  count: number;
  icon: React.ReactElement;
  color: string;
}

const AcquisitionsDashboard: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentLead, setCurrentLead] = useState<WorkflowLead | null>(null);

  // Mock data - in real app this would come from API
  const kpiMetrics: KPIMetric[] = [
    {
      title: 'New Leads',
      value: 28,
      change: 12.5,
      icon: <FaUsers />,
      color: '#3B82F6',
    },
    {
      title: 'Follow-ups Due',
      value: 15,
      change: -2.1,
      icon: <FaClock />,
      color: '#F59E0B',
    },
    {
      title: 'Conversions',
      value: 8,
      change: 15.4,
      icon: <FaHandshake />,
      color: '#10B981',
    },
    {
      title: 'Pipeline Value',
      value: '$425K',
      change: 18.7,
      icon: <FaChartLine />,
      color: '#8B5CF6',
    },
  ];

  const workflowLeads: WorkflowLead[] = [
    {
      id: '1',
      name: 'John Smith',
      status: 'New',
      property: '123 Oak Street, City, State',
      priority: 'high',
      phone: '(555) 123-4567',
      email: 'john@email.com',
      source: 'Web Form',
      notes: 'Interested in selling due to relocation',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      status: 'Contacting',
      property: '456 Pine Avenue, City, State',
      priority: 'medium',
      lastContact: '2 hours ago',
      phone: '(555) 987-6543',
      email: 'sarah@email.com',
      source: 'Phone Call',
      notes: 'Property needs repairs, motivated seller',
    },
    {
      id: '3',
      name: 'Robert Davis',
      status: 'Negotiating',
      property: '789 Elm Street, City, State',
      priority: 'high',
      lastContact: '1 hour ago',
      phone: '(555) 456-7890',
      email: 'robert@email.com',
      source: 'Referral',
      notes: 'Inherited property, wants quick sale',
    },
    {
      id: '4',
      name: 'Maria Garcia',
      status: 'Converted',
      property: '321 Maple Drive, City, State',
      priority: 'medium',
      lastContact: '30 minutes ago',
      phone: '(555) 789-0123',
      email: 'maria@email.com',
      source: 'Direct Mail',
      notes: 'Retiring, selling family home',
    },
    {
      id: '5',
      name: 'David Thompson',
      status: 'New',
      property: '654 Birch Lane, City, State',
      priority: 'high',
      phone: '(555) 321-6540',
      email: 'david@email.com',
      source: 'Referral',
      notes: 'Job transfer, needs quick sale',
    },
    {
      id: '6',
      name: 'Lisa Chen',
      status: 'Contacting',
      property: '987 Cedar Road, City, State',
      priority: 'medium',
      lastContact: '3 hours ago',
      phone: '(555) 654-3210',
      email: 'lisa@email.com',
      source: 'Online Listing',
      notes: 'Divorce settlement, motivated seller',
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'call',
      text: 'Called John Smith about 123 Oak St property',
      time: '2 minutes ago',
      icon: <FaPhone />,
      color: '#10B981',
    },
    {
      id: '2',
      type: 'contract',
      text: 'Contract sent to Mary Johnson for 456 Pine Ave',
      time: '15 minutes ago',
      icon: <FaFileContract />,
      color: '#8B5CF6',
    },
    {
      id: '3',
      type: 'offer',
      text: 'Made offer to Robert Davis for 789 Elm St',
      time: '1 hour ago',
      icon: <FaHandshake />,
      color: '#F59E0B',
    },
    {
      id: '4',
      type: 'call',
      text: 'Scheduled callback with Lisa Wilson for tomorrow',
      time: '2 hours ago',
      icon: <FaPhone />,
      color: '#3B82F6',
    },
  ];

  const todayPriorities: PriorityItem[] = [
    {
      title: 'Scheduled Callbacks',
      count: 5,
      time: 'Next: John Smith at 10:30 AM',
      urgent: true,
      icon: <FaPhone />,
    },
    {
      title: 'Follow-up Leads',
      count: 12,
      time: 'Last contacted 2+ days ago',
      icon: <FaClock />,
    },
    {
      title: 'New Leads',
      count: 8,
      time: 'Added in last 24 hours',
      icon: <FaUsers />,
    },
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      value: 23,
      label: 'Calls Made',
      icon: <FaPhone />,
      color: '#3B82F6',
    },
    {
      value: 7,
      label: 'Offers Made',
      icon: <FaHandshake />,
      color: '#10B981',
    },
    {
      value: 3,
      label: 'Contracts',
      icon: <FaFileContract />,
      color: '#8B5CF6',
    },
    {
      value: '42.9%',
      label: 'Conversion Rate',
      icon: <FaChartLine />,
      color: '#F59E0B',
    },
  ];

  // New mock data for enhanced functionality
  const callbackItems: CallbackItem[] = [
    {
      id: '1',
      leadName: 'John Smith',
      time: '10:30 AM',
      date: '2024-01-15',
      status: 'scheduled',
      notes: 'Discuss offer details',
    },
    {
      id: '2',
      leadName: 'Sarah Wilson',
      time: '2:00 PM',
      date: '2024-01-15',
      status: 'scheduled',
      notes: 'Property inspection follow-up',
    },
    {
      id: '3',
      leadName: 'Robert Davis',
      time: '9:00 AM',
      date: '2024-01-15',
      status: 'missed',
      notes: 'Contract negotiation call',
    },
    {
      id: '4',
      leadName: 'David Thompson',
      time: '11:00 AM',
      date: '2024-01-16',
      status: 'scheduled',
      notes: 'Initial contact call',
    },
    {
      id: '5',
      leadName: 'Lisa Chen',
      time: '3:30 PM',
      date: '2024-01-15',
      status: 'urgent',
      notes: 'Counter-offer discussion',
    },
  ];

  const statusUpdates: StatusUpdate[] = [
    {
      status: 'callback',
      count: 12,
      icon: <FaPhone />,
      color: '#3B82F6',
    },
    {
      status: 'offer',
      count: 8,
      icon: <FaHandshake />,
      color: '#10B981',
    },
    {
      status: 'negotiating',
      count: 5,
      icon: <FaHandshake />,
      color: '#F59E0B',
    },
    {
      status: 'contract',
      count: 3,
      icon: <FaFileContract />,
      color: '#8B5CF6',
    },
  ];

  const handleGetNextLead = async () => {
    setLoading(true);
    try {
      // Set current user for lead assignment
      if (user?.id) {
        leadQueueService.setCurrentUser(user.id);
      }
      
      const result = await leadQueueService.getNextLead();
      
      if (result.lead) {
        // Convert Lead to WorkflowLead for compatibility
        const workflowLead: WorkflowLead = {
          id: result.lead.id,
          name: `${result.lead.firstName} ${result.lead.lastName}`,
          status: result.lead.status,
          property: result.lead.propertyAddress || result.lead.address,
          priority: 'high',
          phone: result.lead.phone,
          email: result.lead.email,
          source: result.lead.source,
          notes: result.lead.notes,
        };
        
        setCurrentLead(workflowLead);
        toast({
          title: 'Lead Retrieved',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Navigate to lead detail
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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add_lead':
        router.push('/leads/new');
        break;
      case 'view_queue':
        router.push('/leads/queue');
        break;
      case 'export':
        // Handle export functionality
        toast({
          title: 'Export Started',
          description: 'Preparing lead data for export...',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  };

  const handleStatusUpdate = (status: string) => {
    if (currentLead) {
      // Update lead status
      const updatedLead = { ...currentLead, status };
      setCurrentLead(updatedLead);
      
      toast({
        title: 'Status Updated',
        description: `Updated ${currentLead.name} status to ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'No Lead Selected',
        description: 'Please get a lead first by clicking "Get Next Lead"',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCallbackAction = (callback: CallbackItem, action: 'call' | 'reschedule') => {
    switch (action) {
      case 'call':
        toast({
          title: 'Calling Lead',
          description: `Calling ${callback.leadName} at ${callback.time}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'reschedule':
        toast({
          title: 'Reschedule Callback',
          description: `Rescheduling callback for ${callback.leadName}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
    }
  };

  const handlePriorityAction = (priority: PriorityItem) => {
    if (priority.title.includes('Scheduled Callbacks')) {
      toast({
        title: 'View Callbacks',
        description: 'Opening callback calendar...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } else if (priority.title.includes('Follow-up')) {
      toast({
        title: 'View Follow-ups',
        description: 'Opening follow-up leads...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } else if (priority.title.includes('New Leads')) {
      toast({
        title: 'View New Leads',
        description: 'Opening new leads...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return '#DBEAFE';
      case 'contacting':
        return '#FEF3C7';
      case 'negotiating':
        return '#FCE7F3';
      case 'converted':
        return '#D1FAE5';
      default:
        return '#E2E8F0';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return '#1E40AF';
      case 'contacting':
        return '#92400E';
      case 'negotiating':
        return '#BE185D';
      case 'converted':
        return '#065F46';
      default:
        return '#64748B';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <Box bg="#F8FAFC" minH="100vh" p={8}>
      {/* Page Header */}
      <Box mb={8}>
        <HStack spacing={4} mb={2}>
          <Icon as={FaBullseye} color="#0F172A" boxSize={8} />
          <Text fontSize="3xl" fontWeight="700" color="#0F172A">
            Acquisitions Dashboard
          </Text>
        </HStack>
        <Text fontSize="lg" color="#64748B">
          Ready to make calls and close deals today?
        </Text>
      </Box>

      {/* Today's Priorities */}
      <Card mb={8} borderRadius="12px" border="1px solid #E2E8F0">
        <CardHeader bg="#F8FAFC" borderBottom="1px solid #E2E8F0">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FaCalendar} color="#0F172A" />
              <Text fontWeight="600" color="#0F172A">
                Today&apos;s Priorities
              </Text>
            </HStack>
            <Text color="#64748B" fontSize="sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Flex>
        </CardHeader>
        <CardBody p={6}>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            {todayPriorities.map((priority, index) => (
              <Box
                key={index}
                p={4}
                bg={priority.urgent ? '#FEF3C7' : '#F8FAFC'}
                border="1px solid"
                borderColor={priority.urgent ? '#F59E0B' : '#E2E8F0'}
                borderRadius="8px"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => handlePriorityAction(priority)}
              >
                <HStack spacing={3}>
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    bg={priority.urgent ? '#F59E0B' : '#3B82F6'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="1.2rem"
                  >
                    {priority.icon}
                  </Box>
                  <Box flex={1}>
                    <Text fontWeight="600" color="#0F172A" mb={1}>
                      {priority.title}
                    </Text>
                    <Text fontSize="xl" fontWeight="700" color="#3B82F6" mb={1}>
                      {priority.count} {priority.title.includes('Leads') ? 'leads' : 'calls'}
                    </Text>
                    <Text fontSize="sm" color="#64748B">
                      {priority.time}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Main Call Workflow - CENTRAL FOCUS */}
      <Card
        mb={8}
        borderRadius="16px"
        border="2px solid #3B82F6"
        bg="linear-gradient(135deg, #EBF4FF, #DBEAFE)"
        boxShadow="0 20px 25px rgba(59, 130, 246, 0.15)"
        position="relative"
        overflow="hidden"
      >
        <CardBody p={12} textAlign="center">
          <Box mb={8}>
            <Text fontSize="5xl" fontWeight="700" color="#0F172A" mb={2}>
              🎯 Start Making Calls
            </Text>
            <Text fontSize="xl" color="#374151" fontWeight="500">
              Click the button below to get your next lead and begin calling
            </Text>
          </Box>
          
          <VStack spacing={8}>
            <Button
              size="lg"
              bg="#0F172A"
              color="white"
              borderColor="#0F172A"
              fontSize="xl"
              px={12}
              py={6}
              borderRadius="12px"
              boxShadow="0 10px 25px rgba(0, 0, 0, 0.2)"
              _hover={{
                bg: '#1E293B',
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
              }}
              onClick={handleGetNextLead}
              isLoading={loading}
              loadingText="Getting Lead..."
              leftIcon={<FaPhone />}
            >
              Get Next Lead
            </Button>
            
            <HStack spacing={8} flexWrap="wrap" justify="center">
              <HStack
                spacing={2}
                bg="rgba(255, 255, 255, 0.95)"
                px={4}
                py={3}
                borderRadius="8px"
                backdropFilter="blur(10px)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              >
                <Icon as={FaUsers} color="#3B82F6" />
                <Text color="#0F172A" fontWeight="500">
                  <strong>12</strong> leads in your queue
                </Text>
              </HStack>
              
              <HStack
                spacing={2}
                bg="rgba(255, 255, 255, 0.95)"
                px={4}
                py={3}
                borderRadius="8px"
                backdropFilter="blur(10px)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              >
                <Icon as={FaClock} color="#3B82F6" />
                <Text color="#0F172A" fontWeight="500">
                  Avg call time: <strong>4.2 minutes</strong>
                </Text>
              </HStack>
              
              <HStack
                spacing={2}
                bg="rgba(255, 255, 255, 0.95)"
                px={4}
                py={3}
                borderRadius="8px"
                backdropFilter="blur(10px)"
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
              >
                <Icon as={FaBullseye} color="#3B82F6" />
                <Text color="#0F172A" fontWeight="500">
                  Today&apos;s goal: <strong>25 calls</strong>
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* KPI Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        {kpiMetrics.map((metric, index) => (
          <Card key={index} borderRadius="12px" border="1px solid #E2E8F0" boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)">
            <CardBody p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="sm" color="#64748B" fontWeight="500">
                  {metric.title}
                </Text>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="8px"
                  bg={metric.color}
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="1.2rem"
                >
                  {metric.icon}
                </Box>
              </Flex>
              <Text fontSize="3xl" fontWeight="700" color="#0F172A" mb={2}>
                {metric.value}
              </Text>
              <HStack spacing={1}>
                <Icon
                  as={metric.change >= 0 ? FaChartLine : FaExclamationTriangle}
                  color={metric.change >= 0 ? '#059669' : '#DC2626'}
                  boxSize={4}
                />
                <Text
                  fontSize="sm"
                  color={metric.change >= 0 ? '#059669' : '#DC2626'}
                  fontWeight="500"
                >
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </Text>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {/* Workflow Grid */}
      <Grid templateColumns="1fr 1fr" gap={8} mb={8}>
        {/* New/Contacting Leads */}
        <Card borderRadius="12px" border="1px solid #E2E8F0" overflow="hidden">
          <CardHeader bg="#F8FAFC" borderBottom="1px solid #E2E8F0">
            <Flex justify="space-between" align="center">
              <Text fontWeight="600" color="#0F172A">
                New & Contacting
              </Text>
              <Badge bg="#3B82F6" color="white" px={3} py={1} borderRadius="20px" fontSize="sm" fontWeight="600">
                {workflowLeads.filter(l => ['New', 'Contacting'].includes(l.status)).length}
              </Badge>
            </Flex>
          </CardHeader>
          <Box maxH="400px" overflowY="auto">
            {workflowLeads
              .filter(lead => ['New', 'Contacting'].includes(lead.status))
              .map((lead) => (
                <Box
                  key={lead.id}
                  p={4}
                  borderBottom="1px solid #F1F5F9"
                  cursor="pointer"
                  transition="background-color 0.2s"
                  _hover={{ bg: '#F8FAFC' }}
                  _last={{ borderBottom: 'none' }}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Text fontWeight="600" color="#0F172A">
                      {lead.name}
                    </Text>
                    <Badge
                      bg={getStatusColor(lead.status)}
                      color={getStatusTextColor(lead.status)}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="12px"
                      fontWeight="500"
                    >
                      {lead.status}
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color="#64748B" mb={2}>
                    {lead.property}
                  </Text>
                  <Flex gap={2}>
                    <Badge
                      size="sm"
                      colorScheme={lead.priority === 'high' ? 'red' : lead.priority === 'medium' ? 'orange' : 'green'}
                    >
                      {lead.priority} priority
                    </Badge>
                    {lead.lastContact && (
                      <Text fontSize="xs" color="#64748B">
                        Last: {lead.lastContact}
                      </Text>
                    )}
                  </Flex>
                </Box>
              ))}
          </Box>
        </Card>

        {/* Negotiating/Converted Leads */}
        <Card borderRadius="12px" border="1px solid #E2E8F0" overflow="hidden">
          <CardHeader bg="#F8FAFC" borderBottom="1px solid #E2E8F0">
            <Flex justify="space-between" align="center">
              <Text fontWeight="600" color="#0F172A">
                Negotiating & Converted
              </Text>
              <Badge bg="#3B82F6" color="white" px={3} py={1} borderRadius="20px" fontSize="sm" fontWeight="600">
                {workflowLeads.filter(l => ['Negotiating', 'Converted'].includes(l.status)).length}
              </Badge>
            </Flex>
          </CardHeader>
          <Box maxH="400px" overflowY="auto">
            {workflowLeads
              .filter(lead => ['Negotiating', 'Converted'].includes(lead.status))
              .map((lead) => (
                <Box
                  key={lead.id}
                  p={4}
                  borderBottom="1px solid #F1F5F9"
                  cursor="pointer"
                  transition="background-color 0.2s"
                  _hover={{ bg: '#F8FAFC' }}
                  _last={{ borderBottom: 'none' }}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <Text fontWeight="600" color="#0F172A">
                      {lead.name}
                    </Text>
                    <Badge
                      bg={getStatusColor(lead.status)}
                      color={getStatusTextColor(lead.status)}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="12px"
                      fontWeight="500"
                    >
                      {lead.status}
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color="#64748B" mb={2}>
                    {lead.property}
                  </Text>
                  <Flex gap={2}>
                    <Badge
                      size="sm"
                      colorScheme={lead.priority === 'high' ? 'red' : lead.priority === 'medium' ? 'orange' : 'green'}
                    >
                      {lead.priority} priority
                    </Badge>
                    {lead.lastContact && (
                      <Text fontSize="xs" color="#64748B">
                        Last: {lead.lastContact}
                      </Text>
                    )}
                  </Flex>
                </Box>
              ))}
          </Box>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Card mb={8} borderRadius="12px" border="1px solid #E2E8F0">
        <CardHeader>
          <Text fontWeight="600" color="#0F172A" fontSize="lg">
            Quick Actions
          </Text>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Box
              p={4}
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor="pointer"
              transition="all 0.2s"
              textAlign="center"
              _hover={{
                borderColor: '#3B82F6',
                bg: '#F8FAFC',
              }}
              onClick={() => handleQuickAction('add_lead')}
            >
              <Box
                w="48px"
                h="48px"
                borderRadius="12px"
                bg="#3B82F6"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="0 auto 0.5rem"
                fontSize="1.5rem"
              >
                <FaPlus />
              </Box>
              <Text fontWeight="600" color="#0F172A" mb={1}>
                Add New Lead
              </Text>
              <Text fontSize="sm" color="#64748B">
                Create a new lead record
              </Text>
            </Box>

            <Box
              p={4}
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor="pointer"
              transition="all 0.2s"
              textAlign="center"
              _hover={{
                borderColor: '#3B82F6',
                bg: '#F8FAFC',
              }}
              onClick={() => handleQuickAction('view_queue')}
            >
              <Box
                w="48px"
                h="48px"
                borderRadius="12px"
                bg="#10B981"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="0 auto 0.5rem"
                fontSize="1.5rem"
              >
                <FaList />
              </Box>
              <Text fontWeight="600" color="#0F172A" mb={1}>
                View Lead Queue
              </Text>
              <Text fontSize="sm" color="#64748B">
                Manage your lead pipeline
              </Text>
            </Box>

            <Box
              p={4}
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor="pointer"
              transition="all 0.2s"
              textAlign="center"
              _hover={{
                borderColor: '#3B82F6',
                bg: '#F8FAFC',
              }}
              onClick={() => handleQuickAction('export')}
            >
              <Box
                w="48px"
                h="48px"
                borderRadius="12px"
                bg="#8B5CF6"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="0 auto 0.5rem"
                fontSize="1.5rem"
              >
                <FaDownload />
              </Box>
              <Text fontWeight="600" color="#0F172A" mb={1}>
                Export Data
              </Text>
              <Text fontSize="sm" color="#64748B">
                Download lead reports
              </Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {/* Performance Section */}
      <Card mb={8} borderRadius="12px" border="1px solid #E2E8F0">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="600" color="#0F172A" fontSize="lg">
              Today&apos;s Progress
            </Text>
            <Button size="sm" colorScheme="blue" variant="outline">
              View Full Report
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            {performanceMetrics.map((metric, index) => (
              <HStack key={index} spacing={4} p={4} bg="#F8FAFC" border="1px solid #E2E8F0" borderRadius="8px">
                <Box
                  w="48px"
                  h="48px"
                  borderRadius="12px"
                  bg={metric.color}
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="1.2rem"
                >
                  {metric.icon}
                </Box>
                <Box flex={1}>
                  <Text fontSize="2xl" fontWeight="700" color="#0F172A" mb={1}>
                    {metric.value}
                  </Text>
                  <Text fontSize="sm" color="#64748B">
                    {metric.label}
                  </Text>
                </Box>
              </HStack>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Callback Calendar */}
      <Card mb={8} borderRadius="12px" border="1px solid #E2E8F0">
        <CardHeader bg="#F8FAFC" borderBottom="1px solid #E2E8F0">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FaCalendar} color="#0F172A" />
              <Text fontWeight="600" color="#0F172A" fontSize="lg">
                📅 Callback Calendar
              </Text>
            </HStack>
            <Button size="sm" colorScheme="blue" variant="outline">
              <Icon as={FaPlus} mr={2} />
              Add Callback
            </Button>
          </Flex>
        </CardHeader>
        <CardBody p={6}>
          <Grid templateColumns="2fr 1fr" gap={6}>
            {/* Calendar View */}
            <Box>
              <Text fontWeight="600" color="#0F172A" mb={4}>
                Today&apos;s Callbacks
              </Text>
              <Box
                p={4}
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
                borderRadius="8px"
                minH="200px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing={2}>
                  <Icon as={FaCalendar} color="#64748B" boxSize={8} />
                  <Text color="#64748B" fontSize="sm">
                    Calendar view coming soon
                  </Text>
                </VStack>
              </Box>
            </Box>
            
            {/* Callback List */}
            <Box>
              <Text fontWeight="600" color="#0F172A" mb={4}>
                Upcoming Callbacks
              </Text>
              <VStack spacing={3} align="stretch">
                {callbackItems.map((callback) => (
                  <Box
                    key={callback.id}
                    p={3}
                    bg="white"
                    border="1px solid #E2E8F0"
                    borderRadius="8px"
                    borderLeft="4px solid"
                    borderLeftColor={
                      callback.status === 'missed' ? '#EF4444' :
                      callback.status === 'urgent' ? '#F59E0B' : '#3B82F6'
                    }
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Flex justify="space-between" align="flex-start" mb={2}>
                      <Text fontWeight="600" color="#0F172A" fontSize="sm">
                        {callback.leadName}
                      </Text>
                      <Text fontSize="xs" color="#64748B">
                        {callback.time}
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="#64748B" mb={2}>
                      {callback.notes}
                    </Text>
                    <Flex gap={2}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        onClick={() => handleCallbackAction(callback, 'call')}
                      >
                        Call
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleCallbackAction(callback, 'reschedule')}
                      >
                        Reschedule
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {/* Quick Status Updates */}
      <Card mb={8} borderRadius="12px" border="1px solid #E2E8F0">
        <CardHeader>
          <VStack align="stretch" spacing={2}>
            <Text fontWeight="600" color="#0F172A" fontSize="lg">
              📝 Quick Status Updates
            </Text>
            <Text fontSize="sm" color="#64748B">
              After each call, quickly update the lead status
            </Text>
            <HStack spacing={4} p={3} bg="#F8FAFC" border="1px solid #E2E8F0" borderRadius="8px">
              <Text fontSize="sm" color="#64748B" fontWeight="500">
                Total Active Leads:
              </Text>
              <Text fontSize="lg" fontWeight="700" color="#3B82F6">
                {statusUpdates.reduce((sum, status) => sum + status.count, 0)}
              </Text>
            </HStack>
          </VStack>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
            {statusUpdates.map((status, index) => (
              <Box
                key={index}
                p={4}
                bg="#F8FAFC"
                border="1px solid #E2E8F0"
                borderRadius="8px"
                cursor="pointer"
                transition="all 0.2s"
                textAlign="center"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => handleStatusUpdate(status.status)}
              >
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="10px"
                  bg={status.color}
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  margin="0 auto 0.5rem"
                  fontSize="1rem"
                >
                  {status.icon}
                </Box>
                <Text fontSize="sm" color="#64748B" mb={1}>
                  {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                </Text>
                <Text fontSize="xl" fontWeight="700" color="#0F172A">
                  {status.count}
                </Text>
              </Box>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card borderRadius="12px" border="1px solid #E2E8F0">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="600" color="#0F172A" fontSize="lg">
              Recent Activity
            </Text>
            <Button size="sm" variant="ghost" colorScheme="blue">
              View All
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {recentActivity.map((activity) => (
              <HStack key={activity.id} spacing={4} p={3} borderBottom="1px solid #F1F5F9" _last={{ borderBottom: 'none' }}>
                <Box
                  w="32px"
                  h="32px"
                  borderRadius="8px"
                  bg={activity.color}
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="0.875rem"
                >
                  {activity.icon}
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" color="#0F172A" mb={1}>
                    {activity.text}
                  </Text>
                  <Text fontSize="xs" color="#64748B">
                    {activity.time}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AcquisitionsDashboard;
