import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Box, VStack, HStack, Heading, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { PipelineStage } from './PipelineStage';
import { PipelineStage as PipelineStageType, PipelineBoardProps } from './PipelineBoard';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface PipelineBoardWithDragProps extends Omit<PipelineBoardProps, 'onLeadMove'> {
  onLeadMove?: (leadId: string, fromStageId: string, toStageId: string) => Promise<void>;
  onStatusUpdate?: (leadId: string, newStatus: string) => Promise<void>;
}

export const PipelineBoardWithDrag: React.FC<PipelineBoardWithDragProps> = ({
  stages,
  onLeadMove,
  onStatusUpdate,
  onLeadClick,
  loading = false,
  error = null,
}) => {
  const [localStages, setLocalStages] = useState<PipelineStageType[]>(stages);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Update local stages when props change
  React.useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    const fromStageId = source.droppableId;
    const toStageId = destination.droppableId;

    if (fromStageId === toStageId) {
      // Reordering within the same stage
      const stageIndex = localStages.findIndex(stage => stage.id === fromStageId);
      if (stageIndex === -1) return;

      const newStages = [...localStages];
      const stage = { ...newStages[stageIndex] };
      const leads = [...stage.leads];
      
      const [removed] = leads.splice(source.index, 1);
      leads.splice(destination.index, 0, removed);
      
      stage.leads = leads;
      newStages[stageIndex] = stage;
      setLocalStages(newStages);
      return;
    }

    // Moving between stages
    try {
      // Optimistic update
      const newStages = localStages.map(stage => {
        if (stage.id === fromStageId) {
          return {
            ...stage,
            leads: stage.leads.filter((_, index) => index !== source.index),
          };
        }
        if (stage.id === toStageId) {
          const lead = localStages
            .find(s => s.id === fromStageId)
            ?.leads[source.index];
          if (lead) {
            return {
              ...stage,
              leads: [
                ...stage.leads.slice(0, destination.index),
                { ...lead, status: stage.name.toLowerCase() },
                ...stage.leads.slice(destination.index),
              ],
            };
          }
        }
        return stage;
      });

      setLocalStages(newStages);

      // Call API to update
      if (onLeadMove) {
        await onLeadMove(draggableId, fromStageId, toStageId);
      }

      if (onStatusUpdate) {
        const newStage = newStages.find(s => s.id === toStageId);
        if (newStage) {
          await onStatusUpdate(draggableId, newStage.name.toLowerCase());
        }
      }

      toast({
        title: 'Lead moved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Revert optimistic update
      setLocalStages(stages);
      
      toast({
        title: 'Failed to move lead',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [localStages, onLeadMove, onStatusUpdate, toast]);

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Text>Loading pipeline...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Text color="red.500">Error loading pipeline: {error}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Box
          bg={bgColor}
          minH="calc(100vh - 200px)"
          p={4}
          overflowX="auto"
          overflowY="hidden"
        >
          <VStack spacing={6} align="stretch">
            {/* Pipeline Header */}
            <Box>
              <Heading size="lg" mb={2}>
                Sales Pipeline
              </Heading>
              <Text color="gray.600" fontSize="sm">
                {localStages.reduce((total, stage) => total + stage.leads.length, 0)} leads in pipeline
                {isDragging && ' - Drag to move leads between stages'}
              </Text>
            </Box>

            {/* Pipeline Stages */}
            <HStack spacing={4} align="flex-start" minW="max-content">
              {localStages.map((stage) => (
                <Droppable key={stage.id} droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minWidth: '300px',
                        maxWidth: '350px',
                        height: 'fit-content',
                        maxHeight: 'calc(100vh - 300px)',
                        backgroundColor: snapshot.isDraggingOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        borderRadius: '8px',
                        border: snapshot.isDraggingOver ? '2px dashed #3B82F6' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <PipelineStage
                        stage={stage}
                        onLeadClick={onLeadClick}
                        isDragEnabled={true}
                      />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </HStack>

            {/* Pipeline Summary */}
            <Box
              borderTop="1px solid"
              borderColor={borderColor}
              pt={4}
              mt={4}
            >
              <HStack justify="space-between" fontSize="sm" color="gray.600">
                <Text>
                  Total Value: $
                  {localStages
                    .reduce((total, stage) => {
                      return (
                        total +
                        stage.leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
                      );
                    }, 0)
                    .toLocaleString()}
                </Text>
                <Text>
                  Conversion Rate: {calculateConversionRate(localStages)}%
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </DragDropContext>
    </ErrorBoundary>
  );
};

// Helper function to calculate conversion rate
const calculateConversionRate = (stages: PipelineStageType[]): number => {
  const totalLeads = stages.reduce((total, stage) => total + stage.leads.length, 0);
  const convertedLeads = stages
    .filter((stage) => stage.name.toLowerCase().includes('converted'))
    .reduce((total, stage) => total + stage.leads.length, 0);

  if (totalLeads === 0) return 0;
  return Math.round((convertedLeads / totalLeads) * 100);
}; 