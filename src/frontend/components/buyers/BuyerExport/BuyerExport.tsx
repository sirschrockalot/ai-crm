import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FaDownload, FaFileCsv, FaFileAlt, FaFilter, FaInfoCircle } from 'react-icons/fa';
import { useApi } from '../../../hooks/useApi';
import { BuyerType } from '../../../types';

interface BuyerExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters: {
    buyerType?: BuyerType;
    investmentRange?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
  };
  includeInactive: boolean;
}

interface BuyerExportProps {
  onExportComplete?: () => void;
  onClose?: () => void;
}

export const BuyerExport: React.FC<BuyerExportProps> = ({ onExportComplete, onClose }) => {
  const [exportOptions, setExportOptions] = useState<BuyerExportOptions>({
    format: 'csv',
    filters: {},
    includeInactive: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const api = useApi();
  const toast = useToast();
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();

  const buyerTypes: { value: BuyerType; label: string }[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
    { value: 'investor', label: 'Investor' },
  ];

  const investmentRanges: { value: string; label: string }[] = [
    { value: '0-50k', label: '$0 - $50k' },
    { value: '50k-100k', label: '$50k - $100k' },
    { value: '100k-250k', label: '$100k - $250k' },
    { value: '250k-500k', label: '$250k - $500k' },
    { value: '500k+', label: '$500k+' },
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...exportOptions.filters };
    if (value === '' || value === undefined) {
      delete newFilters[key as keyof typeof newFilters];
    } else {
      newFilters[key as keyof typeof newFilters] = value;
    }
    
    const newOptions = { ...exportOptions, filters: newFilters };
    setExportOptions(newOptions);
    
    // Count active filters
    const activeFilters = Object.keys(newFilters).length;
    setFilterCount(activeFilters);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();
      
      // Add format
      params.append('format', exportOptions.format);
      
      // Add filters
      if (Object.keys(exportOptions.filters).length > 0) {
        params.append('filters', JSON.stringify(exportOptions.filters));
      }
      
      // Add include inactive option
      if (exportOptions.includeInactive) {
        params.append('includeInactive', 'true');
      }

      const response = await api.get(`/api/buyers/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { 
        type: exportOptions.format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Buyers exported successfully in ${exportOptions.format.toUpperCase()} format`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onExportComplete?.();
      onModalClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export buyers. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setExportOptions({
      format: 'csv',
      filters: {},
      includeInactive: false,
    });
    setFilterCount(0);
    onModalClose();
    onClose?.();
  };

  const clearFilters = () => {
    setExportOptions(prev => ({
      ...prev,
      filters: {},
    }));
    setFilterCount(0);
  };

  return (
    <>
      <Button
        leftIcon={<FaDownload />}
        colorScheme="green"
        onClick={onOpen}
        size="sm"
      >
        Export Buyers
        {filterCount > 0 && (
          <Badge ml={2} colorScheme="blue" borderRadius="full" fontSize="xs">
            {filterCount}
          </Badge>
        )}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Buyers</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Export Format */}
              <Box>
                <Text fontWeight="semibold" mb={3}>Export Format</Text>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FaFileCsv />}
                    variant={exportOptions.format === 'csv' ? "solid" : "outline"}
                    colorScheme={exportOptions.format === 'csv' ? "blue" : "gray"}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'csv' }))}
                    size="sm"
                  >
                    CSV
                  </Button>
                  <Button
                    leftIcon={<FaFileAlt />}
                    variant={exportOptions.format === 'json' ? "solid" : "outline"}
                    colorScheme={exportOptions.format === 'json' ? "green" : "gray"}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                    size="sm"
                  >
                    JSON
                  </Button>
                  <Button
                    leftIcon={<FaFileAlt />}
                    variant={exportOptions.format === 'xlsx' ? "solid" : "outline"}
                    colorScheme={exportOptions.format === 'xlsx' ? "purple" : "gray"}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: 'xlsx' }))}
                    size="sm"
                  >
                    Excel
                  </Button>
                </HStack>
              </Box>

              <Divider />

              {/* Filters */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <HStack>
                    <Icon as={FaFilter} color="blue.500" />
                    <Text fontWeight="semibold">Filters</Text>
                  </HStack>
                  {filterCount > 0 && (
                    <Button size="xs" variant="ghost" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </HStack>

                <VStack spacing={4} align="stretch">
                  {/* Buyer Type Filter */}
                  <FormControl>
                    <FormLabel fontSize="sm">Buyer Type</FormLabel>
                    <Select
                      size="sm"
                      placeholder="All buyer types"
                      value={exportOptions.filters.buyerType || ''}
                      onChange={(e) => updateFilters('buyerType', e.target.value || undefined)}
                    >
                      {buyerTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Investment Range Filter */}
                  <FormControl>
                    <FormLabel fontSize="sm">Investment Range</FormLabel>
                    <Select
                      size="sm"
                      placeholder="All investment ranges"
                      value={exportOptions.filters.investmentRange || ''}
                      onChange={(e) => updateFilters('investmentRange', e.target.value || undefined)}
                    >
                      {investmentRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* City Filter */}
                  <FormControl>
                    <FormLabel fontSize="sm">City</FormLabel>
                    <Input
                      size="sm"
                      placeholder="Filter by city"
                      value={exportOptions.filters.city || ''}
                      onChange={(e) => updateFilters('city', e.target.value || undefined)}
                    />
                  </FormControl>

                  {/* State Filter */}
                  <FormControl>
                    <FormLabel fontSize="sm">State</FormLabel>
                    <Select
                      size="sm"
                      placeholder="All states"
                      value={exportOptions.filters.state || ''}
                      onChange={(e) => updateFilters('state', e.target.value || undefined)}
                    >
                      {states.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Active Status Filter */}
                  <FormControl>
                    <FormLabel fontSize="sm">Status</FormLabel>
                    <Select
                      size="sm"
                      placeholder="All statuses"
                      value={exportOptions.filters.isActive === undefined ? '' : exportOptions.filters.isActive.toString()}
                      onChange={(e) => updateFilters('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                    >
                      <option value="">All statuses</option>
                      <option value="true">Active only</option>
                      <option value="false">Inactive only</option>
                    </Select>
                  </FormControl>

                  {/* Include Inactive Checkbox */}
                  <FormControl>
                    <Checkbox
                      isChecked={exportOptions.includeInactive}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeInactive: e.target.checked }))}
                    >
                      <Text fontSize="sm">Include inactive buyers in export</Text>
                    </Checkbox>
                  </FormControl>
                </VStack>
              </Box>

              {/* Export Info */}
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Export Information</AlertTitle>
                  <AlertDescription>
                    The export will include all buyer data with the selected filters applied. 
                    {exportOptions.format === 'csv' && ' CSV format is recommended for spreadsheet applications.'}
                    {exportOptions.format === 'json' && ' JSON format is recommended for data processing.'}
                    {exportOptions.format === 'xlsx' && ' Excel format provides better formatting and multiple sheets.'}
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Active Filters Summary */}
              {filterCount > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Active Filters:</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {exportOptions.filters.buyerType && (
                      <Badge colorScheme="blue" size="sm">
                        Type: {buyerTypes.find(t => t.value === exportOptions.filters.buyerType)?.label}
                      </Badge>
                    )}
                    {exportOptions.filters.investmentRange && (
                      <Badge colorScheme="green" size="sm">
                        Range: {investmentRanges.find(r => r.value === exportOptions.filters.investmentRange)?.label}
                      </Badge>
                    )}
                    {exportOptions.filters.city && (
                      <Badge colorScheme="purple" size="sm">
                        City: {exportOptions.filters.city}
                      </Badge>
                    )}
                    {exportOptions.filters.state && (
                      <Badge colorScheme="orange" size="sm">
                        State: {exportOptions.filters.state}
                      </Badge>
                    )}
                    {exportOptions.filters.isActive !== undefined && (
                      <Badge colorScheme="teal" size="sm">
                        Status: {exportOptions.filters.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleExport}
                leftIcon={<FaDownload />}
                isLoading={isExporting}
                loadingText="Exporting..."
              >
                Export Buyers
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
