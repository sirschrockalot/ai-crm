import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Grid,
  GridItem,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { FiEdit, FiPhone, FiMail, FiMapPin, FiDollarSign, FiCalendar, FiUser, FiHome } from 'react-icons/fi';
import { Lead, LeadStatus, PropertyType } from '../../../types';
import { Card } from '../../ui';

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
}) => {
  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'orange';
      case 'converted': return 'green';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case 'single_family': return <FiHome />;
      case 'multi_family': return <FiHome />;
      case 'commercial': return <FiHome />;
      case 'land': return <FiMapPin />;
      default: return <FiHome />;
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md">
                {lead.firstName} {lead.lastName}
              </Heading>
              <Badge colorScheme={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </VStack>
            <IconButton
              icon={<FiEdit />}
              aria-label="Edit lead"
              onClick={onEdit}
              size="sm"
            />
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack align="stretch" spacing={6}>
            {/* Contact Information */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="sm">Contact Information</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <HStack spacing={2}>
                      <FiUser />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Name</Text>
                        <Text fontWeight="semibold">
                          {lead.firstName} {lead.lastName}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                  
                  <GridItem>
                    <HStack spacing={2}>
                      <FiMail />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Email</Text>
                        <Text fontWeight="semibold">{lead.email}</Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                  
                  <GridItem>
                    <HStack spacing={2}>
                      <FiPhone />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Phone</Text>
                        <Text fontWeight="semibold">{lead.phone}</Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                  
                  <GridItem>
                    <HStack spacing={2}>
                      <FiUser />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Assigned To</Text>
                        <Text fontWeight="semibold">
                          {lead.assignedTo || 'Unassigned'}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                </Grid>
              </VStack>
            </Card>

            {/* Property Information */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="sm">Property Information</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <HStack spacing={2}>
                      {getPropertyTypeIcon(lead.propertyType)}
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Property Type</Text>
                        <Text fontWeight="semibold">{lead.propertyType}</Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                  
                  <GridItem>
                    <HStack spacing={2}>
                      <FiMapPin />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Location</Text>
                        <Text fontWeight="semibold">
                          {lead.propertyAddress || 'Not specified'}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                  
                  <GridItem>
                    <HStack spacing={2}>
                      <FiDollarSign />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Estimated Value</Text>
                        <Text fontWeight="semibold">
                          {formatCurrency(lead.estimatedValue)}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                  
                  <GridItem>
                    <HStack spacing={2}>
                      <FiCalendar />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Created</Text>
                        <Text fontWeight="semibold">
                          {formatDate(lead.createdAt)}
                        </Text>
                      </VStack>
                    </HStack>
                  </GridItem>
                </Grid>
              </VStack>
            </Card>

            {/* Additional Information */}
            {(lead.notes || lead.source || lead.company) && (
              <Card>
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm">Additional Information</Heading>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {lead.source && (
                      <GridItem>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">Source</Text>
                          <Text fontWeight="semibold">{lead.source}</Text>
                        </VStack>
                      </GridItem>
                    )}
                    
                    {lead.company && (
                      <GridItem>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">Company</Text>
                          <Text fontWeight="semibold">{lead.company}</Text>
                        </VStack>
                      </GridItem>
                    )}
                  </Grid>
                  
                  {lead.notes && (
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={2}>Notes</Text>
                      <Text>{lead.notes}</Text>
                    </Box>
                  )}
                </VStack>
              </Card>
            )}

            {/* Lead History */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <Heading size="sm">Lead History</Heading>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500">Status Changes</Text>
                    <Badge colorScheme={getStatusColor(lead.status)}>
                      Current: {lead.status}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500">Last Updated</Text>
                    <Text fontSize="sm">
                      {lead.updatedAt ? formatDate(lead.updatedAt) : 'Never'}
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500">Lead Score</Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {lead.score || 'Not scored'}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={onEdit}>
              Edit Lead
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 