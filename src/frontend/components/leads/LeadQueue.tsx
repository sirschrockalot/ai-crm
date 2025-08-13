import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Badge,
  Button,
  Input,
  Select,
  HStack,
  VStack,
  Text,
  Flex,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaPhone,
  FaEnvelope,
  FaSms,
  FaClock,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaDownload,
  FaUserPlus,
  FaEye,
} from 'react-icons/fa';
import { useRouter } from 'next/router';

// Types for the lead queue
interface Lead {
  id: string;
  name: string;
  property: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  source: string;
  assignedAgent: string;
  lastContact?: string;
  nextAction?: string;
  priority: 'high' | 'medium' | 'low';
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  status: string;
  source: string;
  assignedAgent: string;
  priority: string;
}

interface SortState {
  field: keyof Lead;
  direction: 'asc' | 'desc';
}

const LeadQueue: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    source: '',
    assignedAgent: '',
    priority: '',
  });
  const [sortConfig, setSortConfig] = useState<SortState>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Mock data - in real app this would come from API
  const mockLeads: Lead[] = [
    {
      id: 'LD-001',
      name: 'John Smith',
      property: '123 Oak Street, City, State',
      status: 'New',
      source: 'Web Form',
      assignedAgent: 'Sarah Johnson',
      priority: 'high',
      phone: '(555) 123-4567',
      email: 'john@email.com',
      notes: 'Interested in selling due to relocation',
      createdAt: '2024-12-18T08:00:00Z',
      updatedAt: '2024-12-18T08:00:00Z',
    },
    {
      id: 'LD-002',
      name: 'Sarah Wilson',
      property: '456 Pine Avenue, City, State',
      status: 'Contacted',
      source: 'Phone Call',
      assignedAgent: 'Mike Davis',
      priority: 'medium',
      phone: '(555) 987-6543',
      email: 'sarah@email.com',
      notes: 'Property needs repairs, motivated seller',
      lastContact: '2024-12-17T14:30:00Z',
      nextAction: 'Follow up on offer',
      createdAt: '2024-12-16T10:00:00Z',
      updatedAt: '2024-12-17T14:30:00Z',
    },
    {
      id: 'LD-003',
      name: 'Robert Davis',
      property: '789 Elm Street, City, State',
      status: 'Qualified',
      source: 'Referral',
      assignedAgent: 'Sarah Johnson',
      priority: 'high',
      phone: '(555) 456-7890',
      email: 'robert@email.com',
      notes: 'Inherited property, wants quick sale',
      lastContact: '2024-12-17T16:00:00Z',
      nextAction: 'Send contract',
      createdAt: '2024-12-15T09:00:00Z',
      updatedAt: '2024-12-17T16:00:00Z',
    },
    {
      id: 'LD-004',
      name: 'Maria Garcia',
      property: '321 Maple Drive, City, State',
      status: 'Converted',
      source: 'Direct Mail',
      assignedAgent: 'Mike Davis',
      priority: 'medium',
      phone: '(555) 321-6540',
      email: 'maria@email.com',
      notes: 'Contract signed, closing in 2 weeks',
      lastContact: '2024-12-16T11:00:00Z',
      nextAction: 'Prepare closing docs',
      createdAt: '2024-12-10T08:00:00Z',
      updatedAt: '2024-12-16T11:00:00Z',
    },
    {
      id: 'LD-005',
      name: 'David Chen',
      property: '654 Birch Lane, City, State',
      status: 'New',
      source: 'Social Media',
      assignedAgent: 'Sarah Johnson',
      priority: 'low',
      phone: '(555) 789-0123',
      email: 'david@email.com',
      notes: 'Saw ad on Facebook, interested in selling',
      createdAt: '2024-12-18T12:00:00Z',
      updatedAt: '2024-12-18T12:00:00Z',
    },
    {
      id: 'LD-006',
      name: 'Lisa Johnson',
      property: '987 Cedar Road, City, State',
      status: 'Contacted',
      source: 'Referral',
      assignedAgent: 'Mike Davis',
      priority: 'high',
      phone: '(555) 234-5678',
      email: 'lisa@email.com',
      notes: 'Divorce sale, needs quick closing',
      lastContact: '2024-12-17T13:00:00Z',
      nextAction: 'Schedule property visit',
      createdAt: '2024-12-14T11:00:00Z',
      updatedAt: '2024-12-17T13:00:00Z',
    },
    {
      id: 'LD-007',
      name: 'Michael Brown',
      property: '147 Spruce Court, City, State',
      status: 'New',
      source: 'Web Form',
      assignedAgent: 'Sarah Johnson',
      priority: 'medium',
      phone: '(555) 876-5432',
      email: 'michael@email.com',
      notes: 'Job transfer, selling family home',
      createdAt: '2024-12-18T09:00:00Z',
      updatedAt: '2024-12-18T09:00:00Z',
    },
    {
      id: 'LD-008',
      name: 'Jennifer Lee',
      property: '258 Willow Way, City, State',
      status: 'Qualified',
      source: 'Phone Call',
      assignedAgent: 'Mike Davis',
      priority: 'high',
      phone: '(555) 345-6789',
      email: 'jennifer@email.com',
      notes: 'Property in good condition, motivated seller',
      lastContact: '2024-12-17T15:00:00Z',
      nextAction: 'Make offer',
      createdAt: '2024-12-13T14:00:00Z',
      updatedAt: '2024-12-17T15:00:00Z',
    },
  ];

  // Load leads on component mount
  useEffect(() => {
    setLeads(mockLeads);
  }, []);

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !filters.status || lead.status === filters.status;
      const matchesSource = !filters.source || lead.source === filters.source;
      const matchesAgent = !filters.assignedAgent || lead.assignedAgent === filters.assignedAgent;
      const matchesPriority = !filters.priority || lead.priority === filters.priority;
      
      return matchesSearch && matchesStatus && matchesSource && matchesAgent && matchesPriority;
    });

    // Sort leads
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, searchQuery, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage);
  const paginatedLeads = filteredAndSortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: keyof Lead) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle status change
  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      // In real app, this would be an API call
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
          : lead
      ));
      
      toast({
        title: 'Status Updated',
        description: `Lead status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'No Leads Selected',
        description: 'Please select leads to perform bulk actions',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    switch (action) {
      case 'status':
        // Handle bulk status change
        toast({
          title: 'Bulk Status Update',
          description: `Updating status for ${selectedLeads.length} leads`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'assign':
        // Handle bulk assignment
        toast({
          title: 'Bulk Assignment',
          description: `Assigning ${selectedLeads.length} leads`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'export':
        // Handle bulk export
        toast({
          title: 'Export Started',
          description: `Exporting ${selectedLeads.length} leads`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
    
    setSelectedLeads([]);
  };

  // Handle lead selection
  const handleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Handle lead actions
  const handleLeadAction = (action: string, lead: Lead) => {
    switch (action) {
      case 'view':
        router.push(`/leads/${lead.id}`);
        break;
      case 'edit':
        setEditingLead(lead);
        onOpen();
        break;
      case 'call':
        // Handle phone call
        toast({
          title: 'Calling Lead',
          description: `Calling ${lead.name} at ${lead.phone}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'email':
        // Handle email
        toast({
          title: 'Sending Email',
          description: `Sending email to ${lead.email}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'sms':
        // Handle SMS
        toast({
          title: 'Sending SMS',
          description: `Sending SMS to ${lead.phone}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return '#DBEAFE';
      case 'Contacted':
        return '#FEF3C7';
      case 'Qualified':
        return '#FCE7F3';
      case 'Converted':
        return '#D1FAE5';
      case 'Lost':
        return '#FEE2E2';
      default:
        return '#E2E8F0';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'New':
        return '#1E40AF';
      case 'Contacted':
        return '#92400E';
      case 'Qualified':
        return '#BE185D';
      case 'Converted':
        return '#065F46';
      case 'Lost':
        return '#DC2626';
      default:
        return '#64748B';
    }
  };

  // Get priority color
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

  // Get sort icon
  const getSortIcon = (field: keyof Lead) => {
    if (sortConfig.field !== field) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <Box bg="#F8FAFC" minH="100vh" p={8}>
      {/* Page Header */}
      <Box mb={8}>
        <Text fontSize="3xl" fontWeight="700" color="#0F172A" mb={2}>
          Lead Queue Management
        </Text>
        <Text fontSize="lg" color="#64748B">
          Manage your lead pipeline and workflow
        </Text>
      </Box>

      {/* Filters and Search */}
      <Card mb={6} borderRadius="12px" border="1px solid #E2E8F0">
        <CardBody p={6}>
          <VStack spacing={4} align="stretch">
            {/* Search Bar */}
            <Box position="relative">
              <Input
                placeholder="Search leads by name, property, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl={10}
                size="lg"
                border="1px solid #D1D5DB"
                borderRadius="8px"
                _focus={{
                  borderColor: '#3B82F6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                }}
              />
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                color="#6B7280"
              >
                <FaSearch />
              </Box>
            </Box>

            {/* Filter Row */}
            <HStack spacing={4} flexWrap="wrap">
              <Select
                placeholder="All Statuses"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                size="md"
                border="1px solid #D1D5DB"
                borderRadius="6px"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </Select>

              <Select
                placeholder="All Sources"
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                size="md"
                border="1px solid #D1D5DB"
                borderRadius="6px"
              >
                <option value="Web Form">Web Form</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Referral">Referral</option>
                <option value="Direct Mail">Direct Mail</option>
                <option value="Social Media">Social Media</option>
              </Select>

              <Select
                placeholder="All Agents"
                value={filters.assignedAgent}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedAgent: e.target.value }))}
                size="md"
                border="1px solid #D1D5DB"
                borderRadius="6px"
              >
                <option value="Sarah Johnson">Sarah Johnson</option>
                <option value="Mike Davis">Mike Davis</option>
              </Select>

              <Select
                placeholder="All Priorities"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                size="md"
                border="1px solid #D1D5DB"
                borderRadius="6px"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </HStack>

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <HStack spacing={3} pt={2} borderTop="1px solid #E2E8F0">
                <Text fontSize="sm" color="#64748B">
                  {selectedLeads.length} lead(s) selected
                </Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleBulkAction('status')}
                >
                  Change Status
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={() => handleBulkAction('assign')}
                >
                  Reassign
                </Button>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => handleBulkAction('export')}
                >
                  Export Selected
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Leads Table */}
      <Card borderRadius="12px" border="1px solid #E2E8F0" overflow="hidden">
        <CardHeader bg="#F8FAFC" borderBottom="1px solid #E2E8F0">
          <Flex justify="space-between" align="center">
            <Text fontWeight="600" color="#0F172A">
              Lead Queue ({filteredAndSortedLeads.length} leads)
            </Text>
            <HStack spacing={3}>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FaDownload />}
                onClick={() => handleBulkAction('export')}
              >
                Export All
              </Button>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<FaUserPlus />}
                onClick={() => router.push('/leads/new')}
              >
                Add Lead
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" align="center" p={8}>
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="#F8FAFC">
                  <Tr>
                    <Th px={4} py={3}>
                      <Checkbox
                        isChecked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                        isIndeterminate={selectedLeads.length > 0 && selectedLeads.length < paginatedLeads.length}
                        onChange={handleSelectAll}
                      />
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('id')}>
                      <HStack spacing={2}>
                        <Text>Lead ID</Text>
                        {getSortIcon('id')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('name')}>
                      <HStack spacing={2}>
                        <Text>Name</Text>
                        {getSortIcon('name')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('property')}>
                      <HStack spacing={2}>
                        <Text>Property</Text>
                        {getSortIcon('property')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('status')}>
                      <HStack spacing={2}>
                        <Text>Status</Text>
                        {getSortIcon('status')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('priority')}>
                      <HStack spacing={2}>
                        <Text>Priority</Text>
                        {getSortIcon('priority')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('lastContact')}>
                      <HStack spacing={2}>
                        <Text>Last Contact</Text>
                        {getSortIcon('lastContact')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3} cursor="pointer" onClick={() => handleSort('nextAction')}>
                      <HStack spacing={2}>
                        <Text>Next Action</Text>
                        {getSortIcon('nextAction')}
                      </HStack>
                    </Th>
                    <Th px={4} py={3}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedLeads.map((lead) => (
                    <Tr key={lead.id} _hover={{ bg: '#F8FAFC' }}>
                      <Td px={4} py={3}>
                        <Checkbox
                          isChecked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                        />
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontWeight="600" color="#3B82F6" fontSize="sm">
                          {lead.id}
                        </Text>
                      </Td>
                      <Td px={4} py={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="600" color="#0F172A">
                            {lead.name}
                          </Text>
                          <Text fontSize="sm" color="#64748B">
                            {lead.assignedAgent}
                          </Text>
                        </VStack>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="sm" color="#64748B" maxW="200px" noOfLines={2}>
                          {lead.property}
                        </Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Badge
                          bg={getStatusColor(lead.status)}
                          color={getStatusTextColor(lead.status)}
                          px={3}
                          py={1}
                          borderRadius="12px"
                          fontSize="xs"
                          fontWeight="500"
                        >
                          {lead.status}
                        </Badge>
                      </Td>
                      <Td px={4} py={3}>
                        <Badge
                          bg={getPriorityColor(lead.priority)}
                          color="white"
                          px={2}
                          py={1}
                          borderRadius="6px"
                          fontSize="xs"
                          fontWeight="500"
                        >
                          {lead.priority}
                        </Badge>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="sm" color="#64748B">
                          {lead.lastContact 
                            ? new Date(lead.lastContact).toLocaleDateString()
                            : 'Never'
                          }
                        </Text>
                      </Td>
                      <Td px={4} py={3}>
                        <Text fontSize="sm" color="#64748B" maxW="150px" noOfLines={2}>
                          {lead.nextAction || 'No action set'}
                        </Text>
                      </Td>
                      <Td px={4} py={3}>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            aria-label="View lead"
                            icon={<FaEye />}
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleLeadAction('view', lead)}
                          />
                          <IconButton
                            size="sm"
                            aria-label="Call lead"
                            icon={<FaPhone />}
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleLeadAction('call', lead)}
                          />
                          <IconButton
                            size="sm"
                            aria-label="Email lead"
                            icon={<FaEnvelope />}
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleLeadAction('email', lead)}
                          />
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              size="sm"
                              aria-label="More actions"
                              icon={<FaEllipsisV />}
                              variant="ghost"
                            />
                            <MenuList>
                              <MenuItem icon={<FaEdit />} onClick={() => handleLeadAction('edit', lead)}>
                                Edit Lead
                              </MenuItem>
                              <MenuItem icon={<FaPhone />} onClick={() => handleLeadAction('call', lead)}>
                                Call Lead
                              </MenuItem>
                              <MenuItem icon={<FaEnvelope />} onClick={() => handleLeadAction('email', lead)}>
                                Send Email
                              </MenuItem>
                              <MenuItem icon={<FaSms />} onClick={() => handleLeadAction('sms', lead)}>
                                Send SMS
                              </MenuItem>
                              <MenuItem icon={<FaClock />} onClick={() => handleLeadAction('schedule', lead)}>
                                Schedule Follow-up
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={6}>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? 'solid' : 'outline'}
                colorScheme={currentPage === page ? 'blue' : 'gray'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Edit Lead Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Lead</ModalHeader>
          <ModalBody>
            {editingLead && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input value={editingLead.name} />
                </FormControl>
                <FormControl>
                  <FormLabel>Property</FormLabel>
                  <Input value={editingLead.property} />
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={editingLead.status}>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea value={editingLead.notes || ''} />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LeadQueue;
