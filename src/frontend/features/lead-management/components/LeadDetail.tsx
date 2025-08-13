import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
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
  GridItem,
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
  FiCalendar,
  FiUser,
  FiEdit,
  FiTrash2,
  FiMessageSquare,
  FiFileText,
  FiActivity,
} from 'react-icons/fi';
import { Lead } from '../types/lead';
import { CommunicationPanel } from './CommunicationPanel';

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'yellow';
      case 'qualified':
        return 'green';
      case 'negotiation':
        return 'orange';
      case 'closed':
        return 'purple';
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
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={`${lead.firstName} ${lead.lastName}`}
              src={lead.avatar}
              bg={useColorModeValue('blue.100', 'blue.700')}
              color={useColorModeValue('blue.700', 'blue.100')}
            />
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                {lead.firstName} {lead.lastName}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme={getPriorityColor(lead.priority)} size="sm">
                  Priority {lead.priority}
                </Badge>
                <Badge colorScheme={getStatusColor(lead.status)} size="sm">
                  {lead.status}
                </Badge>
                <Badge colorScheme={getPropertyTypeColor(lead.propertyType)} size="sm">
                  {lead.propertyType.replace('_', ' ')}
                </Badge>
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiUser />
                  <Text>Overview</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiMessageSquare />
                  <Text>Communication</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiActivity />
                  <Text>Activity</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiFileText />
                  <Text>Documents</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Contact Information */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Contact Information
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <HStack spacing={2}>
                            <FiMail size={16} />
                            <Text fontSize="sm" color={subTextColor}>Email</Text>
                          </HStack>
                          <Text fontSize="md" color={textColor}>{lead.email}</Text>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <HStack spacing={2}>
                            <FiPhone size={16} />
                            <Text fontSize="sm" color={subTextColor}>Phone</Text>
                          </HStack>
                          <Text fontSize="md" color={textColor}>{lead.phone}</Text>
                        </VStack>
                      </GridItem>
                      {lead.propertyAddress && (
                        <GridItem colSpan={2}>
                          <VStack align="flex-start" spacing={2}>
                            <HStack spacing={2}>
                              <FiMapPin size={16} />
                              <Text fontSize="sm" color={subTextColor}>Property Address</Text>
                            </HStack>
                            <Text fontSize="md" color={textColor}>{lead.propertyAddress}</Text>
                          </VStack>
                        </GridItem>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Property Information */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Property Information
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <Text fontSize="sm" color={subTextColor}>Property Type</Text>
                          <Badge colorScheme={getPropertyTypeColor(lead.propertyType)} size="md">
                            {lead.propertyType.replace('_', ' ')}
                          </Badge>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <HStack spacing={2}>
                            <FiDollarSign size={16} />
                            <Text fontSize="sm" color={subTextColor}>Estimated Value</Text>
                          </HStack>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {formatCurrency(lead.estimatedValue || 0)}
                          </Text>
                        </VStack>
                      </GridItem>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Lead Details */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                      Lead Details
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <Text fontSize="sm" color={subTextColor}>Status</Text>
                          <Badge colorScheme={getStatusColor(lead.status)} size="md">
                            {lead.status}
                          </Badge>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <Text fontSize="sm" color={subTextColor}>Priority</Text>
                          <Badge colorScheme={getPriorityColor(lead.priority)} size="md">
                            {lead.priority}/10
                          </Badge>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <HStack spacing={2}>
                            <FiCalendar size={16} />
                            <Text fontSize="sm" color={subTextColor}>Created</Text>
                          </HStack>
                          <Text fontSize="md" color={textColor}>
                            {formatDate(lead.createdAt)}
                          </Text>
                        </VStack>
                      </GridItem>
                      <GridItem>
                        <VStack align="flex-start" spacing={2}>
                          <HStack spacing={2}>
                            <FiCalendar size={16} />
                            <Text fontSize="sm" color={subTextColor}>Last Updated</Text>
                          </HStack>
                          <Text fontSize="md" color={textColor}>
                            {formatDate(lead.updatedAt)}
                          </Text>
                        </VStack>
                      </GridItem>
                      {lead.assignedTo && (
                        <GridItem colSpan={2}>
                          <VStack align="flex-start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor}>Assigned To</Text>
                            <Text fontSize="md" color={textColor}>{lead.assignedTo}</Text>
                          </VStack>
                        </GridItem>
                      )}
                    </Grid>
                  </Box>

                  {lead.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold" mb={4} color={textColor}>
                          Notes
                        </Text>
                        <Box
                          p={4}
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          borderRadius="md"
                        >
                          <Text color={textColor}>{lead.notes}</Text>
                        </Box>
                      </Box>
                    </>
                  )}
                </VStack>
              </TabPanel>

              {/* Communication Tab */}
              <TabPanel>
                <CommunicationPanel lead={lead} isOpen={true} onClose={() => {}} />
              </TabPanel>

              {/* Activity Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                    Lead Activity
                  </Text>
                  <Box
                    p={4}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="md"
                    textAlign="center"
                  >
                    <Text color={subTextColor}>Activity tracking coming soon...</Text>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Documents Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                    Documents
                  </Text>
                  <Box
                    p={4}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    borderRadius="md"
                    textAlign="center"
                  >
                    <Text color={subTextColor}>Document management coming soon...</Text>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Tooltip label="Call lead">
              <IconButton
                aria-label="Call lead"
                icon={<FiPhone />}
                colorScheme="green"
                onClick={handleCall}
                isDisabled={!lead.phone}
              />
            </Tooltip>
            <Tooltip label="Send email">
              <IconButton
                aria-label="Send email"
                icon={<FiMail />}
                colorScheme="blue"
                onClick={handleEmail}
                isDisabled={!lead.email}
              />
            </Tooltip>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              leftIcon={<FiEdit />}
              colorScheme="blue"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              leftIcon={<FiTrash2 />}
              colorScheme="red"
              variant="outline"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
