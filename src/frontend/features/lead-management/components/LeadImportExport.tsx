import React, { useState, useRef } from 'react';
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
} from '@chakra-ui/react';
import { FiUpload, FiDownload, FiFile, FiX, FiCheck } from 'react-icons/fi';

interface LeadImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{ imported: number; failed: number }>;
  onExport: () => Promise<void>;
}

export const LeadImportExport: React.FC<LeadImportExportProps> = ({
  isOpen,
  onClose,
  onImport,
  onExport,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onImport(importFile);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${result.imported} leads${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        status: result.failed > 0 ? 'warning' : 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset after a delay
      setTimeout(() => {
        setImportFile(null);
        setImportProgress(0);
        setImportResult(null);
      }, 3000);

    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      await onExport();
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
    } finally {
      setExporting(false);
    }
  };

  const clearFile = () => {
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create a CSV template
    const template = `firstName,lastName,email,phone,address,city,state,zipCode,propertyType,estimatedValue,notes
John,Doe,john.doe@example.com,555-0123,123 Main St,Anytown,CA,90210,single_family,500000,Interested in selling
Jane,Smith,jane.smith@example.com,555-0124,456 Oak Ave,Somewhere,NY,10001,multi_family,750000,Looking for quick sale`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
                      Supports CSV and Excel files (max 10MB)
                    </Text>
                  </Box>
                  
                  <Button
                    variant="link"
                    colorScheme="blue"
                    size="sm"
                    onClick={downloadTemplate}
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

                  {importing && (
                    <VStack spacing={2} w="full">
                      <Text fontSize="sm">Importing leads...</Text>
                      <Progress value={importProgress} w="full" colorScheme="blue" />
                      <Text fontSize="sm" color="gray.500">
                        {importProgress}% complete
                      </Text>
                    </VStack>
                  )}

                  {importResult && (
                    <Alert status={importResult.failed > 0 ? 'warning' : 'success'}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Import Complete</AlertTitle>
                        <AlertDescription>
                          Successfully imported {importResult.imported} leads
                          {importResult.failed > 0 && `, ${importResult.failed} failed`}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
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
                  Export all leads or filtered results to CSV format
                </Text>
                
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    onClick={handleExport}
                    isLoading={exporting}
                    loadingText="Exporting..."
                  >
                    Export All Leads
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    isLoading={exporting}
                    loadingText="Exporting..."
                  >
                    Export Filtered Results
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {importFile && !importing && (
              <Button
                colorScheme="blue"
                onClick={handleImport}
                isLoading={importing}
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
