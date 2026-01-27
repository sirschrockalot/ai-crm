import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { FiUpload, FiFile } from 'react-icons/fi';
import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FieldMapping {
  [csvColumn: string]: string;
}

const LEAD_FIELDS = [
  { value: '', label: 'Skip Column' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'status', label: 'Status' },
  { value: 'source', label: 'Source' },
  { value: 'priority', label: 'Priority' },
  { value: 'notes', label: 'Notes' },
  { value: 'address.street', label: 'Address - Street' },
  { value: 'address.city', label: 'Address - City' },
  { value: 'address.state', label: 'Address - State' },
  { value: 'address.zipCode', label: 'Address - Zip Code' },
  { value: 'address.country', label: 'Address - Country' },
  { value: 'tags', label: 'Tags (comma-separated)' },
  { value: 'score', label: 'Score' },
  { value: 'estimatedValue', label: 'Estimated Value' },
];

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [defaultSource, setDefaultSource] = useState<string>('other');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file',
        description: 'Please select a CSV file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>) => {
        if (results.errors.length > 0) {
          toast({
            title: 'CSV Parse Error',
            description: results.errors[0].message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        const headers = Object.keys(results.data[0] || {});
        const rows = results.data.slice(0, 10); // Show first 10 rows as preview

        setCsvHeaders(headers);
        setCsvRows(rows as any[]);
        setImportResult(null);

        // Auto-map common field names
        const autoMapping: FieldMapping = {};
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase().trim();
          const field = LEAD_FIELDS.find((f) => {
            if (!f.value) return false;
            const fieldName = f.label.toLowerCase();
            return lowerHeader.includes(fieldName.split(' ')[0]) || 
                   fieldName.includes(lowerHeader.split(' ')[0]);
          });
          if (field && field.value) {
            autoMapping[header] = field.value;
          }
        });
        setFieldMapping(autoMapping);
      },
      error: (error) => {
        toast({
          title: 'File Read Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  const handleImport = async () => {
    if (csvHeaders.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate required fields are mapped
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const mappedFields = Object.values(fieldMapping);
    const missingFields = requiredFields.filter((f) => !mappedFields.includes(f));

    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please map: ${missingFields.join(', ')}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Re-parse the full file
      const file = fileInputRef.current?.files?.[0];
      if (!file) throw new Error('File not found');

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: ParseResult<any>) => {
          // Map CSV rows to lead data
          const mappedRows = results.data.map((row: any, index: number) => {
            const mappedData: any = {};
            
            Object.entries(fieldMapping).forEach(([csvCol, leadField]) => {
              if (!leadField || !csvCol) return;
              
              const value = row[csvCol];
              if (value === undefined || value === null || value === '') return;

              // Handle nested fields (e.g., address.street)
              if (leadField.includes('.')) {
                const [parent, child] = leadField.split('.');
                if (!mappedData[parent]) mappedData[parent] = {};
                mappedData[parent][child] = value;
              } else if (leadField === 'tags') {
                // Handle comma-separated tags
                mappedData[leadField] = String(value).split(',').map((t: string) => t.trim()).filter(Boolean);
              } else if (leadField === 'score' || leadField === 'estimatedValue') {
                mappedData[leadField] = parseFloat(value) || 0;
              } else {
                mappedData[leadField] = value;
              }
            });

            return {
              rowNumber: String(index + 2), // +2 because CSV is 1-indexed and has header
              data: mappedData,
            };
          });

          // Check row limit
          if (mappedRows.length > 2000) {
            throw new Error('CSV file exceeds 2,000 row limit. Please split your file.');
          }

          // Call import API
          const token = localStorage.getItem('auth_token');
          const response = await fetch('/api/leads/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              rows: mappedRows,
              defaultSource: defaultSource || 'other',
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Import failed');
          }

          const result = await response.json();
          setImportResult(result);

          toast({
            title: 'Import completed',
            description: `Created: ${result.createdCount}, Duplicates: ${result.duplicateCount}, Errors: ${result.errors.length}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setCsvHeaders([]);
    setCsvRows([]);
    setFieldMapping({});
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import Leads from CSV</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {!importResult && (
              <>
                <FormControl>
                  <FormLabel>Select CSV File</FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    leftIcon={<FiUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    w="full"
                  >
                    Choose CSV File
                  </Button>
                </FormControl>

                {csvHeaders.length > 0 && (
                  <>
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        Found {csvHeaders.length} columns. Map each CSV column to a Lead field below.
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>Default Source (if not in CSV)</FormLabel>
                      <Select
                        value={defaultSource}
                        onChange={(e) => setDefaultSource(e.target.value)}
                      >
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="social_media">Social Media</option>
                        <option value="advertising">Advertising</option>
                        <option value="cold_call">Cold Call</option>
                        <option value="email_campaign">Email Campaign</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>

                    <Box overflowX="auto">
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>CSV Column</Th>
                            <Th>Map to Lead Field</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {csvHeaders.map((header) => (
                            <Tr key={header}>
                              <Td>
                                <Text fontSize="sm" fontWeight="medium">
                                  {header}
                                </Text>
                                {csvRows[0] && (
                                  <Text fontSize="xs" color="gray.500">
                                    Sample: {String(csvRows[0][header] || '').substring(0, 30)}
                                  </Text>
                                )}
                              </Td>
                              <Td>
                                <Select
                                  value={fieldMapping[header] || ''}
                                  onChange={(e) =>
                                    setFieldMapping({
                                      ...fieldMapping,
                                      [header]: e.target.value,
                                    })
                                  }
                                  size="sm"
                                >
                                  {LEAD_FIELDS.map((field) => (
                                    <option key={field.value} value={field.value}>
                                      {field.label}
                                    </option>
                                  ))}
                                </Select>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                )}
              </>
            )}

            {importResult && (
              <>
                <Alert status="success">
                  <AlertIcon />
                  <AlertDescription>Import completed successfully!</AlertDescription>
                </Alert>

                <SimpleGrid columns={3} spacing={4}>
                  <Stat>
                    <StatLabel>Created</StatLabel>
                    <StatNumber>{importResult.createdCount}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Duplicates</StatLabel>
                    <StatNumber>{importResult.duplicateCount}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Errors</StatLabel>
                    <StatNumber>{importResult.errors.length}</StatNumber>
                  </Stat>
                </SimpleGrid>

                {importResult.errors.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Errors:</Text>
                    <VStack align="stretch" spacing={1} maxH="200px" overflowY="auto">
                      {importResult.errors.map((error: any, idx: number) => (
                        <Text key={idx} fontSize="sm" color="red.500">
                          Row {error.rowNumber}: {error.message}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {importResult.duplicates.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Duplicates Found:</Text>
                    <VStack align="stretch" spacing={1} maxH="200px" overflowY="auto">
                      {importResult.duplicates.map((dup: any, idx: number) => (
                        <HStack key={idx} justify="space-between">
                          <Text fontSize="sm">Row {dup.rowNumber}</Text>
                          <Badge colorScheme="orange">Duplicate of {dup.duplicateOf}</Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            {importResult ? (
              <>
                <Button onClick={handleReset} variant="outline">
                  Import Another
                </Button>
                <Button onClick={onClose} colorScheme="blue">
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onClose} variant="ghost">
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  colorScheme="blue"
                  isLoading={isImporting}
                  isDisabled={csvHeaders.length === 0}
                >
                  Import Leads
                </Button>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
