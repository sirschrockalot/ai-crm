import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiEye, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Lead } from '../types/lead';

interface LeadPipelineProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  onLeadEdit: (lead: Lead) => void;
  onLeadDelete: (leadId: string) => void;
  onLeadStatusChange: (leadId: string, status: Lead['status']) => Promise<void>;
  loading?: boolean;
  filters?: {
    search?: string;
    assignedTo?: string;
    propertyType?: string;
    minValue?: string;
    maxValue?: string;
  };
  onFiltersChange?: (filters: any) => void;
}

interface PipelineColumn {
  id: Lead['status'];
  title: string;
  color: string;
  bgColor: string;
}

const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'new', title: 'New', color: 'blue.500', bgColor: 'blue.50' },
  { id: 'contacted', title: 'Contacted', color: 'yellow.500', bgColor: 'yellow.50' },
  { id: 'qualified', title: 'Qualified', color: 'orange.500', bgColor: 'orange.50' },
  { id: 'converted', title: 'Converted', color: 'green.500', bgColor: 'green.50' },
  { id: 'lost', title: 'Lost', color: 'red.500', bgColor: 'red.50' },
];

export const LeadPipeline: React.FC<LeadPipelineProps> = ({
  leads,
  onLeadSelect,
  onLeadEdit,
  onLeadDelete,
  onLeadStatusChange,
  loading = false,
  filters = {},
  onFiltersChange,
}) => {
  const toast = useToast();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Filter leads based on search and other filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          lead.firstName.toLowerCase().includes(searchLower) ||
          lead.lastName.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Property type filter
      if (filters.propertyType && lead.propertyType !== filters.propertyType) {
        return false;
      }

      // Value range filter
      if (filters.minValue && lead.estimatedValue < Number(filters.minValue)) {
        return false;
      }
      if (filters.maxValue && lead.estimatedValue > Number(filters.maxValue)) {
        return false;
      }

      return true;
    });
  }, [leads, searchTerm, filters]);

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped = PIPELINE_COLUMNS.reduce((acc, column) => {
      acc[column.id] = filteredLeads.filter(lead => lead.status === column.id);
      return acc;
    }, {} as Record<Lead['status'], Lead[]>);
    return grouped;
  }, [filteredLeads]);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    
    if (!draggedLead || draggedLead.status === targetStatus) {
      setDraggedLead(null);
      return;
    }

    try {
      await onLeadStatusChange(draggedLead.id, targetStatus);
      toast({
        title: 'Lead Status Updated',
        description: `Lead moved to ${targetStatus}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Updating Status',
        description: error instanceof Error ? error.message : 'Failed to update lead status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDraggedLead(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onFiltersChange) {
      onFiltersChange({ ...filters, search: value });
    }
  };

  const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => (
    <Card
      size="sm"
      mb={3}
      cursor="pointer"
      draggable
      onDragStart={(e) => handleDragStart(e, lead)}
      onClick={() => onLeadSelect(lead)}
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <CardBody p={3}>
        <VStack align="start" spacing={2}>
          <HStack justify="space-between" w="full">
            <Text fontWeight="semibold" fontSize="sm">
              {lead.firstName} {lead.lastName}
            </Text>
            <Menu>
              <MenuButton
                as={IconButton}
                size="xs"
                icon={<FiMoreVertical />}
                variant="ghost"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                <MenuItem icon={<FiEye />} onClick={() => onLeadSelect(lead)}>
                  View Details
                </MenuItem>
                <MenuItem icon={<FiEdit />} onClick={() => onLeadEdit(lead)}>
                  Edit Lead
                </MenuItem>
                <MenuItem 
                  icon={<FiTrash2 />} 
                  onClick={() => onLeadDelete(lead.id)}
                  color="red.500"
                >
                  Delete Lead
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          
          <Text fontSize="xs" color="gray.600">
            {lead.email}
          </Text>
          
          <Text fontSize="xs" color="gray.600">
            {lead.phone}
          </Text>
          
          <HStack justify="space-between" w="full">
            <Badge size="sm" colorScheme="gray">
              {lead.propertyType}
            </Badge>
            <Text fontSize="xs" fontWeight="semibold">
              ${lead.estimatedValue.toLocaleString()}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading pipeline...</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="Property Type"
              value={filters.propertyType || ''}
              onChange={(e) => onFiltersChange?.({ ...filters, propertyType: e.target.value })}
              maxW="150px"
            >
              <option value="single_family">Single Family</option>
              <option value="multi_family">Multi Family</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </Select>

            <Input
              placeholder="Min Value"
              type="number"
              value={filters.minValue || ''}
              onChange={(e) => onFiltersChange?.({ ...filters, minValue: e.target.value })}
              maxW="120px"
            />

            <Input
              placeholder="Max Value"
              type="number"
              value={filters.maxValue || ''}
              onChange={(e) => onFiltersChange?.({ ...filters, maxValue: e.target.value })}
              maxW="120px"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                onFiltersChange?.({});
              }}
            >
              Clear Filters
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Pipeline Board */}
      <Box overflowX="auto">
        <HStack align="start" spacing={4} minW="max-content">
          {PIPELINE_COLUMNS.map((column) => (
            <Box
              key={column.id}
              w="300px"
              minH="600px"
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader
                bg={column.bgColor}
                borderTopRadius="lg"
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <HStack justify="space-between">
                  <HStack>
                    <Text fontWeight="semibold" color={column.color}>
                      {column.title}
                    </Text>
                    <Badge colorScheme={column.id === 'new' ? 'blue' : 
                                       column.id === 'contacted' ? 'yellow' : 
                                       column.id === 'qualified' ? 'orange' : 
                                       column.id === 'converted' ? 'green' : 'red'}>
                      {leadsByStatus[column.id]?.length || 0}
                    </Badge>
                  </HStack>
                  <IconButton
                    size="sm"
                    icon={<FiPlus />}
                    aria-label={`Add lead to ${column.title}`}
                    variant="ghost"
                    color={column.color}
                  />
                </HStack>
              </CardHeader>
              
              <CardBody p={3}>
                <VStack align="stretch" spacing={0}>
                  {leadsByStatus[column.id]?.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  
                  {(!leadsByStatus[column.id] || leadsByStatus[column.id].length === 0) && (
                    <Box
                      p={4}
                      textAlign="center"
                      color="gray.400"
                      fontSize="sm"
                      border="2px dashed"
                      borderColor="gray.200"
                      borderRadius="md"
                      minH="100px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      No leads in this stage
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Box>
          ))}
        </HStack>
      </Box>

      {filteredLeads.length === 0 && leads.length > 0 && (
        <Alert status="info">
          <AlertIcon />
          No leads match the current filters. Try adjusting your search criteria.
        </Alert>
      )}
    </VStack>
  );
};
