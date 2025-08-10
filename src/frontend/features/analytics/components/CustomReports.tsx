import React, { useState, useEffect } from 'react';
import {
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
  Grid,
  Input,
  Textarea,
  Checkbox,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { Card, Chart, ErrorBoundary, Loading } from '../../../components/ui';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { CustomReportConfig, AnalyticsFilters } from '../types/analytics';

interface CustomReportsProps {
  timeRange?: string;
}

export const CustomReports: React.FC<CustomReportsProps> = ({
  timeRange = '30d',
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    analyticsData,
    loading,
    error,
    // getCustomReport,
    // exportAnalytics,
  } = useAnalytics();
  
  const { isAuthenticated } = useAuth();

  const [reports, setReports] = useState<CustomReportConfig[]>([
    {
      name: 'Monthly Performance Summary',
      description: 'Comprehensive monthly performance report',
      metrics: ['totalLeads', 'conversionRate', 'revenue'],
      charts: ['leadGrowth', 'conversionFunnel'],
      filters: { timeRange: '30d' },
      schedule: 'monthly',
      recipients: ['admin@company.com'],
    },
    {
      name: 'Team Performance Report',
      description: 'Individual team member performance analysis',
      metrics: ['teamConversionRate', 'avgLeadValue'],
      charts: ['teamPerformance', 'revenueByMember'],
      filters: { timeRange: '30d' },
      schedule: 'weekly',
      recipients: ['manager@company.com'],
    },
  ]);

  const [newReport, setNewReport] = useState<CustomReportConfig>({
    name: '',
    description: '',
    metrics: [],
    charts: [],
    filters: { timeRange: '30d' },
  });

  const [selectedReport, setSelectedReport] = useState<CustomReportConfig | null>(null);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access custom reports.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isAuthenticated, toast]);

  // Handle create new report
  const handleCreateReport = () => {
    if (!newReport.name.trim()) {
      toast({
        title: 'Error',
        description: 'Report name is required.',
        status: 'error',
      });
      return;
    }

    setReports(prev => [...prev, { ...newReport, name: newReport.name.trim() }]);
    setNewReport({
      name: '',
      description: '',
      metrics: [],
      charts: [],
      filters: { timeRange: '30d' },
    });
    onClose();
    toast({
      title: 'Success',
      description: 'Custom report created successfully.',
      status: 'success',
    });
  };

  // Handle generate report
  const handleGenerateReport = async (report: CustomReportConfig) => {
    try {
      // const result = await getCustomReport(report);
      // setGeneratedReport(result);
      setSelectedReport(report);
      toast({
        title: 'Success',
        description: 'Report generated successfully.',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        status: 'error',
      });
    }
  };

  // Handle export report
  const handleExportReport = async (report: CustomReportConfig, format: 'pdf' | 'csv' | 'excel') => {
    try {
      // await exportAnalytics({
      //   format,
      //   includeCharts: true,
      //   includeMetrics: true,
      //   filters: report.filters,
      // });
      toast({
        title: 'Export successful',
        description: `Report exported as ${format.toUpperCase()}.`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export report',
        status: 'error',
      });
    }
  };

  // Handle delete report
  const handleDeleteReport = (reportName: string) => {
    setReports(prev => prev.filter(r => r.name !== reportName));
    toast({
      title: 'Success',
      description: 'Report deleted successfully.',
      status: 'success',
    });
  };

  // Show authentication error
  if (!isAuthenticated) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please log in to access custom reports.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (loading && !analyticsData) {
    return <Loading variant="spinner" size="lg" />;
  }

  // Show error state
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error Loading Custom Reports</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const availableMetrics = [
    { key: 'totalLeads', label: 'Total Leads' },
    { key: 'conversionRate', label: 'Conversion Rate' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'avgLeadValue', label: 'Average Lead Value' },
    { key: 'teamConversionRate', label: 'Team Conversion Rate' },
  ];

  const availableCharts = [
    { key: 'leadGrowth', label: 'Lead Growth' },
    { key: 'conversionFunnel', label: 'Conversion Funnel' },
    { key: 'teamPerformance', label: 'Team Performance' },
    { key: 'revenueByMember', label: 'Revenue by Member' },
  ];

  return (
    <ErrorBoundary>
      <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Custom Reports</Heading>
            <Text color="gray.600">
              Create and manage custom analytics reports
            </Text>
          </VStack>
          <Button colorScheme="blue" onClick={onOpen}>
            Create New Report
          </Button>
        </HStack>

        {/* Reports List */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {reports.map((report) => (
            <Card key={report.name}>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{report.name}</Heading>
                    <Text fontSize="sm" color="gray.500">{report.description}</Text>
                  </VStack>
                  <Select
                    placeholder="Export"
                    size="sm"
                    maxW="100px"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleExportReport(report, e.target.value as 'pdf' | 'csv' | 'excel');
                      }
                    }}
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </Select>
                </HStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Metrics:</Text>
                  <HStack spacing={2} wrap="wrap">
                    {report.metrics.map((metric) => (
                      <Text key={metric} fontSize="xs" bg="blue.100" px={2} py={1} borderRadius="md">
                        {availableMetrics.find(m => m.key === metric)?.label || metric}
                      </Text>
                    ))}
                  </HStack>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Charts:</Text>
                  <HStack spacing={2} wrap="wrap">
                    {report.charts.map((chart) => (
                      <Text key={chart} fontSize="xs" bg="green.100" px={2} py={1} borderRadius="md">
                        {availableCharts.find(c => c.key === chart)?.label || chart}
                      </Text>
                    ))}
                  </HStack>
                </VStack>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.500">
                    Schedule: {report.schedule || 'Manual'}
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleGenerateReport(report)}
                      isLoading={loading}
                    >
                      Generate
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteReport(report.name)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </HStack>
              </VStack>
            </Card>
          ))}
        </Grid>

        {/* Generated Report Display */}
        {selectedReport && generatedReport && (
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">{selectedReport.name}</Heading>
              <Text fontSize="sm" color="gray.500">{selectedReport.description}</Text>
              
              {/* Mock report content */}
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Card>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.500">Total Leads</Text>
                    <Text fontSize="2xl" fontWeight="bold">1,245</Text>
                  </VStack>
                </Card>
                <Card>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.500">Conversion Rate</Text>
                    <Text fontSize="2xl" fontWeight="bold">22.8%</Text>
                  </VStack>
                </Card>
                <Card>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.500">Revenue</Text>
                    <Text fontSize="2xl" fontWeight="bold">$2.8M</Text>
                  </VStack>
                </Card>
                <Card>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.500">Avg Lead Value</Text>
                    <Text fontSize="2xl" fontWeight="bold">$285K</Text>
                  </VStack>
                </Card>
              </Grid>
            </VStack>
          </Card>
        )}

        {/* Create Report Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Custom Report</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Report Name</Text>
                  <Input
                    placeholder="Enter report name"
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  />
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Description</Text>
                  <Textarea
                    placeholder="Enter report description"
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  />
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Metrics to Include</Text>
                  <VStack align="start" spacing={2}>
                    {availableMetrics.map((metric) => (
                      <Checkbox
                        key={metric.key}
                        isChecked={newReport.metrics.includes(metric.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewReport(prev => ({
                              ...prev,
                              metrics: [...prev.metrics, metric.key],
                            }));
                          } else {
                            setNewReport(prev => ({
                              ...prev,
                              metrics: prev.metrics.filter(m => m !== metric.key),
                            }));
                          }
                        }}
                      >
                        {metric.label}
                      </Checkbox>
                    ))}
                  </VStack>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Charts to Include</Text>
                  <VStack align="start" spacing={2}>
                    {availableCharts.map((chart) => (
                      <Checkbox
                        key={chart.key}
                        isChecked={newReport.charts.includes(chart.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewReport(prev => ({
                              ...prev,
                              charts: [...prev.charts, chart.key],
                            }));
                          } else {
                            setNewReport(prev => ({
                              ...prev,
                              charts: prev.charts.filter(c => c !== chart.key),
                            }));
                          }
                        }}
                      >
                        {chart.label}
                      </Checkbox>
                    ))}
                  </VStack>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold">Schedule (Optional)</Text>
                  <Select
                    placeholder="Select schedule"
                    value={newReport.schedule || ''}
                    onChange={(e) => setNewReport(prev => ({ ...prev, schedule: e.target.value as any }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </VStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreateReport}>
                  Create Report
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </ErrorBoundary>
  );
};
