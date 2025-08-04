import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, RefreshIcon } from '@chakra-ui/icons';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import PipelineBoard from '../components/PipelineBoard';
import { usePipeline } from '../../../hooks/usePipeline';
import { Lead, PipelineStage } from '../../../types/pipeline';

// Mock tenant ID - in real app, this would come from auth context
const MOCK_TENANT_ID = 'tenant-123';

const PipelinePage: React.FC = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  
  const {
    stages,
    leads,
    isLoading,
    hasError,
    stagesError,
    leadsError,
    handleLeadMove,
    getLeadsForStage,
    refreshData,
    createStageMutation,
    updateStageMutation,
  } = usePipeline({
    tenantId: MOCK_TENANT_ID,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleLeadClick = (leadId: string) => {
    setSelectedLeadId(leadId);
    // TODO: Open lead detail modal or navigate to lead detail page
  };

  const handleStageAdd = () => {
    // TODO: Open stage creation modal
    console.log('Add stage clicked');
  };

  const handleStageEdit = (stageId: string) => {
    // TODO: Open stage edit modal
    console.log('Edit stage clicked:', stageId);
  };

  const handleLeadAdd = (stageId: string) => {
    // TODO: Open lead creation modal
    console.log('Add lead clicked for stage:', stageId);
  };

  // Error handling
  if (hasError) {
    return (
      <Box p={6} bg={bgColor} minH="100vh">
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Error loading pipeline data</Text>
            {stagesError && (
              <Text fontSize="sm">Failed to load pipeline stages</Text>
            )}
            {leadsError && (
              <Text fontSize="sm">Failed to load leads</Text>
            )}
            <Button size="sm" onClick={refreshData} mt={2}>
              Retry
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // Loading state
  if (isLoading && stages.length === 0) {
    return (
      <Box p={6} bg={bgColor} minH="100vh">
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColor}>Loading pipeline...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Header */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        px={6}
        py={4}
      >
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Sales Pipeline
            </Text>
            <Text fontSize="sm" color="gray.500">
              Manage your leads and track progress through the sales process
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<RefreshIcon />}
              variant="outline"
              size="sm"
              onClick={refreshData}
              isLoading={isLoading}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              size="sm"
              onClick={handleStageAdd}
              isLoading={createStageMutation.isLoading}
            >
              Add Stage
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Pipeline Board */}
      <Box p={4}>
        <PipelineBoard
          stages={stages}
          leads={leads}
          onLeadMove={handleLeadMove}
          onStageAdd={handleStageAdd}
          onStageEdit={handleStageEdit}
          onLeadClick={handleLeadClick}
          isLoading={isLoading}
        />
      </Box>

      {/* Pipeline Analytics Summary */}
      {stages.length > 0 && (
        <Box
          bg="white"
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          px={6}
          py={4}
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={6}>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Total Leads
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {leads.length}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Active Stages
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {stages.filter(stage => stage.isActive).length}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  Total Value
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  ${leads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}
                </Text>
              </VStack>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsOpen}
            >
              Pipeline Settings
            </Button>
          </Flex>
        </Box>
      )}

      {/* Empty State */}
      {stages.length === 0 && !isLoading && (
        <Box p={8} textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="lg" color={textColor}>
              No pipeline stages found
            </Text>
            <Text fontSize="sm" color="gray.500">
              Create your first pipeline stage to get started
            </Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleStageAdd}
              isLoading={createStageMutation.isLoading}
            >
              Create First Stage
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

// Wrapper with providers
const PipelinePageWithProviders: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PipelinePage />
    </QueryClientProvider>
  );
};

export default PipelinePageWithProviders; 