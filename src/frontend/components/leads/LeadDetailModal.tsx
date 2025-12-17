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
  Heading,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Flex,
  IconButton,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Divider,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  FiMapPin,
  FiHome,
} from 'react-icons/fi';
import { Lead } from '../../features/lead-management/types/lead';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const [newNote, setNewNote] = useState('');

  if (!lead) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'green';
      case 'converted': return 'purple';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'single_family': return 'blue';
      case 'multi_family': return 'green';
      case 'commercial': return 'purple';
      case 'land': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} maxH="90vh">
        <ModalHeader>
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Heading size="lg" mb={2} color={textColor}>
                {lead.firstName} {lead.lastName}
              </Heading>
              <Text color={subTextColor} fontSize="md">
                {lead.address}, {lead.city}, {lead.state} {lead.zipCode}
              </Text>
            </Box>
            <HStack spacing={2}>
              <Badge
                colorScheme={getStatusColor(lead.status)}
                size="lg"
                px={4}
                py={2}
                borderRadius="full"
              >
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
              {lead.priority && (
                <Badge colorScheme="red" px={3} py={1} borderRadius="md">
                  {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                </Badge>
              )}
            </HStack>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Lead Meta Information */}
            <Card bg={cardBg} shadow="sm">
              <CardBody>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={subTextColor} fontWeight="500">Phone</Text>
                    <Text fontWeight="600" color={textColor}>{lead.phone}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={subTextColor} fontWeight="500">Email</Text>
                    <Text fontWeight="600" color={textColor}>{lead.email}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={subTextColor} fontWeight="500">Property Type</Text>
                    <Text fontWeight="600" color={textColor}>{lead.propertyType.replace('_', ' ')}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={subTextColor} fontWeight="500">Estimated Value</Text>
                    <Text fontWeight="600" color={textColor}>${lead.estimatedValue.toLocaleString()}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={subTextColor} fontWeight="500">Source</Text>
                    <Text fontWeight="600" color={textColor}>{lead.source || 'N/A'}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={subTextColor} fontWeight="500">Created</Text>
                    <Text fontWeight="600" color={textColor}>{lead.createdAt.toLocaleDateString()}</Text>
                  </VStack>
                </SimpleGrid>

                {/* Quick Actions */}
                <HStack spacing={3} mt={4} flexWrap="wrap">
                  <Button leftIcon={<FiPhone />} colorScheme="blue" size="sm">
                    Call Lead
                  </Button>
                  <Button leftIcon={<FiMessageSquare />} variant="outline" size="sm">
                    Send SMS
                  </Button>
                  <Button leftIcon={<FiMail />} variant="outline" size="sm">
                    Send Email
                  </Button>
                  <Button leftIcon={<FiFileText />} colorScheme="green" size="sm">
                    Create Offer
                  </Button>
                  <Button leftIcon={<FiCalendar />} variant="outline" size="sm">
                    Schedule Follow-up
                  </Button>
                  {onEdit && (
                    <Button leftIcon={<FiEdit />} colorScheme="purple" size="sm" onClick={onEdit}>
                      Edit Lead
                    </Button>
                  )}
                </HStack>
              </CardBody>
            </Card>

            {/* Main Content Tabs */}
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>Lead Information</Tab>
                <Tab>Transaction Details</Tab>
                <Tab>Communication</Tab>
                <Tab>Activity</Tab>
                <Tab>Notes</Tab>
              </TabList>

              <TabPanels>
                {/* Lead Information Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Card bg={cardBg} shadow="sm">
                      <CardHeader>
                        <HStack spacing={3}>
                          <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                            <FiUser size="16" />
                          </Box>
                          <Heading size="md" color={textColor}>Lead Information</Heading>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Property Address</Text>
                            <Text fontWeight="600" color={textColor}>{lead.address}, {lead.city}, {lead.state} {lead.zipCode}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Lead Source</Text>
                            <Text fontWeight="600" color={textColor}>{lead.source || 'N/A'}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Owner Name</Text>
                            <Text fontWeight="600" color={textColor}>{lead.firstName} {lead.lastName}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Phone Number</Text>
                            <Text fontWeight="600" color={textColor}>{lead.phone}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Email Address</Text>
                            <Text fontWeight="600" color={textColor}>{lead.email}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Property Type</Text>
                            <Text fontWeight="600" color={textColor}>{lead.propertyType.replace('_', ' ')}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Company</Text>
                            <Text fontWeight="600" color={textColor}>{lead.company || 'N/A'}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Assigned To</Text>
                            <Text fontWeight="600" color={textColor}>{lead.assignedTo || 'Unassigned'}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Score</Text>
                            <Text fontWeight="600" color={textColor}>{lead.score || 'N/A'}</Text>
                          </VStack>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm" color={subTextColor} fontWeight="500">Created Date</Text>
                            <Text fontWeight="600" color={textColor}>{lead.createdAt.toLocaleDateString()}</Text>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Transaction Details Tab */}
                <TabPanel>
                  <Card bg={cardBg} shadow="sm">
                    <CardHeader>
                      <HStack spacing={3}>
                        <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                          <FiDollarSign size="16" />
                        </Box>
                        <Heading size="md" color={textColor}>Transaction Details</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Box
                        bg="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
                        border="1px solid"
                        borderColor="green.200"
                        borderRadius="12px"
                        p={4}
                        mb={4}
                      >
                        <Flex justify="space-between" align="center" mb={4}>
                          <Text fontSize="lg" fontWeight="600" color="green.800">Financial Summary</Text>
                          <Badge bg="green.500" color="white" px={4} py={2} borderRadius="full" fontSize="sm">
                            ${lead.estimatedValue ? (lead.estimatedValue * 0.3).toLocaleString() : '0'} Profit
                          </Badge>
                        </Flex>
                        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                          <VStack spacing={1}>
                            <Text fontSize="sm" color="green.700">Estimated Value</Text>
                            <Text fontSize="lg" fontWeight="700">${lead.estimatedValue.toLocaleString()}</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text fontSize="sm" color="green.700">ARV</Text>
                            <Text fontSize="lg" fontWeight="700">${(lead.estimatedValue * 1.2).toLocaleString()}</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text fontSize="sm" color="green.700">Potential Profit</Text>
                            <Text fontSize="lg" fontWeight="700" color="green.600">${(lead.estimatedValue * 0.3).toLocaleString()}</Text>
                          </VStack>
                        </SimpleGrid>
                      </Box>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Communication Tab */}
                <TabPanel>
                  <Card bg={cardBg} shadow="sm">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                            <FiMessageCircle size="16" />
                          </Box>
                          <Heading size="md" color={textColor}>Communication History</Heading>
                        </HStack>
                        <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
                          New Message
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {[
                          { author: `${lead.firstName} ${lead.lastName}`, time: '2 hours ago', message: 'Interested in selling property quickly. Need to move by end of month.', type: 'SMS' },
                          { author: 'Agent (You)', time: '1 hour ago', message: 'Thanks for reaching out. I can help you sell quickly. Can we schedule a call?', type: 'SMS' },
                        ].map((comm, index) => (
                          <HStack key={index} spacing={4} p={4} bg="gray.50" borderRadius="8px">
                            <Avatar size="md" name={comm.author} bg="blue.500" />
                            <Box flex={1}>
                              <Flex justify="space-between" align="center" mb={2}>
                                <Text fontWeight="600" color={textColor}>{comm.author}</Text>
                                <Text fontSize="sm" color={subTextColor}>{comm.time}</Text>
                              </Flex>
                              <Text color={textColor} mb={2} lineHeight="1.5">{comm.message}</Text>
                              <Badge bg="blue.100" color="blue.700" px={2} py={1} borderRadius="4px" fontSize="xs">
                                <FiMessageSquare style={{ display: 'inline', marginRight: '4px' }} />
                                {comm.type}
                              </Badge>
                            </Box>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Activity Tab */}
                <TabPanel>
                  <Card bg={cardBg} shadow="sm">
                    <CardHeader>
                      <HStack spacing={3}>
                        <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                          <FiClock size="16" />
                        </Box>
                        <Heading size="md" color={textColor}>Activity Timeline</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {[
                          { action: 'Lead Created', description: 'Lead added to system', time: lead.createdAt.toLocaleDateString(), icon: FiPlus },
                          { action: 'Status Updated', description: `Status changed to ${lead.status}`, time: lead.updatedAt.toLocaleDateString(), icon: FiUser },
                        ].map((activity, index) => (
                          <HStack key={index} spacing={4} p={4} borderBottom="1px solid" borderColor="gray.100">
                            <Box
                              w={8}
                              h={8}
                              bg="purple.500"
                              color="white"
                              borderRadius="50%"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <activity.icon size="16" />
                            </Box>
                            <Box flex={1}>
                              <Text fontWeight="600" color={textColor} mb={1}>{activity.action}</Text>
                              <Text color={subTextColor} fontSize="sm" mb={1}>{activity.description}</Text>
                              <Text color={subTextColor} fontSize="xs">{activity.time}</Text>
                            </Box>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>

                {/* Notes Tab */}
                <TabPanel>
                  <Card bg={cardBg} shadow="sm">
                    <CardHeader>
                      <HStack spacing={3}>
                        <Box w={8} h={8} bg="purple.500" color="white" borderRadius="8px" display="flex" alignItems="center" justifyContent="center">
                          <FiBookmark size="16" />
                        </Box>
                        <Heading size="md" color={textColor}>Notes</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Textarea
                          placeholder="Add a note about this lead..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          size="sm"
                          minH="100px"
                        />
                        <Button leftIcon={<FiPlus />} colorScheme="purple" size="sm">
                          Add Note
                        </Button>

                        {lead.notes && (
                          <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
                            <Text color={textColor} fontSize="sm" lineHeight="1.5">{lead.notes}</Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button colorScheme="blue" onClick={onEdit}>
              Edit Lead
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

