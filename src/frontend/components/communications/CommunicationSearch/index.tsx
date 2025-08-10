import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  Badge,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  IconButton,
  Select,
  Checkbox,
  CheckboxGroup,
  Collapse,
  useDisclosure,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Spacer,
} from '@chakra-ui/react';
import { 
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  TimeIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { communicationService, CommunicationLog } from '../../../services/communicationService';
import { formatPhoneNumber } from '../../../utils/phone';
import { formatDateTime } from '../../../utils/date';

interface CommunicationSearchProps {
  leadId?: string;
  buyerId?: string;
  onSearchResult?: (results: CommunicationLog[]) => void;
  onSearchSelect?: (communication: CommunicationLog) => void;
}

interface SearchFilters {
  query: string;
  types: string[];
  statuses: string[];
  directions: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sender?: string;
  recipient?: string;
  hasAttachments: boolean;
  hasCost: boolean;
}

interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: Date;
}

const CommunicationSearch: React.FC<CommunicationSearchProps> = ({
  leadId,
  buyerId,
  onSearchResult,
  onSearchSelect,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    types: [],
    statuses: [],
    directions: [],
    hasAttachments: false,
    hasCost: false,
  });
  const [searchResults, setSearchResults] = useState<CommunicationLog[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      // Mock search history - in real implementation, this would come from localStorage or API
      const mockHistory: SearchHistory[] = [
        {
          id: '1',
          query: 'property inquiry',
          filters: { query: 'property inquiry', types: [], statuses: [], directions: [], hasAttachments: false, hasCost: false },
          resultCount: 5,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          query: 'follow up',
          filters: { query: 'follow up', types: ['sms'], statuses: [], directions: [], hasAttachments: false, hasCost: false },
          resultCount: 12,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];
      setSearchHistory(mockHistory);
    } catch (err) {
      console.error('Failed to load search history:', err);
    }
  };

  const performSearch = async () => {
    if (!filters.query.trim() && filters.types.length === 0 && filters.statuses.length === 0) {
      toast({
        title: 'Search Error',
        description: 'Please enter a search query or select filters',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mock search - in real implementation, this would call the search API
      await new Promise(resolve => setTimeout(resolve, 1000));

      let data: CommunicationLog[] = [];
      
      if (leadId) {
        data = await communicationService.getCommunicationHistory(leadId);
      }

      // Apply filters
      let filteredResults = data.filter(comm => {
        // Query filter
        if (filters.query && !comm.content.toLowerCase().includes(filters.query.toLowerCase()) &&
            !comm.to.toLowerCase().includes(filters.query.toLowerCase()) &&
            !comm.from.toLowerCase().includes(filters.query.toLowerCase())) {
          return false;
        }

        // Type filter
        if (filters.types.length > 0 && !filters.types.includes(comm.type)) {
          return false;
        }

        // Status filter
        if (filters.statuses.length > 0 && !filters.statuses.includes(comm.status)) {
          return false;
        }

        // Direction filter
        if (filters.directions.length > 0 && !filters.directions.includes(comm.direction)) {
          return false;
        }

        // Date range filter
        if (filters.dateFrom && new Date(comm.createdAt) < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && new Date(comm.createdAt) > filters.dateTo) {
          return false;
        }

        // Sender filter
        if (filters.sender && !comm.from.toLowerCase().includes(filters.sender.toLowerCase())) {
          return false;
        }

        // Recipient filter
        if (filters.recipient && !comm.to.toLowerCase().includes(filters.recipient.toLowerCase())) {
          return false;
        }

        // Has attachments filter (mock)
        if (filters.hasAttachments) {
          // In real implementation, this would check for actual attachments
          return false;
        }

        // Has cost filter
        if (filters.hasCost && !comm.cost) {
          return false;
        }

        return true;
      });

      setSearchResults(filteredResults);
      onSearchResult?.(filteredResults);

      // Save to search history
      const searchRecord: SearchHistory = {
        id: Date.now().toString(),
        query: filters.query,
        filters: { ...filters },
        resultCount: filteredResults.length,
        timestamp: new Date(),
      };
      setSearchHistory(prev => [searchRecord, ...prev.slice(0, 9)]); // Keep last 10 searches

      toast({
        title: 'Search completed',
        description: `Found ${filteredResults.length} results`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      setError('Failed to perform search');
      toast({
        title: 'Error',
        description: 'Failed to perform search',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    
    // Generate suggestions based on query
    if (query.length > 2) {
      const mockSuggestions = [
        'property inquiry',
        'follow up',
        'meeting request',
        'offer details',
        'closing date',
      ].filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      types: [],
      statuses: [],
      directions: [],
      hasAttachments: false,
      hasCost: false,
    });
    setSearchResults([]);
  };

  const loadSearchFromHistory = (search: SearchHistory) => {
    setFilters(search.filters);
  };

  const removeFromHistory = (searchId: string) => {
    setSearchHistory(prev => prev.filter(search => search.id !== searchId));
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
      {/* Search Input */}
      <Card mb={4}>
        <CardBody>
          <VStack spacing={4}>
            <HStack w="full" spacing={2}>
              <Box position="relative" flex={1}>
                <Input
                  placeholder="Search communications..."
                  value={filters.query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  pr="4rem"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    boxShadow="lg"
                    zIndex={10}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <Box
                        key={index}
                        px={3}
                        py={2}
                        cursor="pointer"
                        _hover={{ bg: 'gray.50' }}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Text fontSize="sm">{suggestion}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Button
                leftIcon={<SearchIcon />}
                colorScheme="blue"
                onClick={performSearch}
                isLoading={loading}
                loadingText="Searching"
              >
                Search
              </Button>
              <IconButton
                aria-label="Toggle filters"
                icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                onClick={onToggle}
                variant="outline"
              />
            </HStack>

            {/* Advanced Filters */}
            <Collapse in={isOpen} animateOpacity>
              <VStack spacing={4} w="full" pt={4} borderTop="1px solid" borderColor="gray.200">
                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Communication Type</Text>
                    <CheckboxGroup value={filters.types} onChange={(values) => setFilters(prev => ({ ...prev, types: values as string[] }))}>
                      <HStack spacing={4}>
                        <Checkbox value="sms">SMS</Checkbox>
                        <Checkbox value="voice">Voice</Checkbox>
                        <Checkbox value="email">Email</Checkbox>
                      </HStack>
                    </CheckboxGroup>
                  </Box>
                  
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Status</Text>
                    <CheckboxGroup value={filters.statuses} onChange={(values) => setFilters(prev => ({ ...prev, statuses: values as string[] }))}>
                      <HStack spacing={4}>
                        <Checkbox value="sent">Sent</Checkbox>
                        <Checkbox value="delivered">Delivered</Checkbox>
                        <Checkbox value="failed">Failed</Checkbox>
                        <Checkbox value="queued">Queued</Checkbox>
                      </HStack>
                    </CheckboxGroup>
                  </Box>
                </HStack>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Direction</Text>
                    <CheckboxGroup value={filters.directions} onChange={(values) => setFilters(prev => ({ ...prev, directions: values as string[] }))}>
                      <HStack spacing={4}>
                        <Checkbox value="inbound">Inbound</Checkbox>
                        <Checkbox value="outbound">Outbound</Checkbox>
                      </HStack>
                    </CheckboxGroup>
                  </Box>
                  
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Options</Text>
                    <CheckboxGroup value={[
                      ...(filters.hasAttachments ? ['attachments'] : []),
                      ...(filters.hasCost ? ['cost'] : [])
                    ]} onChange={(values) => setFilters(prev => ({ 
                      ...prev, 
                      hasAttachments: values.includes('attachments'),
                      hasCost: values.includes('cost')
                    }))}>
                      <HStack spacing={4}>
                        <Checkbox value="attachments">Has Attachments</Checkbox>
                        <Checkbox value="cost">Has Cost</Checkbox>
                      </HStack>
                    </CheckboxGroup>
                  </Box>
                </HStack>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Date Range</Text>
                    <HStack spacing={2}>
                      <Input
                        type="date"
                        size="sm"
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value ? new Date(e.target.value) : undefined }))}
                      />
                      <Text fontSize="sm">to</Text>
                      <Input
                        type="date"
                        size="sm"
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value ? new Date(e.target.value) : undefined }))}
                      />
                    </HStack>
                  </Box>
                  
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Contact</Text>
                    <HStack spacing={2}>
                      <Input
                        placeholder="Sender"
                        size="sm"
                        value={filters.sender || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                      />
                      <Input
                        placeholder="Recipient"
                        size="sm"
                        value={filters.recipient || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, recipient: e.target.value }))}
                      />
                    </HStack>
                  </Box>
                </HStack>

                <HStack spacing={3} w="full">
                  <Button
                    leftIcon={<CloseIcon />}
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Spacer />
                  <Button
                    leftIcon={<SearchIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={performSearch}
                    isLoading={loading}
                    loadingText="Searching"
                  >
                    Search
                  </Button>
                </HStack>
              </VStack>
            </Collapse>
          </VStack>
        </CardBody>
      </Card>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card mb={4}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Text fontWeight="semibold">Recent Searches</Text>
              {searchHistory.slice(0, 5).map((search) => (
                <HStack key={search.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">{search.query || 'Advanced search'}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {search.resultCount} results • {formatDateTime(search.timestamp)}
                    </Text>
                  </VStack>
                  <HStack spacing={1}>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => loadSearchFromHistory(search)}
                    >
                      Load
                    </Button>
                    <IconButton
                      aria-label="Remove from history"
                      icon={<Text>×</Text>}
                      size="xs"
                      variant="ghost"
                      onClick={() => removeFromHistory(search.id)}
                    />
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Search Results ({searchResults.length})</Text>
                <Button size="sm" variant="outline" onClick={() => setSearchResults([])}>
                  Clear Results
                </Button>
              </HStack>
              
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => onSearchSelect?.(result)}
                >
                  <CardBody>
                    <HStack spacing={3} align="start">
                      <Text fontSize="lg">{getTypeIcon(result.type)}</Text>
                      
                      <VStack align="start" flex={1} spacing={1}>
                        <HStack justify="space-between" w="full">
                          <HStack spacing={2}>
                            <Badge colorScheme={getStatusColor(result.status)} size="sm">
                              {result.status}
                            </Badge>
                            <Badge variant="outline" size="sm">
                              {result.direction}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {formatDateTime(result.createdAt)}
                          </Text>
                        </HStack>
                        
                        <HStack spacing={2} fontSize="sm" color="gray.600">
                          <Text>
                            <strong>To:</strong> {result.type === 'sms' || result.type === 'voice' 
                              ? formatPhoneNumber(result.to) 
                              : result.to}
                          </Text>
                          <Text>
                            <strong>From:</strong> {result.type === 'sms' || result.type === 'voice' 
                              ? formatPhoneNumber(result.from) 
                              : result.from}
                          </Text>
                        </HStack>
                        
                        <Text fontSize="sm" noOfLines={2}>
                          {result.content}
                        </Text>
                        
                        {result.cost && (
                          <Text fontSize="xs" color="gray.500">
                            Cost: ${result.cost.toFixed(4)}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default CommunicationSearch;
