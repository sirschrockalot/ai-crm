import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  useToast,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  Checkbox,
  Select,
  Input,
  Textarea,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FiUpload, FiDownload, FiFile, FiX, FiCheck, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import { useLeads } from '../hooks/useLeads';
import { ImportOptions, ValidationResult } from '../services/leadImportExportService';

interface LeadImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export const LeadImportExport: React.FC<LeadImportExportProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const {
    importLeads,
    exportLeads,
    validateImportFile,
    downloadImportTemplate,
    importProgress,
    exportProgress,
    resetImportProgress,
    resetExportProgress,
    error,
  } = useLeads();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    updateExisting: false,
    skipDuplicates: true,
    batchSize: 100,
    defaultSource: 'import',
    defaultStatus: 'new',
    defaultPriority: 'medium',
    defaultTags: [],
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Reset progress when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetImportProgress();
      resetExportProgress();
    }
  }, [isOpen, resetImportProgress, resetExportProgress]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a CSV or Excel file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select a file smaller than 100MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setImportFile(file);
      setValidationResult(null);

      // Validate file structure
      try {
        const validation = await validateImportFile(file);
        setValidationResult(validation);
        
        if (validation.validation.invalidRows > 0) {
          toast({
            title: 'File Validation Warning',
            description: `${validation.validation.invalidRows} rows have validation issues`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Validation Failed',
          description: 'Failed to validate file structure',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const result = await importLeads(importFile, importOptions);
      
      if (result.success) {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${result.imported} leads`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onImportComplete?.();
        
        // Reset after a delay
        setTimeout(() => {
          setImportFile(null);
          setValidationResult(null);
          resetImportProgress();
        }, 3000);
      } else {
        toast({
          title: 'Import Completed with Errors',
          description: `${result.imported} leads imported, ${result.errors.length} errors`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportLeads(undefined, exportFormat);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Lead data has been exported successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Only CSV and XLSX are supported for templates
      const templateFormat = exportFormat === 'json' ? 'csv' : exportFormat;
      const blob = await downloadImportTemplate(templateFormat as 'csv' | 'xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lead-import-template.${templateFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Template Download Failed',
        description: 'Failed to download import template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const clearFile = () => {
    setImportFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canImport = importFile && importProgress.status === 'idle' && !validationResult?.validation.invalidRows;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import/Export Leads</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Import Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                Import Leads
              </Text>
              
              {!importFile ? (
                <VStack spacing={4}>
                  <Box
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    p={8}
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUpload size={32} color="#718096" />
                    <Text mt={2} fontWeight="medium">
                      Click to select file or drag and drop
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Supports CSV and Excel files (max 100MB)
                    </Text>
                  </Box>
                  
                  <Button
                    variant="link"
                    colorScheme="blue"
                    size="sm"
                    onClick={handleDownloadTemplate}
                  >
                    Download Import Template
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={4}>
                  <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    w="full"
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <FiFile size={20} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{importFile.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {(importFile.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </VStack>
                      </HStack>
                      <IconButton
                        size="sm"
                        icon={<FiX />}
                        aria-label="Remove file"
                        variant="ghost"
                        onClick={clearFile}
                      />
                    </HStack>
                  </Box>

                  {/* Validation Results */}
                  {validationResult && (
                    <Box w="full">
                      <HStack spacing={2} mb={2}>
                        <Text fontSize="sm" fontWeight="medium">File Validation:</Text>
                        <Badge colorScheme={validationResult.validation.invalidRows > 0 ? 'yellow' : 'green'}>
                          {validationResult.validation.validRows} valid, {validationResult.validation.invalidRows} invalid
                        </Badge>
                      </HStack>
                      
                      {validationResult.validation.errors.length > 0 && (
                        <Accordion allowToggle>
                          <AccordionItem>
                            <AccordionButton>
                              <Box as="span" flex='1' textAlign='left'>
                                <FiAlertTriangle style={{ display: 'inline', marginRight: '8px' }} />
                                View Validation Errors ({validationResult.validation.errors.length})
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <VStack align="stretch" spacing={2}>
                                {validationResult.validation.errors.slice(0, 10).map((error, index) => (
                                  <Text key={index} fontSize="sm" color="red.600">
                                    Row {error.row}: {error.message}
                                  </Text>
                                ))}
                                {validationResult.validation.errors.length > 10 && (
                                  <Text fontSize="sm" color="gray.500">
                                    ... and {validationResult.validation.errors.length - 10} more errors
                                  </Text>
                                )}
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </Box>
                  )}

                  {/* Import Progress */}
                  {importProgress.status !== 'idle' && (
                    <VStack spacing={2} w="full">
                      <Text fontSize="sm">{importProgress.message}</Text>
                      <Progress 
                        value={importProgress.percentage} 
                        w="full" 
                        colorScheme={importProgress.status === 'failed' ? 'red' : 'blue'} 
                      />
                      <Text fontSize="sm" color="gray.500">
                        {importProgress.currentStep} ({importProgress.currentStepNumber}/{importProgress.totalSteps})
                      </Text>
                    </VStack>
                  )}

                  {/* Import Options */}
                  <Accordion allowToggle w="full">
                    <AccordionItem>
                      <AccordionButton>
                        <Box as="span" flex='1' textAlign='left'>
                          <FiSettings style={{ display: 'inline', marginRight: '8px' }} />
                          Import Options
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4} align="stretch">
                          <HStack spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="sm">Update Existing</FormLabel>
                              <Checkbox
                                isChecked={importOptions.updateExisting}
                                onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                              >
                                Update existing leads
                              </Checkbox>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Skip Duplicates</FormLabel>
                              <Checkbox
                                isChecked={importOptions.skipDuplicates}
                                onChange={(e) => setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                              >
                                Skip duplicate leads
                              </Checkbox>
                            </FormControl>
                          </HStack>
                          
                          <HStack spacing={4}>
                            <FormControl>
                              <FormLabel fontSize="sm">Default Status</FormLabel>
                              <Select
                                value={importOptions.defaultStatus}
                                onChange={(e) => setImportOptions(prev => ({ ...prev, defaultStatus: e.target.value }))}
                                size="sm"
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="converted">Converted</option>
                                <option value="lost">Lost</option>
                              </Select>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Default Priority</FormLabel>
                              <Select
                                value={importOptions.defaultPriority}
                                onChange={(e) => setImportOptions(prev => ({ ...prev, defaultPriority: e.target.value }))}
                                size="sm"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </Select>
                            </FormControl>
                          </HStack>
                          
                          <FormControl>
                            <FormLabel fontSize="sm">Default Source</FormLabel>
                            <Input
                              value={importOptions.defaultSource}
                              onChange={(e) => setImportOptions(prev => ({ ...prev, defaultSource: e.target.value }))}
                              size="sm"
                              placeholder="e.g., import, website, referral"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontSize="sm">Default Tags</FormLabel>
                            <Input
                              value={importOptions.defaultTags?.join(', ') || ''}
                              onChange={(e) => setImportOptions(prev => ({ 
                                ...prev, 
                                defaultTags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                              }))}
                              size="sm"
                              placeholder="tag1, tag2, tag3"
                            />
                          </FormControl>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Box>

            <Divider />

            {/* Export Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                Export Leads
              </Text>
              
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Export all leads to your preferred format
                </Text>
                
                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Export Format</FormLabel>
                    <Select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx' | 'json')}
                      size="sm"
                    >
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel</option>
                      <option value="json">JSON</option>
                    </Select>
                  </FormControl>
                  
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    onClick={handleExport}
                    isLoading={exportProgress.status === 'processing'}
                    loadingText="Exporting..."
                  >
                    Export Leads
                  </Button>
                </HStack>

                {/* Export Progress */}
                {exportProgress.status !== 'idle' && (
                  <VStack spacing={2} w="full">
                    <Text fontSize="sm">{exportProgress.message}</Text>
                    <Progress 
                      value={exportProgress.percentage} 
                      w="full" 
                      colorScheme={exportProgress.status === 'failed' ? 'red' : 'blue'} 
                    />
                  </VStack>
                )}
              </VStack>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {canImport && (
              <Button
                colorScheme="blue"
                onClick={handleImport}
                isLoading={importProgress.status === 'processing'}
                loadingText="Importing..."
              >
                Import Leads
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
