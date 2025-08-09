import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Badge,
  Card,
  CardBody,
  Flex,
  Spacer,
  IconButton,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon, FilterIcon, DownloadIcon } from '@chakra-ui/icons';
import { communicationService, CommunicationLog } from '../../../services/communicationService';
import { formatPhoneNumber } from '../../../utils/phone';

interface CommunicationHistoryProps {
  leadId?: string;
  buyerId?: string;
  onCommunicationSelect?: (communication: CommunicationLog) => void;
  showFilters?: boolean;
  showSearch?: boolean;
  maxHeight?: string;
}

const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  leadId,
  buyerId,
  onCommunicationSelect,
  showFilters = true,
  showSearch = true,
  maxHeight = '600px',
}) => {
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [filteredCommunications, setFilteredCommunications] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const toast = useToast();

  useEffect(() => {
    loadCommunications();
  }, [leadId, buyerId]);

  useEffect(() => {
    filterCommunications();
  }, [communications, searchTerm, typeFilter, statusFilter, dateFilter]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: CommunicationLog[] = [];
      
      if (leadId) {
        data = await communicationService.getCommunicationHistory(leadId);
      } else {
        // For general communication history, we'll need to implement a different API endpoint
        // For now, we'll use the lead history as a placeholder
        data = [];
      }
      
      setCommunications(data);
    } catch (err) {
      setError('Failed to load communication history');
      toast({
        title: 'Error',
        description: 'Failed to load communication history',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCommunications = () => {
    let filtered = [...communications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(comm =>
        comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.from.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(comm => comm.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(comm => comm.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(comm => {
        const commDate = new Date(comm.createdAt);
        switch (dateFilter) {
          case 'today':
            return commDate >= today;
          case 'yesterday':
            return commDate >= yesterday && commDate < today;
          case 'lastWeek':
            return commDate >= lastWeek;
          case 'lastMonth':
            return commDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    setFilteredCommunications(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'sent':
        return 'blue';
      case 'failed':
        return 'red';
      case 'queued':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return '📱';
      case 'voice':
        return '📞';
      case 'email':
        return '📧';
      default:
        return '💬';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportCommunications = () => {
    const csvContent = [
      ['Date', 'Type', 'Direction', 'To', 'From', 'Status', 'Content'],
      ...filteredCommunications.map(comm => [
        formatDate(comm.createdAt),
        comm.type,
        comm.direction,
        comm.to,
        comm.from,
        comm.status,
        comm.content.replace(/"/g, '""'), // Escape quotes for CSV
      ]),
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="80px" />
        ))}
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <Card mb={4}>
          <CardBody>
            <VStack spacing={4}>
              {showSearch && (
                <HStack w="full">
                  <Input
                    placeholder="Search communications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<SearchIcon />}
                  />
                  <IconButton
                    aria-label="Export communications"
                    icon={<DownloadIcon />}
                    onClick={exportCommunications}
                    variant="outline"
                  />
                </HStack>
              )}
              
              {showFilters && (
                <HStack spacing={4} w="full">
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    placeholder="Filter by type"
                    size="sm"
                  >
                    <option value="all">All Types</option>
                    <option value="sms">SMS</option>
                    <option value="voice">Voice</option>
                    <option value="email">Email</option>
                  </Select>
                  
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    placeholder="Filter by status"
                    size="sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="queued">Queued</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </Select>
                  
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Filter by date"
                    size="sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="lastMonth">Last Month</option>
                  </Select>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Communications List */}
      <VStack spacing={3} align="stretch" maxH={maxHeight} overflowY="auto">
        {filteredCommunications.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                No communications found
              </Text>
            </CardBody>
          </Card>
        ) : (
          filteredCommunications.map((communication) => (
            <Card
              key={communication.id}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              onClick={() => onCommunicationSelect?.(communication)}
            >
              <CardBody>
                <HStack spacing={3} align="start">
                  <Text fontSize="lg">{getTypeIcon(communication.type)}</Text>
                  
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Badge colorScheme={getStatusColor(communication.status)} size="sm">
                          {communication.status}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {communication.direction}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(communication.createdAt)}
                      </Text>
                    </HStack>
                    
                    <HStack spacing={2} fontSize="sm" color="gray.600">
                      <Text>
                        <strong>To:</strong> {communication.type === 'sms' || communication.type === 'voice' 
                          ? formatPhoneNumber(communication.to) 
                          : communication.to}
                      </Text>
                      <Text>
                        <strong>From:</strong> {communication.type === 'sms' || communication.type === 'voice' 
                          ? formatPhoneNumber(communication.from) 
                          : communication.from}
                      </Text>
                    </HStack>
                    
                    <Text fontSize="sm" noOfLines={2}>
                      {communication.content}
                    </Text>
                    
                    {communication.cost && (
                      <Text fontSize="xs" color="gray.500">
                        Cost: ${communication.cost.toFixed(4)}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default CommunicationHistory;
