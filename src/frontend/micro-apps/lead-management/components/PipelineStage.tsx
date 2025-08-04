import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import PipelineCard from './PipelineCard';
import { Lead, PipelineStage as PipelineStageType } from '../../types/pipeline';

interface PipelineStageProps {
  stage: PipelineStageType;
  leads: Lead[];
  onLeadClick?: (leadId: string) => void;
  onStageEdit?: (stageId: string) => void;
  onLeadAdd?: (stageId: string) => void;
  isLoading?: boolean;
}

const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  leads,
  onLeadClick,
  onStageEdit,
  onLeadAdd,
  isLoading = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.100', 'gray.600');

  const getStageColor = (stageType: string) => {
    const colors = {
      'prospecting': 'blue',
      'qualification': 'yellow',
      'proposal': 'orange',
      'negotiation': 'purple',
      'closed-won': 'green',
      'closed-lost': 'red',
    };
    return colors[stageType as keyof typeof colors] || 'gray';
  };

  return (
    <Box
      minW="300px"
      maxW="300px"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      {/* Stage Header */}
      <Box
        bg={headerBg}
        p={3}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1} flex={1}>
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {stage.name}
              </Text>
              <Badge
                size="sm"
                colorScheme={getStageColor(stage.type)}
                variant="subtle"
              >
                {leads.length}
              </Badge>
            </HStack>
            {stage.description && (
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {stage.description}
              </Text>
            )}
          </VStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="Add lead"
              icon={<AddIcon />}
              size="xs"
              variant="ghost"
              onClick={() => onLeadAdd?.(stage.id)}
              isDisabled={isLoading}
            />
            <IconButton
              aria-label="Edit stage"
              icon={<EditIcon />}
              size="xs"
              variant="ghost"
              onClick={() => onStageEdit?.(stage.id)}
              isDisabled={isLoading}
            />
          </HStack>
        </HStack>
      </Box>

      {/* Stage Content */}
      <Box p={2} minH="400px" maxH="600px" overflowY="auto">
        <Droppable droppableId={stage.id}>
          {(provided, snapshot) => (
            <VStack
              ref={provided.innerRef}
              {...provided.droppableProps}
              spacing={2}
              minH="100%"
              bg={snapshot.isDraggingOver ? 'blue.50' : 'transparent'}
              borderRadius="md"
              p={1}
            >
              {isLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minH="200px"
                >
                  <Spinner size="md" color="blue.500" />
                </Box>
              ) : leads.length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minH="200px"
                  color="gray.400"
                >
                  <Text fontSize="sm">No leads in this stage</Text>
                </Box>
              ) : (
                leads.map((lead, index) => (
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
                        w="100%"
                        opacity={snapshot.isDragging ? 0.8 : 1}
                        transform={snapshot.isDragging ? 'rotate(5deg)' : 'none'}
                      >
                        <PipelineCard
                          lead={lead}
                          onClick={() => onLeadClick?.(lead.id)}
                        />
                      </Box>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </VStack>
          )}
        </Droppable>
      </Box>
    </Box>
  );
};

export default PipelineStage; 