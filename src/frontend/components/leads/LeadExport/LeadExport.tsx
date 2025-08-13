import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Checkbox,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FiDownload, FiEye, FiFilter, FiRefreshCw, FiSettings, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';

interface ExportField {
  field: string;
  label: string;
  required: boolean;
  description: string;
}

interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  source?: string[];
  propertyType?: string[];
  assignedTo?: string[];
  search?: string;
}

interface ExportPreviewResult {
  success: boolean;
  previewData: any[];
  totalCount: number;
  availableFields: ExportField[];
  selectedFields: string[];
  fieldMapping: Record<string, string>;
  warnings?: string[];
  errors?: string[];
}

interface LeadExportProps {
  onExportComplete?: () => void;
  onClose?: () => void;
}

export const LeadExport: React.FC<LeadExportProps> = ({ onExportComplete, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<ExportField[]>([]);
  const [filters, setFilters] = useState<ExportFilters>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [exportProgress, setExportProgress] = useState(0);

  const api = useApi();
  const toast = useToast();

  useEffect(() => {
    loadAvailableFields();
  }, []);

  const loadAvailableFields = async () => {
    try {
      const response = await api.get('/leads/import-export/export-fields');
      setAvailableFields(response.data);
      // Pre-select required fields
      const requiredFields = response.data
        .filter((field: ExportField) => field.required)
        .map((field: ExportField) => field.field);
      setSelectedFields(requiredFields);
    } catch (error) {
      console.error('Failed to load export fields:', error);
    }
  };

  const handleFieldToggle = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleFieldOrderChange = (field: string, direction: 'up' | 'down') => {
    const currentIndex = selectedFields.indexOf(field);
    if (currentIndex === -1) return;
    
    const newFields = [...selectedFields];
    if (direction === 'up' && currentIndex > 0) {
      [newFields[currentIndex], newFields[currentIndex - 1]] = [newFields[currentIndex - 1], newFields[currentIndex]];
    } else if (direction === 'down' && currentIndex < newFields.length - 1) {
      [newFields[currentIndex], newFields[currentIndex + 1]] = [newFields[currentIndex + 1], newFields[currentIndex]];
    }
    setSelectedFields(newFields);
  };

  const saveFieldSelection = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('leadExportFieldSelection', JSON.stringify(selectedFields));
      }
      toast({
        title: 'Success',
        description: 'Field selection saved for future exports',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to save field selection:', error);
    }
  };

  const loadSavedFieldSelection = () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('leadExportFieldSelection');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSelectedFields(parsed);
          toast({
            title: 'Success',
            description: 'Saved field selection loaded',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load saved field selection:', error);
    }
  };

  const selectAllFields = () => {
    setSelectedFields(availableFields.map(f => f.field));
  };

  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  const selectRequiredFields = () => {
    setSelectedFields(availableFields.filter(f => f.required).map(f => f.field));
  };

  const handleFilterChange = (key: keyof ExportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const loadPreview = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one field for export',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoadingPreview(true);
    try {
      const response = await api.execute({
        method: 'POST',
        url: '/leads/import-export/export-preview',
        data: {
          fields: selectedFields,
          filters,
          format: exportFormat,
          tenantId: 'current' // This will be set by the backend
        }
      });

      if (response.success) {
        setPreviewData(response.data.previewData);
        setTotalCount(response.data.totalCount);
        setShowPreview(true);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load preview',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to load export preview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one field for export',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Start export process
      const response = await api.execute({
        method: 'POST',
        url: '/leads/import-export/export',
        data: {
          fields: selectedFields,
          filters,
          format: exportFormat,
          tenantId: 'current' // This will be set by the backend
        }
      });

      if (response.success) {
        // Poll for progress
        const pollProgress = async () => {
          try {
            const progressResponse = await api.execute({
              method: 'GET',
              url: `/leads/import-export/export-progress/${response.data.exportId}`
            });

            if (progressResponse.success) {
              const progress = progressResponse.data.progress;
              setExportProgress(progress);

              if (progress < 100) {
                setTimeout(pollProgress, 1000);
              } else {
                // Download file when complete
                const downloadResponse = await api.execute({
                  method: 'GET',
                  url: `/leads/import-export/export-download/${response.data.exportId}`,
                  responseType: 'blob'
                });

                if (downloadResponse.success) {
                  // Create download link
                  const url = window.URL.createObjectURL(downloadResponse.data);
                  const link = document.createElement('a');
                  link.href = url;
                  
                  // Generate filename with filters
                  const timestamp = new Date().toISOString().split('T')[0];
                  const filterSuffix = Object.keys(filters).length > 0 ? '-filtered' : '';
                  link.download = `leads-export-${timestamp}${filterSuffix}.${exportFormat}`;
                  
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);

                  toast({
                    title: 'Success',
                    description: 'Export completed and downloaded successfully',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });

                  if (onExportComplete) {
                    onExportComplete();
                  }
                }
              }
            }
          } catch (error) {
            console.error('Failed to poll export progress:', error);
          }
        };

        pollProgress();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to start export',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to export:', error);
      toast({
        title: 'Error',
        description: 'Failed to start export process',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getFilterPresets = () => [
    { name: 'Today', action: () => applyFilterPreset('today') },
    { name: 'This Week', action: () => applyFilterPreset('thisWeek') },
    { name: 'This Month', action: () => applyFilterPreset('thisMonth') },
    { name: 'Last 30 Days', action: () => applyFilterPreset('last30Days') },
    { name: 'Last Quarter', action: () => applyFilterPreset('lastQuarter') },
  ];

  const applyFilterPreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case 'today':
        setFilters({
          dateFrom: today.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0]
        });
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        setFilters({
          dateFrom: startOfWeek.toISOString().split('T')[0],
          dateTo: endOfWeek.toISOString().split('T')[0]
        });
        break;
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setFilters({
          dateFrom: startOfMonth.toISOString().split('T')[0],
          dateTo: endOfMonth.toISOString().split('T')[0]
        });
        break;
      case 'last30Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setFilters({
          dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0]
        });
        break;
      case 'lastQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        setFilters({
          dateFrom: startOfQuarter.toISOString().split('T')[0],
          dateTo: endOfQuarter.toISOString().split('T')[0]
        });
        break;
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Export Leads</Heading>
          <HStack>
            <Button
              leftIcon={<FiEye />}
              onClick={loadPreview}
              isLoading={isLoadingPreview}
              variant="outline"
              size="sm"
            >
              Preview
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={handleExport}
              isLoading={isExporting}
              colorScheme="blue"
              size="sm"
            >
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Field Selection */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="sm">Select Fields to Export</Heading>
            <HStack spacing={2}>
              <Button size="xs" onClick={selectRequiredFields} variant="outline">
                Required Only
              </Button>
              <Button size="xs" onClick={selectAllFields} variant="outline">
                Select All
              </Button>
              <Button size="xs" onClick={deselectAllFields} variant="outline">
                Clear All
              </Button>
            </HStack>
          </HStack>
          
          <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
            {selectedFields.length > 0 && (
              <Box p={2} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>Selected Fields ({selectedFields.length})</Text>
                <VStack spacing={1} align="stretch">
                  {selectedFields.map((fieldName, index) => {
                    const field = availableFields.find(f => f.field === fieldName);
                    if (!field) return null;
                    
                    return (
                      <HStack key={field.field} justify="space-between" p={2} bg="white" borderRadius="sm">
                        <HStack>
                          <Text fontSize="sm" fontWeight="medium">{index + 1}.</Text>
                          <Text fontSize="sm">{field.label}</Text>
                          {field.required && <Badge size="sm" colorScheme="red">Required</Badge>}
                        </HStack>
                        <HStack spacing={1}>
                          <IconButton
                            size="xs"
                            icon={<FiArrowUp />}
                            aria-label="Move up"
                            onClick={() => handleFieldOrderChange(field.field, 'up')}
                            isDisabled={index === 0}
                          />
                          <IconButton
                            size="xs"
                            icon={<FiArrowDown />}
                            aria-label="Move down"
                            onClick={() => handleFieldOrderChange(field.field, 'down')}
                            isDisabled={index === selectedFields.length - 1}
                          />
                          <IconButton
                            size="xs"
                            icon={<FiX />}
                            aria-label="Remove field"
                            onClick={() => handleFieldToggle(field.field)}
                            colorScheme="red"
                            variant="ghost"
                          />
                        </HStack>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            )}
            
            <Text fontSize="sm" fontWeight="medium" color="gray.600">Available Fields</Text>
            {availableFields.map((field) => (
              <HStack key={field.field} justify="space-between" p={2} bg="gray.50" borderRadius="sm">
                <HStack>
                  <Checkbox
                    isChecked={selectedFields.includes(field.field)}
                    onChange={() => handleFieldToggle(field.field)}
                    isDisabled={field.required}
                  />
                  <Text fontSize="sm">{field.label}</Text>
                  {field.required && <Badge size="sm" colorScheme="red">Required</Badge>}
                </HStack>
                <Tooltip label={field.description}>
                  <Text fontSize="xs" color="gray.500" maxW="200px" noOfLines={1}>
                    {field.description}
                  </Text>
                </Tooltip>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Divider />

        {/* Export Format */}
        <Box>
          <Heading size="sm" mb={3}>Export Format</Heading>
          <Select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'excel')}
            size="sm"
            maxW="200px"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="excel">Excel</option>
          </Select>
        </Box>

        <Divider />

        {/* Filters */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="sm">Filters</Heading>
            <HStack>
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
              <Button size="sm" variant="outline" onClick={loadPreview}>
                Apply
              </Button>
            </HStack>
          </HStack>

          {/* Filter Presets */}
          <HStack mb={4} spacing={2}>
            {getFilterPresets().map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant="outline"
                onClick={preset.action}
              >
                {preset.name}
              </Button>
            ))}
          </HStack>

          {/* Filter Fields */}
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Date From</FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Date To</FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  size="sm"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Status</FormLabel>
                <Select
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : [])}
                  size="sm"
                  placeholder="Select status"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Source</FormLabel>
                <Select
                  value={filters.source?.[0] || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value ? [e.target.value] : [])}
                  size="sm"
                  placeholder="Select source"
                >
                  <option value="WEBSITE">Website</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="COLD_CALL">Cold Call</option>
                  <option value="SOCIAL_MEDIA">Social Media</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel fontSize="sm">Search</FormLabel>
              <Input
                placeholder="Search by name, email, or company"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="sm"
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Export Progress */}
        {isExporting && (
          <Box>
            <Text fontSize="sm" mb={2}>Exporting leads...</Text>
            <Progress value={exportProgress} size="sm" colorScheme="blue" />
            <Text fontSize="xs" mt={1} textAlign="right">{exportProgress}%</Text>
          </Box>
        )}

        {/* Preview Modal */}
        <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>Export Preview</Text>
                <Text fontSize="sm" color="gray.500">
                  {totalCount} total records
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Preview Data</AlertTitle>
                    <AlertDescription>
                      Showing first 10 records. The actual export will include all {totalCount} records.
                    </AlertDescription>
                  </Box>
                </Alert>

                {previewData.length > 0 && (
                  <Box overflowX="auto">
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          {selectedFields.map((field) => (
                            <Th key={field}>
                              {availableFields.find(f => f.field === field)?.label || field}
                            </Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {previewData.map((row, index) => (
                          <Tr key={index}>
                            {selectedFields.map((field) => (
                              <Td key={field}>
                                <Text fontSize="sm" noOfLines={2}>
                                  {row[field] || '-'}
                                </Text>
                              </Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowPreview(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};
