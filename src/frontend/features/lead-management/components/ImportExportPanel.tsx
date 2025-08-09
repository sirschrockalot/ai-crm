import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Checkbox,
  Select,
  useToast,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiDownload, FiUpload, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { ImportExportProgress } from '../types/lead';
import { useLeads } from '../hooks/useLeads';

interface ImportExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportPanel: React.FC<ImportExportPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportExportProgress | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    skipDuplicates: true,
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportFilters, setExportFilters] = useState({
    status: '',
    propertyType: '',
    source: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importLeads, exportLeads } = useLeads();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/json',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (allowedTypes.includes(file.type)) {
        setImportFile(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV or JSON file',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportProgress({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      errors: [],
    });

    try {
      const result = await importLeads(importFile, importOptions);
      
      if (result.success) {
        toast({
          title: 'Import successful',
          description: `Successfully imported ${result.imported} leads`,
          status: 'success',
          duration: 5000,
        });
        
        setImportFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast({
          title: 'Import failed',
          description: result.errors.join(', '),
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Import error',
        description: error instanceof Error ? error.message : 'Failed to import leads',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const handleExport = async () => {
    try {
      const filters = Object.fromEntries(
        Object.entries(exportFilters).filter(([_, value]) => value !== '')
      );
      
      const blob = await exportLeads(filters, exportFormat);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export successful',
        description: 'Leads exported successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export leads',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv': return '📊';
      case 'json': return '📄';
      case 'xlsx': return '📈';
      default: return '📁';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <Heading size="md">Import/Export Leads</Heading>
            <IconButton
              icon={<FiX />}
              variant="ghost"
              size="sm"
              aria-label="Close"
              onClick={onClose}
            />
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Import Section */}
            <Box>
              <Heading size="sm" mb={4}>Import Leads</Heading>
              
              <VStack spacing={4} align="stretch">
                {/* File Upload */}
                <Box
                  border="2px dashed"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  _hover={{ borderColor: 'blue.300' }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  {importFile ? (
                    <VStack spacing={2}>
                      <Text fontSize="2xl">{getFileIcon(importFile.name)}</Text>
                      <Text fontWeight="medium">{importFile.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove File
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={2}>
                      <FiUpload size={24} />
                      <Text fontWeight="medium">Click to select file</Text>
                      <Text fontSize="sm" color="gray.500">
                        Supports CSV, JSON, and Excel files
                      </Text>
                    </VStack>
                  )}
                </Box>

                {/* Import Options */}
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">Import Options</FormLabel>
                    <VStack spacing={2} align="start">
                      <Checkbox
                        isChecked={importOptions.updateExisting}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          updateExisting: e.target.checked,
                        }))}
                      >
                        Update existing leads
                      </Checkbox>
                      <Checkbox
                        isChecked={importOptions.skipDuplicates}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          skipDuplicates: e.target.checked,
                        }))}
                      >
                        Skip duplicate entries
                      </Checkbox>
                    </VStack>
                  </FormControl>
                </VStack>

                {/* Import Progress */}
                {importProgress && (
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm">Import Progress</Text>
                      <Text fontSize="sm" color="gray.500">
                        {importProgress.processed} / {importProgress.total}
                      </Text>
                    </HStack>
                    <Progress
                      value={(importProgress.processed / importProgress.total) * 100}
                      size="sm"
                      colorScheme="blue"
                    />
                    <HStack spacing={4} mt={2}>
                      <Badge colorScheme="green" size="sm">
                        <FiCheck /> {importProgress.success} Success
                      </Badge>
                      <Badge colorScheme="red" size="sm">
                        <FiAlertCircle /> {importProgress.failed} Failed
                      </Badge>
                    </HStack>
                  </Box>
                )}

                <Button
                  colorScheme="blue"
                  onClick={handleImport}
                  isDisabled={!importFile || isImporting}
                  isLoading={isImporting}
                  loadingText="Importing..."
                >
                  Import Leads
                </Button>
              </VStack>
            </Box>

            <Divider />

            {/* Export Section */}
            <Box>
              <Heading size="sm" mb={4}>Export Leads</Heading>
              
              <VStack spacing={4} align="stretch">
                {/* Export Format */}
                <FormControl>
                  <FormLabel fontSize="sm">Export Format</FormLabel>
                  <Select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </Select>
                </FormControl>

                {/* Export Filters */}
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="medium">Filters (Optional)</Text>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">Status</FormLabel>
                    <Select
                      value={exportFilters.status}
                      onChange={(e) => setExportFilters(prev => ({
                        ...prev,
                        status: e.target.value,
                      }))}
                      placeholder="All statuses"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Property Type</FormLabel>
                    <Select
                      value={exportFilters.propertyType}
                      onChange={(e) => setExportFilters(prev => ({
                        ...prev,
                        propertyType: e.target.value,
                      }))}
                      placeholder="All property types"
                    >
                      <option value="single_family">Single Family</option>
                      <option value="multi_family">Multi Family</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Source</FormLabel>
                    <Select
                      value={exportFilters.source}
                      onChange={(e) => setExportFilters(prev => ({
                        ...prev,
                        source: e.target.value,
                      }))}
                      placeholder="All sources"
                    >
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="cold_call">Cold Call</option>
                    </Select>
                  </FormControl>
                </VStack>

                <Button
                  colorScheme="green"
                  onClick={handleExport}
                  leftIcon={<FiDownload />}
                >
                  Export Leads
                </Button>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
