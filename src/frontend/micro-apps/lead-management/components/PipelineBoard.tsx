import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import PipelineStage from './PipelineStage';
import PipelineCard from './PipelineCard';
import { Lead, PipelineStage as PipelineStageType } from '../../types/pipeline';

interface PipelineBoardProps {
  stages: PipelineStageType[];
  leads: Lead[];
  onLeadMove: (leadId: string, fromStageId: string, toStageId: string) => void;
  onStageAdd?: () => void;
  onStageEdit?: (stageId: string) => void;
  onLeadClick?: (leadId: string) => void;
  isLoading?: boolean;
}

const PipelineBoard: React.FC<PipelineBoardProps> = ({
  stages,
  leads,
  onLeadMove,
  onStageAdd,
  onStageEdit,
  onLeadClick,
  isLoading = false,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Move the lead
    onLeadMove(draggableId, source.droppableId, destination.droppableId);

    toast({
      title: 'Lead moved',
      description: `Lead moved to ${destination.droppableId}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getLeadsForStage = (stageId: string) => {
    return leads.filter(lead => lead.stageId === stageId);
  };

  return (
    <Box
      bg={bgColor}
      minH="calc(100vh - 200px)"
      p={4}
      overflowX="auto"
      overflowY="hidden"
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="gray.700">
          Sales Pipeline
        </Text>
        <HStack spacing={3}>
          <IconButton
            aria-label="Add stage"
            icon={<AddIcon />}
            size="sm"
            colorScheme="blue"
            onClick={onStageAdd}
            isDisabled={isLoading}
          />
          <IconButton
            aria-label="Pipeline settings"
            icon={<SettingsIcon />}
            size="sm"
            variant="outline"
            onClick={() => {/* TODO: Implement settings */}}
            isDisabled={isLoading}
          />
        </HStack>
      </Flex>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Flex
          gap={4}
          minW="max-content"
          pb={4}
          sx={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              bg: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              bg: borderColor,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              bg: 'gray.400',
            },
          }}
        >
          {stages.map((stage) => (
            <PipelineStage
              key={stage.id}
              stage={stage}
              leads={getLeadsForStage(stage.id)}
              onLeadClick={onLeadClick}
              onStageEdit={onStageEdit}
              isLoading={isLoading}
            />
          ))}
        </Flex>
      </DragDropContext>
    </Box>
  );
};

export default PipelineBoard; 