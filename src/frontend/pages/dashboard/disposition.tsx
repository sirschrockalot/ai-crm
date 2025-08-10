import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Center,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Input,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FaCog, FaDownload, FaRedo, FaSave, FaEye, FaEyeSlash, FaFilter } from 'react-icons/fa';

// Import all disposition dashboard components
import {
  PriorityAlerts,
  DealPipeline,
  BuyerManagement,
  DispositionAnalytics,
  QuickActions,
  getDefaultDispositionActions,
} from '../../components/dashboard';

// Import types
import type {
  PriorityAlert,
  Deal,
  Buyer,
  Communication,
  DispositionMetrics,
  QuickAction,
} from '../../components/dashboard';

// Import hooks for real-time updates and dashboard management
import { useDashboard } from '../../hooks/useDashboard';
import { useAnalytics } from '../../hooks/useAnalytics';

// Dashboard personalization interface
interface DashboardPreferences {
  showPriorityAlerts: boolean;
  showDealPipeline: boolean;
  showBuyerManagement: boolean;
  showAnalytics: boolean;
  showQuickActions: boolean;
  layout: 'default' | 'compact' | 'detailed';
  refreshInterval: number;
  autoRefresh: boolean;
}

// Enhanced mock data for development
const mockPriorityAlerts: PriorityAlert[] = [
  {
    id: '1',
    title: 'Inspection Period Ending',
    count: 3,
    details: '3 deals have inspection periods ending within 24 hours',
    urgency: 'urgent',
    type: 'inspection',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Closing Deadlines',
    count: 2,
    details: '2 deals are closing within the next 3 days',
    urgency: 'warning',
    type: 'closing',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Follow-up Required',
    count: 5,
    details: '5 buyers require follow-up communication',
    urgency: 'info',
    type: 'followup',
  },
];

const mockDeals: Deal[] = [
  {
    id: '1',
    address: '123 Main St, Anytown, USA',
    status: 'new-contract',
    priority: 'high',
    buyer: 'John Smith',
    price: 250000,
    profit: 45000,
    inspectionEnds: new Date(Date.now() + 24 * 60 * 60 * 1000),
    closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(),
    assignedTo: 'Agent 1',
  },
  {
    id: '2',
    address: '456 Oak Ave, Somewhere, USA',
    status: 'active-disposition',
    priority: 'medium',
    buyer: 'Jane Doe',
    price: 320000,
    profit: 52000,
    inspectionEnds: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    closingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(),
    assignedTo: 'Agent 2',
  },
  {
    id: '3',
    address: '789 Pine Rd, Elsewhere, USA',
    status: 'closing',
    priority: 'high',
    buyer: 'Bob Johnson',
    price: 180000,
    profit: 28000,
    closingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(),
    assignedTo: 'Agent 1',
  },
  {
    id: '4',
    address: '321 Elm St, Nowhere, USA',
    status: 'assigned',
    priority: 'low',
    buyer: 'Alice Brown',
    price: 450000,
    profit: 75000,
    inspectionEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    closingDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(),
    assignedTo: 'Agent 3',
  },
];

const mockBuyers: Buyer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    status: 'active',
    priority: 'high',
    location: 'Anytown, USA',
    budget: { min: 200000, max: 300000 },
    preferredAreas: ['Anytown', 'Somewhere'],
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalDeals: 3,
    successfulDeals: 2,
    averageDealSize: 250000,
    tags: ['Cash Buyer', 'Quick Close'],
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '(555) 234-5678',
    status: 'qualified',
    priority: 'medium',
    location: 'Somewhere, USA',
    budget: { min: 300000, max: 500000 },
    preferredAreas: ['Somewhere', 'Elsewhere'],
    lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalDeals: 2,
    successfulDeals: 1,
    averageDealSize: 320000,
    tags: ['First Time', 'Financing'],
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@email.com',
    phone: '(555) 345-6789',
    status: 'active',
    priority: 'high',
    location: 'Elsewhere, USA',
    budget: { min: 150000, max: 250000 },
    preferredAreas: ['Elsewhere', 'Nowhere'],
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalDeals: 5,
    successfulDeals: 4,
    averageDealSize: 180000,
    tags: ['Investor', 'Cash Buyer'],
  },
];

const mockCommunications: Communication[] = [
  {
    id: '1',
    type: 'call',
    direction: 'outbound',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    summary: 'Called buyer to discuss inspection results',
    outcome: 'positive',
    nextAction: 'Schedule closing',
    nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'email',
    direction: 'inbound',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    summary: 'Buyer sent inspection report',
    outcome: 'neutral',
    nextAction: 'Review inspection report',
  },
  {
    id: '3',
    type: 'meeting',
    direction: 'outbound',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    summary: 'Property walkthrough with buyer',
    outcome: 'positive',
    nextAction: 'Prepare offer',
  },
];

const mockMetrics: DispositionMetrics = {
  totalDeals: 24,
  activeDeals: 18,
  closedDeals: 5,
  cancelledDeals: 1,
  totalValue: 5200000,
  averageDealSize: 216667,
  averageDaysToClose: 28.5,
  successRate: 83.3,
  profitMargin: 18.2,
  buyerSatisfaction: 92.5,
  monthlyTrends: [
    { month: 'Jan', deals: 3, value: 650000, profit: 120000 },
    { month: 'Feb', deals: 4, value: 850000, profit: 150000 },
    { month: 'Mar', deals: 5, value: 1100000, profit: 200000 },
    { month: 'Apr', deals: 6, value: 1300000, profit: 240000 },
    { month: 'May', deals: 4, value: 900000, profit: 160000 },
    { month: 'Jun', deals: 2, value: 400000, profit: 70000 },
  ],
  statusBreakdown: [
    { status: 'New Contract', count: 8, percentage: 33.3 },
    { status: 'Active Disposition', count: 6, percentage: 25.0 },
    { status: 'Assigned', count: 3, percentage: 12.5 },
    { status: 'Closing', count: 2, percentage: 8.3 },
    { status: 'Closed', count: 5, percentage: 20.8 },
  ],
  priorityBreakdown: [
    { priority: 'High', count: 10, percentage: 41.7 },
    { priority: 'Medium', count: 12, percentage: 50.0 },
    { priority: 'Low', count: 2, percentage: 8.3 },
  ],
  topPerformers: [
    { name: 'Agent 1', deals: 8, value: 1800000, successRate: 87.5 },
    { name: 'Agent 2', deals: 6, value: 1400000, successRate: 83.3 },
    { name: 'Agent 3', deals: 4, value: 900000, successRate: 75.0 },
  ],
};

const DispositionDashboard: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  // Dashboard state
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshCount, setRefreshCount] = useState(0);

  // Dashboard personalization
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    const saved = localStorage.getItem('disposition-dashboard-preferences');
    return saved ? JSON.parse(saved) : {
      showPriorityAlerts: true,
      showDealPipeline: true,
      showBuyerManagement: true,
      showAnalytics: true,
      showQuickActions: true,
      layout: 'default',
      refreshInterval: 30000, // 30 seconds
      autoRefresh: true,
    };
  });

  // Modal states
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();

  // Export options
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('excel');
  const [exportTimeRange, setExportTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Hooks for real-time updates and analytics
  const { refreshDashboard, getRealTimeStats } = useDashboard();
  const { exportAnalytics } = useAnalytics();

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('disposition-dashboard-preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!preferences.autoRefresh) return undefined;

    const interval = setInterval(() => {
      handleRefresh();
    }, preferences.refreshInterval);

    return () => clearInterval(interval);
  }, [preferences.autoRefresh, preferences.refreshInterval]);

  // Handle component interactions
  const handleAlertClick = useCallback((alert: PriorityAlert) => {
    toast({
      title: 'Alert Details',
      description: alert.details,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleDealClick = useCallback((deal: Deal) => {
    router.push(`/deals/${deal.id}`);
  }, [router]);

  const handleStatusChange = useCallback((dealId: string, status: Deal['status']) => {
    toast({
      title: 'Status Updated',
      description: `Deal status changed to ${status}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleAssignDeal = useCallback((dealId: string, userId: string) => {
    toast({
      title: 'Deal Assigned',
      description: 'Deal has been assigned successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleBuyerClick = useCallback((buyer: Buyer) => {
    router.push(`/buyers/${buyer.id}`);
  }, [router]);

  const handleAddBuyer = useCallback(() => {
    router.push('/buyers/new');
  }, [router]);

  const handleContactBuyer = useCallback((buyer: Buyer, method: 'call' | 'email') => {
    toast({
      title: 'Contact Initiated',
      description: `${method === 'call' ? 'Calling' : 'Emailing'} ${buyer.name}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleUpdateBuyerStatus = useCallback((buyerId: string, status: Buyer['status']) => {
    toast({
      title: 'Status Updated',
      description: `Buyer status changed to ${status}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleTimeRangeChange = useCallback((range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
    toast({
      title: 'Time Range Updated',
      description: `Showing data for ${range}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleActionClick = useCallback((action: QuickAction) => {
    toast({
      title: 'Action Executed',
      description: action.title,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Enhanced refresh functionality
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await refreshDashboard();
      setLastRefresh(new Date());
      setRefreshCount(prev => prev + 1);
      toast({
        title: 'Dashboard Refreshed',
        description: 'Latest data has been loaded',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [refreshDashboard, toast]);

  // Export functionality
  const handleExport = useCallback(async () => {
    try {
      const exportOptions = {
        format: exportFormat,
        timeRange: exportTimeRange,
        includeCharts: true,
        includeData: true,
        includeMetrics: true,
      };

      const result = await exportAnalytics(exportOptions);
      
      // Create download link
      const blob = new Blob([result], { type: getMimeType(exportFormat) });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disposition-dashboard-${exportTimeRange}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: `Dashboard data exported as ${exportFormat.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onExportClose();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [exportAnalytics, exportFormat, exportTimeRange, toast, onExportClose]);

  // Helper function for MIME types
  const getMimeType = (format: string) => {
    switch (format) {
      case 'pdf': return 'application/pdf';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv': return 'text/csv';
      default: return 'text/plain';
    }
  };

  // Update preferences
  const updatePreference = useCallback((key: keyof DashboardPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Loading state
  if (loading && refreshCount === 0) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading disposition dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Enhanced Page Header with Controls */}
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <Box>
                <Heading size="lg" color={textColor} mb={2}>
                  Dispositions Dashboard
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Manage deals, track buyers, and monitor disposition performance
                </Text>
              </Box>
              
              {/* Dashboard Controls */}
              <HStack spacing={3}>
                <Tooltip label="Refresh Dashboard">
                  <IconButton
                    aria-label="Refresh dashboard"
                    icon={<FaRedo />}
                    onClick={handleRefresh}
                    isLoading={loading}
                    colorScheme="blue"
                    variant="ghost"
                  />
                </Tooltip>
                
                <Tooltip label="Export Data">
                  <IconButton
                    aria-label="Export dashboard data"
                    icon={<FaDownload />}
                    onClick={onExportOpen}
                    colorScheme="green"
                    variant="ghost"
                  />
                </Tooltip>
                
                <Tooltip label="Dashboard Settings">
                  <IconButton
                    aria-label="Dashboard settings"
                    icon={<FaCog />}
                    onClick={onSettingsOpen}
                    colorScheme="purple"
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
            </HStack>

            {/* Status Bar */}
            <HStack justify="space-between" align="center" p={3} bg="white" borderRadius="md" shadow="sm">
              <HStack spacing={4}>
                <Badge colorScheme="blue" variant="subtle">
                  Last Updated: {lastRefresh.toLocaleTimeString()}
                </Badge>
                <Badge colorScheme="green" variant="subtle">
                  Auto-refresh: {preferences.autoRefresh ? 'ON' : 'OFF'}
                </Badge>
                <Badge colorScheme="purple" variant="subtle">
                  Layout: {preferences.layout}
                </Badge>
              </HStack>
              
              <Text fontSize="sm" color="gray.500">
                Refresh Count: {refreshCount}
              </Text>
            </HStack>
          </Box>

          {/* Priority Alerts - Conditional Display */}
          {preferences.showPriorityAlerts && (
            <PriorityAlerts
              alerts={mockPriorityAlerts}
              onAlertClick={handleAlertClick}
            />
          )}

          {/* Main Dashboard Grid */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            {/* Left Column - Main Content */}
            <GridItem>
              <VStack spacing={8} align="stretch">
                {/* Deal Pipeline - Conditional Display */}
                {preferences.showDealPipeline && (
                  <DealPipeline
                    deals={mockDeals}
                    onDealClick={handleDealClick}
                    onStatusChange={handleStatusChange}
                    onAssignDeal={handleAssignDeal}
                  />
                )}

                {/* Buyer Management - Conditional Display */}
                {preferences.showBuyerManagement && (
                  <BuyerManagement
                    buyers={mockBuyers}
                    communications={mockCommunications}
                    onBuyerClick={handleBuyerClick}
                    onAddBuyer={handleAddBuyer}
                    onContactBuyer={handleContactBuyer}
                    onUpdateBuyerStatus={handleUpdateBuyerStatus}
                  />
                )}
              </VStack>
            </GridItem>

            {/* Right Column - Sidebar */}
            <GridItem>
              <VStack spacing={8} align="stretch">
                {/* Quick Actions - Conditional Display */}
                {preferences.showQuickActions && (
                  <QuickActions
                    actions={getDefaultDispositionActions()}
                    onActionClick={handleActionClick}
                  />
                )}

                {/* Disposition Analytics - Conditional Display */}
                {preferences.showAnalytics && (
                  <DispositionAnalytics
                    metrics={mockMetrics}
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                  />
                )}
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Container>

      {/* Dashboard Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dashboard Settings</ModalHeader>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Display Options */}
              <Box>
                <Heading size="sm" mb={4}>Display Options</Heading>
                <VStack spacing={3} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="showPriorityAlerts" mb="0">
                      Show Priority Alerts
                    </FormLabel>
                    <Switch
                      id="showPriorityAlerts"
                      isChecked={preferences.showPriorityAlerts}
                      onChange={(e) => updatePreference('showPriorityAlerts', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="showDealPipeline" mb="0">
                      Show Deal Pipeline
                    </FormLabel>
                    <Switch
                      id="showDealPipeline"
                      isChecked={preferences.showDealPipeline}
                      onChange={(e) => updatePreference('showDealPipeline', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="showBuyerManagement" mb="0">
                      Show Buyer Management
                    </FormLabel>
                    <Switch
                      id="showBuyerManagement"
                      isChecked={preferences.showBuyerManagement}
                      onChange={(e) => updatePreference('showBuyerManagement', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="showAnalytics" mb="0">
                      Show Analytics
                    </FormLabel>
                    <Switch
                      id="showAnalytics"
                      isChecked={preferences.showAnalytics}
                      onChange={(e) => updatePreference('showAnalytics', e.target.checked)}
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="showQuickActions" mb="0">
                      Show Quick Actions
                    </FormLabel>
                    <Switch
                      id="showQuickActions"
                      isChecked={preferences.showQuickActions}
                      onChange={(e) => updatePreference('showQuickActions', e.target.checked)}
                    />
                  </FormControl>
                </VStack>
              </Box>

              <Divider />

              {/* Layout and Refresh Options */}
              <Box>
                <Heading size="sm" mb={4}>Layout & Refresh</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Layout Style</FormLabel>
                    <Select
                      value={preferences.layout}
                      onChange={(e) => updatePreference('layout', e.target.value)}
                    >
                      <option value="default">Default</option>
                      <option value="compact">Compact</option>
                      <option value="detailed">Detailed</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="autoRefresh" mb="0">
                      Auto-refresh
                    </FormLabel>
                    <Switch
                      id="autoRefresh"
                      isChecked={preferences.autoRefresh}
                      onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                    />
                  </FormControl>
                  
                  {preferences.autoRefresh && (
                    <FormControl>
                      <FormLabel>Refresh Interval (seconds)</FormLabel>
                      <Select
                        value={preferences.refreshInterval / 1000}
                        onChange={(e) => updatePreference('refreshInterval', parseInt(e.target.value) * 1000)}
                      >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                      </Select>
                    </FormControl>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSettingsClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onSettingsClose}>
              Save Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={isExportOpen} onClose={onExportClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Dashboard Data</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Export Format</FormLabel>
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Time Range</FormLabel>
                <Select
                  value={exportTimeRange}
                  onChange={(e) => setExportTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExportClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleExport} isLoading={loading}>
              Export Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DispositionDashboard;
