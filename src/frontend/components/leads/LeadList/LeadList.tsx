import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  useDisclosure,
  Checkbox,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiSearch, FiDownload, FiUpload, FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useLeads } from '../../../hooks/services/useLeads';
import { Lead, LeadStatus, PropertyType } from '../../../types';
import { Table, Card, ErrorBoundary, Loading } from '../../ui';
import LeadForm from '../../forms/LeadForm';
import { LeadDetail } from '../LeadDetail/LeadDetail';

interface LeadListProps {
  onLeadSelect?: (lead: Lead) => void;
  showFilters?: boolean;
  showBulkActions?: boolean;
  selectedLeads?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  filters?: {
    status?: string;
    propertyType?: string;
    search?: string;
    minValue?: string;
    maxValue?: string;
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onFiltersChange?: (filters: any) => void;
}

export const LeadList: React.FC<LeadListProps> = ({
  onLeadSelect,
  showFilters = true,
  showBulkActions = true,
  selectedLeads: externalSelectedLeads,
  onSelectionChange,
  filters: externalFilters,
  onFiltersChange,
}) => {
  const toast = useToast();
  const {
    leads,
    loading,
    error,
    isAuthenticated,
    user,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    getLeadStats,
  } = useLeads();

  const [internalSelectedLeads, setInternalSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [internalFilters, setInternalFilters] = useState<{
    status?: LeadStatus;
    propertyType?: PropertyType;
    minValue?: number;
    maxValue?: number;
  }>({});

  // Use external state if provided, otherwise use internal state
  const selectedLeads = externalSelectedLeads || internalSelectedLeads;
  const setSelectedLeads = onSelectionChange || setInternalSelectedLeads;
  const filters = externalFilters || internalFilters;
  const setFilters = onFiltersChange || setInternalFilters;

  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access lead management features.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Fetch leads on component mount
    fetchLeads();
  }, [fetchLeads, isAuthenticated, toast]);

  // Update search filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        // In a real implementation, this would update the API filters
        // For now, we'll just update local state
        setFilters((prev: any) => ({ ...prev, search: searchTerm }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setFilters]);

  // Sync external filters with internal state
  useEffect(() => {
    if (externalFilters) {
      setInternalFilters({
        status: externalFilters.status as LeadStatus,
        propertyType: externalFilters.propertyType as PropertyType,
        minValue: externalFilters.minValue ? Number(externalFilters.minValue) : undefined,
        maxValue: externalFilters.maxValue ? Number(externalFilters.maxValue) : undefined,
      });
      if (externalFilters.search) {
        setSearchTerm(externalFilters.search);
      }
    }
  }, [externalFilters]);

  // Handle lead form submission
  const handleLeadSubmit = async (data: any) => {
    try {
      if (editingLead) {
        await updateLead(editingLead.id, data);
        toast({
          title: 'Lead updated',
          description: 'Lead has been successfully updated.',
          status: 'success',
        });
      } else {
        await createLead(data);
        toast({
          title: 'Lead created',
          description: 'New lead has been successfully created.',
          status: 'success',
        });
      }
      setShowLeadForm(false);
      setEditingLead(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save lead',
        status: 'error',
      });
    }
  };

  // Handle lead deletion
  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast({
        title: 'Lead deleted',
        description: 'Lead has been successfully deleted.',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete lead',
        status: 'error',
      });
    }
  };

  // Handle bulk operations
  const handleBulkUpdate = async (updates: Partial<Lead>) => {
    try {
      await bulkUpdateLeads(selectedLeads, updates);
      setSelectedLeads([]);
      toast({
        title: 'Leads updated',
        description: `${selectedLeads.length} leads have been updated.`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update leads',
        status: 'error',
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteLeads(selectedLeads);
      setSelectedLeads([]);
      toast({
        title: 'Leads deleted',
        description: `${selectedLeads.length} leads have been deleted.`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete leads',
        status: 'error',
      });
    }
  };

  // Handle file import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importLeads(file);
      toast({
        title: 'Import successful',
        description: `Imported ${result.imported} leads. ${result.errors.length} errors occurred.`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import leads',
        status: 'error',
      });
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportLeads();
      toast({
        title: 'Export successful',
        description: 'Leads have been exported successfully.',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export leads',
        status: 'error',
      });
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Filter leads based on current filters
  const filteredLeads = leads.filter(lead => {
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.propertyType && lead.propertyType !== filters.propertyType) return false;
    if (filters.minValue && lead.estimatedValue < Number(filters.minValue)) return false;
    if (filters.maxValue && lead.estimatedValue > Number(filters.maxValue)) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        lead.firstName.toLowerCase().includes(searchLower) ||
        lead.lastName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchTerm)
      );
    }
    return true;
  });

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access lead management features.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (loading && leads.length === 0) {
    return <Loading variant="spinner" size="lg" />;
  }

  // Show error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Leads</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Table columns configuration
  const columns = [
    {
      key: 'select',
      header: (
        <Checkbox
          isChecked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
          isIndeterminate={selectedLeads.length > 0 && selectedLeads.length < filteredLeads.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedLeads(filteredLeads.map(lead => lead.id));
            } else {
              setSelectedLeads([]);
            }
          }}
        />
      ),
      accessor: (lead: Lead) => (
        <Checkbox
          isChecked={selectedLeads.includes(lead.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedLeads([...selectedLeads, lead.id]);
            } else {
              setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
            }
          }}
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (lead: Lead) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="semibold">
            {lead.firstName} {lead.lastName}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {lead.email}
          </Text>
        </VStack>
      ),
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (lead: Lead) => <Text>{lead.phone}</Text>,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (lead: Lead) => (
        <Badge
          colorScheme={
            lead.status === 'new' ? 'blue' :
            lead.status === 'contacted' ? 'yellow' :
            lead.status === 'qualified' ? 'orange' :
            lead.status === 'converted' ? 'green' :
            'gray'
          }
        >
          {lead.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'propertyType',
      header: 'Property Type',
      accessor: (lead: Lead) => <Text>{lead.propertyType}</Text>,
      sortable: true,
    },
    {
      key: 'estimatedValue',
      header: 'Value',
      accessor: (lead: Lead) => (
        <Text fontWeight="semibold">
          ${lead.estimatedValue.toLocaleString()}
        </Text>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (lead: Lead) => (
        <HStack spacing={2}>
          <IconButton
            size="sm"
            icon={<FiEye />}
            aria-label="View lead"
            onClick={() => {
              setViewingLead(lead);
              onDetailOpen();
            }}
          />
          <IconButton
            size="sm"
            icon={<FiEdit />}
            aria-label="Edit lead"
            onClick={() => {
              setEditingLead(lead);
              setShowLeadForm(true);
            }}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              size="sm"
              icon={<FiMoreVertical />}
              aria-label="More actions"
            />
            <MenuList>
              <MenuItem
                icon={<FiTrash2 />}
                onClick={() => handleDeleteLead(lead.id)}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Lead Management</Heading>
            <Text color="gray.600">
              {filteredLeads.length} leads • {user?.firstName} {user?.lastName}
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiUpload />}
              onClick={() => document.getElementById('file-import')?.click()}
              isLoading={loading}
            >
              Import
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={handleExport}
              isLoading={loading}
            >
              Export
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                setEditingLead(null);
                setShowLeadForm(true);
              }}
              isLoading={loading}
            >
              Add Lead
            </Button>
          </HStack>
        </HStack>

        {/* Filters */}
        {showFilters && (
          <Card>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md">Filters</Heading>
                <Button size="sm" variant="ghost" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </HStack>
              
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FiSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <Select
                  placeholder="Status"
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ status: e.target.value as LeadStatus || undefined })}
                  maxW="150px"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </Select>

                <Select
                  placeholder="Property Type"
                  value={filters.propertyType || ''}
                  onChange={(e) => updateFilters({ propertyType: e.target.value as PropertyType || undefined })}
                  maxW="150px"
                >
                  <option value="single_family">Single Family</option>
                  <option value="multi_family">Multi Family</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                </Select>

                <Input
                  placeholder="Min Value"
                  type="number"
                  value={filters.minValue || ''}
                  onChange={(e) => updateFilters({ minValue: e.target.value ? Number(e.target.value) : undefined })}
                  maxW="120px"
                />

                <Input
                  placeholder="Max Value"
                  type="number"
                  value={filters.maxValue || ''}
                  onChange={(e) => updateFilters({ maxValue: e.target.value ? Number(e.target.value) : undefined })}
                  maxW="120px"
                />
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Bulk Actions */}
        {showBulkActions && selectedLeads.length > 0 && (
          <Card>
            <HStack justify="space-between">
              <Text>
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </Text>
              <HStack spacing={2}>
                <Select
                  placeholder="Bulk Update"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkUpdate({ status: e.target.value as LeadStatus });
                    }
                  }}
                  maxW="200px"
                >
                  <option value="new">Mark as New</option>
                  <option value="contacted">Mark as Contacted</option>
                  <option value="qualified">Mark as Qualified</option>
                  <option value="converted">Mark as Converted</option>
                  <option value="lost">Mark as Lost</option>
                </Select>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleBulkDelete}
                  isLoading={loading}
                >
                  Delete Selected
                </Button>
              </HStack>
            </HStack>
          </Card>
        )}

        {/* Leads Table */}
        <Card>
          {loading ? (
            <Loading variant="skeleton" />
          ) : (
            <Table
              data={filteredLeads}
              columns={columns}
              onRowClick={(lead) => onLeadSelect?.(lead)}
            />
          )}
        </Card>

        {/* Hidden file input for import */}
        <input
          id="file-import"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />

        {/* Lead Form Modal */}
        {showLeadForm && (
          <LeadForm
            onSubmit={handleLeadSubmit}
            initialData={editingLead || undefined}
          />
        )}

        {/* Lead Detail Modal */}
        {viewingLead && (
          <LeadDetail
            lead={viewingLead}
            isOpen={isDetailOpen}
            onClose={() => {
              setViewingLead(null);
              onDetailClose();
            }}
            onEdit={() => {
              setEditingLead(viewingLead);
              setShowLeadForm(true);
              onDetailClose();
            }}
          />
        )}
      </VStack>
    </ErrorBoundary>
  );
}; 