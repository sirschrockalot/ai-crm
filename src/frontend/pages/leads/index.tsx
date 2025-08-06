import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Heading, Text, useDisclosure, useToast, Checkbox, Select } from '@chakra-ui/react';
import { Sidebar, Header, Navigation, SearchBar } from '../../components/layout';
import { Card, Button, Badge, Table, Modal, ErrorBoundary } from '../../components/ui';
import { LeadForm } from '../../components/forms';
import { useLeads } from '../../hooks/services/useLeads';
import { Lead, LeadStatus, PropertyType } from '../../types';

const LeadsPage: React.FC = () => {
  const { 
    leads, 
    loading, 
    error, 
    bulkOperation,
    fetchLeads, 
    createLead, 
    updateLead, 
    deleteLead,
    bulkUpdate,
    bulkDelete,
    bulkAssign,
    bulkChangeStatus,
    getBulkOperationStats,
    validateLeadIds
  } = useLeads();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | 'all'>('all');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'update' | 'delete' | 'assign' | 'changeStatus' | null>(null);
  const [bulkData, setBulkData] = useState<Record<string, any>>({});
  const toast = useToast();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (data: any) => {
    try {
      await createLead(data);
      toast({
        title: 'Lead created successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleUpdateLead = async (data: any) => {
    if (!selectedLead) return;
    try {
      await updateLead(selectedLead.id, data);
      toast({
        title: 'Lead updated successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      toast({
        title: 'Lead deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting lead',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Bulk operations handlers
  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      await bulkUpdate(selectedLeads, bulkData);
      toast({
        title: 'Bulk update completed',
        status: 'success',
        duration: 3000,
      });
      setSelectedLeads([]);
      setBulkAction(null);
      setBulkData({});
    } catch (error) {
      toast({
        title: 'Error in bulk update',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      await bulkDelete(selectedLeads);
      toast({
        title: 'Bulk delete completed',
        status: 'success',
        duration: 3000,
      });
      setSelectedLeads([]);
      setBulkAction(null);
    } catch (error) {
      toast({
        title: 'Error in bulk delete',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleBulkAssign = async () => {
    if (selectedLeads.length === 0 || !bulkData.assignedTo) return;
    
    try {
      await bulkAssign(selectedLeads, bulkData.assignedTo);
      toast({
        title: 'Bulk assign completed',
        status: 'success',
        duration: 3000,
      });
      setSelectedLeads([]);
      setBulkAction(null);
      setBulkData({});
    } catch (error) {
      toast({
        title: 'Error in bulk assign',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleBulkChangeStatus = async () => {
    if (selectedLeads.length === 0 || !bulkData.status) return;
    
    try {
      await bulkChangeStatus(selectedLeads, bulkData.status);
      toast({
        title: 'Bulk status change completed',
        status: 'success',
        duration: 3000,
      });
      setSelectedLeads([]);
      setBulkAction(null);
      setBulkData({});
    } catch (error) {
      toast({
        title: 'Error in bulk status change',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPropertyType = propertyTypeFilter === 'all' || lead.propertyType === propertyTypeFilter;
    
    return matchesSearch && matchesStatus && matchesPropertyType;
  });

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

  const columns = [
    {
      key: 'select',
      header: (
        <Checkbox
          isChecked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
          isIndeterminate={selectedLeads.length > 0 && selectedLeads.length < filteredLeads.length}
          onChange={(e) => handleSelectAllLeads(e.target.checked)}
        />
      ),
      accessor: (lead: Lead) => (
        <Checkbox
          isChecked={selectedLeads.includes(lead.id)}
          onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (lead: Lead) => `${lead.firstName} ${lead.lastName}`,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (lead: Lead) => lead.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (lead: Lead) => lead.phone,
    },
    {
      key: 'propertyType',
      header: 'Property Type',
      accessor: (lead: Lead) => (
        <Badge colorScheme={getPropertyTypeColor(lead.propertyType)}>
          {lead.propertyType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'estimatedValue',
      header: 'Estimated Value',
      accessor: (lead: Lead) => `$${lead.estimatedValue.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (lead: Lead) => (
        <Badge colorScheme={getStatusColor(lead.status)}>
          {lead.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (lead: Lead) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedLead(lead);
              onOpen();
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteLead(lead.id)}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <VStack align="stretch" spacing={6}>
              <HStack justify="space-between">
                <Heading size="lg">Leads Management</Heading>
                <Button variant="primary" onClick={onOpen}>
                  Add New Lead
                </Button>
              </HStack>

            {/* Filters */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Filters</Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPropertyTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </HStack>
                <HStack spacing={4} wrap="wrap">
                  <SearchBar />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                  <select
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value as PropertyType | 'all')}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Property Types</option>
                    <option value="single_family">Single Family</option>
                    <option value="multi_family">Multi Family</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </HStack>
              </VStack>
            </Card>

            {/* Bulk Operations */}
            {selectedLeads.length > 0 && (
              <Card>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">
                      Bulk Operations ({selectedLeads.length} selected)
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedLeads([]);
                        setBulkAction(null);
                        setBulkData({});
                      }}
                    >
                      Clear Selection
                    </Button>
                  </HStack>
                  
                  <HStack spacing={4} wrap="wrap">
                    <Select
                      placeholder="Select bulk action"
                      value={bulkAction || ''}
                      onChange={(e) => setBulkAction(e.target.value as any)}
                      size="sm"
                      maxW="200px"
                    >
                      <option value="update">Update Fields</option>
                      <option value="delete">Delete Leads</option>
                      <option value="assign">Assign to User</option>
                      <option value="changeStatus">Change Status</option>
                    </Select>
                    
                    {bulkAction === 'update' && (
                      <Button size="sm" onClick={handleBulkUpdate}>
                        Update Selected
                      </Button>
                    )}
                    
                    {bulkAction === 'delete' && (
                      <Button size="sm" colorScheme="red" onClick={handleBulkDelete}>
                        Delete Selected
                      </Button>
                    )}
                    
                    {bulkAction === 'assign' && (
                      <HStack spacing={2}>
                        <Select
                          placeholder="Select user"
                          value={bulkData.assignedTo || ''}
                          onChange={(e) => setBulkData({ ...bulkData, assignedTo: e.target.value })}
                          size="sm"
                          maxW="200px"
                        >
                          <option value="user1">User 1</option>
                          <option value="user2">User 2</option>
                          <option value="user3">User 3</option>
                        </Select>
                        <Button size="sm" onClick={handleBulkAssign}>
                          Assign Selected
                        </Button>
                      </HStack>
                    )}
                    
                    {bulkAction === 'changeStatus' && (
                      <HStack spacing={2}>
                        <Select
                          placeholder="Select status"
                          value={bulkData.status || ''}
                          onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })}
                          size="sm"
                          maxW="200px"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </Select>
                        <Button size="sm" onClick={handleBulkChangeStatus}>
                          Change Status
                        </Button>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </Card>
            )}

            {/* Stats */}
            <HStack spacing={4}>
              <Card>
                <Text fontSize="sm" color="gray.600">Total Leads</Text>
                <Text fontSize="2xl" fontWeight="bold">{leads.length}</Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">New Leads</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {leads.filter(l => l.status === 'new').length}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Qualified</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {leads.filter(l => l.status === 'qualified').length}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Converted</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {leads.filter(l => l.status === 'converted').length}
                </Text>
              </Card>
            </HStack>

            {/* Leads Table */}
            <Card header="Leads">
              {loading ? (
                <Text>Loading leads...</Text>
              ) : error ? (
                <Text color="red.500">Error loading leads: {error}</Text>
              ) : (
                <Table
                  data={filteredLeads}
                  columns={columns}
                  sortable
                  pagination
                  pageSize={10}
                />
              )}
            </Card>
          </VStack>
        </Box>
      </HStack>

      {/* Lead Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedLead ? 'Edit Lead' : 'Add New Lead'}
        size="lg"
      >
        <LeadForm
          onSubmit={selectedLead ? handleUpdateLead : handleCreateLead}
          initialData={selectedLead || undefined}
          isLoading={loading}
        />
      </Modal>
    </Box>
    </ErrorBoundary>
  );
};

export default LeadsPage; 