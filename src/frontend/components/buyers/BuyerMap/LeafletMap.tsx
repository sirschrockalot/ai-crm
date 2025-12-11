import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, VStack, HStack, Text, Badge } from '@chakra-ui/react';
import L from 'leaflet';
import { Buyer } from '../../../types';
import { Coordinates } from '../../../utils/geocoding';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface LeafletMapProps {
  center: Coordinates;
  zoom: number;
  buyerMarkers: Array<{
    buyer: Buyer;
    coordinates: Coordinates;
  }>;
}

const LeafletMapComponent: React.FC<LeafletMapProps> = ({ center, zoom, buyerMarkers }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {buyerMarkers.map((marker) => (
        <Marker
          key={marker.buyer.id}
          position={[marker.coordinates.lat, marker.coordinates.lng]}
        >
          <Popup>
            <Box p={2} minW="200px">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" fontSize="sm">
                  {marker.buyer.companyName}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {marker.buyer.contactName}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {marker.buyer.city}, {marker.buyer.state} {marker.buyer.zipCode}
                </Text>
                <HStack spacing={2}>
                  <Badge size="sm" colorScheme={marker.buyer.isActive ? 'green' : 'red'}>
                    {marker.buyer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge size="sm">{marker.buyer.buyerType}</Badge>
                </HStack>
                {marker.buyer.buyBox && (
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" mb={1}>
                      Buy Box:
                    </Text>
                    <VStack align="start" spacing={1}>
                      {marker.buyer.buyBox.zipCodes.length > 0 && (
                        <Text fontSize="xs">ZIP: {marker.buyer.buyBox.zipCodes.join(', ')}</Text>
                      )}
                      {marker.buyer.buyBox.states.length > 0 && (
                        <Text fontSize="xs">States: {marker.buyer.buyBox.states.join(', ')}</Text>
                      )}
                      {marker.buyer.buyBox.cities.length > 0 && (
                        <Text fontSize="xs">Cities: {marker.buyer.buyBox.cities.join(', ')}</Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </Box>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMapComponent;

