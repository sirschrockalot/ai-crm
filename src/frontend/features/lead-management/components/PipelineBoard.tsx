import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { FiRefreshCw, FiPlus, FiFilter, FiDownload } from 'react-icons/fi';
import { PipelineStage, Lead } from '../types/lead';
import { usePipeline } from '../hooks/usePipeline';
import { PipelineStage as PipelineStageComponent } from './PipelineStage';
import { LeadDetail } from './LeadDetail';
import { ErrorBoundary } from '../../../components/ui/ErrorBoundary';

interface PipelineBoardProps {
  onLeadSelect?: (lead: Lead) => void;
  onStageUpdate?: (stageId: string, updates: Partial<PipelineStage>) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onAddLead?: () => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  onLeadSelect,
  onStageUpdate,
  onRefresh,
  onExport,
  onAddLead,
}) => {
  const {
    stages,
    leads,
    loading,
    error,
    selectedLead,
    moveLead,
    updateStage,
    selectLead,
    refreshPipeline,
  } = usePipeline();

  const [isDragging, setIsDragging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Calculate pipeline statistics
  const pipelineStats = useMemo(() => {
    const totalLeads = stages.reduce((total, stage) => total + stage.leads.length, 0);
    const totalValue = stages.reduce((total, stage) => 
      total + stage.leads.reduce((stageTotal, lead) => stageTotal + (lead.estimatedValue || 0), 0), 0
    );
    const conversionRate = stages.length > 1 ? 
      ((stages[stages.length - 1].leads.length / totalLeads) * 100) : 0;

    return { totalLeads, totalValue, conversionRate };
  }, [stages]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Same stage - just reorder
      return;
    }

    // Move lead between stages
    try {
      await moveLead({
        leadId: draggableId,
        fromStageId: source.droppableId,
        toStageId: destination.droppableId,
      });
      
      toast({
        title: 'Lead moved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to move lead:', error);
      toast({
        title: 'Failed to move lead',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [moveLead, toast]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleLeadClick = useCallback((lead: Lead) => {
    selectLead(lead);
    onLeadSelect?.(lead);
  }, [selectLead, onLeadSelect]);

  const handleStageUpdate = useCallback((stageId: string, updates: Partial<PipelineStage>) => {
    updateStage(stageId, updates);
    onStageUpdate?.(stageId, updates);
  }, [updateStage, onStageUpdate]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshPipeline();
      onRefresh?.();
      toast({
        title: 'Pipeline refreshed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to refresh pipeline',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshPipeline, onRefresh, toast]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Loading pipeline...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Error loading pipeline</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
        <Button size="sm" onClick={handleRefresh}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <Box bg={bgColor} minH="calc(100vh - 200px)" p={4}>
        <VStack spacing={6} align="stretch">
          {/* Pipeline Header with Actions */}
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
            <Flex justify="space-between" align="center" mb={4}>
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg" color="gray.800">
                  Sales Pipeline
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {pipelineStats.totalLeads} leads • ${pipelineStats.totalValue.toLocaleString()} total value
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                <Tooltip label="Refresh pipeline">
                  <IconButton
                    aria-label="Refresh pipeline"
                    icon={<FiRefreshCw />}
                    onClick={handleRefresh}
                    isLoading={isRefreshing}
                    variant="ghost"
                    size="sm"
                  />
                </Tooltip>
                
                <Tooltip label="Filter leads">
                  <IconButton
                    aria-label="Filter leads"
                    icon={<FiFilter />}
                    variant="ghost"
                    size="sm"
                  />
                </Tooltip>
                
                <Tooltip label="Export pipeline">
                  <IconButton
                    aria-label="Export pipeline"
                    icon={<FiDownload />}
                    onClick={onExport}
                    variant="ghost"
                    size="sm"
                  />
                </Tooltip>
                
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  size="sm"
                  onClick={onAddLead}
                >
                  Add Lead
                </Button>
              </HStack>
            </Flex>

            {/* Pipeline Statistics */}
            <HStack spacing={6} justify="center">
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {pipelineStats.totalLeads}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Leads</Text>
              </VStack>
              
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${pipelineStats.totalValue.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Value</Text>
              </VStack>
              
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {pipelineStats.conversionRate.toFixed(1)}%
                </Text>
                <Text fontSize="sm" color="gray.600">Conversion Rate</Text>
              </VStack>
            </HStack>
          </Box>

          {/* Pipeline Stages */}
          <Box overflowX="auto" overflowY="hidden">
            <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              <HStack spacing={4} align="flex-start" minW="max-content" pb={4}>
                {stages.map((stage) => (
                  <PipelineStageComponent
                    key={stage.id}
                    stage={stage}
                    onLeadMove={(leadId: string, fromStageId: string, toStageId: string) => {
                      moveLead({ leadId, fromStageId, toStageId });
                    }}
                    onLeadClick={handleLeadClick}
                    onStageUpdate={handleStageUpdate}
                    isDragging={isDragging}
                  />
                ))}
              </HStack>
            </DragDropContext>
          </Box>

          {/* Lead Detail Modal */}
          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              isOpen={!!selectedLead}
              onClose={() => selectLead(null)}
            />
          )}
        </VStack>
      </Box>
    </ErrorBoundary>
  );
};
