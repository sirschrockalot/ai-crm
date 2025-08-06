import React from 'react';
import { Box, VStack, HStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { PipelineStage } from './PipelineStage';
import { PipelineCard } from './PipelineCard';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export interface PipelineLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  propertyType: string;
  estimatedValue: number;
  assignedAgent?: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  leads: PipelineLead[];
  maxLeads?: number;
}

export interface PipelineBoardProps {
  stages: PipelineStage[];
  onLeadMove?: (leadId: string, fromStageId: string, toStageId: string) => void;
  onLeadClick?: (lead: PipelineLead) => void;
  loading?: boolean;
  error?: string | null;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  stages,
  onLeadMove,
  onLeadClick,
  loading = false,
  error = null,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
              {stages.reduce((total, stage) => total + stage.leads.length, 0)} leads in pipeline
            </Text>
          </Box>

          {/* Pipeline Stages */}
          <HStack spacing={4} align="flex-start" minW="max-content">
            {stages.map((stage) => (
              <PipelineStage
                key={stage.id}
                stage={stage}
                onLeadMove={onLeadMove}
                onLeadClick={onLeadClick}
              />
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
                {stages
                  .reduce((total, stage) => {
                    return (
                      total +
                      stage.leads.reduce((sum, lead) => sum + lead.estimatedValue, 0)
                    );
                  }, 0)
                  .toLocaleString()}
              </Text>
              <Text>
                Conversion Rate: {calculateConversionRate(stages)}%
              </Text>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
};

// Helper function to calculate conversion rate
const calculateConversionRate = (stages: PipelineStage[]): number => {
  const totalLeads = stages.reduce((total, stage) => total + stage.leads.length, 0);
  const convertedLeads = stages
    .filter((stage) => stage.name.toLowerCase().includes('converted'))
    .reduce((total, stage) => total + stage.leads.length, 0);

  if (totalLeads === 0) return 0;
  return Math.round((convertedLeads / totalLeads) * 100);
}; 