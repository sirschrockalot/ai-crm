import React from 'react';
import { Box, VStack, HStack, Text, Badge, Avatar, useColorModeValue } from '@chakra-ui/react';
import { PipelineLead } from './PipelineBoard';

interface PipelineCardProps {
  lead: PipelineLead;
  stageId: string;
  onMove?: (leadId: string, fromStageId: string, toStageId: string) => void;
  onClick?: (lead: PipelineLead) => void;
}

export const PipelineCard: React.FC<PipelineCardProps> = ({
  lead,
  stageId,
  onMove,
  onClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.500');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'red';
    if (priority >= 6) return 'orange';
    if (priority >= 4) return 'yellow';
    return 'green';
  };

  const getPropertyTypeColor = (propertyType: string) => {
    switch (propertyType.toLowerCase()) {
      case 'single_family':
        return 'blue';
      case 'multi_family':
        return 'purple';
      case 'commercial':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={3}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
        borderColor: 'blue.300',
      }}
      onClick={() => onClick?.(lead)}
    >
      <VStack spacing={3} align="stretch">
        {/* Card Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={1} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color={textColor}>
              {lead.firstName} {lead.lastName}
            </Text>
            <Text fontSize="xs" color={subTextColor}>
              {lead.email}
            </Text>
          </VStack>
          
          <VStack align="flex-end" spacing={1}>
            <Badge
              colorScheme={getPriorityColor(lead.priority)}
              size="sm"
              variant="solid"
            >
              P{lead.priority}
            </Badge>
            <Text fontSize="xs" color={subTextColor}>
              {formatDate(lead.createdAt)}
            </Text>
          </VStack>
        </HStack>

        {/* Property Info */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Badge
              colorScheme={getPropertyTypeColor(lead.propertyType)}
              size="sm"
              variant="subtle"
            >
              {lead.propertyType.replace('_', ' ')}
            </Badge>
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              ${lead.estimatedValue.toLocaleString()}
            </Text>
          </HStack>
        </Box>

        {/* Contact Info */}
        <Box>
          <Text fontSize="xs" color={subTextColor} mb={1}>
            Contact
          </Text>
          <Text fontSize="xs" color={textColor}>
            {lead.phone}
          </Text>
        </Box>

        {/* Assigned Agent */}
        {lead.assignedAgent && (
          <HStack spacing={2}>
            <Avatar
              size="xs"
              name={lead.assignedAgent}
              bg="blue.500"
              color="white"
            />
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="xs" color={subTextColor}>
                Assigned to
              </Text>
              <Text fontSize="xs" color={textColor} fontWeight="medium">
                {lead.assignedAgent}
              </Text>
            </VStack>
          </HStack>
        )}

        {/* Status Badge */}
        <Box>
          <Badge
            colorScheme="blue"
            size="sm"
            variant="outline"
            textTransform="capitalize"
          >
            {lead.status}
          </Badge>
        </Box>
      </VStack>
    </Box>
  );
}; 