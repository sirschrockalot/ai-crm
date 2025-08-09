import React from 'react';
import { Box, VStack, HStack, Text, Badge, Button, Avatar, IconButton } from '@chakra-ui/react';
import { FaEdit, FaEye, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { Buyer, BuyerType } from '../../../types';

interface BuyerCardProps {
  buyer: Buyer;
  onEdit?: (buyer: Buyer) => void;
  onView?: (buyer: Buyer) => void;
  onContact?: (buyer: Buyer) => void;
  onToggleStatus?: (buyerId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showContactInfo?: boolean;
  showLocation?: boolean;
}

const BuyerCard: React.FC<BuyerCardProps> = ({
  buyer,
  onEdit,
  onView,
  onContact,
  onToggleStatus,
  variant = 'default',
  showActions = true,
  showContactInfo = true,
  showLocation = true,
}) => {
  const getBuyerTypeColor = (type: BuyerType) => {
    switch (type) {
      case 'individual': return 'blue';
      case 'company': return 'green';
      case 'investor': return 'purple';
      default: return 'gray';
    }
  };

  const getInvestmentRangeColor = (range: string) => {
    switch (range) {
      case '0-50k': return 'gray';
      case '50k-100k': return 'blue';
      case '100k-250k': return 'green';
      case '250k-500k': return 'yellow';
      case '500k+': return 'purple';
      default: return 'gray';
    }
  };

  const formatInvestmentRange = (range: string) => {
    switch (range) {
      case '0-50k': return '$0 - $50K';
      case '50k-100k': return '$50K - $100K';
      case '100k-250k': return '$100K - $250K';
      case '250k-500k': return '$250K - $500K';
      case '500k+': return '$500K+';
      default: return range;
    }
  };

  const handlePhoneClick = () => {
    window.open(`tel:${buyer.phone}`, '_self');
  };

  const handleEmailClick = () => {
    window.open(`mailto:${buyer.email}`, '_self');
  };

  if (variant === 'compact') {
    return (
      <Box
        p={3}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        _hover={{ shadow: 'md' }}
        transition="all 0.2s"
      >
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
              {buyer.companyName}
            </Text>
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {buyer.contactName}
            </Text>
            <HStack spacing={2}>
              <Badge size="sm" colorScheme={getBuyerTypeColor(buyer.buyerType)}>
                {buyer.buyerType}
              </Badge>
              <Badge size="sm" colorScheme={buyer.isActive ? 'green' : 'red'}>
                {buyer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </HStack>
          </VStack>
          {showActions && (
            <VStack spacing={1}>
              {onView && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<FaEye />}
                  aria-label="View buyer"
                  onClick={() => onView(buyer)}
                />
              )}
              {onEdit && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<FaEdit />}
                  aria-label="Edit buyer"
                  onClick={() => onEdit(buyer)}
                />
              )}
            </VStack>
          )}
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      bg="white"
      _hover={{ shadow: 'lg' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between" align="start">
          <HStack spacing={3}>
            <Avatar size="md" name={buyer.contactName} bg="blue.500" />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="lg">
                {buyer.companyName}
              </Text>
              <Text color="gray.600" fontSize="sm">
                {buyer.contactName}
              </Text>
            </VStack>
          </HStack>
          <VStack spacing={2} align="end">
            <Badge colorScheme={buyer.isActive ? 'green' : 'red'}>
              {buyer.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {onToggleStatus && (
              <Button
                size="xs"
                variant={buyer.isActive ? 'danger' : 'primary'}
                onClick={() => onToggleStatus(buyer.id)}
              >
                {buyer.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </VStack>
        </HStack>

        {/* Badges */}
        <HStack spacing={2} wrap="wrap">
          <Badge colorScheme={getBuyerTypeColor(buyer.buyerType)}>
            {buyer.buyerType}
          </Badge>
          <Badge colorScheme={getInvestmentRangeColor(buyer.investmentRange)}>
            {formatInvestmentRange(buyer.investmentRange)}
          </Badge>
          {buyer.preferredPropertyTypes.slice(0, 2).map((type) => (
            <Badge key={type} colorScheme="blue" variant="outline">
              {type.replace('_', ' ')}
            </Badge>
          ))}
          {buyer.preferredPropertyTypes.length > 2 && (
            <Badge colorScheme="gray" variant="outline">
              +{buyer.preferredPropertyTypes.length - 2} more
            </Badge>
          )}
        </HStack>

        {/* Contact Information */}
        {showContactInfo && (
          <VStack align="stretch" spacing={2}>
            <HStack spacing={2} color="gray.600">
              <FaEnvelope size={14} />
              <Text fontSize="sm">{buyer.email}</Text>
            </HStack>
            <HStack spacing={2} color="gray.600">
              <FaPhone size={14} />
              <Text fontSize="sm">{buyer.phone}</Text>
            </HStack>
            {showLocation && (
              <HStack spacing={2} color="gray.600">
                <FaMapMarkerAlt size={14} />
                <Text fontSize="sm">
                  {buyer.city}, {buyer.state} {buyer.zipCode}
                </Text>
              </HStack>
            )}
          </VStack>
        )}

        {/* Actions */}
        {showActions && (
          <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="gray.100">
            {onView && (
              <Button size="sm" variant="outline" leftIcon={<FaEye />} onClick={() => onView(buyer)}>
                View
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="outline" leftIcon={<FaEdit />} onClick={() => onEdit(buyer)}>
                Edit
              </Button>
            )}
            {onContact && (
              <Button size="sm" variant="primary" onClick={() => onContact(buyer)}>
                Contact
              </Button>
            )}
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FaPhone />}
              aria-label="Call buyer"
              onClick={handlePhoneClick}
            />
            <IconButton
              size="sm"
              variant="ghost"
              icon={<FaEnvelope />}
              aria-label="Email buyer"
              onClick={handleEmailClick}
            />
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default BuyerCard;
