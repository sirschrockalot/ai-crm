import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Checkbox,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

interface TimeTrackingExportProps {
  onExportComplete?: () => void;
}

interface ExportRequest {
  format: 'csv' | 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
  projectIds?: string[];
  userIds?: string[];
  billableOnly?: boolean;
  includeStatus?: boolean;
}

export const TimeTrackingExport: React.FC<TimeTrackingExportProps> = ({ onExportComplete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { execute } = useApi();
  const toast = useToast();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    format: 'csv',
    billableOnly: false,
    includeStatus: false,
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field: keyof ExportRequest, value: any) => {
    setExportRequest(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await execute({
        method: 'POST',
        url: '/api/time-tracking/export',
        data: exportRequest,
      });

      if (response.data) {
        // Handle different export formats
        if (response.data.format === 'csv') {
          // Download CSV
          const csvContent = response.data.data.map((row: any[]) => row.join(',')).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.data.filename;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          // For PDF/Excel, show message about library integration
          toast({
            title: 'Export Ready',
            description: response.data.message || 'Export completed successfully',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }

        toast({
          title: 'Export Successful',
          description: `${response.data.format.toUpperCase()} export completed`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        onExportComplete?.();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export time tracking data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        leftIcon={<DownloadIcon />}
        colorScheme="blue"
        variant="outline"
        onClick={onOpen}
        size="sm"
      >
        Export Data
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Time Tracking Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Export Format */}
              <FormControl>
                <FormLabel>Export Format</FormLabel>
                <Select
                  value={exportRequest.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </Select>
              </FormControl>

              {/* Date Range */}
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={exportRequest.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    value={exportRequest.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </FormControl>
              </HStack>

              {/* Options */}
              <VStack spacing={3} align="stretch">
                <Checkbox
                  isChecked={exportRequest.billableOnly}
                  onChange={(e) => handleInputChange('billableOnly', e.target.checked)}
                >
                  Billable hours only
                </Checkbox>
                <Checkbox
                  isChecked={exportRequest.includeStatus}
                  onChange={(e) => handleInputChange('includeStatus', e.target.checked)}
                >
                  Include timesheet status
                </Checkbox>
              </VStack>

              {/* Info */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  {exportRequest.format === 'csv' 
                    ? 'CSV export will download immediately after processing.'
                    : `${exportRequest.format.toUpperCase()} export requires additional library integration.`
                  }
                </Text>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleExport}
                isLoading={isExporting}
                loadingText="Exporting..."
              >
                Export
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
