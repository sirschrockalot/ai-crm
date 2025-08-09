import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Input, Button, Text, Badge, IconButton, Popover, PopoverTrigger, PopoverContent, PopoverBody, useDisclosure } from '@chakra-ui/react';
import { FaSearch, FaHistory, FaTimes, FaFilter } from 'react-icons/fa';
import { Buyer } from '../../../types';

interface BuyerSearchProps {
  buyers: Buyer[];
  onSearch: (query: string, filters: SearchFilters) => void;
  onSelectBuyer?: (buyer: Buyer) => void;
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  showSuggestions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface SearchFilters {
  buyerType?: string;
  investmentRange?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}

const BuyerSearch: React.FC<BuyerSearchProps> = ({
  buyers,
  onSearch,
  onSelectBuyer,
  placeholder = 'Search buyers...',
  showFilters = true,
  showHistory = true,
  showSuggestions = true,
  size = 'md',
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<Buyer[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('buyerSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    const filtered = buyers.filter(buyer => 
      buyer.companyName.toLowerCase().includes(query.toLowerCase()) ||
      buyer.contactName.toLowerCase().includes(query.toLowerCase()) ||
      buyer.email.toLowerCase().includes(query.toLowerCase()) ||
      buyer.city.toLowerCase().includes(query.toLowerCase()) ||
      buyer.state.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    setSuggestions(filtered);
  }, [query, buyers, showSuggestions]);

  const handleSearch = (searchQuery: string = query, searchFilters: SearchFilters = filters) => {
    if (!searchQuery.trim()) return;

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('buyerSearchHistory', JSON.stringify(newHistory));

    onSearch(searchQuery, searchFilters);
    setIsOpen(false);
  };

  const handleSuggestionClick = (buyer: Buyer) => {
    if (onSelectBuyer) {
      onSelectBuyer(buyer);
    } else {
      setQuery(buyer.companyName);
      handleSearch(buyer.companyName);
    }
    setIsOpen(false);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    setSuggestions([]);
    setIsOpen(false);
  };

  const getInputSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

  return (
    <Box position="relative" width="100%">
      <HStack spacing={2}>
        <Box position="relative" flex={1}>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder={placeholder}
            size={getInputSize()}
            pr="40px"
          />
          <IconButton
            position="absolute"
            right="1"
            top="50%"
            transform="translateY(-50%)"
            size="sm"
            variant="ghost"
            icon={<FaSearch />}
            aria-label="Search"
            onClick={() => handleSearch()}
          />
        </Box>
        
        {showFilters && (
          <Popover isOpen={isFilterOpen} onClose={() => setIsOpen(false)}>
            <PopoverTrigger>
              <IconButton
                size={getButtonSize()}
                variant="outline"
                icon={<FaFilter />}
                aria-label="Filters"
                onClick={onFilterToggle}
              />
            </PopoverTrigger>
            <PopoverContent p={4}>
              <PopoverBody>
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="semibold">Filters</Text>
                  
                  <Box>
                    <Text fontSize="sm" mb={1}>Buyer Type</Text>
                    <select
                      value={filters.buyerType || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, buyerType: e.target.value || undefined }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="">All Types</option>
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="investor">Investor</option>
                    </select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" mb={1}>Investment Range</Text>
                    <select
                      value={filters.investmentRange || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, investmentRange: e.target.value || undefined }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="">All Ranges</option>
                      <option value="0-50k">$0 - $50K</option>
                      <option value="50k-100k">$50K - $100K</option>
                      <option value="100k-250k">$100K - $250K</option>
                      <option value="250k-500k">$250K - $500K</option>
                      <option value="500k+">$500K+</option>
                    </select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" mb={1}>Status</Text>
                    <select
                      value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        isActive: e.target.value === '' ? undefined : e.target.value === 'true' 
                      }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </Box>

                  <Button size="sm" onClick={() => handleSearch()}>
                    Apply Filters
                  </Button>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}

        {query && (
          <IconButton
            size={getButtonSize()}
            variant="ghost"
            icon={<FaTimes />}
            aria-label="Clear search"
            onClick={clearSearch}
          />
        )}
      </HStack>

      {/* Suggestions and History Dropdown */}
      {isOpen && (suggestions.length > 0 || (showHistory && searchHistory.length > 0)) && (
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
          zIndex={1000}
          mt={1}
        >
          <VStack align="stretch" spacing={0}>
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Box>
                <Text px={3} py={2} fontSize="sm" fontWeight="semibold" bg="gray.50">
                  Suggestions
                </Text>
                {suggestions.map((buyer) => (
                  <Box
                    key={buyer.id}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleSuggestionClick(buyer)}
                  >
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{buyer.companyName}</Text>
                      <Text fontSize="sm" color="gray.600">{buyer.contactName}</Text>
                      <HStack spacing={2}>
                        <Badge size="sm" colorScheme="blue">{buyer.buyerType}</Badge>
                        <Text fontSize="xs" color="gray.500">{buyer.city}, {buyer.state}</Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </Box>
            )}

            {/* Search History */}
            {showHistory && searchHistory.length > 0 && (
              <Box>
                <Text px={3} py={2} fontSize="sm" fontWeight="semibold" bg="gray.50">
                  Recent Searches
                </Text>
                {searchHistory.map((historyItem, index) => (
                  <Box
                    key={index}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleHistoryClick(historyItem)}
                  >
                    <HStack spacing={2}>
                      <FaHistory size={12} color="gray" />
                      <Text fontSize="sm">{historyItem}</Text>
                    </HStack>
                  </Box>
                ))}
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default BuyerSearch;
