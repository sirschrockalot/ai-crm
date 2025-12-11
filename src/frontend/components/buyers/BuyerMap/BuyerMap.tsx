import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Badge, Button } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { Buyer } from '../../../types';
import { geocodeAddress, geocodeBuyer, Coordinates } from '../../../utils/geocoding';

// Dynamically import Leaflet map component to avoid SSR issues
const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <Box
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
      >
        <Text color="gray.600">Loading map...</Text>
      </Box>
    ),
  }
);

interface BuyerMapProps {
  buyers: Buyer[];
  centerAddress?: string;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
}

interface BuyerMarker {
  buyer: Buyer;
  coordinates: Coordinates;
}

export const BuyerMap: React.FC<BuyerMapProps> = ({
  buyers,
  centerAddress,
  centerLat,
  centerLng,
  zoom = 10,
  height = '600px',
}) => {
  const [showList, setShowList] = useState(false);
  const [buyerMarkers, setBuyerMarkers] = useState<BuyerMarker[]>([]);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 41.8781, lng: -87.6298 }); // Default to Chicago
  const [isLoading, setIsLoading] = useState(true);

  // Geocode buyers and center address
  useEffect(() => {
    const loadMapData = async () => {
      setIsLoading(true);
      
      try {
        // Get center coordinates
        let center: Coordinates | null = null;
        if (centerLat && centerLng) {
          center = { lat: centerLat, lng: centerLng };
        } else if (centerAddress) {
          center = await geocodeAddress(centerAddress);
        }
        
        if (center) {
          setMapCenter(center);
        } else if (buyers.length > 0) {
          // Use first buyer's location as center
          const firstBuyerCoords = await geocodeBuyer(buyers[0]);
          if (firstBuyerCoords) {
            setMapCenter(firstBuyerCoords);
          }
        }

        // Geocode all buyers
        const markers: BuyerMarker[] = [];
        for (const buyer of buyers) {
          const coords = await geocodeBuyer(buyer);
          if (coords) {
            markers.push({ buyer, coordinates: coords });
          }
        }
        setBuyerMarkers(markers);
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (buyers && buyers.length > 0) {
      loadMapData();
    } else {
      setIsLoading(false);
    }
  }, [buyers, centerAddress, centerLat, centerLng]);

  if (!buyers || buyers.length === 0) {
    return (
      <Box
        height={height}
        bg="gray.100"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={2}>
          <Text color="gray.600" fontSize="lg">
            No buyers found for this location
          </Text>
          <Text color="gray.500" fontSize="sm">
            Try searching for a different address
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontWeight="semibold" fontSize="lg">
          {buyers.length} Buyer{buyers.length !== 1 ? 's' : ''} Found
          {buyerMarkers.length > 0 && ` (${buyerMarkers.length} on map)`}
        </Text>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowList(!showList)}
        >
          {showList ? 'Hide' : 'Show'} List
        </Button>
      </HStack>

      <Box
        position="relative"
        height={height}
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
        bg="gray.100"
      >
        {isLoading ? (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.600">Loading map...</Text>
          </Box>
        ) : (
          <LeafletMap
            center={mapCenter}
            zoom={zoom}
            buyerMarkers={buyerMarkers}
          />
        )}
      </Box>

      {showList && (
        <Box
          maxH="400px"
          overflowY="auto"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          p={4}
        >
          <VStack spacing={3} align="stretch">
            {buyers.map((buyer) => (
              <Box
                key={buyer.id}
                p={3}
                bg="white"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.300', shadow: 'sm' }}
              >
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" width="100%">
                    <Text fontWeight="semibold">{buyer.companyName}</Text>
                    <Badge colorScheme={buyer.isActive ? 'green' : 'red'}>
                      {buyer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Contact: {buyer.contactName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {buyer.city}, {buyer.state} {buyer.zipCode}
                  </Text>
                  {buyer.buyBox && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                        Buy Box:
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {buyer.buyBox.zipCodes.length > 0 && (
                          <Badge size="sm" colorScheme="blue">
                            ZIP: {buyer.buyBox.zipCodes.join(', ')}
                          </Badge>
                        )}
                        {buyer.buyBox.states.length > 0 && (
                          <Badge size="sm" colorScheme="green">
                            States: {buyer.buyBox.states.join(', ')}
                          </Badge>
                        )}
                        {buyer.buyBox.cities.length > 0 && (
                          <Badge size="sm" colorScheme="purple">
                            Cities: {buyer.buyBox.cities.join(', ')}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  )}
                  <HStack spacing={2} fontSize="sm">
                    <Text color="gray.500">Type:</Text>
                    <Badge size="sm">{buyer.buyerType}</Badge>
                    <Text color="gray.500" ml={2}>Range:</Text>
                    <Badge size="sm" colorScheme="orange">
                      {buyer.investmentRange}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default BuyerMap;
