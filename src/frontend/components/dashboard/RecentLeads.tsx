import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  Link,
} from '@chakra-ui/react';
import { 
  PhoneIcon, 
  EmailIcon, 
  ExternalLinkIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

interface Lead {
  id: string;
  name: string;
  address: string;
  status: string;
  value: number;
  source: string;
  lastContact: string;
  priority: 'high' | 'medium' | 'low';
  email?: string;
  phone?: string;
}

interface RecentLeadsProps {
  leads: Lead[];
  variant?: 'executive' | 'acquisitions' | 'disposition' | 'team-member' | 'mobile';
  maxItems?: number;
  onLeadClick?: (lead: Lead) => void;
  onContact?: (lead: Lead, method: 'phone' | 'email') => void;
}

export const RecentLeads: React.FC<RecentLeadsProps> = ({
  leads,
  variant = 'acquisitions',
  maxItems = 5,
  onLeadClick,
  onContact,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const getStatusColor = (status: string) => {
    const statusColors = {
      'New': 'blue',
      'Contacted': 'orange',
      'Qualified': 'green',
      'Converted': 'purple',
      'Lost': 'red',
      'Follow-up': 'yellow',
    };
    return (statusColors as any)[status] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      'high': 'red',
      'medium': 'orange',
      'low': 'green',
    };
    return (priorityColors as any)[priority] || 'gray';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleLeadClick = (lead: Lead) => {
    if (onLeadClick) {
      onLeadClick(lead);
    }
  };

  const handleContact = (lead: Lead, method: 'phone' | 'email') => {
    if (onContact) {
      onContact(lead, method);
    }
  };

  const displayedLeads = leads.slice(0, maxItems);

  if (displayedLeads.length === 0) {
    return (
      <Box bg={bgColor} p={4} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={3}>
          <Text color="gray.500" fontSize="sm">No recent leads</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={0} align="stretch">
        {displayedLeads.map((lead, index) => (
          <Box key={lead.id}>
            <Box
              p={4}
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              transition="background-color 0.2s"
              onClick={() => handleLeadClick(lead)}
            >
              <VStack spacing={3} align="stretch">
                {/* Lead Header */}
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                      <Avatar size="sm" name={lead.name} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" color={textColor} fontSize="sm">
                          {lead.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {lead.address}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Badge colorScheme={getStatusColor(lead.status)} size="sm">
                      {lead.status}
                    </Badge>
                    <Badge colorScheme={getPriorityColor(lead.priority)} size="sm" variant="outline">
                      {lead.priority}
                    </Badge>
                  </VStack>
                </HStack>

                {/* Lead Details */}
                <HStack justify="space-between" fontSize="xs" color="gray.600">
                  <Text>Value: {formatCurrency(lead.value)}</Text>
                  <Text>Source: {lead.source}</Text>
                </HStack>

                {/* Contact Actions */}
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.500">
                    Last contact: {lead.lastContact}
                  </Text>
                  <HStack spacing={1}>
                    {lead.phone && (
                      <Tooltip label="Call">
                        <IconButton
                          aria-label="Call lead"
                          icon={<PhoneIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContact(lead, 'phone');
                          }}
                        />
                      </Tooltip>
                    )}
                    {lead.email && (
                      <Tooltip label="Email">
                        <IconButton
                          aria-label="Email lead"
                          icon={<EmailIcon />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContact(lead, 'email');
                          }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip label="View details">
                      <IconButton
                        aria-label="View lead details"
                        icon={<ExternalLinkIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeadClick(lead);
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
            {index < displayedLeads.length - 1 && (
              <Divider borderColor={borderColor} />
            )}
          </Box>
        ))}
      </VStack>

      {/* View All Button */}
      {leads.length > maxItems && (
        <Box p={3} borderTop="1px" borderColor={borderColor}>
          <Button
            size="sm"
            variant="ghost"
            rightIcon={<ChevronRightIcon />}
            w="full"
            onClick={() => {
              // Navigate to leads page
              window.location.href = '/leads';
            }}
          >
            View All Leads ({leads.length})
          </Button>
        </Box>
      )}
    </Box>
  );
};
