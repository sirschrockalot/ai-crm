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
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FaFilter, FaSearch, FaPhone, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaStar, FaUserPlus } from 'react-icons/fa';

export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospect' | 'qualified';
  priority: 'high' | 'medium' | 'low';
  location: string;
  budget: {
    min: number;
    max: number;
  };
  preferredAreas: string[];
  lastContact: Date;
  totalDeals: number;
  successfulDeals: number;
  averageDealSize: number;
  notes?: string;
  tags: string[];
}

export interface Communication {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'text';
  direction: 'inbound' | 'outbound';
  date: Date;
  summary: string;
  outcome: 'positive' | 'neutral' | 'negative' | 'pending';
  nextAction?: string;
  nextActionDate?: Date;
}

interface BuyerManagementProps {
  buyers: Buyer[];
  communications: Communication[];
  loading?: boolean;
  onBuyerClick?: (buyer: Buyer) => void;
  onAddBuyer?: () => void;
  onContactBuyer?: (buyer: Buyer, method: 'call' | 'email') => void;
  onUpdateBuyerStatus?: (buyerId: string, status: Buyer['status']) => void;
}

export const BuyerManagement: React.FC<BuyerManagementProps> = ({
  buyers,
  communications,
  loading = false,
  onBuyerClick,
  onAddBuyer,
  onContactBuyer,
  onUpdateBuyerStatus,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const filteredBuyers = useMemo(() => {
    return buyers.filter((buyer) => {
      const matchesStatus = statusFilter === 'all' || buyer.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || buyer.priority === priorityFilter;
      const matchesSearch = searchTerm === '' || 
        buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [buyers, statusFilter, priorityFilter, searchTerm]);

  const getStatusColors = (status: Buyer['status']) => {
    switch (status) {
      case 'active':
        return { bg: 'green.100', text: 'green.800', border: 'green.200' };
      case 'inactive':
        return { bg: 'gray.100', text: 'gray.800', border: 'gray.200' };
      case 'prospect':
        return { bg: 'blue.100', text: 'blue.800', border: 'blue.200' };
      case 'qualified':
        return { bg: 'purple.100', text: 'purple.800', border: 'purple.200' };
      default:
        return { bg: 'gray.100', text: 'gray.800', border: 'gray.200' };
    }
  };

  const getPriorityColors = (priority: Buyer['priority']) => {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getSuccessRate = (buyer: Buyer) => {
    if (buyer.totalDeals === 0) return 0;
    return Math.round((buyer.successfulDeals / buyer.totalDeals) * 100);
  };

  if (loading) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          <Text>Loading buyers...</Text>
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
            <Icon as={FaUserPlus} color="blue.500" boxSize={5} />
            <Heading size="md" color={textColor}>
              Buyer Management
            </Heading>
          </HStack>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FaUserPlus />}
              colorScheme="blue"
              size="sm"
              onClick={onAddBuyer}
            >
              Add Buyer
            </Button>
          </HStack>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
            <option value="qualified">Qualified</option>
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
          
          <Input
            size="sm"
            placeholder="Search buyers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            minW="200px"
          />
        </HStack>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Buyers ({filteredBuyers.length})</Tab>
            <Tab>Communications</Tab>
          </TabList>

          <TabPanels>
            {/* Buyers Tab */}
            <TabPanel p={0} pt={4}>
              <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
                {filteredBuyers.map((buyer) => {
                  const statusColors = getStatusColors(buyer.status);
                  const priorityColors = getPriorityColors(buyer.priority);
                  const successRate = getSuccessRate(buyer);
                  const isRecentlyContacted = new Date().getTime() - buyer.lastContact.getTime() < 7 * 24 * 60 * 60 * 1000;

                  return (
                    <Box
                      key={buyer.id}
                      p={4}
                      borderRadius="lg"
                      bg={isRecentlyContacted ? 'blue.50' : 'gray.50'}
                      border="1px"
                      borderColor={isRecentlyContacted ? 'blue.200' : 'gray.200'}
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'md',
                      }}
                    >
                      {/* Buyer Header */}
                      <HStack justify="space-between" align="start" mb={3}>
                        <HStack spacing={3} flex={1}>
                          <Avatar size="sm" name={buyer.name} />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" color={textColor} fontSize="sm">
                              {buyer.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {buyer.email}
                            </Text>
                          </VStack>
                        </HStack>
                        
                        <VStack align="end" spacing={1}>
                          <Badge
                            size="sm"
                            bg={statusColors.bg}
                            color={statusColors.text}
                            border="1px"
                            borderColor={statusColors.border}
                          >
                            {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                          </Badge>
                          <Badge
                            size="sm"
                            bg={priorityColors.bg}
                            color={priorityColors.text}
                          >
                            {buyer.priority.toUpperCase()}
                          </Badge>
                        </VStack>
                      </HStack>

                      {/* Buyer Details */}
                      <VStack align="start" spacing={2} mb={3}>
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="xs" color="gray.500">Location:</Text>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            {buyer.location}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="xs" color="gray.500">Budget:</Text>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="xs" color="gray.500">Deals:</Text>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            {buyer.totalDeals} ({successRate}% success)
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="xs" color="gray.500">Avg Deal:</Text>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            {formatCurrency(buyer.averageDealSize)}
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Tags */}
                      {buyer.tags.length > 0 && (
                        <HStack spacing={1} mb={3} flexWrap="wrap">
                          {buyer.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} size="xs" variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          {buyer.tags.length > 3 && (
                            <Badge size="xs" variant="outline">
                              +{buyer.tags.length - 3}
                            </Badge>
                          )}
                        </HStack>
                      )}

                      {/* Last Contact */}
                      <HStack justify="space-between" mb={3}>
                        <Text fontSize="xs" color="gray.500">Last Contact:</Text>
                        <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                          {getTimeAgo(buyer.lastContact)}
                        </Text>
                      </HStack>

                      {/* Actions */}
                      <HStack spacing={2} justify="center">
                        <Button size="sm" variant="outline" onClick={() => onBuyerClick?.(buyer)}>
                          View Details
                        </Button>
                        <IconButton
                          size="sm"
                          icon={<FaPhone />}
                          aria-label="Call buyer"
                          onClick={() => onContactBuyer?.(buyer, 'call')}
                        />
                        <IconButton
                          size="sm"
                          icon={<FaEnvelope />}
                          aria-label="Email buyer"
                          onClick={() => onContactBuyer?.(buyer, 'email')}
                        />
                      </HStack>
                    </Box>
                  );
                })}
              </Grid>

              {filteredBuyers.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No buyers match the current filters</Text>
                </Box>
              )}
            </TabPanel>

            {/* Communications Tab */}
            <TabPanel p={0} pt={4}>
              <VStack spacing={4} align="stretch">
                {communications.slice(0, 10).map((comm) => (
                  <Box
                    key={comm.id}
                    p={4}
                    borderRadius="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={3}>
                          <Icon
                            as={comm.type === 'call' ? FaPhone : comm.type === 'email' ? FaEnvelope : FaCalendar}
                            color="blue.500"
                            boxSize={4}
                          />
                          <Text fontWeight="semibold" fontSize="sm">
                            {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} - {comm.direction}
                          </Text>
                          <Badge
                            size="sm"
                            bg={comm.outcome === 'positive' ? 'green.100' : 
                                comm.outcome === 'negative' ? 'red.100' : 
                                comm.outcome === 'pending' ? 'yellow.100' : 'gray.100'}
                            color={comm.outcome === 'positive' ? 'green.800' : 
                                   comm.outcome === 'negative' ? 'red.800' : 
                                   comm.outcome === 'pending' ? 'yellow.800' : 'gray.800'}
                          >
                            {comm.outcome.charAt(0).toUpperCase() + comm.outcome.slice(1)}
                          </Badge>
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.700">
                          {comm.summary}
                        </Text>
                        
                        {comm.nextAction && (
                          <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                            Next: {comm.nextAction}
                            {comm.nextActionDate && ` - ${formatDate(comm.nextActionDate)}`}
                          </Text>
                        )}
                      </VStack>
                      
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(comm.date)}
                      </Text>
                    </HStack>
                  </Box>
                ))}
                
                {communications.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No communications found</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};
