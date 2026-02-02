import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NextPage } from 'next';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  useToast, 
  useDisclosure, 
  Badge, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  Flex, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Select, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  Checkbox,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiDownload, 
  FiUpload, 
  FiRefreshCw, 
  FiBarChart, 
  FiGrid, 
  FiList, 
  FiEdit, 
  FiTrash2, 
  FiMoreVertical, 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiHome, 
  FiTrendingUp, 
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useLeads } from '../../features/lead-management/hooks/useLeads';
import { Lead, LeadStatus, PropertyType } from '../../types';
import { useRouter } from 'next/router';
import { Layout } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { CsvImportModal } from '../../components/leads/CsvImportModal';

const LeadsPageContent: React.FC = () => {
  const toast = useToast();
  const router = useRouter();
  const {
    leads,
    pagination,
    loading,
    error,
    isAuthenticated,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    getLeadStats,
    getFilterOptions,
  } = useLeads();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    status: LeadStatus | '';
    propertyType: PropertyType | '';
    city: string;
    state: string;
    search: string;
  }>({
    status: '',
    propertyType: '',
    city: '',
    state: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  const [stats, setStats] = useState<{
    totalLeads: number;
    newLeadsThisMonth: number;
    callBack: number;
    offerMade: number;
    contractOut: number;
    transaction: number;
    negotiatingOffer: number;
  } | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    statuses: Array<{ value: string; label: string; count: number }>;
    propertyTypes: Array<{ value: string; label: string; count: number }>;
    cities: Array<{ value: string; label: string; count: number }>;
    states: Array<{ value: string; label: string; count: number }>;
  } | null>(null);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isPurgeOpen, onOpen: onPurgeOpen, onClose: onPurgeClose } = useDisclosure();
  const [purging, setPurging] = useState(false);
  const purgeCancelRef = useRef<HTMLButtonElement>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const initialLoadDoneRef = useRef(false);

  const buildFetchParams = useCallback((opts?: { page?: number; limit?: number }) => ({
    search: filters.search || undefined,
    status: filters.status || undefined,
    propertyType: filters.propertyType || undefined,
    city: filters.city || undefined,
    state: filters.state || undefined,
    page: opts?.page ?? page,
    limit: opts?.limit ?? limit,
  }), [filters, page, limit]);

  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([
        fetchLeads(buildFetchParams()),
        getLeadStats().then(setStats),
        getFilterOptions().then(setFilterOptions),
      ]);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to load leads and statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [fetchLeads, getLeadStats, getFilterOptions, buildFetchParams, toast]);

  // Load once on mount when authenticated. Ref prevents re-running when getLeadStats
  // gets a new reference after leads update (which would otherwise cause a refetch loop).
  useEffect(() => {
    if (!isAuthenticated || initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    loadInitialData();
  }, [isAuthenticated, loadInitialData]);

  const handleCreateLead = async (leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: PropertyType;
    estimatedValue: number;
    notes?: string;
    status: LeadStatus;
  }) => {
    try {
      await createLead(leadData);
      toast({
        title: 'Lead created',
        description: 'New lead has been successfully created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onFormClose();
      setEditingLead(null);
    } catch (error) {
      toast({
        title: 'Error creating lead',
        description: 'Failed to create new lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateLead = async (leadId: string, updateData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: PropertyType;
    estimatedValue: number;
    notes: string;
    status: LeadStatus;
  }>) => {
    try {
      await updateLead(leadId, updateData);
      toast({
        title: 'Lead updated',
        description: 'Lead has been successfully updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onFormClose();
      setEditingLead(null);
    } catch (error) {
      toast({
        title: 'Error updating lead',
        description: 'Failed to update lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast({
        title: 'Lead deleted',
        description: 'Lead has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting lead',
        description: 'Failed to delete lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBulkUpdate = async (operation: string, data: Record<string, unknown>) => {
    try {
      if (selectedLeads.length === 0) {
        toast({
          title: 'No leads selected',
          description: 'Please select leads to perform bulk operations',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await bulkUpdateLeads(selectedLeads, data);
      toast({
        title: 'Bulk update completed',
        description: `${selectedLeads.length} leads have been updated`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedLeads([]);
    } catch (error) {
      toast({
        title: 'Error updating leads',
        description: 'Failed to perform bulk update',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedLeads.length === 0) {
        toast({
          title: 'No leads selected',
          description: 'Please select leads to delete',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await bulkDeleteLeads(selectedLeads);
      toast({
        title: 'Bulk delete completed',
        description: `${selectedLeads.length} leads have been deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedLeads([]);
    } catch (error) {
      toast({
        title: 'Error deleting leads',
        description: 'Failed to perform bulk delete',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await importLeads(file);
      toast({
        title: 'Import completed',
        description: `${result.imported} leads have been imported`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error importing leads',
        description: 'Failed to import leads from file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportLeads(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export completed',
        description: 'Lead data has been exported successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error exporting leads',
        description: 'Failed to export leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePurgeAll = async () => {
    setPurging(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        toast({ title: 'Not signed in', description: 'Please sign in to purge leads.', status: 'error', duration: 5000, isClosable: true });
        onPurgeClose();
        return;
      }
      const res = await fetch('/api/imports/leads/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: 'Purge failed',
          description: data.error || data.message || `Request failed (${res.status})`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        onPurgeClose();
        return;
      }
      const deletedLeads = data.deletedLeads ?? 0;
      const deletedRuns = data.deletedImportRuns ?? 0;
      const description =
        deletedLeads === 0 && deletedRuns === 0
          ? 'The Leads Service database was already empty. You can run a fresh import now.'
          : `Removed ${deletedLeads} leads and ${deletedRuns} import records. You can run a fresh import now.`;
      toast({
        title: 'Leads purged',
        description,
        status: 'success',
        duration: 6000,
        isClosable: true,
      });
      onPurgeClose();
      setPage(1);
      fetchLeads(buildFetchParams({ page: 1 }));
    } catch (err: any) {
      toast({
        title: 'Purge failed',
        description: err.message || 'Failed to purge leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onPurgeClose();
    } finally {
      setPurging(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    onFormOpen();
  };

  const handleLeadClick = (lead: Lead) => {
    if (!lead?.id) return;
    router.push(`/leads/${lead.id}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      propertyType: '',
      city: '',
      state: '',
      search: '',
    });
  };

  const handleLeadSelection = (leadId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const statusColors: Record<LeadStatus, string> = {
      new: 'blue',
      contacted: 'yellow',
      qualified: 'orange',
      converted: 'green',
      lost: 'red',
    };
    return statusColors[status] || 'gray';
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    const icons: Record<PropertyType, React.ReactElement> = {
      single_family: <FiHome />,
      multi_family: <FiHome />,
      commercial: <FiBarChart />,
      land: <FiMapPin />,
    };
    return icons[type] || <FiHome />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <Container maxW="container.xl">
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>Please log in to access the leads page.</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="center" justify="center" minH="400px">
            <Spinner size="xl" color="blue.500" />
            <Text>Loading leads...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <Container maxW="container.xl">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex align="center" justify="space-between">
        <Box>
          <Heading size="lg" mb={2}>Leads Management</Heading>
          <Text color="gray.600">Manage and track your property leads</Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onFormOpen}
          >
            Add Lead
          </Button>
          <Button
            leftIcon={<FiUpload />}
            onClick={onImportOpen}
            variant="outline"
          >
            Import CSV
          </Button>
          <Button
            leftIcon={<FiDownload />}
            variant="outline"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="ghost"
            onClick={loadInitialData}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiTrash2 />}
            variant="outline"
            colorScheme="red"
            onClick={onPurgeOpen}
            title="Delete all leads and import history (for fresh data load)"
          >
            Purge all leads
          </Button>
        </HStack>
      </Flex>

      <AlertDialog
        isOpen={isPurgeOpen}
        leastDestructiveRef={purgeCancelRef}
        onClose={onPurgeClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Purge all leads?</AlertDialogHeader>
            <AlertDialogBody>
              This will permanently delete all leads and import history. Use this only when you want
              to do a fresh data load (e.g. after fixing import issues). This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={purgeCancelRef} onClick={onPurgeClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handlePurgeAll} isLoading={purging} ml={3}>
                Purge all
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Statistics */}
      {stats && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 7 }} spacing={4}>
          <Stat key="stat-total">
            <StatLabel>Total Leads</StatLabel>
            <StatNumber>{stats.totalLeads}</StatNumber>
          </Stat>
          <Stat key="stat-new">
            <StatLabel>New Leads</StatLabel>
            <StatNumber color="blue.500">{stats.newLeadsThisMonth}</StatNumber>
            <StatHelpText>Current month</StatHelpText>
          </Stat>
          <Stat key="stat-callback">
            <StatLabel>Call Back</StatLabel>
            <StatNumber color="yellow.600">{stats.callBack}</StatNumber>
          </Stat>
          <Stat key="stat-offer">
            <StatLabel>Offer Made</StatLabel>
            <StatNumber color="orange.500">{stats.offerMade}</StatNumber>
          </Stat>
          <Stat key="stat-contract">
            <StatLabel>Contract Out</StatLabel>
            <StatNumber color="purple.500">{stats.contractOut}</StatNumber>
          </Stat>
          <Stat key="stat-transaction">
            <StatLabel>Transaction</StatLabel>
            <StatNumber color="green.500">{stats.transaction}</StatNumber>
          </Stat>
          <Stat key="stat-negotiating">
            <StatLabel>Negotiating Offer</StatLabel>
            <StatNumber color="teal.500">{stats.negotiatingOffer}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <Flex align="center" justify="space-between">
            <HStack>
              <FiFilter />
              <Text fontWeight="semibold">Filters & Search</Text>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {/* Search Bar */}
            <InputGroup>
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Search leads by name, email, phone, or address..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </InputGroup>

            {/* Filter Options */}
            {showFilters && (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                <Select
                  placeholder="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {filterOptions?.statuses?.map((status, idx) => (
                    <option key={`status-${idx}-${status.value}`} value={status.value}>
                      {status.label} ({status.count})
                    </option>
                  ))}
                </Select>
                <Select
                  placeholder="Property Type"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  {filterOptions?.propertyTypes?.map((type, idx) => (
                    <option key={`type-${idx}-${type.value}`} value={type.value}>
                      {type.label} ({type.count})
                    </option>
                  ))}
                </Select>
                <Select
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                  {filterOptions?.cities?.map((city, idx) => (
                    <option key={`city-${idx}-${city.value}`} value={city.value}>
                      {city.label} ({city.count})
                    </option>
                  ))}
                </Select>
                <Select
                  placeholder="State"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                >
                  {filterOptions?.states?.map((state, idx) => (
                    <option key={`state-${idx}-${state.value}`} value={state.value}>
                      {state.label} ({state.count})
                    </option>
                  ))}
                </Select>
              </SimpleGrid>
            )}

            {/* Filter Actions */}
            {showFilters && (
              <HStack spacing={3} w="full" justify="flex-end">
                <Button size="sm" variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button size="sm" colorScheme="blue" onClick={() => {
                  setPage(1);
                  fetchLeads(buildFetchParams({ page: 1 }));
                }}>
                  Apply Filters
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* View Mode Toggle and Bulk Actions */}
      <Flex align="center" justify="space-between">
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.600">View Mode:</Text>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'solid' : 'ghost'}
            onClick={() => setViewMode('list')}
          >
            <FiList />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'solid' : 'ghost'}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid />
          </Button>
        </HStack>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <HStack spacing={3}>
            <Text fontSize="sm" color="gray.600">
              {selectedLeads.length} lead(s) selected
            </Text>
            <Menu>
              <MenuButton as={Button} size="sm" variant="outline">
                Bulk Actions
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => handleBulkUpdate('status', { status: 'contacted' })}>
                  Mark as Contacted
                </MenuItem>
                <MenuItem onClick={() => handleBulkUpdate('status', { status: 'qualified' })}>
                  Mark as Qualified
                </MenuItem>
                <MenuItem onClick={() => handleBulkUpdate('status', { status: 'lost' })}>
                  Mark as Lost
                </MenuItem>
                <MenuItem onClick={handleBulkDelete} color="red.500">
                  Delete Selected
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        )}
      </Flex>

      {/* Leads Display */}
      {viewMode === 'grid' && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {leads.map((lead, idx) => (
            <Card key={lead.id ?? `lead-grid-${idx}`} onClick={() => handleLeadClick(lead)} cursor="pointer">
              <CardHeader pb={2}>
                <Flex align="center" justify="space-between">
                  <HStack spacing={3}>
                    <Checkbox
                      isChecked={selectedLeads.includes(lead.id)}
                      onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" fontSize="lg">
                        {lead.firstName} {lead.lastName}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {lead.email}
                      </Text>
                    </VStack>
                  </HStack>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<FiEye />} onClick={() => handleLeadClick(lead)}>
                        View Details
                      </MenuItem>
                      <MenuItem icon={<FiEdit />} onClick={() => handleEditLead(lead)}>
                        Edit
                      </MenuItem>
                      <MenuItem icon={<FiTrash2 />} onClick={() => handleDeleteLead(lead.id)} color="red.500">
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <HStack>
                      {getPropertyTypeIcon(lead.propertyType)}
                      <Text fontSize="sm" color="gray.600">
                        {(lead.propertyType ?? '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                      </Text>
                    </HStack>
                    <Badge colorScheme={getStatusColor(lead.status)}>
                      {((lead.status ?? 'NEW') as string).charAt(0).toUpperCase() + (lead.status ?? 'NEW').slice(1)}
                    </Badge>
                  </HStack>
                  
                  <HStack>
                    <FiMapPin />
                    <Text fontSize="sm" noOfLines={2}>
                      {(() => {
                            const addr = lead.address;
                            const street = typeof addr === 'object' && addr !== null ? (addr as { street?: string }).street : (lead as { address?: string }).address;
                            const city = lead.city ?? (typeof addr === 'object' && addr !== null ? (addr as { city?: string }).city : undefined);
                            const state = lead.state ?? (typeof addr === 'object' && addr !== null ? (addr as { state?: string }).state : undefined);
                            const zip = lead.zipCode ?? (typeof addr === 'object' && addr !== null ? (addr as { zipCode?: string }).zipCode : undefined);
                            return [street, city, state, zip].filter(Boolean).join(', ') || '—';
                          })()}
                    </Text>
                  </HStack>
                  
                  <HStack>
                    <FiDollarSign />
                    <Text fontSize="sm" fontWeight="semibold">
                      {formatCurrency(lead.estimatedValue ?? 0)}
                    </Text>
                  </HStack>
                  
                  <HStack>
                    <FiCalendar />
                    <Text fontSize="sm" color="gray.600">
                      Created {formatDate(lead.createdAt)}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Select All Header */}
              <Flex align="center" justify="space-between" p={2} bg="gray.50" borderRadius="md">
                <HStack spacing={3}>
                  <Checkbox
                    isChecked={selectedLeads.length === leads.length && leads.length > 0}
                    isIndeterminate={selectedLeads.length > 0 && selectedLeads.length < leads.length}
                    onChange={handleSelectAll}
                  />
                  <Text fontSize="sm" fontWeight="medium">
                    Select All ({leads.length} leads)
                  </Text>
                </HStack>
              </Flex>

              {/* Leads List */}
              {leads.map((lead, idx) => (
                <Box key={lead.id ?? `lead-list-${idx}`} p={4} border="1px solid" borderColor="gray.200" borderRadius="md" onClick={() => handleLeadClick(lead)} cursor="pointer">
                  <Flex align="center" justify="space-between">
                    <HStack spacing={3} flex={1}>
                      <Checkbox
                        isChecked={selectedLeads.includes(lead.id)}
                        onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                      />
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack>
                          <Text fontWeight="semibold" fontSize="lg">
                            {lead.firstName} {lead.lastName}
                          </Text>
                          <Badge colorScheme={getStatusColor(lead.status)}>
                            {((lead.status ?? 'NEW') as string).charAt(0).toUpperCase() + (lead.status ?? 'NEW').slice(1)}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {lead.email} • {lead.phone}
                        </Text>
                        <HStack>
                          <FiMapPin />
                          <Text fontSize="sm">
                            {(() => {
                            const addr = lead.address;
                            const street = typeof addr === 'object' && addr !== null ? (addr as { street?: string }).street : (lead as { address?: string }).address;
                            const city = lead.city ?? (typeof addr === 'object' && addr !== null ? (addr as { city?: string }).city : undefined);
                            const state = lead.state ?? (typeof addr === 'object' && addr !== null ? (addr as { state?: string }).state : undefined);
                            const zip = lead.zipCode ?? (typeof addr === 'object' && addr !== null ? (addr as { zipCode?: string }).zipCode : undefined);
                            return [street, city, state, zip].filter(Boolean).join(', ') || '—';
                          })()}
                          </Text>
                        </HStack>
                        <HStack>
                          {getPropertyTypeIcon(lead.propertyType)}
                          <Text fontSize="sm" color="gray.600">
                            {(lead.propertyType ?? '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                          </Text>
                          <FiDollarSign />
                          <Text fontSize="sm" fontWeight="semibold">
                            {formatCurrency(lead.estimatedValue ?? 0)}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLeadClick(lead)}
                        aria-label="View lead details"
                      />
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditLead(lead)}
                        aria-label="Edit lead"
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLead(lead.id)}
                        aria-label="Delete lead"
                        color="red.500"
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {pagination && (
        <Flex align="center" justify="space-between" wrap="wrap" gap={4} py={4}>
          <Text fontSize="sm" color="gray.600">
            {pagination.total === 0
              ? 'No leads'
              : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`}
          </Text>
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.600">Per page</Text>
              <Select
                size="sm"
                w="70px"
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  setPage(1);
                  fetchLeads(buildFetchParams({ page: 1, limit: newLimit }));
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiChevronLeft />}
                isDisabled={pagination.page <= 1}
                onClick={() => {
                  const nextPage = pagination.page - 1;
                  setPage(nextPage);
                  fetchLeads(buildFetchParams({ page: nextPage }));
                }}
              >
                Previous
              </Button>
              <Text fontSize="sm" color="gray.600">
                Page {pagination.page} of {pagination.pages}
              </Text>
              <Button
                size="sm"
                rightIcon={<FiChevronRight />}
                isDisabled={pagination.page >= pagination.pages}
                onClick={() => {
                  const nextPage = pagination.page + 1;
                  setPage(nextPage);
                  fetchLeads(buildFetchParams({ page: nextPage }));
                }}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        </Flex>
      )}

      {/* Hidden file input for import */}
      <input
        id="file-upload"
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImport(file);
          }
        }}
      />

      {/* Simple Lead Form Modal */}
      {isFormOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Card maxW="2xl" w="full" mx={4}>
            <CardHeader>
              <Heading size="md">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <Text>Lead form would go here...</Text>
                <HStack spacing={3}>
                  <Button onClick={onFormClose}>Cancel</Button>
                  <Button colorScheme="blue" onClick={() => {
                    // Mock submit
                    if (editingLead) {
                      handleUpdateLead(editingLead.id, { status: 'contacted' });
                    } else {
                      handleCreateLead({
                        firstName: 'New',
                        lastName: 'Lead',
                        email: 'new@example.com',
                        phone: '(555) 000-0000',
                        address: '123 Example St',
                        city: 'Austin',
                        state: 'TX',
                        zipCode: '78701',
                        propertyType: 'single_family',
                        estimatedValue: 300000,
                        notes: 'Sample lead',
                        status: 'new'
                      });
                    }
                  }}>
                    {editingLead ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      )}
      <CsvImportModal
        isOpen={isImportOpen}
        onClose={onImportClose}
        onSuccess={() => {
          setPage(1);
          fetchLeads(buildFetchParams({ page: 1 }));
          onImportClose();
        }}
      />
    </VStack>
  );
};

const LeadsPage: NextPage = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <LeadsPageContent />
      </ErrorBoundary>
    </Layout>
  );
};

export default LeadsPage; 