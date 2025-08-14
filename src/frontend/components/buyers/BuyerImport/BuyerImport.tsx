import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
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
  ModalCloseButton,
  useDisclosure,
  Badge,
  Divider,
  Icon,
  Tooltip,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
} from '@chakra-ui/react';
import { FaUpload, FaDownload, FaFileCsv, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaEye, FaCog } from 'react-icons/fa';
import { useApi } from '../../../hooks/useApi';
import { FieldMapping } from '../FieldMapping';

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalRows: number;
  preview: any[];
}

interface BuyerImportProps {
  onImportComplete?: () => void;
  onClose?: () => void;
}

export const BuyerImport: React.FC<BuyerImportProps> = ({ onImportComplete, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showErrorReport, setShowErrorReport] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationPreview, setShowValidationPreview] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    defaultStatus: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();
  const toast = useToast();
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a CSV file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select a file smaller than 10MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
      setValidationResult(null);
      
      // Extract CSV headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setCsvHeaders(headers);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/api/buyers/template', {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'buyer_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Template Downloaded',
        description: 'Buyer import template has been downloaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Template download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download template. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/api/buyers/validate-csv', formData);
      const result: ValidationResult = response.data;

      setValidationResult(result);

      if (result.isValid) {
        toast({
          title: 'Validation Successful',
          description: `File is valid. ${result.totalRows} rows found.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Validation Issues Found',
          description: `${result.errors.length} errors found. Please review and fix.`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const startImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('skipDuplicates', importOptions.skipDuplicates.toString());
      formData.append('updateExisting', importOptions.updateExisting.toString());
      formData.append('defaultStatus', importOptions.defaultStatus.toString());
      
      // Add field mapping if available
      if (Object.keys(fieldMapping).length > 0) {
        formData.append('fieldMapping', JSON.stringify(fieldMapping));
      }

      const response = await api.post('/api/buyers/import-csv', formData);
      const result: ImportResult = response.data;

      setImportResult(result);

      if (result.success) {
        toast({
          title: 'Import Successful',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onImportComplete?.();
      } else {
        toast({
          title: 'Import Completed with Errors',
          description: result.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import buyers. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setValidationResult(null);
    setShowErrorReport(false);
    setShowValidationPreview(false);
    setShowFieldMapping(false);
    setCsvHeaders([]);
    setFieldMapping({});
    onModalClose();
    onClose?.();
  };

  return (
    <>
      <Button
        leftIcon={<FaUpload />}
        colorScheme="blue"
        onClick={onOpen}
        size="sm"
      >
        Import Buyers
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="4xl">
          <ModalHeader>Import Buyers from CSV</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Template Download */}
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="semibold">Step 1: Download Template</Text>
                  <Tooltip label="Download CSV template with all required fields">
                    <Icon as={FaInfoCircle} color="blue.500" />
                  </Tooltip>
                </HStack>
                <Button
                  leftIcon={<FaDownload />}
                  variant="outline"
                  onClick={downloadTemplate}
                  size="sm"
                >
                  Download CSV Template
                </Button>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Use the template to ensure your CSV file has the correct format and all required fields.
                </Text>
              </Box>

              <Divider />

              {/* File Upload */}
              <Box>
                <Text fontWeight="semibold" mb={2}>Step 2: Upload CSV File</Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  leftIcon={<FaFileCsv />}
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  isDisabled={isImporting || isValidating}
                >
                  {selectedFile ? selectedFile.name : 'Select CSV File'}
                </Button>
                {selectedFile && (
                  <Text fontSize="sm" color="green.600" mt={2}>
                    ✓ File selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                )}
              </Box>

              {/* File Validation */}
              {selectedFile && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Step 3: Validate File (Optional)</Text>
                  <Button
                    leftIcon={<FaEye />}
                    variant="outline"
                    onClick={validateFile}
                    isLoading={isValidating}
                    size="sm"
                  >
                    Validate CSV File
                  </Button>
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    Validate your file to check for errors before importing.
                  </Text>
                </Box>
              )}

              {/* Field Mapping */}
              {selectedFile && csvHeaders.length > 0 && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold">Step 4: Field Mapping (Optional)</Text>
                    <Button
                      leftIcon={<FaCog />}
                      variant="outline"
                      onClick={() => setShowFieldMapping(!showFieldMapping)}
                      size="sm"
                    >
                      {showFieldMapping ? 'Hide' : 'Show'} Field Mapping
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Customize how CSV columns map to buyer fields.
                  </Text>
                  
                  {showFieldMapping && (
                    <Box mt={3} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                      <FieldMapping
                        csvHeaders={csvHeaders}
                        onMappingChange={setFieldMapping}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Validation Results */}
              {validationResult && (
                <Box>
                  <Text fontWeight="semibold" mb={3}>Validation Results</Text>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Total Rows:</Text>
                      <Badge colorScheme="blue">{validationResult.totalRows}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Status:</Text>
                      <Badge colorScheme={validationResult.isValid ? "green" : "red"}>
                        {validationResult.isValid ? "Valid" : "Invalid"}
                      </Badge>
                    </HStack>
                    
                    {validationResult.errors.length > 0 && (
                      <Alert status="error">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Validation Errors ({validationResult.errors.length})</AlertTitle>
                          <AlertDescription>
                            <Button
                              size="sm"
                              variant="link"
                              colorScheme="red"
                              onClick={() => setShowValidationPreview(!showValidationPreview)}
                              ml={2}
                            >
                              {showValidationPreview ? 'Hide' : 'Show'} Details
                            </Button>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <Alert status="warning">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Validation Warnings ({validationResult.warnings.length})</AlertTitle>
                          <AlertDescription>
                            <Button
                              size="sm"
                              variant="link"
                              colorScheme="orange"
                              onClick={() => setShowValidationPreview(!showValidationPreview)}
                              ml={2}
                            >
                              {showValidationPreview ? 'Hide' : 'Show'} Details
                            </Button>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {showValidationPreview && (
                      <Box maxH="200px" overflowY="auto" p={3} bg="gray.50" borderRadius="md">
                        {validationResult.errors.map((error, index) => (
                          <Text key={`error-${index}`} fontSize="sm" color="red.600" mb={1}>
                            ❌ {error}
                          </Text>
                        ))}
                        {validationResult.warnings.map((warning, index) => (
                          <Text key={`warning-${index}`} fontSize="sm" color="orange.600" mb={1}>
                            ⚠️ {warning}
                          </Text>
                        ))}
                      </Box>
                    )}

                    {/* Preview Table */}
                    {validationResult.preview && validationResult.preview.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Data Preview (First 5 rows):</Text>
                        <Box maxH="200px" overflowY="auto">
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                {Object.keys(validationResult.preview[0]).map((header) => (
                                  <Th key={header} fontSize="xs">{header}</Th>
                                ))}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {validationResult.preview.map((row, index) => (
                                <Tr key={index}>
                                  {Object.values(row).map((value: any, cellIndex) => (
                                    <Td key={cellIndex} fontSize="xs">
                                      <Code fontSize="xs">{String(value || '').substring(0, 20)}</Code>
                                    </Td>
                                  ))}
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              <Divider />

              {/* Import Options */}
              <Box>
                <Text fontWeight="semibold" mb={3}>Step 5: Import Options</Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Skip duplicates (by email)</Text>
                    <Button
                      size="sm"
                      variant={importOptions.skipDuplicates ? "solid" : "outline"}
                      colorScheme={importOptions.skipDuplicates ? "green" : "gray"}
                      onClick={() => setImportOptions(prev => ({ ...prev, skipDuplicates: !prev.skipDuplicates }))}
                    >
                      {importOptions.skipDuplicates ? "Yes" : "No"}
                    </Button>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Update existing buyers</Text>
                    <Button
                      size="sm"
                      variant={importOptions.updateExisting ? "solid" : "outline"}
                      colorScheme={importOptions.updateExisting ? "blue" : "gray"}
                      onClick={() => setImportOptions(prev => ({ ...prev, updateExisting: !prev.updateExisting }))}
                    >
                      {importOptions.updateExisting ? "Yes" : "No"}
                    </Button>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Set as active by default</Text>
                    <Button
                      size="sm"
                      variant={importOptions.defaultStatus ? "solid" : "outline"}
                      colorScheme={importOptions.defaultStatus ? "green" : "gray"}
                      onClick={() => setImportOptions(prev => ({ ...prev, defaultStatus: !prev.defaultStatus }))}
                    >
                      {importOptions.defaultStatus ? "Yes" : "No"}
                    </Button>
                  </HStack>
                </VStack>
              </Box>

              {/* Import Progress */}
              {isImporting && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Importing...</Text>
                  <Progress size="sm" isIndeterminate colorScheme="blue" />
                </Box>
              )}

              {/* Import Results */}
              {importResult && (
                <Box>
                  <Text fontWeight="semibold" mb={3}>Import Results</Text>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Imported:</Text>
                      <Badge colorScheme="green">{importResult.importedCount}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Updated:</Text>
                      <Badge colorScheme="blue">{importResult.updatedCount}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">Skipped:</Text>
                      <Badge colorScheme="gray">{importResult.skippedCount}</Badge>
                    </HStack>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <Alert status="warning">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Import completed with errors</AlertTitle>
                          <AlertDescription>
                            {importResult.errors.length} rows had errors. 
                            <Button
                              size="sm"
                              variant="link"
                              colorScheme="blue"
                              onClick={() => setShowErrorReport(!showErrorReport)}
                              ml={2}
                            >
                              {showErrorReport ? 'Hide' : 'Show'} Details
                            </Button>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                    {showErrorReport && importResult.errors && (
                      <Box maxH="200px" overflowY="auto" p={3} bg="gray.50" borderRadius="md">
                        {importResult.errors.map((error, index) => (
                          <Text key={index} fontSize="sm" color="red.600" mb={1}>
                            {error}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Field Mapping Info */}
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Field Mapping</AlertTitle>
                  <AlertDescription>
                    The system automatically maps PDR CSV fields to buyer properties. 
                    Key mappings: <strong>bname</strong> → Company Name, <strong>bemail</strong> → Email, 
                    <strong>bphone1</strong> → Phone, <strong>btype</strong> → Buyer Type.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Close
              </Button>
              {selectedFile && !isImporting && (
                <Button
                  colorScheme="blue"
                  onClick={startImport}
                  leftIcon={<FaUpload />}
                  isDisabled={validationResult && !validationResult.isValid}
                >
                  Start Import
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
