import React from 'react';
import { Box, VStack, Heading, Text, Badge, useColorModeValue } from '@chakra-ui/react';
import { PipelineCard } from './PipelineCard';
import { PipelineLead, PipelineStage as PipelineStageType } from './PipelineBoard';

interface PipelineStageProps {
  stage: PipelineStageType;
  onLeadMove?: (leadId: string, fromStageId: string, toStageId: string) => void;
  onLeadClick?: (lead: PipelineLead) => void;
}

export const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  onLeadMove,
  onLeadClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const totalValue = stage.leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const avgValue = stage.leads.length > 0 ? totalValue / stage.leads.length : 0;

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      minW="300px"
      maxW="350px"
      h="fit-content"
      maxH="calc(100vh - 300px)"
      overflow="hidden"
    >
      {/* Stage Header */}
      <Box
        p={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={stage.color}
        color="white"
      >
        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <Heading size="sm" fontWeight="semibold">
              {stage.name}
            </Heading>
            <Badge variant="solid" bg="rgba(255,255,255,0.2)">
              {stage.leads.length}
              {stage.maxLeads && `/${stage.maxLeads}`}
            </Badge>
          </HStack>
          
          {/* Stage Stats */}
          <Box fontSize="xs" opacity={0.9}>
            <Text>
              ${totalValue.toLocaleString()} total value
            </Text>
            <Text>
              ${avgValue.toLocaleString()} avg per lead
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Stage Content */}
      <Box p={2} overflowY="auto" maxH="calc(100vh - 400px)">
        <VStack spacing={2} align="stretch">
          {stage.leads.length === 0 ? (
            <Box
              p={4}
              textAlign="center"
              color={textColor}
              fontSize="sm"
            >
              No leads in this stage
            </Box>
          ) : (
            stage.leads.map((lead) => (
              <PipelineCard
                key={lead.id}
                lead={lead}
                stageId={stage.id}
                onMove={onLeadMove}
                onClick={onLeadClick}
              />
            ))
          )}
        </VStack>
      </Box>
    </Box>
  );
}; 