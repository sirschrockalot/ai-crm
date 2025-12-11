import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  Input,
  Button,
  IconButton,
  Text,
  Badge,
  Divider,
  Heading,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

export interface BuyBoxData {
  zipCodes: string[];
  states: string[];
  cities: string[];
}

interface BuyBoxFormProps {
  value?: BuyBoxData;
  onChange: (buyBox: BuyBoxData) => void;
}

export const BuyBoxForm: React.FC<BuyBoxFormProps> = ({ value, onChange }) => {
  const [zipCodes, setZipCodes] = useState<string[]>(value?.zipCodes || ['']);
  const [states, setStates] = useState<string[]>(value?.states || ['']);
  const [cities, setCities] = useState<string[]>(value?.cities || ['']);

  useEffect(() => {
    onChange({
      zipCodes: zipCodes.filter(zip => zip.trim() !== ''),
      states: states.filter(state => state.trim() !== ''),
      cities: cities.filter(city => city.trim() !== ''),
    });
  }, [zipCodes, states, cities, onChange]);

  const addZipCode = () => {
    setZipCodes([...zipCodes, '']);
  };

  const removeZipCode = (index: number) => {
    const newZipCodes = zipCodes.filter((_, i) => i !== index);
    setZipCodes(newZipCodes.length > 0 ? newZipCodes : ['']);
  };

  const updateZipCode = (index: number, value: string) => {
    const newZipCodes = [...zipCodes];
    newZipCodes[index] = value;
    setZipCodes(newZipCodes);
  };

  const addState = () => {
    setStates([...states, '']);
  };

  const removeState = (index: number) => {
    const newStates = states.filter((_, i) => i !== index);
    setStates(newStates.length > 0 ? newStates : ['']);
  };

  const updateState = (index: number, value: string) => {
    const newStates = [...states];
    newStates[index] = value.toUpperCase().substring(0, 2); // Limit to 2 characters for state code
    setStates(newStates);
  };

  const addCity = () => {
    setCities([...cities, '']);
  };

  const removeCity = (index: number) => {
    const newCities = cities.filter((_, i) => i !== index);
    setCities(newCities.length > 0 ? newCities : ['']);
  };

  const updateCity = (index: number, value: string) => {
    const newCities = [...cities];
    newCities[index] = value;
    setCities(newCities);
  };

  const validZipCodes = zipCodes.filter(zip => zip.trim() !== '');
  const validStates = states.filter(state => state.trim() !== '');
  const validCities = cities.filter(city => city.trim() !== '');

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="sm" fontWeight="semibold" mb={2}>
            Buy Box - Geographic Purchase Areas
          </Heading>
          <Text mb={4} fontSize="sm" color="gray.600">
            Define the geographic areas (zip codes, states, cities) where this buyer purchases properties.
            You can add multiple entries for each category.
          </Text>
        </Box>

        {/* Zip Codes Section */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Zip Codes
            </Text>
            <Button
              size="xs"
              leftIcon={<AddIcon />}
              onClick={addZipCode}
              colorScheme="blue"
              variant="outline"
            >
              Add Zip Code
            </Button>
          </HStack>
          <VStack spacing={2} align="stretch">
            {zipCodes.map((zip, index) => (
              <FormControl key={index}>
                <HStack spacing={2}>
                  <Input
                    placeholder="e.g., 12345 or 12345-6789"
                    value={zip}
                    onChange={(e) => updateZipCode(index, e.target.value)}
                    maxLength={10}
                    pattern="^\d{5}(-\d{4})?$"
                  />
                  {zipCodes.length > 1 && (
                    <IconButton
                      aria-label="Remove zip code"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeZipCode(index)}
                    />
                  )}
                </HStack>
              </FormControl>
            ))}
          </VStack>
          {validZipCodes.length > 0 && (
            <HStack mt={2} flexWrap="wrap" spacing={2}>
              {validZipCodes.map((zip, index) => (
                <Badge key={index} colorScheme="blue" p={1}>
                  {zip}
                </Badge>
              ))}
            </HStack>
          )}
        </Box>

        <Divider />

        {/* States Section */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              States
            </Text>
            <Button
              size="xs"
              leftIcon={<AddIcon />}
              onClick={addState}
              colorScheme="blue"
              variant="outline"
            >
              Add State
            </Button>
          </HStack>
          <VStack spacing={2} align="stretch">
            {states.map((state, index) => (
              <FormControl key={index}>
                <HStack spacing={2}>
                  <Input
                    placeholder="e.g., CA, NY, TX (2-letter state code)"
                    value={state}
                    onChange={(e) => updateState(index, e.target.value)}
                    maxLength={2}
                    textTransform="uppercase"
                  />
                  {states.length > 1 && (
                    <IconButton
                      aria-label="Remove state"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeState(index)}
                    />
                  )}
                </HStack>
              </FormControl>
            ))}
          </VStack>
          {validStates.length > 0 && (
            <HStack mt={2} flexWrap="wrap" spacing={2}>
              {validStates.map((state, index) => (
                <Badge key={index} colorScheme="green" p={1}>
                  {state}
                </Badge>
              ))}
            </HStack>
          )}
        </Box>

        <Divider />

        {/* Cities Section */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Cities
            </Text>
            <Button
              size="xs"
              leftIcon={<AddIcon />}
              onClick={addCity}
              colorScheme="blue"
              variant="outline"
            >
              Add City
            </Button>
          </HStack>
          <VStack spacing={2} align="stretch">
            {cities.map((city, index) => (
              <FormControl key={index}>
                <HStack spacing={2}>
                  <Input
                    placeholder="e.g., Los Angeles, New York, Houston"
                    value={city}
                    onChange={(e) => updateCity(index, e.target.value)}
                  />
                  {cities.length > 1 && (
                    <IconButton
                      aria-label="Remove city"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeCity(index)}
                    />
                  )}
                </HStack>
              </FormControl>
            ))}
          </VStack>
          {validCities.length > 0 && (
            <HStack mt={2} flexWrap="wrap" spacing={2}>
              {validCities.map((city, index) => (
                <Badge key={index} colorScheme="purple" p={1}>
                  {city}
                </Badge>
              ))}
            </HStack>
          )}
        </Box>

        {/* Summary */}
        {(validZipCodes.length > 0 || validStates.length > 0 || validCities.length > 0) && (
          <Box mt={4} p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
            <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.800">
              Buy Box Summary:
            </Text>
            <Text fontSize="xs" color="blue.700">
              {validZipCodes.length > 0 && `${validZipCodes.length} zip code(s)`}
              {validZipCodes.length > 0 && (validStates.length > 0 || validCities.length > 0) && ' • '}
              {validStates.length > 0 && `${validStates.length} state(s)`}
              {validStates.length > 0 && validCities.length > 0 && ' • '}
              {validCities.length > 0 && `${validCities.length} city/cities`}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default BuyBoxForm;

