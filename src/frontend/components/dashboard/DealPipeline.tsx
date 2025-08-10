import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Grid,
  Badge,
  Button,
  Select,
  Input,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from '@chakra-ui/react';
import { FaFilter, FaSearch, FaEllipsisV, FaPhone, FaEnvelope, FaEye } from 'react-icons/fa';

export interface Deal {
  id: string;
  address: string;
  status: 'new-contract' | 'active-disposition' | 'assigned' | 'closing' | 'closed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  buyer?: string;
  price: number;
  profit: number;
  inspectionEnds?: Date;
  closingDate?: Date;
  lastUpdated: Date;
  assignedTo?: string;
  notes?: string;
}

interface DealPipelineProps {
  deals: Deal[];
  loading?: boolean;
  onDealClick?: (deal: Deal) => void;
  onStatusChange?: (dealId: string, status: Deal['status']) => void;
  onAssignDeal?: (dealId: string, userId: string) => void;
}

export const DealPipeline: React.FC<DealPipelineProps> = ({
  deals,
  loading = false,
  onDealClick,
  onStatusChange,
  onAssignDeal,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || deal.priority === priorityFilter;
      const matchesTime = timeFilter === 'all' || checkTimeFilter(deal, timeFilter);
      const matchesSearch = searchTerm === '' || 
        deal.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.buyer?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesPriority && matchesTime && matchesSearch;
    });
  }, [deals, statusFilter, priorityFilter, timeFilter, searchTerm]);

  const checkTimeFilter = (deal: Deal, filter: string) => {
    const now = new Date();
    switch (filter) {
      case 'inspection':
        return deal.inspectionEnds && deal.inspectionEnds > now && deal.inspectionEnds < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'closing':
        return deal.closingDate && deal.closingDate > now && deal.closingDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'overdue':
        return (deal.inspectionEnds && deal.inspectionEnds < now) || (deal.closingDate && deal.closingDate < now);
      default:
        return true;
    }
  };

  const getStatusColors = (status: Deal['status']) => {
    switch (status) {
      case 'new-contract':
        return { bg: 'blue.100', text: 'blue.800', border: 'blue.200' };
      case 'active-disposition':
        return { bg: 'yellow.100', text: 'yellow.800', border: 'yellow.200' };
      case 'assigned':
        return { bg: 'pink.100', text: 'pink.800', border: 'pink.200' };
      case 'closing':
        return { bg: 'green.100', text: 'green.800', border: 'green.200' };
      case 'closed':
        return { bg: 'green.100', text: 'green.800', border: 'green.200' };
      case 'cancelled':
        return { bg: 'red.100', text: 'red.800', border: 'red.200' };
      default:
        return { bg: 'gray.100', text: 'gray.800', border: 'gray.200' };
    }
  };

  const getPriorityColors = (priority: Deal['priority']) => {
    switch (priority) {
      case 'high':
        return { bg: 'red.500', text: 'white' };
      case 'medium':
        return { bg: 'orange.500', text: 'white' };
      case 'low':
        return { bg: 'gray.500', text: 'white' };
      default:
        return { bg: 'gray.500', text: 'white' };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getTimeRemaining = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading deals...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack spacing={3}>
            <Icon as={FaFilter} color="blue.500" boxSize={5} />
            <Heading size="md" color={textColor}>
              Deal Pipeline
            </Heading>
          </HStack>
          
          {/* Filters */}
          <HStack spacing={3} flexWrap="wrap">
            <Select
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              minW="150px"
            >
              <option value="all">All Statuses</option>
              <option value="new-contract">New Contract</option>
              <option value="active-disposition">Active Disposition</option>
              <option value="assigned">Assigned</option>
              <option value="closing">Closing</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            
            <Select
              size="sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              minW="150px"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>
            
            <Select
              size="sm"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              minW="150px"
            >
              <option value="all">All Timeframes</option>
              <option value="inspection">Inspection Period</option>
              <option value="closing">Closing Soon</option>
              <option value="overdue">Overdue</option>
            </Select>
            
            <Input
              size="sm"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              minW="200px"
            />
          </HStack>
        </HStack>

        {/* Deals Grid */}
        <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
          {filteredDeals.map((deal) => {
            const statusColors = getStatusColors(deal.status);
            const priorityColors = getPriorityColors(deal.priority);
            const isUrgent = deal.inspectionEnds && deal.inspectionEnds < new Date(Date.now() + 24 * 60 * 60 * 1000);
            const isOverdue = (deal.inspectionEnds && deal.inspectionEnds < new Date()) || 
                             (deal.closingDate && deal.closingDate < new Date());

            return (
              <Box
                key={deal.id}
                p={4}
                borderRadius="lg"
                bg={isUrgent ? 'red.50' : isOverdue ? 'orange.50' : 'gray.50'}
                border="1px"
                borderColor={isUrgent ? 'red.200' : isOverdue ? 'orange.200' : 'gray.200'}
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
              >
                {/* Deal Header */}
                <HStack justify="space-between" align="start" mb={3}>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" color={textColor} fontSize="sm" noOfLines={2}>
                      {deal.address}
                    </Text>
                    <HStack spacing={2}>
                      <Badge
                        size="sm"
                        bg={statusColors.bg}
                        color={statusColors.text}
                        border="1px"
                        borderColor={statusColors.border}
                      >
                        {deal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge
                        size="sm"
                        bg={priorityColors.bg}
                        color={priorityColors.text}
                      >
                        {deal.priority.toUpperCase()}
                      </Badge>
                    </HStack>
                  </VStack>
                  
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FaEllipsisV />}
                      variant="ghost"
                      size="sm"
                      aria-label="Deal actions"
                    />
                    <MenuList>
                      <MenuItem icon={<FaEye />} onClick={() => onDealClick?.(deal)}>
                        View Details
                      </MenuItem>
                      <MenuItem icon={<FaPhone />}>
                        Call Buyer
                      </MenuItem>
                      <MenuItem icon={<FaEnvelope />}>
                        Send Email
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                {/* Deal Details */}
                <VStack align="start" spacing={2} mb={3}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Price:</Text>
                    <Text fontSize="sm" fontWeight="semibold">{formatCurrency(deal.price)}</Text>
                  </HStack>
                  
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.600">Profit:</Text>
                    <Text 
                      fontSize="sm" 
                      fontWeight="semibold"
                      color={deal.profit >= 0 ? 'green.600' : 'red.600'}
                    >
                      {formatCurrency(deal.profit)}
                    </Text>
                  </HStack>
                  
                  {deal.buyer && (
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm" color="gray.600">Buyer:</Text>
                      <Text fontSize="sm" fontWeight="semibold">{deal.buyer}</Text>
                    </HStack>
                  )}
                </VStack>

                {/* Timeline Info */}
                {(deal.inspectionEnds || deal.closingDate) && (
                  <VStack align="start" spacing={2} mb={3}>
                    {deal.inspectionEnds && (
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="xs" color="gray.500">Inspection:</Text>
                        <Text fontSize="xs" color={isUrgent ? 'red.600' : 'gray.600'} fontWeight="semibold">
                          {getTimeRemaining(deal.inspectionEnds)}
                        </Text>
                      </HStack>
                    )}
                    
                    {deal.closingDate && (
                      <HStack justify="space-between" w="100%">
                        <Text fontSize="xs" color="gray.500">Closing:</Text>
                        <Text fontSize="xs" color={isOverdue ? 'red.600' : 'gray.600'} fontWeight="semibold">
                          {getTimeRemaining(deal.closingDate)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                )}

                {/* Actions */}
                <HStack spacing={2} justify="center">
                  <Button size="sm" variant="outline" onClick={() => onDealClick?.(deal)}>
                    View Details
                  </Button>
                  {deal.status === 'new-contract' && (
                    <Button size="sm" colorScheme="blue" onClick={() => onAssignDeal?.(deal.id, 'current-user')}>
                      Assign
                    </Button>
                  )}
                </HStack>
              </Box>
            );
          })}
        </Grid>

        {filteredDeals.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No deals match the current filters</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
