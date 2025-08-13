import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Tooltip,
  Progress,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  Textarea,
  Divider,
  Flex,
  Spacer,
  CloseButton,
  Tag,
  TagLabel,
  TagCloseButton,
  useClipboard,
  Icon,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiDownload, 
  FiFilter, 
  FiUpload, 
  FiRefreshCw, 
  FiFile, 
  FiCheck, 
  FiX, 
  FiAlertTriangle, 
  FiInfo,
  FiSettings,
  FiClock,
  FiEye,
  FiTrash2,
  FiCopy,
  FiSave
} from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import LeadForm from '../../components/forms/LeadForm/LeadForm';
import { Lead } from '../../features/lead-management/types/lead';
import { useLeads } from '../../hooks/services/useLeads';

// Constants for localStorage keys
const STORAGE_KEYS = {
  IMPORT_OPTIONS: 'lead_import_options',
  FIELD_MAPPING: 'lead_import_field_mapping',
  RECENT_FILES: 'lead_import_recent_files',
  IMPORT_HISTORY: 'lead_import_history',
} as const;

// Enhanced import options interface
interface ImportOptions {
  updateExisting: boolean;
  skipDuplicates: boolean;
  validateOnly: boolean;
  notificationEmail: string;
  fieldMapping: Record<string, string>;
  autoMapFields: boolean;
  createMissingFields: boolean;
  defaultStatus: string;
  defaultSource: string;
  batchSize: number;
  retryFailed: boolean;
  maxRetries: number;
}

// Enhanced import progress interface
interface ImportProgress {
  status: 'idle' | 'uploading' | 'processing' | 'validating' | 'mapping' | 'importing' | 'completed' | 'failed';
  percentage: number;
  message: string;
  currentStep: string;
  totalSteps: number;
  currentStepNumber: number;
  estimatedTimeRemaining?: number;
  startTime?: number;
}

// Enhanced validation results interface
interface ValidationResults {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: string[];
  totalRows: number;
  validRows: number;
  fieldMapping: Record<string, string>;
  sampleData: Array<Record<string, any>>;
  requiredFields: string[];
  optionalFields: string[];
}

// Enhanced import history interface
interface ImportHistory {
  id: string;
  fileName: string;
  timestamp: Date;
  status: 'completed' | 'failed' | 'in-progress' | 'cancelled';
  imported: number;
  failed: number;
  total: number;
  errors: string[];
  duration: number;
  fileSize: number;
  user: string;
  options: Partial<ImportOptions>;
}

// Enhanced file info interface
interface FileInfo {
  file: File;
  preview: string;
  size: string;
  lastModified: Date;
  estimatedRows: number;
}

const ImportLeadsPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Enhanced state management with localStorage persistence
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: 'idle',
    percentage: 0,
    message: 'Ready to import',
    currentStep: 'Ready',
    totalSteps: 1,
    currentStepNumber: 0,
  });
  
  const [importOptions, setImportOptions] = useState<ImportOptions>(() => {
    // Load from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.IMPORT_OPTIONS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved import options:', error);
        }
      }
    }
    
    // Default options
    return {
      updateExisting: false,
      skipDuplicates: true,
      validateOnly: false,
      notificationEmail: '',
      fieldMapping: {},
      autoMapFields: true,
      createMissingFields: false,
      defaultStatus: 'New',
      defaultSource: 'Import',
      batchSize: 100,
      retryFailed: true,
      maxRetries: 3,
    };
  });
  
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  
  const [importHistory, setImportHistory] = useState<ImportHistory[]>(() => {
    // Load from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.IMPORT_HISTORY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert timestamp strings back to Date objects
          return parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
        } catch (error) {
          console.warn('Failed to parse saved import history:', error);
        }
      }
    }
    
    // Default history
    return [
      {
        id: '1',
        fileName: 'leads_2024_01.csv',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        status: 'completed',
        imported: 150,
        failed: 5,
        total: 155,
        errors: ['Row 23: Invalid email format', 'Row 67: Missing required field'],
        duration: 45,
        fileSize: 1024000,
        user: 'admin@example.com',
        options: { updateExisting: false, skipDuplicates: true },
      },
      {
        id: '2',
        fileName: 'new_leads.xlsx',
        timestamp: new Date('2024-01-14T14:20:00Z'),
        status: 'completed',
        imported: 89,
        failed: 2,
        total: 91,
        errors: ['Row 12: Duplicate phone number'],
        duration: 23,
        fileSize: 512000,
        user: 'admin@example.com',
        options: { updateExisting: false, skipDuplicates: true },
      },
    ];
  });
  
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showFieldMappingModal, setShowFieldMappingModal] = useState(false);
  
  const {
    isAuthenticated,
    user,
    importLeads,
    exportLeads,
  } = useLeads();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Route guard - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Save import options to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IMPORT_OPTIONS, JSON.stringify(importOptions));
    }
  }, [importOptions]);

  // Save import history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IMPORT_HISTORY, JSON.stringify(importHistory));
    }
  }, [importHistory]);

  // Enhanced file selection with better validation and preview
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Create file info
      const fileInfo: FileInfo = {
        file,
        preview: file.name,
        size: formatFileSize(file.size),
        lastModified: new Date(file.lastModified),
        estimatedRows: estimateRowCount(file),
      };
      
      setFileInfo(fileInfo);
      
      // Reset progress
      setImportProgress({
        status: 'idle',
        percentage: 0,
        message: 'File selected, ready to validate',
        currentStep: 'File Selected',
        totalSteps: 4,
        currentStepNumber: 0,
      });
      
      // Auto-validate if enabled
      if (importOptions.autoMapFields) {
        setTimeout(() => validateFile(file), 500);
      }
      
      toast({
        title: 'File Selected',
        description: `${file.name} (${formatFileSize(file.size)})`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [importOptions.autoMapFields, toast]);

  // Enhanced file drop handling
  const handleFileDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simulate file input change
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Enhanced file clearing
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setFileInfo(null);
    setValidationResults(null);
    setImportProgress({
      status: 'idle',
      percentage: 0,
      message: 'Ready to import',
      currentStep: 'Ready',
      totalSteps: 1,
      currentStepNumber: 0,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Enhanced template download
  const downloadTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/leads/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_import_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Template Downloaded',
          description: 'CSV template downloaded successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download template',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Enhanced file validation with progress tracking
  const validateFile = useCallback(async (file?: File) => {
    const targetFile = file || selectedFile;
    if (!targetFile) return;

    setImportProgress({
      status: 'validating',
      percentage: 0,
      message: 'Validating file structure and content...',
      currentStep: 'Validating',
      totalSteps: 4,
      currentStepNumber: 1,
      startTime: Date.now(),
    });

    try {
      // Simulate validation progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(prev => ({
          ...prev,
          percentage: i,
          message: `Validating... ${i}%`,
        }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Mock validation results
      const mockResults: ValidationResults = {
        isValid: true,
        errors: [
          { row: 23, field: 'email', message: 'Invalid email format', severity: 'error' },
          { row: 67, field: 'phone', message: 'Missing required field', severity: 'error' },
        ],
        warnings: [
          'Some phone numbers may be in different formats',
          'Consider standardizing address formats',
        ],
        totalRows: 155,
        validRows: 153,
        fieldMapping: {
          'First Name': 'firstName',
          'Last Name': 'lastName',
          'Email': 'email',
          'Phone': 'phone',
          'Address': 'address',
        },
        sampleData: [
          { 'First Name': 'John', 'Last Name': 'Doe', 'Email': 'john@example.com' },
          { 'First Name': 'Jane', 'Last Name': 'Smith', 'Email': 'jane@example.com' },
        ],
        requiredFields: ['firstName', 'lastName', 'email'],
        optionalFields: ['phone', 'address', 'company'],
      };

      setValidationResults(mockResults);
      
      // Update field mapping if auto-mapping is enabled
      if (importOptions.autoMapFields) {
        setImportOptions(prev => ({
          ...prev,
          fieldMapping: mockResults.fieldMapping,
        }));
      }

      setImportProgress({
        status: 'idle',
        percentage: 100,
        message: 'Validation completed',
        currentStep: 'Validation Complete',
        totalSteps: 4,
        currentStepNumber: 1,
      });

      toast({
        title: 'Validation Complete',
        description: `${mockResults.validRows} valid rows found, ${mockResults.errors.length} errors detected`,
        status: mockResults.isValid ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      setImportProgress({
        status: 'failed',
        percentage: 0,
        message: 'Validation failed',
        currentStep: 'Validation Failed',
        totalSteps: 4,
        currentStepNumber: 1,
      });

      toast({
        title: 'Validation Failed',
        description: 'Failed to validate file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedFile, importOptions.autoMapFields, toast]);

  // Enhanced import process with detailed progress tracking
  const startImport = useCallback(async () => {
    if (!selectedFile || !validationResults?.isValid) {
      toast({
        title: 'Cannot Start Import',
        description: 'Please select a file and validate it first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const startTime = Date.now();
    
    setImportProgress({
      status: 'processing',
      percentage: 0,
      message: 'Starting import process...',
      currentStep: 'Processing',
      totalSteps: 4,
      currentStepNumber: 2,
      startTime,
    });

    try {
      // Simulate import progress
      const steps = [
        { name: 'Uploading file', percentage: 25 },
        { name: 'Processing data', percentage: 50 },
        { name: 'Validating records', percentage: 75 },
        { name: 'Importing to database', percentage: 100 },
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setImportProgress(prev => ({
          ...prev,
          currentStep: step.name,
          currentStepNumber: i + 2,
          percentage: step.percentage,
          message: step.name,
        }));
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mock successful import
      const importedCount = validationResults.validRows;
      const failedCount = validationResults.errors.length;
      
      const newHistoryItem: ImportHistory = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        timestamp: new Date(),
        status: 'completed',
        imported: importedCount,
        failed: failedCount,
        total: validationResults.totalRows,
        errors: validationResults.errors.map(e => `Row ${e.row}: ${e.message}`),
        duration: Math.round((Date.now() - startTime) / 1000),
        fileSize: selectedFile.size,
        user: user?.email || 'unknown',
        options: importOptions,
      };

      setImportHistory(prev => [newHistoryItem, ...prev]);
      
      setImportProgress({
        status: 'completed',
        percentage: 100,
        message: `Import completed successfully! ${importedCount} leads imported`,
        currentStep: 'Import Complete',
        totalSteps: 4,
        currentStepNumber: 4,
      });

      toast({
        title: 'Import Successful',
        description: `${importedCount} leads imported successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear file after successful import
      setTimeout(() => {
        clearFile();
      }, 2000);

    } catch (error) {
      setImportProgress({
        status: 'failed',
        percentage: 0,
        message: 'Import failed',
        currentStep: 'Import Failed',
        totalSteps: 4,
        currentStepNumber: 2,
      });

      toast({
        title: 'Import Failed',
        description: 'Failed to import leads',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [selectedFile, validationResults, importOptions, user, toast, clearFile]);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimateRowCount = (file: File): number => {
    // Rough estimation based on file size
    const bytesPerRow = 200; // Average bytes per row
    return Math.round(file.size / bytesPerRow);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    switch (extension) {
      case '.csv':
        return '📄';
      case '.xlsx':
      case '.xls':
        return '📊';
      default:
        return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'in-progress':
        return 'blue';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheck />;
      case 'failed':
        return <FiX />;
      case 'in-progress':
        return <FiRefreshCw />;
      case 'cancelled':
        return <FiX />;
      default:
        return <FiInfo />;
    }
  };

  // Enhanced options management
  const updateImportOptions = useCallback((updates: Partial<ImportOptions>) => {
    setImportOptions(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Enhanced field mapping management
  const updateFieldMapping = useCallback((field: string, mappedField: string) => {
    setImportOptions(prev => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [field]: mappedField,
      },
    }));
  }, []);

  // Reset options to defaults
  const resetOptions = useCallback(() => {
    const defaultOptions: ImportOptions = {
      updateExisting: false,
      skipDuplicates: true,
      validateOnly: false,
      notificationEmail: '',
      fieldMapping: {},
      autoMapFields: true,
      createMissingFields: false,
      defaultStatus: 'New',
      defaultSource: 'Import',
      batchSize: 100,
      retryFailed: true,
      maxRetries: 3,
    };
    
    setImportOptions(defaultOptions);
    
    toast({
      title: 'Options Reset',
      description: 'Import options have been reset to defaults',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Save current options as default
  const saveAsDefault = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IMPORT_OPTIONS, JSON.stringify(importOptions));
      
      toast({
        title: 'Options Saved',
        description: 'Current options have been saved as default',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [importOptions, toast]);

  // Enhanced history management
  const clearHistory = useCallback(() => {
    setImportHistory([]);
    
    toast({
      title: 'History Cleared',
      description: 'Import history has been cleared',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const retryImport = useCallback((historyItem: ImportHistory) => {
    // Implementation for retrying failed imports
    toast({
      title: 'Retry Import',
      description: 'Retry functionality coming soon',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Enhanced navigation
  const goToLeads = useCallback(() => {
    router.push('/leads');
  }, [router]);

  const goToPipeline = useCallback(() => {
    router.push('/leads/pipeline');
  }, [router]);

  const goToAnalytics = useCallback(() => {
    router.push('/leads/analytics');
  }, [router]);

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <Box display={{ base: 'block', md: 'flex' }}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Please log in to access lead import features.
                </AlertDescription>
              </Alert>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <Box display={{ base: 'block', md: 'flex' }}>
        <Sidebar />
        <Box flex={1}>
          <Navigation />
          <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
            {/* Breadcrumb Navigation */}
            <Breadcrumb fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/leads">Leads</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Import Leads</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Page Header */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                  Import Leads
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Upload and import leads from CSV or Excel files
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                                  <Button
                    leftIcon={<FiClock />}
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistoryModal(true)}
                  >
                    Import History
                  </Button>
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="blue"
                  size="sm"
                  onClick={downloadTemplate}
                >
                  Download Template
                </Button>
              </HStack>
            </HStack>

            {/* Main Content */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* File Upload Section */}
              <Card bg={cardBg} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Upload File</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Select a CSV or Excel file to import leads
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* File Upload Area */}
                    <Box
                      border="2px dashed"
                      borderColor={selectedFile ? 'green.400' : 'gray.300'}
                      borderRadius="lg"
                      p={8}
                      textAlign="center"
                      cursor="pointer"
                      bg={selectedFile ? 'green.50' : 'gray.50'}
                      _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                    >
                      {selectedFile ? (
                        <VStack spacing={3}>
                          <Text fontSize="4xl">{getFileIcon(selectedFile.name)}</Text>
                          <VStack spacing={1}>
                            <Text fontWeight="medium">{selectedFile.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </VStack>
                          <Button
                            leftIcon={<FiX />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile();
                            }}
                          >
                            Remove File
                          </Button>
                        </VStack>
                      ) : (
                        <VStack spacing={3}>
                          <FiUpload size={48} color="#718096" />
                          <Text fontWeight="medium">
                            Click to select file or drag and drop
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Supports CSV and Excel files (max 10MB)
                          </Text>
                        </VStack>
                      )}
                    </Box>
                    
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      display="none"
                    />
                    
                    {/* Import Options */}
                    <Box>
                      <Heading size="sm" mb={3}>Import Options</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Update existing leads</Text>
                          <Checkbox
                            isChecked={importOptions.updateExisting}
                            onChange={(e) => updateImportOptions({ updateExisting: e.target.checked })}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Skip duplicates</Text>
                          <Checkbox
                            isChecked={importOptions.skipDuplicates}
                            onChange={(e) => updateImportOptions({ skipDuplicates: e.target.checked })}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Validate only (no import)</Text>
                          <Checkbox
                            isChecked={importOptions.validateOnly}
                            onChange={(e) => updateImportOptions({ validateOnly: e.target.checked })}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Auto-map fields</Text>
                          <Checkbox
                            isChecked={importOptions.autoMapFields}
                            onChange={(e) => updateImportOptions({ autoMapFields: e.target.checked })}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Create missing fields</Text>
                          <Checkbox
                            isChecked={importOptions.createMissingFields}
                            onChange={(e) => updateImportOptions({ createMissingFields: e.target.checked })}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Batch size</Text>
                          <Input
                            type="number"
                            value={importOptions.batchSize}
                            onChange={(e) => updateImportOptions({ batchSize: parseInt(e.target.value, 10) || 100 })}
                            min="1"
                            max="1000"
                            size="sm"
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Retry failed imports</Text>
                          <Checkbox
                            isChecked={importOptions.retryFailed}
                            onChange={(e) => updateImportOptions({ retryFailed: e.target.checked })}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Max retries</Text>
                          <Input
                            type="number"
                            value={importOptions.maxRetries}
                            onChange={(e) => updateImportOptions({ maxRetries: parseInt(e.target.value, 10) || 3 })}
                            min="0"
                            max="10"
                            size="sm"
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Notification email</Text>
                          <Input
                            type="email"
                            value={importOptions.notificationEmail}
                            onChange={(e) => updateImportOptions({ notificationEmail: e.target.value })}
                            placeholder="Enter email for notifications"
                            size="sm"
                          />
                        </HStack>
                      </VStack>
                    </Box>
                    
                    {/* Action Buttons */}
                    <HStack spacing={3}>
                      <Button
                        leftIcon={<FiEye />}
                        variant="outline"
                        onClick={() => validateFile()}
                        isDisabled={!selectedFile || importProgress.status === 'processing'}
                        flex={1}
                      >
                        Validate File
                      </Button>
                      <Button
                        leftIcon={<FiUpload />}
                        colorScheme="blue"
                        onClick={startImport}
                        isDisabled={!selectedFile || importProgress.status === 'processing'}
                        flex={1}
                      >
                        Start Import
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Progress and Status Section */}
              <VStack spacing={6} align="stretch">
                {/* Import Progress */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Import Progress</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {importProgress.message}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {importProgress.percentage}%
                          </Text>
                        </HStack>
                        <Progress
                          value={importProgress.percentage}
                          colorScheme={
                            importProgress.status === 'completed' ? 'green' :
                            importProgress.status === 'failed' ? 'red' :
                            importProgress.status === 'processing' ? 'blue' : 'gray'
                          }
                          size="lg"
                        />
                      </Box>
                      
                      {importProgress.status === 'processing' && (
                        <HStack justify="center">
                          <Spinner size="sm" />
                          <Text fontSize="sm" color="gray.600">
                            Processing...
                          </Text>
                        </HStack>
                      )}
                      
                      {importProgress.status === 'completed' && (
                        <Alert status="success">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Import Completed!</AlertTitle>
                            <AlertDescription>
                              Your leads have been imported successfully.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                      
                      {importProgress.status === 'failed' && (
                        <Alert status="error">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Import Failed</AlertTitle>
                            <AlertDescription>
                              There was an error during import. Please try again.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Recent Imports */}
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Recent Imports</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {importHistory.slice(0, 3).map((importItem) => (
                        <Box
                          key={importItem.id}
                          p={3}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          bg={bgColor}
                        >
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium" fontSize="sm">
                              {importItem.fileName}
                            </Text>
                            <Badge colorScheme={getStatusColor(importItem.status)} size="sm">
                              {importItem.status}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500" mb={2}>
                            {importItem.timestamp.toLocaleDateString()} at{' '}
                            {importItem.timestamp.toLocaleTimeString()}
                          </Text>
                          <HStack spacing={4} fontSize="xs">
                            <Text>Imported: {importItem.imported}</Text>
                            <Text>Failed: {importItem.failed}</Text>
                            <Text>Total: {importItem.total}</Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Box>
      </Box>

      {/* Validation Results Modal */}
      <Modal isOpen={showValidationModal} onClose={() => setShowValidationModal(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Validation Results</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {validationResults && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Validation Summary</Text>
                  <Badge colorScheme={validationResults.isValid ? 'green' : 'red'}>
                    {validationResults.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </HStack>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Total Rows</StatLabel>
                    <StatNumber>{validationResults.totalRows}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Valid Rows</StatLabel>
                    <StatNumber>{validationResults.validRows}</StatNumber>
                  </Stat>
                </SimpleGrid>
                
                {validationResults.errors.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Errors</Text>
                    <VStack spacing={2} align="stretch">
                      {validationResults.errors.map((error, index) => (
                        <Alert key={index} status="error" size="sm">
                          <AlertIcon />
                          <Box>
                            <Text fontSize="sm">
                              Row {error.row}: {error.message}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Field: {error.field}
                            </Text>
                          </Box>
                        </Alert>
                      ))}
                    </VStack>
                  </Box>
                )}
                
                {validationResults.warnings.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Warnings</Text>
                    <VStack spacing={2} align="stretch">
                      {validationResults.warnings.map((warning, index) => (
                        <Alert key={index} status="warning" size="sm">
                          <AlertIcon />
                          <Text fontSize="sm">{warning}</Text>
                        </Alert>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setShowValidationModal(false)}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                setShowValidationModal(false);
                startImport();
              }}
              isDisabled={!validationResults?.isValid}
            >
              Proceed with Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Import History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>File Name</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Imported</Th>
                    <Th>Failed</Th>
                    <Th>Total</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {importHistory.map((importItem) => (
                    <Tr key={importItem.id}>
                      <Td>
                        <HStack>
                          <Text>{getFileIcon(importItem.fileName)}</Text>
                          <Text>{importItem.fileName}</Text>
                        </HStack>
                      </Td>
                      <Td fontSize="sm">
                        {importItem.timestamp.toLocaleDateString()}
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(importItem.status)} size="sm">
                          {importItem.status}
                        </Badge>
                      </Td>
                      <Td>{importItem.imported}</Td>
                      <Td>{importItem.failed}</Td>
                      <Td>{importItem.total}</Td>
                      <Td>
                        <Button size="xs" variant="ghost" leftIcon={<FiEye />}>
                          View Details
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImportLeadsPage;
