import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { PhoneIcon, EmailIcon, CalendarIcon } from '@chakra-ui/icons';
import { Lead } from '../../types/pipeline';

interface PipelineCardProps {
  lead: Lead;
  onClick?: () => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({ lead, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.500');
  const hoverBg = useColorModeValue('gray.50', 'gray.500');

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'red',
      'medium': 'orange',
      'low': 'green',
    };
    return colors[priority as keyof typeof colors] || 'gray';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'green',
      'inactive': 'gray',
      'pending': 'yellow',
      'blocked': 'red',
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={3}
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.2s"
      _hover={onClick ? { bg: hoverBg, shadow: 'md' } : {}}
      onClick={onClick}
      position="relative"
    >
      {/* Priority Badge */}
      {lead.priority && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          size="sm"
          colorScheme={getPriorityColor(lead.priority)}
          variant="solid"
        >
          {lead.priority}
        </Badge>
      )}

      {/* Lead Header */}
      <VStack align="start" spacing={2} mb={3}>
        <HStack justify="space-between" w="100%">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
              {lead.firstName} {lead.lastName}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {lead.company}
            </Text>
          </VStack>
          <Avatar
            size="sm"
            name={`${lead.firstName} ${lead.lastName}`}
            src={lead.avatar}
          />
        </HStack>

        {/* Status and Value */}
        <HStack justify="space-between" w="100%">
          <Badge
            size="sm"
            colorScheme={getStatusColor(lead.status)}
            variant="subtle"
          >
            {lead.status}
          </Badge>
          {lead.value && (
            <Text fontSize="xs" fontWeight="semibold" color="green.600">
              {formatCurrency(lead.value)}
            </Text>
          )}
        </HStack>
      </VStack>

      {/* Contact Information */}
      <VStack align="start" spacing={1} mb={3}>
        {lead.email && (
          <HStack spacing={1}>
            <EmailIcon size="xs" color="gray.400" />
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {lead.email}
            </Text>
          </HStack>
        )}
        {lead.phone && (
          <HStack spacing={1}>
            <PhoneIcon size="xs" color="gray.400" />
            <Text fontSize="xs" color="gray.600">
              {lead.phone}
            </Text>
          </HStack>
        )}
      </VStack>

      {/* Additional Information */}
      <VStack align="start" spacing={1}>
        {lead.source && (
          <Text fontSize="xs" color="gray.500">
            Source: {lead.source}
          </Text>
        )}
        {lead.createdAt && (
          <HStack spacing={1}>
            <CalendarIcon size="xs" color="gray.400" />
            <Text fontSize="xs" color="gray.500">
              Created {formatDate(lead.createdAt)}
            </Text>
          </HStack>
        )}
        {lead.lastContact && (
          <HStack spacing={1}>
            <CalendarIcon size="xs" color="gray.400" />
            <Text fontSize="xs" color="gray.500">
              Last contact {formatDate(lead.lastContact)}
            </Text>
          </HStack>
        )}
      </VStack>

      {/* Score Indicator */}
      {lead.score && (
        <Tooltip label={`Lead Score: ${lead.score}/100`}>
          <Box
            position="absolute"
            bottom={2}
            right={2}
            w="8px"
            h="8px"
            borderRadius="full"
            bg={
              lead.score >= 80
                ? 'green.400'
                : lead.score >= 60
                ? 'yellow.400'
                : 'red.400'
            }
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default PipelineCard; 