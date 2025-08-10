import React, { useState, useCallback } from 'react';
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
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Update local stages when props change
  React.useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  if (loading) {
    return (
      <Box
        bg={bgColor}
        minH="calc(100vh - 200px)"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Text>Loading pipeline...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg={bgColor}
        minH="calc(100vh - 200px)"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Text color="red.500">Error loading pipeline: {error}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
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
            </Text>
          </Box>

          {/* Pipeline Stages */}
          <HStack spacing={4} align="flex-start" minW="max-content">
            {localStages.map((stage) => (
              <Box
                key={stage.id}
                minWidth="300px"
                maxWidth="350px"
                height="fit-content"
                maxHeight="calc(100vh - 300px)"
                borderRadius="8px"
              >
                <PipelineStage
                  stage={stage}
                  onLeadClick={onLeadClick}
                  isDragEnabled={false}
                />
              </Box>
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