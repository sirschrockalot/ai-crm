import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  useColorModeValue,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { FiMoreVertical, FiPhone, FiMail, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { Lead } from '../types/lead';

interface PipelineCardProps {
  lead: Lead;
  stageId: string;
  onMove?: (leadId: string, fromStageId: string, toStageId: string) => void;
  onClick?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
}

export const PipelineCard: React.FC<PipelineCardProps> = ({
  lead,
  onClick,
  onEdit,
  onDelete,
  onCall,
  onEmail,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

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
      case 'land':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const timeSinceCreated = useMemo(() => {
    const created = new Date(lead.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return formatDate(created);
    }
  }, [lead.createdAt]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(lead);
  };

  const handleMenuClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    switch (action) {
      case 'edit':
        onEdit?.(lead);
        break;
      case 'delete':
        onDelete?.(lead);
        break;
      case 'call':
        onCall?.(lead);
        break;
      case 'email':
        onEmail?.(lead);
        break;
    }
  };

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: 'blue.300',
        bg: hoverBg,
      }}
      onClick={handleCardClick}
      position="relative"
    >
      {/* Card Header */}
      <HStack justify="space-between" align="flex-start" mb={3}>
        <HStack spacing={3} flex={1}>
          <Avatar
            size="sm"
            name={`${lead.firstName} ${lead.lastName}`}
            src={lead.avatar}
            bg={useColorModeValue('blue.100', 'blue.700')}
            color={useColorModeValue('blue.700', 'blue.100')}
          />
          <VStack align="flex-start" spacing={0} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color={textColor} noOfLines={1}>
              {lead.firstName} {lead.lastName}
            </Text>
            <Text fontSize="xs" color={subTextColor} noOfLines={1}>
              {lead.email}
            </Text>
          </VStack>
        </HStack>
        
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical />}
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          />
          <MenuList>
            <MenuItem icon={<FiPhone />} onClick={(e) => handleMenuClick(e, 'call')}>
              Call Lead
            </MenuItem>
            <MenuItem icon={<FiMail />} onClick={(e) => handleMenuClick(e, 'email')}>
              Send Email
            </MenuItem>
            <MenuDivider />
            <MenuItem onClick={(e) => handleMenuClick(e, 'edit')}>
              Edit Lead
            </MenuItem>
            <MenuItem color="red.500" onClick={(e) => handleMenuClick(e, 'delete')}>
              Delete Lead
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      {/* Priority and Status Badges */}
      <HStack justify="space-between" mb={3}>
        <Badge
          colorScheme={getPriorityColor(lead.priority)}
          size="sm"
          variant="solid"
        >
          P{lead.priority}
        </Badge>
        <Badge
          colorScheme={getStatusColor(lead.status)}
          size="sm"
          variant="subtle"
        >
          {lead.status}
        </Badge>
      </HStack>

      {/* Property Information */}
      <VStack spacing={2} align="stretch" mb={3}>
        <HStack justify="space-between">
          <Badge
            colorScheme={getPropertyTypeColor(lead.propertyType)}
            size="sm"
            variant="outline"
          >
            {lead.propertyType.replace('_', ' ')}
          </Badge>
          <HStack spacing={1}>
            <FiDollarSign size={12} />
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              {formatCurrency(lead.estimatedValue || 0)}
            </Text>
          </HStack>
        </HStack>
        
        {lead.propertyAddress && (
          <HStack spacing={1} color={subTextColor}>
            <FiMapPin size={12} />
            <Text fontSize="xs" noOfLines={1}>
              {lead.propertyAddress}
            </Text>
          </HStack>
        )}
      </VStack>

      {/* Contact Information */}
      <VStack spacing={1} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xs" color={subTextColor}>
            {lead.phone}
          </Text>
          <Text fontSize="xs" color={subTextColor}>
            {timeSinceCreated}
          </Text>
        </HStack>
        
        {lead.assignedAgent && (
          <HStack spacing={2}>
            <Text fontSize="xs" color={subTextColor}>
              Assigned:
            </Text>
            <Text fontSize="xs" fontWeight="medium" color={textColor}>
              {lead.assignedAgent}
            </Text>
          </HStack>
        )}
      </VStack>

      {/* Quick Action Buttons */}
      <HStack spacing={2} mt={3} justify="center">
        <Tooltip label="Call lead">
          <IconButton
            aria-label="Call lead"
            icon={<FiPhone />}
            size="xs"
            variant="ghost"
            colorScheme="green"
            onClick={(e) => handleMenuClick(e, 'call')}
          />
        </Tooltip>
        <Tooltip label="Send email">
          <IconButton
            aria-label="Send email"
            icon={<FiMail />}
            size="xs"
            variant="ghost"
            colorScheme="blue"
            onClick={(e) => handleMenuClick(e, 'email')}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};
