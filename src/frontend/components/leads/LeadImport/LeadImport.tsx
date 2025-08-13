import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Link,
} from '@chakra-ui/react';
import { FiUpload, FiDownload, FiEye, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';

interface ImportTemplate {
  downloadUrl: string;
  filename: string;
  fields: ImportField[];
  sampleData: any[];
  instructions: string;
}

interface ImportField {
  field: string;
  required: boolean;
  description: string;
  example: string;
  validation: string[];
}

interface ImportProgress {
  importId: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors: ImportError[];
  warnings: string[];
  startedAt: Date;
  completedAt?: Date;
}

interface ImportError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
}

interface DetailedErrorReport {
  importId: string;
  timestamp: Date;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  successRate: number;
  errors: ImportError[];
  warnings: string[];
  recommendations: string[];
  downloadUrl?: string;
}

interface LeadImportProps {
  onImportComplete?: () => void;
  onClose?: () => void;
}

export const LeadImport: React.FC<LeadImportProps> = ({ onImportComplete, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [showErrorReport, setShowErrorReport] = useState(false);
  const [errorReport, setErrorReport] = useState<DetailedErrorReport | null>(null);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    skipDuplicates: true,
    validateOnly: false,
    notificationEmail: '',
  });
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    errors: ImportError[];
    warnings: string[];
    totalRows: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a CSV or Excel file',
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
      setValidationResults(null);
    }
  };

  const downloadTemplate = async () => {
    setIsLoadingTemplate(true);
    try {
      const response = await api.get('/leads/import-export/template');
      const template: ImportTemplate = response.data;

      // Trigger file download
      const link = document.createElement('a');
      link.href = template.downloadUrl;
      link.download = template.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Template Downloaded',
        description: 'Import template has been downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to download template:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download import template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('validateOnly', 'true');
      formData.append('options', JSON.stringify(importOptions));

      const response = await api.post('/leads/import-export/import/validate', formData);
      setValidationResults(response.data);

      if (response.data.isValid) {
        toast({
          title: 'Validation Successful',
          description: `File is valid with ${response.data.totalRows} rows`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Validation Failed',
          description: `${response.data.errors.length} errors found`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('options', JSON.stringify(importOptions));

      const response = await api.post('/leads/import-export/import', formData);
      const progress: ImportProgress = response.data;

      setImportProgress(progress);

      // Start polling for progress updates
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await api.get(`/leads/import-export/import/${progress.importId}/progress`);
          const updatedProgress = progressResponse.data;
          setImportProgress(updatedProgress);

          if (updatedProgress.status === 'completed' || updatedProgress.status === 'failed') {
            clearInterval(pollInterval);
            setIsImporting(false);

            if (updatedProgress.status === 'completed') {
              toast({
                title: 'Import Complete',
                description: `Successfully imported ${updatedProgress.successfulRows} leads`,
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
              onImportComplete?.();
            } else {
              toast({
                title: 'Import Failed',
                description: 'Import completed with errors. Check error report for details.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }
          }
        } catch (error) {
          console.error('Failed to get progress update:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to start import process',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setIsImporting(false);
    }
  };

  const getErrorReport = async () => {
    if (!importProgress) return;

    try {
      const response = await api.get(`/leads/import-export/import/${importProgress.importId}/error-report`);
      const report: DetailedErrorReport = response.data;
      setErrorReport(report);
      setShowErrorReport(true);
    } catch (error) {
      console.error('Failed to get error report:', error);
      toast({
        title: 'Error Report Failed',
        description: 'Failed to generate error report',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getDetailedErrorReport = async () => {
    if (!importProgress?.importId) return;
    
    try {
      const response = await api.execute({
        method: 'GET',
        url: `/leads/import-export/error-report/${importProgress.importId}`
      });
      
      if (response.success) {
        setErrorReport(response.data);
        setShowErrorReport(true);
      }
    } catch (error) {
      console.error('Failed to get detailed error report:', error);
      toast({
        title: 'Error',
        description: 'Failed to retrieve detailed error report',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const exportErrorReport = async () => {
    if (!errorReport) return;
    
    try {
      const response = await api.execute({
        method: 'GET',
        url: `/leads/import-export/import/${errorReport.importId}/error-report/export`,
        responseType: 'blob'
      });
      
      if (response.success) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `error-report-${errorReport.importId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Success',
          description: 'Error report exported successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to export error report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export error report',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getActionableErrorMessage = (error: ImportError): string => {
    const suggestions: Record<string, string> = {
      'required_field_missing': 'This field is required. Please provide a value.',
      'invalid_email': 'Please enter a valid email address (e.g., user@example.com).',
      'invalid_phone': 'Please enter a valid phone number (e.g., +1-555-123-4567).',
      'duplicate_email': 'This email already exists. Consider updating the existing lead instead.',
      'duplicate_phone': 'This phone number already exists. Consider updating the existing lead instead.',
      'invalid_status': 'Please select a valid status from: New, Contacted, Qualified, Interested, Negotiating, Closed Won, Closed Lost.',
      'invalid_priority': 'Please select a valid priority from: Low, Medium, High, Urgent.',
      'invalid_source': 'Please select a valid source from: Website, Referral, Cold Call, Social Media, Other.',
      'invalid_date': 'Please enter a valid date in YYYY-MM-DD format.',
      'invalid_number': 'Please enter a valid number.',
      'field_too_long': 'This field value is too long. Please shorten it.',
      'field_too_short': 'This field value is too short. Please provide more information.',
    };
    
    return suggestions[error.error] || 'Please check this field and try again.';
  };

  const getErrorCategory = (error: ImportError): string => {
    const categories: Record<string, string> = {
      'required_field_missing': 'Missing Required Field',
      'invalid_email': 'Invalid Email Format',
      'invalid_phone': 'Invalid Phone Format',
      'duplicate_email': 'Duplicate Email',
      'duplicate_phone': 'Duplicate Phone',
      'invalid_status': 'Invalid Status Value',
      'invalid_priority': 'Invalid Priority Value',
      'invalid_source': 'Invalid Source Value',
      'invalid_date': 'Invalid Date Format',
      'invalid_number': 'Invalid Number Format',
      'field_too_long': 'Field Too Long',
      'field_too_short': 'Field Too Short',
    };
    
    return categories[error.error] || 'Validation Error';
  };

  const clearFile = () => {
    setSelectedFile(null);
    setValidationResults(null);
    setImportProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'csv':
        return '📊';
      case 'xlsx':
      case 'xls':
        return '📈';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'error' ? 'red' : 'orange';
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Import Leads</Heading>
          <Button
            leftIcon={<FiDownload />}
            onClick={downloadTemplate}
            isLoading={isLoadingTemplate}
            variant="outline"
            size="sm"
          >
            Download Template
          </Button>
        </HStack>

        {/* File Selection */}
        <Box>
          <Heading size="sm" mb={3}>Select File to Import</Heading>
          <VStack spacing={4} align="stretch">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              size="lg"
              p={2}
            />
            
            {selectedFile && (
              <HStack justify="space-between" p={4} bg="gray.50" borderRadius="md">
                <HStack>
                  <Text fontSize="2xl">{getFileIcon(selectedFile.name)}</Text>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{selectedFile.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </VStack>
                </HStack>
                <IconButton
                  aria-label="Remove file"
                  icon={<FiX />}
                  onClick={clearFile}
                  size="sm"
                  variant="ghost"
                />
              </HStack>
            )}
          </VStack>
        </Box>

        <Divider />

        {/* Import Options */}
        <Box>
          <Heading size="sm" mb={3}>Import Options</Heading>
          <VStack spacing={4} align="stretch">
            <HStack spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm">Update Existing</FormLabel>
                <Checkbox
                  isChecked={importOptions.updateExisting}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    updateExisting: e.target.checked
                  }))}
                >
                  Update existing leads if found
                </Checkbox>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Skip Duplicates</FormLabel>
                <Checkbox
                  isChecked={importOptions.skipDuplicates}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    skipDuplicates: e.target.checked
                  }))}
                >
                  Skip duplicate records
                </Checkbox>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel fontSize="sm">Notification Email</FormLabel>
              <Input
                type="email"
                placeholder="email@example.com"
                value={importOptions.notificationEmail}
                onChange={(e) => setImportOptions(prev => ({
                  ...prev,
                  notificationEmail: e.target.value
                }))}
                size="sm"
              />
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <HStack spacing={3}>
          <Button
            leftIcon={<FiEye />}
            onClick={validateFile}
            isDisabled={!selectedFile}
            variant="outline"
            size="sm"
          >
            Validate
          </Button>
          
          <Button
            leftIcon={<FiUpload />}
            onClick={startImport}
            isDisabled={!selectedFile || isImporting}
            isLoading={isImporting}
            colorScheme="blue"
            size="sm"
          >
            Start Import
          </Button>
        </HStack>

        {/* Validation Results */}
        {validationResults && (
          <Box>
            <Heading size="sm" mb={3}>Validation Results</Heading>
            <VStack spacing={3} align="stretch">
              <HStack>
                <Badge
                  colorScheme={validationResults.isValid ? 'green' : 'red'}
                  size="lg"
                >
                  {validationResults.isValid ? 'Valid' : 'Invalid'}
                </Badge>
                <Text fontSize="sm">
                  {validationResults.totalRows} rows, {validationResults.errors.length} errors, {validationResults.warnings.length} warnings
                </Text>
              </HStack>

              {validationResults.errors.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Errors:</Text>
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {validationResults.errors.map((error, index) => (
                      <HStack key={index} p={2} bg="red.50" borderRadius="md">
                        <FiXCircle color="red" />
                        <Text fontSize="sm">
                          Row {error.row}, {error.field}: {error.error}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {validationResults.warnings.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Warnings:</Text>
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {validationResults.warnings.map((warning, index) => (
                      <HStack key={index} p={2} bg="orange.50" borderRadius="md">
                        <FiAlertTriangle color="orange" />
                        <Text fontSize="sm">{warning}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        {/* Import Progress */}
        {importProgress && (
          <Box>
            <Heading size="sm" mb={3}>Import Progress</Heading>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Badge colorScheme={getStatusColor(importProgress.status)} size="lg">
                  {importProgress.status.toUpperCase()}
                </Badge>
                <Text fontSize="sm">
                  {importProgress.processedRows} / {importProgress.totalRows} processed
                </Text>
              </HStack>

              <Progress
                value={(importProgress.processedRows / importProgress.totalRows) * 100}
                size="lg"
                colorScheme="blue"
              />

              <HStack justify="space-between" fontSize="sm">
                <Text>Successful: {importProgress.successfulRows}</Text>
                <Text>Failed: {importProgress.failedRows}</Text>
                <Text>Errors: {importProgress.errors.length}</Text>
              </HStack>

              {importProgress.status === 'completed' && importProgress.failedRows > 0 && (
                <Button
                  leftIcon={<FiAlertTriangle />}
                  onClick={getErrorReport}
                  variant="outline"
                  size="sm"
                >
                  View Error Report
                </Button>
              )}
            </VStack>
          </Box>
        )}

        {/* Error Report Modal */}
        <Modal isOpen={showErrorReport} onClose={() => setShowErrorReport(false)} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>Import Error Report</Text>
                <Text fontSize="sm" color="gray.500">
                  Import ID: {errorReport?.importId}
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {errorReport && (
                <VStack spacing={6} align="stretch">
                  {/* Summary */}
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium">Summary</Text>
                      <Badge
                        colorScheme={errorReport.successRate > 80 ? 'green' : errorReport.successRate > 50 ? 'orange' : 'red'}
                        size="lg"
                      >
                        {errorReport.successRate.toFixed(1)}% Success Rate
                      </Badge>
                    </HStack>
                    
                    <HStack spacing={6} fontSize="sm">
                      <Text>Total: {errorReport.totalRecords}</Text>
                      <Text color="green.600">Successful: {errorReport.successfulRecords}</Text>
                      <Text color="red.600">Failed: {errorReport.failedRecords}</Text>
                      <Text>Errors: {errorReport.errors.length}</Text>
                    </HStack>
                  </Box>

                  {/* Recommendations */}
                  {errorReport.recommendations.length > 0 && (
                    <Box>
                      <Heading size="sm" mb={3}>Recommendations</Heading>
                      <VStack spacing={2} align="stretch">
                        {errorReport.recommendations.map((rec, index) => (
                          <HStack key={index} p={2} bg="blue.50" borderRadius="md">
                            <FiInfo color="blue" />
                            <Text fontSize="sm">{rec}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Detailed Errors */}
                  {errorReport.errors.length > 0 && (
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <Heading size="sm">Detailed Errors</Heading>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={exportErrorReport}
                          leftIcon={<FiDownload />}
                        >
                          Export Errors
                        </Button>
                      </HStack>
                      
                      {/* Error Summary */}
                      <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                        <HStack spacing={4} fontSize="sm">
                          <Text>Total Errors: {errorReport.errors.length}</Text>
                          <Text>Critical: {errorReport.errors.filter(e => e.severity === 'error').length}</Text>
                          <Text>Warnings: {errorReport.errors.filter(e => e.severity === 'warning').length}</Text>
                        </HStack>
                      </Box>

                      <Box overflowX="auto">
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Row</Th>
                              <Th>Field</Th>
                              <Th>Value</Th>
                              <Th>Error</Th>
                              <Th>Action</Th>
                              <Th>Severity</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {errorReport.errors.map((error, index) => (
                              <Tr key={index}>
                                <Td>
                                  <Badge colorScheme="gray" size="sm">
                                    Row {error.row}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text fontWeight="medium">{error.field}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" maxW="200px" noOfLines={1}>
                                    {error.value}
                                  </Text>
                                </Td>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" maxW="300px" noOfLines={2}>
                                      {error.error}
                                    </Text>
                                    <Text fontSize="xs" color="blue.600" fontStyle="italic">
                                      {getActionableErrorMessage(error)}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td>
                                  <Badge colorScheme={getErrorCategory(error) === 'duplicate' ? 'orange' : 'blue'} size="sm">
                                    {getErrorCategory(error)}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={getSeverityColor(error.severity)} size="sm">
                                    {error.severity}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  )}

                  {/* Download Link */}
                  {errorReport.downloadUrl && (
                    <Box p={4} bg="green.50" borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontSize="sm">
                          Download detailed error report for further analysis
                        </Text>
                        <Link href={errorReport.downloadUrl} isExternal>
                          <Button size="sm" colorScheme="green">
                            Download Report
                          </Button>
                        </Link>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowErrorReport(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};
