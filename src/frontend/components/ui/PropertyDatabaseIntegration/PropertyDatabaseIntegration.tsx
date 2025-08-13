import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Spinner,
  Badge,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiHome, FiDollarSign, FiInfo } from 'react-icons/fi';

export interface PropertyRecord {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  estimatedValue: number;
  lastSoldPrice?: number;
  lastSoldDate?: string;
  daysOnMarket: number;
  propertyTax: number;
  hoaFee?: number;
  source: 'mls' | 'zillow' | 'redfin' | 'manual';
  lastUpdated: string;
}

interface PropertyDatabaseIntegrationProps {
  onPropertySelect: (property: PropertyRecord) => void;
  onManualEntry: () => void;
  disabled?: boolean;
  required?: boolean;
}

export function PropertyDatabaseIntegration({
  onPropertySelect,
  onManualEntry,
  disabled = false,
  required = false,
}: PropertyDatabaseIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PropertyRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: '',
    minSquareFeet: '',
    maxSquareFeet: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  // Mock property database - in real implementation, this would be an API call
  const mockPropertyDatabase: PropertyRecord[] = [
    {
      id: '1',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      county: 'Travis',
      propertyType: 'Single Family',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      lotSize: 6000,
      yearBuilt: 1995,
      estimatedValue: 450000,
      lastSoldPrice: 420000,
      lastSoldDate: '2022-03-15',
      daysOnMarket: 45,
      propertyTax: 8500,
      source: 'mls',
      lastUpdated: '2024-01-15',
    },
    {
      id: '2',
      address: '456 Oak Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      county: 'Travis',
      propertyType: 'Townhouse',
      bedrooms: 2,
      bathrooms: 2.5,
      squareFeet: 1400,
      lotSize: 2000,
      yearBuilt: 2005,
      estimatedValue: 380000,
      lastSoldPrice: 350000,
      lastSoldDate: '2021-11-20',
      daysOnMarket: 30,
      propertyTax: 7200,
      hoaFee: 150,
      source: 'zillow',
      lastUpdated: '2024-01-10',
    },
    {
      id: '3',
      address: '789 Pine Rd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78703',
      county: 'Travis',
      propertyType: 'Single Family',
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2200,
      lotSize: 8000,
      yearBuilt: 1988,
      estimatedValue: 520000,
      lastSoldPrice: 480000,
      lastSoldDate: '2023-06-10',
      daysOnMarket: 60,
      propertyTax: 9800,
      source: 'redfin',
      lastUpdated: '2024-01-12',
    },
  ];

  const searchProperties = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search query required',
        description: 'Please enter an address, city, or zip code to search',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter properties based on search query and filters
    const filteredResults = mockPropertyDatabase.filter(property => {
      const matchesSearch = 
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.zipCode.includes(searchQuery);
      
      if (!matchesSearch) return false;
      
      // Apply filters
      if (selectedFilters.propertyType && property.propertyType !== selectedFilters.propertyType) return false;
      if (selectedFilters.minPrice && property.estimatedValue < Number(selectedFilters.minPrice)) return false;
      if (selectedFilters.maxPrice && property.estimatedValue > Number(selectedFilters.maxPrice)) return false;
      if (selectedFilters.minBedrooms && property.bedrooms < Number(selectedFilters.minBedrooms)) return false;
      if (selectedFilters.maxBedrooms && property.bedrooms > Number(selectedFilters.maxBedrooms)) return false;
      if (selectedFilters.minBathrooms && property.bathrooms < Number(selectedFilters.minBathrooms)) return false;
      if (selectedFilters.maxBathrooms && property.bathrooms > Number(selectedFilters.maxBathrooms)) return false;
      if (selectedFilters.minSquareFeet && property.squareFeet < Number(selectedFilters.minSquareFeet)) return false;
      if (selectedFilters.maxSquareFeet && property.squareFeet > Number(selectedFilters.maxSquareFeet)) return false;
      
      return true;
    });
    
    setSearchResults(filteredResults);
    setIsSearching(false);
    
    if (filteredResults.length === 0) {
      toast({
        title: 'No properties found',
        description: 'Try adjusting your search criteria or filters',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePropertySelect = (property: PropertyRecord) => {
    onPropertySelect(property);
    toast({
      title: 'Property selected',
      description: `${property.address}, ${property.city}, ${property.state}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minSquareFeet: '',
      maxSquareFeet: '',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <FormControl isRequired={required}>
        <FormLabel>Property Database Search</FormLabel>
        <FormHelperText>
          Search for properties in MLS, Zillow, Redfin, and other databases
        </FormHelperText>
        
        <VStack spacing={4} align="stretch">
          {/* Search Bar */}
          <HStack>
            <Input
              placeholder="Enter address, city, or zip code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProperties()}
              disabled={disabled}
            />
            <Button
              leftIcon={<FiSearch />}
              onClick={searchProperties}
              isLoading={isSearching}
              disabled={disabled || !searchQuery.trim()}
              colorScheme="blue"
            >
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              disabled={disabled}
            >
              Filters
            </Button>
          </HStack>

          {/* Advanced Filters */}
          {showFilters && (
            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" bg="gray.50">
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Advanced Filters</Text>
                  <Button size="sm" variant="ghost" onClick={clearFilters}>
                    Clear All
                  </Button>
                </HStack>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Property Type</FormLabel>
                    <Select
                      value={selectedFilters.propertyType}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                      size="sm"
                    >
                      <option value="">Any</option>
                      <option value="Single Family">Single Family</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Condominium">Condominium</option>
                      <option value="Multi-Family">Multi-Family</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Price Range</FormLabel>
                    <HStack spacing={2}>
                      <NumberInput
                        value={selectedFilters.minPrice}
                        onChange={(value) => setSelectedFilters(prev => ({ ...prev, minPrice: value }))}
                        size="sm"
                        min={0}
                      >
                        <NumberInputField placeholder="Min" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text>-</Text>
                      <NumberInput
                        value={selectedFilters.maxPrice}
                        onChange={(value) => setSelectedFilters(prev => ({ ...prev, maxPrice: value }))}
                        size="sm"
                        min={0}
                      >
                        <NumberInputField placeholder="Max" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </FormControl>
                </HStack>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Bedrooms</FormLabel>
                    <HStack spacing={2}>
                      <NumberInput
                        value={selectedFilters.minBedrooms}
                        onChange={(value) => setSelectedFilters(prev => ({ ...prev, minBedrooms: value }))}
                        size="sm"
                        min={0}
                      >
                        <NumberInputField placeholder="Min" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text>-</Text>
                      <NumberInput
                        value={selectedFilters.maxBedrooms}
                        onChange={(value) => setSelectedFilters(prev => ({ ...prev, maxBedrooms: value }))}
                        size="sm"
                        min={0}
                      >
                        <NumberInputField placeholder="Max" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Bathrooms</FormLabel>
                    <HStack spacing={2}>
                      <NumberInput
                        value={selectedFilters.minBathrooms}
                        onChange={(value) => setSelectedFilters(prev => ({ ...prev, minBathrooms: value }))}
                        size="sm"
                        min={0}
                      >
                        <NumberInputField placeholder="Min" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text>-</Text>
                      <NumberInput
                        value={selectedFilters.maxBathrooms}
                        onChange={(value) => setSelectedFilters(prev => ({ ...prev, maxBathrooms: value }))}
                        size="sm"
                        min={0}
                      >
                        <NumberInputField placeholder="Max" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </FormControl>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold">
                  Found {searchResults.length} properties
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onManualEntry}
                  leftIcon={<FiInfo />}
                >
                  Enter Manually
                </Button>
              </HStack>
              
              <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
                {searchResults.map((property) => (
                  <Box
                    key={property.id}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'gray.50', borderColor: 'blue.300' }}
                    onClick={() => handlePropertySelect(property)}
                  >
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold" fontSize="lg">
                          {property.address}
                        </Text>
                        <Badge colorScheme="blue" variant="subtle">
                          {property.source.toUpperCase()}
                        </Badge>
                      </HStack>
                      
                      <HStack>
                        <FiMapPin />
                        <Text color="gray.600">
                          {property.city}, {property.state} {property.zipCode}
                        </Text>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm">
                        <HStack>
                          <FiHome />
                          <Text>{property.propertyType}</Text>
                        </HStack>
                        <Text>{property.bedrooms} bed, {property.bathrooms} bath</Text>
                        <Text>{property.squareFeet.toLocaleString()} sq ft</Text>
                        <Text>{property.lotSize.toLocaleString()} sq ft lot</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <HStack>
                          <FiDollarSign />
                          <Text fontWeight="semibold" color="green.600">
                            {formatCurrency(property.estimatedValue)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          Built {property.yearBuilt}
                        </Text>
                      </HStack>
                      
                      {property.lastSoldPrice && (
                        <HStack justify="space-between" fontSize="sm">
                          <Text color="gray.600">
                            Last sold: {formatCurrency(property.lastSoldPrice)} on {formatDate(property.lastSoldDate!)}
                          </Text>
                          <Text color="gray.500">
                            {property.daysOnMarket} days on market
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* No Results Message */}
          {searchResults.length === 0 && !isSearching && searchQuery && (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" mb={3}>
                No properties found matching your criteria
              </Text>
              <Button
                variant="outline"
                onClick={onManualEntry}
                leftIcon={<FiInfo />}
              >
                Enter Property Details Manually
              </Button>
            </Box>
          )}
        </VStack>
      </FormControl>
    </Box>
  );
}
