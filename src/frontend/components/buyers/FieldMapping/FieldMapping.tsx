import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  Icon,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FaInfoCircle, FaMagic, FaCheck } from 'react-icons/fa';
import { useApi } from '../../../hooks/useApi';

interface FieldMappingProps {
  csvHeaders: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  onClose?: () => void;
}

interface FieldMappingResponse {
  mapping: Record<string, string>;
  suggestions: Record<string, string[]>;
}

const PDR_FIELDS = [
  { value: 'bname', label: 'Buyer Name (bname)', description: 'Company or individual name' },
  { value: 'bemail', label: 'Email (bemail)', description: 'Primary email address' },
  { value: 'bphone1', label: 'Primary Phone (bphone1)', description: 'Main phone number' },
  { value: 'bphone2', label: 'Secondary Phone (bphone2)', description: 'Alternative phone number' },
  { value: 'bstreet', label: 'Street Address (bstreet)', description: 'Street address' },
  { value: 'bcity', label: 'City (bcity)', description: 'City name' },
  { value: 'bstate', label: 'State (bstate)', description: 'State abbreviation' },
  { value: 'bzip', label: 'ZIP Code (bzip)', description: 'ZIP code' },
  { value: 'btype', label: 'Buyer Type (btype)', description: 'Individual, company, or investor' },
  { value: 'investment_goals', label: 'Investment Goals (investment_goals)', description: 'Investment range or goals' },
  { value: 'btag1', label: 'Property Tag 1 (btag1)', description: 'First property type preference' },
  { value: 'btag2', label: 'Property Tag 2 (btag2)', description: 'Second property type preference' },
  { value: 'btag3', label: 'Property Tag 3 (btag3)', description: 'Third property type preference' },
  { value: 'notes', label: 'Notes (notes)', description: 'General notes' },
  { value: 'bnotes', label: 'Buyer Notes (bnotes)', description: 'Buyer-specific notes' },
  { value: 'property_notes', label: 'Property Notes (property_notes)', description: 'Property-related notes' },
  { value: 'status', label: 'Status (status)', description: 'Active/inactive status' },
  { value: 'buyer_street', label: 'Buyer Street (buyer_street)', description: 'Alternative street field' },
  { value: 'buyer_city', label: 'Buyer City (buyer_city)', description: 'Alternative city field' },
  { value: 'buyer_state', label: 'Buyer State (buyer_state)', description: 'Alternative state field' },
  { value: 'buyer_zip', label: 'Buyer ZIP (buyer_zip)', description: 'Alternative ZIP field' },
  { value: 'bneighborhood', label: 'Neighborhood (bneighborhood)', description: 'Neighborhood or area' },
  { value: 'bcounties', label: 'Counties (bcounties)', description: 'Target counties' },
];

export const FieldMapping: React.FC<FieldMappingProps> = ({ 
  csvHeaders, 
  onMappingChange, 
  onClose 
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoMapped, setAutoMapped] = useState(false);

  const api = useApi();
  const toast = useToast();

  useEffect(() => {
    if (csvHeaders.length > 0) {
      generateFieldMapping();
    }
  }, [csvHeaders]);

  const generateFieldMapping = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/buyers/field-mapping', {
        headers: csvHeaders,
      });
      
      const result: FieldMappingResponse = response.data;
      setMapping(result.mapping);
      setSuggestions(result.suggestions);
      setAutoMapped(true);
      
      // Notify parent of initial mapping
      onMappingChange(result.mapping);
      
      toast({
        title: 'Field Mapping Generated',
        description: 'Automatic field mapping has been applied. Review and adjust as needed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to generate field mapping:', error);
      toast({
        title: 'Mapping Generation Failed',
        description: 'Failed to generate automatic field mapping. Please map fields manually.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (csvHeader: string, pdrField: string) => {
    const newMapping = { ...mapping };
    if (pdrField) {
      newMapping[csvHeader] = pdrField;
    } else {
      delete newMapping[csvHeader];
    }
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  const getMappedCount = () => {
    return Object.keys(mapping).length;
  };

  const getUnmappedHeaders = () => {
    return csvHeaders.filter(header => !mapping[header]);
  };

  const getFieldDescription = (fieldValue: string) => {
    const field = PDR_FIELDS.find(f => f.value === fieldValue);
    return field?.description || '';
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={FaMagic} color="blue.500" />
              <Text fontWeight="semibold">Field Mapping</Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              Map your CSV columns to buyer data fields
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue" size="sm">
              {getMappedCount()} / {csvHeaders.length} mapped
            </Badge>
            <Button
              size="sm"
              leftIcon={<FaMagic />}
              onClick={generateFieldMapping}
              isLoading={isLoading}
              loadingText="Generating..."
            >
              Auto-Map
            </Button>
          </HStack>
        </HStack>

        <Divider />

        {/* Auto-mapping success message */}
        {autoMapped && (
          <Alert status="success">
            <AlertIcon />
            <Box>
              <AlertTitle>Automatic Mapping Applied</AlertTitle>
              <AlertDescription>
                The system has automatically mapped your CSV fields. Review the mappings below and adjust as needed.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Field Mappings */}
        <VStack spacing={3} align="stretch">
          {csvHeaders.map((header) => (
            <Box key={header} p={3} border="1px" borderColor="gray.200" borderRadius="md">
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Text fontWeight="semibold" fontSize="sm">
                      {header}
                    </Text>
                    {mapping[header] && (
                      <Badge colorScheme="green" size="sm">
                        <Icon as={FaCheck} mr={1} />
                        Mapped
                      </Badge>
                    )}
                  </HStack>
                  
                  {mapping[header] && (
                    <Text fontSize="xs" color="gray.600">
                      {getFieldDescription(mapping[header])}
                    </Text>
                  )}
                  
                  {suggestions[header] && suggestions[header].length > 0 && !mapping[header] && (
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="orange.600" fontWeight="semibold">
                        Suggestions:
                      </Text>
                      <HStack spacing={1} flexWrap="wrap">
                        {suggestions[header].slice(0, 3).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            colorScheme="orange"
                            size="sm"
                            cursor="pointer"
                            onClick={() => handleMappingChange(header, suggestion)}
                            _hover={{ bg: 'orange.400' }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  )}
                </VStack>
                
                <FormControl maxW="200px">
                  <Select
                    size="sm"
                    value={mapping[header] || ''}
                    onChange={(e) => handleMappingChange(header, e.target.value)}
                    placeholder="Select field..."
                  >
                    <option value="">-- No mapping --</option>
                    {PDR_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* Unmapped fields warning */}
        {getUnmappedHeaders().length > 0 && (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Unmapped Fields</AlertTitle>
              <AlertDescription>
                {getUnmappedHeaders().length} CSV columns are not mapped to buyer fields. 
                These columns will be ignored during import.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Field mapping info */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Field Mapping Information</AlertTitle>
            <AlertDescription>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm">
                  • <strong>Required fields:</strong> bname (company name), bemail (email), bphone1 (phone)
                </Text>
                <Text fontSize="sm">
                  • <strong>Optional fields:</strong> All other fields are optional and will use defaults if not mapped
                </Text>
                <Text fontSize="sm">
                  • <strong>Auto-mapping:</strong> The system automatically suggests mappings based on field names
                </Text>
                <Text fontSize="sm">
                  • <strong>Unmapped fields:</strong> CSV columns without mappings will be ignored during import
                </Text>
              </VStack>
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};
