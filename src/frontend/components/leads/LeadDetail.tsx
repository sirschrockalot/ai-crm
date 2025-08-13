import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Button,
  IconButton,
  useColorModeValue,
  Divider,
  Grid,
  Tooltip,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiDollarSign,
  FiUser,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiActivity,
  FiHome,
} from 'react-icons/fi';

// Import types
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  propertyAddress?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'single_family' | 'multi_family' | 'commercial' | 'land';
  estimatedValue: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  notes?: string;
  source?: string;
  company?: string;
  score?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();
  
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    if (priority >= 4) return 'yellow';
    return 'green';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'yellow';
      case 'qualified':
        return 'green';
      case 'converted':
        return 'purple';
      case 'lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPropertyTypeColor = (propertyType: string) => {
    switch (propertyType.toLowerCase()) {
      case 'single_family':
        return 'blue';
      case 'multi_family':
        return 'purple';
      case 'commercial':
        return 'teal';
      case 'land':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCall = () => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
      toast({
        title: 'Initiating call',
        description: `Calling ${lead.firstName} ${lead.lastName}`,
        status: 'info',
        duration: 2000,
      });
    }
  };

  const handleEmail = () => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_self');
      toast({
        title: 'Opening email',
        description: `Composing email to ${lead.email}`,
        status: 'info',
        duration: 2000,
      });
    }
  };

  const handleEdit = () => {
    onEdit?.(lead);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${lead.firstName} ${lead.lastName}?`)) {
      onDelete?.(lead);
      onClose();
      toast({
        title: 'Lead deleted',
        description: `${lead.firstName} ${lead.lastName} has been deleted`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <HStack spacing={3}>
                <Avatar size="lg" name={`${lead.firstName} ${lead.lastName}`} bg="blue.500" />
                <VStack align="start" spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    {lead.firstName} {lead.lastName}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    <Badge colorScheme={getPropertyTypeColor(lead.propertyType)}>
                      {lead.propertyType.replace('_', ' ')}
                    </Badge>
                    {lead.score && (
                      <Badge colorScheme={getPriorityColor(lead.score)}>
                        Score: {lead.score}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
            <HStack spacing={2}>
              <Tooltip label="Call">
                <IconButton
                  icon={<FiPhone />}
                  aria-label="Call lead"
                  onClick={handleCall}
                  colorScheme="green"
                  variant="ghost"
                />
              </Tooltip>
              <Tooltip label="Email">
                <IconButton
                  icon={<FiMail />}
                  aria-label="Email lead"
                  onClick={handleEmail}
                  colorScheme="blue"
                  variant="ghost"
                />
              </Tooltip>
              <Tooltip label="Edit">
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Edit lead"
                  onClick={handleEdit}
                  colorScheme="gray"
                  variant="ghost"
                />
              </Tooltip>
              <Tooltip label="Delete">
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Delete lead"
                  onClick={handleDelete}
                  colorScheme="red"
                  variant="ghost"
                />
              </Tooltip>
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Property Details</Tab>
              <Tab>Activity</Tab>
              <Tab>Notes</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={6}>
                  {/* Contact Information */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Contact Information
                    </Text>
                    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiMail color={subTextColor} />
                          <Text color={subTextColor}>Email</Text>
                        </HStack>
                        <Text fontWeight="medium">{lead.email}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiPhone color={subTextColor} />
                          <Text color={subTextColor}>Phone</Text>
                        </HStack>
                        <Text fontWeight="medium">{lead.phone}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiMapPin color={subTextColor} />
                          <Text color={subTextColor}>Address</Text>
                        </HStack>
                        <Text fontWeight="medium">
                          {lead.address}, {lead.city}, {lead.state} {lead.zipCode}
                        </Text>
                      </VStack>
                      {lead.company && (
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <FiUser color={subTextColor} />
                            <Text color={subTextColor}>Company</Text>
                          </HStack>
                          <Text fontWeight="medium">{lead.company}</Text>
                        </VStack>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Lead Information */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Lead Information
                    </Text>
                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text color={subTextColor}>Source</Text>
                        <Text fontWeight="medium">{lead.source || 'Not specified'}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text color={subTextColor}>Assigned To</Text>
                        <Text fontWeight="medium">{lead.assignedTo || 'Unassigned'}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text color={subTextColor}>Created</Text>
                        <Text fontWeight="medium">{formatDate(lead.createdAt)}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text color={subTextColor}>Last Updated</Text>
                        <Text fontWeight="medium">{formatDate(lead.updatedAt)}</Text>
                      </VStack>
                    </Grid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Property Details Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Property Information
                    </Text>
                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiHome color={subTextColor} />
                          <Text color={subTextColor}>Property Type</Text>
                        </HStack>
                        <Badge colorScheme={getPropertyTypeColor(lead.propertyType)}>
                          {lead.propertyType.replace('_', ' ')}
                        </Badge>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <FiDollarSign color={subTextColor} />
                          <Text color={subTextColor}>Estimated Value</Text>
                        </HStack>
                        <Text fontWeight="medium" fontSize="lg">
                          {formatCurrency(lead.estimatedValue)}
                        </Text>
                      </VStack>
                      {lead.propertyAddress && (
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <FiMapPin color={subTextColor} />
                            <Text color={subTextColor}>Property Address</Text>
                          </HStack>
                          <Text fontWeight="medium">{lead.propertyAddress}</Text>
                        </VStack>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Financial Summary */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Financial Summary
                    </Text>
                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                      <VStack align="start" spacing={2}>
                        <Text color={subTextColor}>Estimated Value</Text>
                        <Text fontWeight="medium" fontSize="lg">
                          {formatCurrency(lead.estimatedValue)}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text color={subTextColor}>Lead Score</Text>
                        <Text fontWeight="medium">
                          {lead.score ? `${lead.score}/10` : 'Not scored'}
                        </Text>
                      </VStack>
                    </Grid>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Activity Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                    Recent Activity
                  </Text>
                  <Box textAlign="center" py={8}>
                    <FiActivity size={48} color={subTextColor} />
                    <Text color={subTextColor} mt={2}>
                      No recent activity
                    </Text>
                    <Text fontSize="sm" color={subTextColor}>
                      Activity tracking will appear here
                    </Text>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Notes Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                    Notes
                  </Text>
                  {lead.notes ? (
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text>{lead.notes}</Text>
                    </Box>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <FiFileText size={48} color={subTextColor} />
                      <Text color={subTextColor} mt={2}>
                        No notes available
                      </Text>
                      <Text fontSize="sm" color={subTextColor}>
                        Add notes to track important information
                      </Text>
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={handleEdit}>
              Edit Lead
            </Button>
            <Button colorScheme="green" onClick={handleCall}>
              Call
            </Button>
            <Button colorScheme="blue" onClick={handleEmail}>
              Email
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LeadDetail;
