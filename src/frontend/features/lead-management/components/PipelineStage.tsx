import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
  Tooltip,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { PipelineCard } from './PipelineCard';
import { PipelineStage as PipelineStageType, Lead } from '../types/lead';

interface PipelineStageProps {
  stage: PipelineStageType;
  onLeadMove?: (leadId: string, fromStageId: string, toStageId: string) => void;
  onLeadClick?: (lead: Lead) => void;
  onStageUpdate?: (stageId: string, updates: Partial<PipelineStageType>) => void;
  onAddLead?: (stageId: string) => void;
  isDragging?: boolean;
}

export const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  onLeadMove,
  onLeadClick,
  onStageUpdate,
  onAddLead,
  isDragging = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const getStageColor = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'yellow';
      case 'qualified':
        return 'green';
      case 'negotiation':
        return 'orange';
      case 'closed':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const stageColor = getStageColor(stage.name);
  const totalValue = useMemo(() => {
    return stage.leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
  }, [stage.leads]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddLead = () => {
    onAddLead?.(stage.id);
  };

  const handleLeadClick = (lead: Lead) => {
    onLeadClick?.(lead);
  };

  const handleLeadEdit = (lead: Lead) => {
    // Handle lead edit - could open a modal or navigate to edit page
    console.log('Edit lead:', lead);
  };

  const handleLeadDelete = (lead: Lead) => {
    // Handle lead deletion - could show confirmation dialog
    console.log('Delete lead:', lead);
  };

  const handleLeadCall = (lead: Lead) => {
    // Handle lead call - could initiate phone call or show call interface
    console.log('Call lead:', lead);
  };

  const handleLeadEmail = (lead: Lead) => {
    // Handle lead email - could open email composer
    console.log('Email lead:', lead);
  };

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
      shadow="sm"
    >
      {/* Stage Header */}
      <Box
        bg={`${stageColor}.50`}
        borderBottom="1px solid"
        borderColor={borderColor}
        p={4}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <HStack spacing={2}>
            <Badge
              colorScheme={stageColor}
              variant="solid"
              size="sm"
            >
              {stage.leads.length}
            </Badge>
            <Text fontWeight="semibold" fontSize="sm" color={textColor}>
              {stage.name}
            </Text>
          </HStack>
          
          <HStack spacing={1}>
            <Tooltip label="Add lead to this stage">
              <IconButton
                aria-label="Add lead"
                icon={<FiPlus />}
                size="xs"
                variant="ghost"
                colorScheme={stageColor}
                onClick={handleAddLead}
              />
            </Tooltip>
            <IconButton
              aria-label="Stage options"
              icon={<FiMoreVertical />}
              size="xs"
              variant="ghost"
            />
          </HStack>
        </Flex>

        {/* Stage Statistics */}
        <VStack spacing={1} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={1}>
              <FiUsers size={12} />
              <Text fontSize="xs" color={subTextColor}>
                {stage.leads.length} leads
              </Text>
            </HStack>
            <Text fontSize="xs" fontWeight="medium" color={textColor}>
              {formatCurrency(totalValue)}
            </Text>
          </HStack>
          
          {stage.maxLeads && (
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color={subTextColor}>
                  Capacity
                </Text>
                <Text fontSize="xs" color={subTextColor}>
                  {stage.leads.length}/{stage.maxLeads}
                </Text>
              </HStack>
              <Box
                bg="gray.200"
                h="2px"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  bg={`${stageColor}.400`}
                  h="100%"
                  w={`${Math.min((stage.leads.length / stage.maxLeads) * 100, 100)}%`}
                  transition="width 0.3s ease"
                />
              </Box>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Stage Content */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            p={3}
            minH="200px"
            maxH="calc(100vh - 400px)"
            overflowY="auto"
            bg={snapshot.isDraggingOver ? `${stageColor}.50` : 'transparent'}
            transition="background-color 0.2s ease"
          >
            {stage.leads.length === 0 ? (
              <Box
                border="2px dashed"
                borderColor={borderColor}
                borderRadius="md"
                p={6}
                textAlign="center"
              >
                <VStack spacing={2}>
                  <Text fontSize="sm" color={subTextColor}>
                    No leads in this stage
                  </Text>
                  <Text fontSize="xs" color={subTextColor}>
                    Drag leads here or click + to add
                  </Text>
                </VStack>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {stage.leads.map((lead, index) => (
                  <Draggable
                    key={lead.id}
                    draggableId={lead.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        transform={snapshot.isDragging ? 'rotate(5deg)' : 'none'}
                        transition="transform 0.2s ease"
                      >
                        <PipelineCard
                          lead={lead}
                          stageId={stage.id}
                          onClick={handleLeadClick}
                          onEdit={handleLeadEdit}
                          onDelete={handleLeadDelete}
                          onCall={handleLeadCall}
                          onEmail={handleLeadEmail}
                        />
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </VStack>
            )}
          </Box>
        )}
      </Droppable>

      {/* Stage Footer */}
      <Box
        borderTop="1px solid"
        borderColor={borderColor}
        p={3}
        bg={useColorModeValue('gray.50', 'gray.700')}
      >
        <HStack justify="space-between">
          <Text fontSize="xs" color={subTextColor}>
            Avg: {stage.leads.length > 0 ? formatCurrency(totalValue / stage.leads.length) : '$0'}
          </Text>
          <Text fontSize="xs" color={subTextColor}>
            {stage.leads.length > 0 ? 
              `${Math.round((stage.leads.length / stage.leads.length) * 100)}%` : 
              '0%'
            }
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};
