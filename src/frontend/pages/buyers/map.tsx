import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  Card,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { BuyerMap } from '../../components/buyers/BuyerMap/BuyerMap';
import { Buyer } from '../../types';
import { parseAddress } from '../../utils/addressParser';
import { useApi } from '../../hooks/useApi';

const BuyerMapSearchPage: React.FC = () => {
  const router = useRouter();
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [searchParams, setSearchParams] = useState<{
    city?: string;
    state?: string;
    zipCode?: string;
    address?: string;
  }>({});
  const [hasSearched, setHasSearched] = useState(false);
  const toast = useToast();
  const api = useApi();

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter an address to search for buyers',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Parse the address to extract city, state, zip
      const parsed = parseAddress(searchAddress);

      // Build query parameters
      const params = new URLSearchParams();
      if (parsed.city) params.append('city', parsed.city);
      if (parsed.state) params.append('state', parsed.state);
      if (parsed.zipCode) params.append('zipCode', parsed.zipCode);
      params.append('address', searchAddress);

      // Call the API
      // Note: useApi.get() returns the data directly, not wrapped in response.data
      const data = await api.get(`/api/buyers/search-by-location?${params.toString()}`);

      setBuyers(data?.buyers || []);
      setSearchParams(data?.searchParams || {});

      if (data?.buyers && data.buyers.length === 0) {
        toast({
          title: 'No buyers found',
          description: `No active buyers found for ${searchAddress}`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else if (data?.buyers && data.buyers.length > 0) {
        toast({
          title: 'Search completed',
          description: `Found ${data.buyers.length} buyer${data.buyers.length !== 1 ? 's' : ''}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error searching buyers:', error);
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Failed to search for buyers',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setBuyers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="lg">Buyer Map Search</Heading>
                <Text color="gray.600">
                  Search for an address to find all buyers who purchase in that location
                </Text>
              </VStack>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={() => router.push('/buyers')}
              >
                Back to Buyers
              </Button>
            </HStack>

            {/* Search Section */}
            <Card p={6}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Search Address
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Enter a full address, city, state, or zip code to find buyers who purchase in that area
                  </Text>
                  <HStack spacing={3}>
                    <Input
                      placeholder="e.g., 123 Main St, Chicago, IL 60601 or Chicago, IL or 60601"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      onKeyPress={handleKeyPress}
                      size="lg"
                      isDisabled={isSearching}
                    />
                    <Button
                      colorScheme="blue"
                      onClick={handleSearch}
                      isLoading={isSearching}
                      loadingText="Searching..."
                      size="lg"
                      px={8}
                    >
                      Search
                    </Button>
                  </HStack>
                </Box>

                {/* Search Parameters Display */}
                {hasSearched && searchParams && (
                  <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                    <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.800">
                      Search Parameters:
                    </Text>
                    <HStack spacing={4} flexWrap="wrap">
                      {searchParams.city && (
                        <Badge colorScheme="blue" p={1}>
                          City: {searchParams.city}
                        </Badge>
                      )}
                      {searchParams.state && (
                        <Badge colorScheme="green" p={1}>
                          State: {searchParams.state}
                        </Badge>
                      )}
                      {searchParams.zipCode && (
                        <Badge colorScheme="purple" p={1}>
                          ZIP: {searchParams.zipCode}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Card>

            {/* Results Section */}
            {isSearching ? (
              <Card p={6}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text color="gray.600">Searching for buyers...</Text>
                </VStack>
              </Card>
            ) : hasSearched ? (
              <Card p={6}>
                <BuyerMap
                  buyers={buyers}
                  centerAddress={searchAddress}
                  height="700px"
                />
              </Card>
            ) : (
              <Card p={6}>
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="semibold">Ready to search</Text>
                    <Text fontSize="sm">
                      Enter an address above to find buyers who purchase in that location based on their buy box preferences.
                    </Text>
                  </Box>
                </Alert>
              </Card>
            )}
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default BuyerMapSearchPage;

