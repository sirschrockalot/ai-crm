import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Switch,
  Checkbox,
  Select,
  Input,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { DownloadIcon, UploadIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { useDropzone } from 'react-dropzone';
import importExportService, { ImportOptions, ImportResult, ExportOptions } from '../../../services/importExportService';

interface ImportExportPanelProps {
  onImportComplete?: (result: ImportResult) => void;
  onExportComplete?: () => void;
}

const ImportExportPanel: React.FC<ImportExportPanelProps> = ({
  onImportComplete,
  onExportComplete,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    updateExisting: false,
    skipDuplicates: true,
  });
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { isOpen: isImportModalOpen, onOpen: onImportModalOpen, onClose: onImportModalClose } = useDisclosure();
  const { isOpen: isExportModalOpen, onOpen: onExportModalOpen, onClose: onExportModalClose } = useDisclosure();
  
  const toast = useToast();

  // Dropzone for file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      validateFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  // Validate uploaded file
  const validateFile = async (file: File) => {
    try {
      const result = await importExportService.validateCsvFile(file);
      setValidationResult(result);
      
      if (!result.isValid) {
        toast({
          title: 'File validation failed',
          description: result.errors.join(', '),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (result.warnings.length > 0) {
        toast({
          title: 'File validation warnings',
          description: result.warnings.join(', '),
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'File validation error',
        description: 'Failed to validate file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Import leads
  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await importExportService.importLeads(selectedFile, importOptions);
      
      clearInterval(progressInterval);
      setImportProgress(100);

      setImportResult(result);
      onImportComplete?.(result);

      if (result.success) {
        toast({
          title: 'Import successful',
          description: `${result.importedRecords} leads imported successfully`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Import completed with errors',
          description: `${result.failedRecords} leads failed to import`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }

      onImportModalClose();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Export leads
  const handleExport = async (options: ExportOptions = {}) => {
    setIsExporting(true);

    try {
      const blob = await importExportService.exportLeads(options);
      importExportService.downloadFile(blob, `leads_export_${Date.now()}.csv`);
      
      toast({
        title: 'Export successful',
        description: 'Leads exported successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onExportComplete?.();
      onExportModalClose();
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Download import template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await importExportService.getImportTemplate();
      importExportService.downloadFile(blob, 'leads_import_template.csv');
      
      toast({
        title: 'Template downloaded',
        description: 'Import template downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Import Section */}
        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">
                Import Leads
              </Text>
              <Button
                leftIcon={<DownloadIcon />}
                size="sm"
                variant="outline"
                onClick={handleDownloadTemplate}
              >
                Download Template
              </Button>
            </HStack>

            <Box
              {...getRootProps()}
              p={6}
              border="2px dashed"
              borderColor={isDragActive ? 'blue.400' : 'gray.300'}
              borderRadius="md"
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.400' }}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <VStack spacing={2}>
                  <Text fontWeight="semibold">{selectedFile.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Text>
                  {validationResult && (
                    <HStack spacing={2}>
                      {validationResult.isValid ? (
                        <Badge colorScheme="green">Valid</Badge>
                      ) : (
                        <Badge colorScheme="red">Invalid</Badge>
                      )}
                    </HStack>
                  )}
                </VStack>
              ) : (
                <VStack spacing={2}>
                  <UploadIcon size="lg" color="gray.400" />
                  <Text>
                    {isDragActive
                      ? 'Drop the file here'
                      : 'Drag and drop a CSV file here, or click to select'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Supports CSV, XLS, XLSX files
                  </Text>
                </VStack>
              )}
            </Box>

            {selectedFile && validationResult?.isValid && (
              <Button
                colorScheme="blue"
                onClick={onImportModalOpen}
                isLoading={isImporting}
                loadingText="Importing..."
              >
                Import Leads
              </Button>
            )}

            {isImporting && (
              <Box>
                <Text fontSize="sm" mb={2}>
                  Importing leads... {importProgress}%
                </Text>
                <Progress value={importProgress} colorScheme="blue" />
              </Box>
            )}
          </VStack>
        </Box>

        <Divider />

        {/* Export Section */}
        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold">
              Export Leads
            </Text>

            <HStack spacing={4}>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="green"
                onClick={() => handleExport()}
                isLoading={isExporting}
                loadingText="Exporting..."
              >
                Export All Leads
              </Button>
              <Button
                variant="outline"
                onClick={onExportModalOpen}
                isLoading={isExporting}
              >
                Custom Export
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Import Results */}
        {importResult && (
          <Alert
            status={importResult.success ? 'success' : 'warning'}
            borderRadius="md"
          >
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">
                Import {importResult.success ? 'Successful' : 'Completed with Errors'}
              </Text>
              <Text fontSize="sm">
                {importResult.importedRecords} imported, {importResult.failedRecords} failed
              </Text>
              {importResult.warnings.length > 0 && (
                <Text fontSize="sm" color="orange.600">
                  Warnings: {importResult.warnings.join(', ')}
                </Text>
              )}
            </VStack>
          </Alert>
        )}
      </VStack>

      {/* Import Options Modal */}
      <Modal isOpen={isImportModalOpen} onClose={onImportModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="update-existing" mb="0">
                  Update existing leads
                </FormLabel>
                <Switch
                  id="update-existing"
                  isChecked={importOptions.updateExisting}
                  onChange={(e) =>
                    setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="skip-duplicates" mb="0">
                  Skip duplicates
                </FormLabel>
                <Switch
                  id="skip-duplicates"
                  isChecked={importOptions.skipDuplicates}
                  onChange={(e) =>
                    setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))
                  }
                />
              </FormControl>

              {validationResult?.warnings.length > 0 && (
                <Alert status="warning">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Warnings:</Text>
                    {validationResult.warnings.map((warning, index) => (
                      <Text key={index} fontSize="sm">
                        • {warning}
                      </Text>
                    ))}
                  </VStack>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onImportModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleImport}>
              Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Export Options Modal */}
      <Modal isOpen={isExportModalOpen} onClose={onExportModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Format</FormLabel>
                <Select defaultValue="csv">
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Fields to Export</FormLabel>
                <VStack align="start" spacing={2}>
                  {[
                    'firstName',
                    'lastName',
                    'email',
                    'phone',
                    'company',
                    'status',
                    'priority',
                    'value',
                    'score',
                  ].map((field) => (
                    <Checkbox key={field} defaultChecked>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Checkbox>
                  ))}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExportModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={() => handleExport({ format: 'csv' })}
              isLoading={isExporting}
            >
              Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImportExportPanel; 