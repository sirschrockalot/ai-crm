import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  HStack, 
  Button, 
  useToast, 
  Text,
  Badge,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FiPlus, FiDownload, FiFilter, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { LeadList } from '../../components/leads';
import { LeadForm } from '../../features/lead-management/components/LeadForm';
import { LeadImportExport } from '../../features/lead-management/components/LeadImportExport';
import { Lead } from '../../features/lead-management/types/lead';
import { useLeads } from '../../hooks/services/useLeads';

const LeadsPage: React.FC = () => {
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    propertyType: '',
    search: '',
    minValue: '',
    maxValue: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const toast = useToast();
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  
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
    getLeadStats
  } = useLeads();

  // Fetch leads on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated, fetchLeads]);

  const handleAddLead = () => {
    setIsAddLeadModalOpen(true);
  };

  const handleImportExport = () => {
    setIsImportExportModalOpen(true);
  };

  const handleFilter = () => {
    onFilterToggle();
  };

  const handleRefresh = () => {
    fetchLeads();
    toast({
      title: 'Leads Refreshed',
      description: 'Lead data has been updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleLeadFormSubmit = async (leadData: Partial<Lead>) => {
    try {
      await createLead(leadData as any);
      setIsAddLeadModalOpen(false);
      
      toast({
        title: 'Lead Created',
        description: 'New lead has been added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Creating Lead',
        description: error instanceof Error ? error.message : 'Failed to create lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLeadFormCancel = () => {
    setIsAddLeadModalOpen(false);
  };

  const handleBulkAction = async (action: string, data?: any) => {
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

    try {
      switch (action) {
        case 'delete':
          await bulkDeleteLeads(selectedLeads);
          setSelectedLeads([]);
          toast({
            title: 'Leads Deleted',
            description: `${selectedLeads.length} leads have been deleted`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          break;
        case 'update':
          await bulkUpdateLeads(selectedLeads, data);
          setSelectedLeads([]);
          toast({
            title: 'Leads Updated',
            description: `${selectedLeads.length} leads have been updated`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          break;
        default:
          break;
      }
    } catch (error) {
      toast({
        title: 'Bulk Action Failed',
        description: error instanceof Error ? error.message : 'Failed to perform bulk action',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportLeads();
      toast({
        title: 'Export Successful',
        description: 'Lead data has been exported',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Please log in to access lead management features.
                </AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Box display={{ base: 'block', md: 'flex' }}>
        <Sidebar />
        <Box flex={1}>
          <Navigation />
          <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
            {/* Page Header */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                  Lead Management
                </Heading>
                <HStack spacing={2}>
                  <Text color="gray.600" fontSize="sm">
                    {leads.length} leads
                  </Text>
                  {user && (
                    <Text color="gray.600" fontSize="sm">
                      • {user.firstName} {user.lastName}
                    </Text>
                  )}
                </HStack>
              </VStack>
              
              <HStack spacing={3}>
                <Button
                  leftIcon={<FiRefreshCw />}
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  isLoading={loading}
                >
                  Refresh
                </Button>
                <Button
                  leftIcon={<FiFilter />}
                  variant="outline"
                  size="sm"
                  onClick={handleFilter}
                >
                  Filter
                </Button>
                <Button
                  leftIcon={<FiUpload />}
                  variant="outline"
                  size="sm"
                  onClick={handleImportExport}
                >
                  Import/Export
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  isLoading={loading}
                >
                  Export
                </Button>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleAddLead}
                >
                  Add Lead
                </Button>
              </HStack>
            </HStack>

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error Loading Leads</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Bulk Actions */}
            {selectedLeads.length > 0 && (
              <HStack justify="space-between" p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="medium">
                  {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    isLoading={loading}
                  >
                    Delete Selected
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleBulkAction('update', { status: 'contacted' })}
                    isLoading={loading}
                  >
                    Mark as Contacted
                  </Button>
                </HStack>
              </HStack>
            )}

            {/* Lead List Component */}
            <LeadList 
              onLeadSelect={(lead) => {
                // Handle lead selection - could navigate to detail page
                console.log('Selected lead:', lead);
              }}
              showFilters={isFilterOpen}
              showBulkActions={true}
              selectedLeads={selectedLeads}
              onSelectionChange={setSelectedLeads}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </VStack>
        </Box>
      </Box>

      {/* Add Lead Modal */}
      <LeadForm
        isOpen={isAddLeadModalOpen}
        onClose={handleLeadFormCancel}
        onSubmit={handleLeadFormSubmit}
        mode="create"
      />

      {/* Import/Export Modal */}
      <LeadImportExport
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onImport={importLeads}
        onExport={async () => {
          await exportLeads();
        }}
      />
    </Box>
  );
};

export default LeadsPage; 