import React, { useState } from 'react';
import { Box, Heading, VStack, useToast } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary, Breadcrumb } from '../../components/ui';
import { PipelineBoard } from '../../features/lead-management/components/PipelineBoard';
import { LeadForm } from '../../features/lead-management/components/LeadForm';
import { Lead } from '../../features/lead-management/types/lead';

const PipelinePage: React.FC = () => {
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const toast = useToast();

  const handleAddLead = (stageId?: string) => {
    setSelectedStageId(stageId || null);
    setIsAddLeadModalOpen(true);
  };

  const handleExport = () => {
    // TODO: Implement pipeline export functionality
    toast({
      title: 'Export Pipeline',
      description: 'Pipeline export functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRefresh = () => {
    // The refresh functionality is handled within the PipelineBoard component
    toast({
      title: 'Pipeline Refreshed',
      description: 'Pipeline data has been updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleLeadSelect = (lead: Lead) => {
    // Lead selection is handled within the PipelineBoard component
    console.log('Selected lead:', lead);
  };

  const handleStageUpdate = (stageId: string, updates: any) => {
    // TODO: Implement stage update functionality
    console.log('Stage update:', stageId, updates);
  };

  const handleLeadFormSubmit = (leadData: Partial<Lead>) => {
    // TODO: Implement lead creation functionality
    console.log('New lead data:', leadData);
    setIsAddLeadModalOpen(false);
    setSelectedStageId(null);
    
    toast({
      title: 'Lead Created',
      description: 'New lead has been added to the pipeline',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLeadFormCancel = () => {
    setIsAddLeadModalOpen(false);
    setSelectedStageId(null);
  };

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              <Breadcrumb />
              <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                Lead Pipeline
              </Heading>
              <PipelineBoard
                onLeadSelect={handleLeadSelect}
                onStageUpdate={handleStageUpdate}
                onRefresh={handleRefresh}
                onExport={handleExport}
                onAddLead={handleAddLead}
              />
            </VStack>
          </Box>
        </Box>

        {/* Add Lead Modal */}
        <LeadForm
          isOpen={isAddLeadModalOpen}
          onClose={handleLeadFormCancel}
          onSubmit={handleLeadFormSubmit}
          initialStageId={selectedStageId}
          mode="create"
        />
      </Box>
    </ErrorBoundary>
  );
};

export default PipelinePage;
