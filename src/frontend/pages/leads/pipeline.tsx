import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { FiPlus, FiFilter, FiRefreshCw, FiMoreVertical, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { LeadPipeline } from '../../features/lead-management/components/LeadPipeline';
import { LeadDetail } from '../../components/leads/LeadDetail/LeadDetail';
import { LeadForm } from '../../features/lead-management/components/LeadForm';
import { Lead } from '../../features/lead-management/types/lead';
import { useLeads } from '../../hooks/services/useLeads';

const LeadPipelinePage: React.FC = () => {
  const toast = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    assignedTo: '',
    propertyType: '',
    minValue: '',
    maxValue: '',
  });

  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

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
    getLeadStats,
  } = useLeads();

  // Fetch leads on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated, fetchLeads]);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    onDetailOpen();
  };

  const handleLeadEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowLeadForm(true);
  };

  const handleLeadDelete = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast({
        title: 'Lead Deleted',
        description: 'Lead has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Lead',
        description: error instanceof Error ? error.message : 'Failed to delete lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLeadFormSubmit = async (leadData: Partial<Lead>) => {
    try {
      if (editingLead) {
        await updateLead(editingLead.id, leadData);
        toast({
          title: 'Lead Updated',
          description: 'Lead has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createLead(leadData as any);
        toast({
          title: 'Lead Created',
          description: 'New lead has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      setShowLeadForm(false);
      setEditingLead(null);
    } catch (error) {
      toast({
        title: 'Error Saving Lead',
        description: error instanceof Error ? error.message : 'Failed to save lead',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRefresh = () => {
    fetchLeads();
    toast({
      title: 'Pipeline Refreshed',
      description: 'Lead pipeline data has been updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Calculate pipeline statistics
  const pipelineStats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === 'new').length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    qualified: leads.filter(lead => lead.status === 'qualified').length,
    converted: leads.filter(lead => lead.status === 'converted').length,
    lost: leads.filter(lead => lead.status === 'lost').length,
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
            {/* Breadcrumb */}
            <Breadcrumb fontSize="sm" color="gray.600">
              <BreadcrumbItem>
                <BreadcrumbLink href="/leads">Leads</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Pipeline</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Page Header */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                  Lead Pipeline
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Visualize and manage your lead flow
                </Text>
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
                >
                  Filter
                </Button>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => {
                    setEditingLead(null);
                    setShowLeadForm(true);
                  }}
                >
                  Add Lead
                </Button>
              </HStack>
            </HStack>

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error Loading Pipeline</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Pipeline Statistics */}
            <SimpleGrid columns={{ base: 2, md: 6 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Leads</StatLabel>
                    <StatNumber>{pipelineStats.total}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>New</StatLabel>
                    <StatNumber color="blue.500">{pipelineStats.new}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Contacted</StatLabel>
                    <StatNumber color="yellow.500">{pipelineStats.contacted}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Qualified</StatLabel>
                    <StatNumber color="orange.500">{pipelineStats.qualified}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Converted</StatLabel>
                    <StatNumber color="green.500">{pipelineStats.converted}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Lost</StatLabel>
                    <StatNumber color="red.500">{pipelineStats.lost}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Pipeline Board */}
            <LeadPipeline
              leads={leads}
              onLeadSelect={handleLeadSelect}
              onLeadEdit={handleLeadEdit}
              onLeadDelete={handleLeadDelete}
              onLeadStatusChange={async (leadId: string, status: Lead['status']) => {
                await updateLead(leadId, { status });
              }}
              loading={loading}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </VStack>
        </Box>
      </Box>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          isOpen={isDetailOpen}
          onClose={() => {
            setSelectedLead(null);
            onDetailClose();
          }}
          onEdit={() => {
            setEditingLead(selectedLead);
            setShowLeadForm(true);
            onDetailClose();
          }}
        />
      )}

      {/* Lead Form Modal */}
      {showLeadForm && (
        <LeadForm
          isOpen={showLeadForm}
          onClose={() => {
            setShowLeadForm(false);
            setEditingLead(null);
          }}
          onSubmit={handleLeadFormSubmit}
          lead={editingLead || undefined}
          mode={editingLead ? 'edit' : 'create'}
        />
      )}
    </Box>
  );
};

export default LeadPipelinePage;
