import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormErrorMessage,
  Textarea,
  SimpleGrid,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Flex,
  Spacer,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
  MenuOptionGroup,
  MenuItemOption,
  RadioGroup,
  Radio,
  Stack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  useColorMode,
  useDisclosure as useDisclosureHook,
} from '@chakra-ui/react';
import { 
  FiActivity, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSave, 
  FiX, 
  FiSettings, 
  FiDownload, 
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiDatabase,
  FiShield,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw,
  FiFileText,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiClock,
  FiMapPin,
  FiGlobe,
  FiServer,
  FiHardDrive,
  FiCpu,
  FiWifi,
  FiSmartphone,
  FiTablet,
  FiMonitor,
} from 'react-icons/fi';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'data_access' | 'data_modification' | 'system' | 'security' | 'user_management';
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalLeads: number;
  totalDeals: number;
  conversionRate: number;
  avgDealValue: number;
  systemUptime: number;
  responseTime: number;
  storageUsed: number;
  storageTotal: number;
}

const AuditAnalytics: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  
  // Modal states
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  
  // View states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportDateRange, setExportDateRange] = useState({ start: '', end: '' });
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    loadAuditLogs();
    loadAnalyticsData();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      // This would call the settings service
      // const logs = await settingsService.getAuditLogs();
      // setAuditLogs(logs);
      
      // Mock data for now
      setAuditLogs([
        {
          id: '1',
          timestamp: new Date('2024-01-15T10:30:00'),
          userId: 'user1',
          userName: 'John Doe',
          action: 'LOGIN',
          resource: 'auth',
          resourceId: 'session_123',
          details: { method: 'password', success: true },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'low',
          category: 'authentication',
        },
        {
          id: '2',
          timestamp: new Date('2024-01-15T10:35:00'),
          userId: 'user1',
          userName: 'John Doe',
          action: 'CREATE',
          resource: 'lead',
          resourceId: 'lead_456',
          details: { leadName: 'New Property Lead', status: 'new' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'medium',
          category: 'data_modification',
        },
        {
          id: '3',
          timestamp: new Date('2024-01-15T09:15:00'),
          userId: 'admin1',
          userName: 'Admin User',
          action: 'UPDATE',
          resource: 'user',
          resourceId: 'user_789',
          details: { role: 'manager', permissions: ['read', 'write'] },
          ipAddress: '192.168.1.50',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          severity: 'high',
          category: 'user_management',
        },
        {
          id: '4',
          timestamp: new Date('2024-01-15T08:45:00'),
          userId: 'system',
          userName: 'System',
          action: 'BACKUP',
          resource: 'database',
          resourceId: 'backup_20240115',
          details: { size: '2.5GB', status: 'completed' },
          ipAddress: '127.0.0.1',
          userAgent: 'System/1.0',
          severity: 'low',
          category: 'system',
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading audit logs',
        description: 'Failed to load audit logs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // This would call the settings service
      // const data = await settingsService.getAnalyticsData();
      // setAnalyticsData(data);
      
      // Mock data for now
      setAnalyticsData({
        totalUsers: 1250,
        activeUsers: 890,
        totalLeads: 5670,
        totalDeals: 2340,
        conversionRate: 41.3,
        avgDealValue: 125000,
        systemUptime: 99.8,
        responseTime: 245,
        storageUsed: 45.2,
        storageTotal: 100,
      });
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: 'Failed to load analytics data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // This would call the settings service
      // await settingsService.exportAuditLogs(exportFormat, exportDateRange);
      
      toast({
        title: 'Export started',
        description: `Audit logs are being exported in ${exportFormat.toUpperCase()} format`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onExportClose();
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export audit logs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const openViewModal = (log: AuditLog) => {
    setSelectedLog(log);
    onViewOpen();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <FiShield />;
      case 'data_access': return <FiDatabase />;
      case 'data_modification': return <FiEdit2 />;
      case 'system': return <FiServer />;
      case 'security': return <FiShield />;
      case 'user_management': return <FiUser />;
      default: return <FiActivity />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <FiCheckCircle />;
      case 'LOGOUT': return <FiX />;
      case 'CREATE': return <FiPlus />;
      case 'UPDATE': return <FiEdit2 />;
      case 'DELETE': return <FiTrash2 />;
      case 'VIEW': return <FiEye />;
      case 'BACKUP': return <FiDatabase />;
      default: return <FiActivity />;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (dateRange.start && log.timestamp < new Date(dateRange.start)) return false;
    if (dateRange.end && log.timestamp > new Date(dateRange.end)) return false;
    if (userFilter && !log.userName.toLowerCase().includes(userFilter.toLowerCase())) return false;
    if (actionFilter && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    if (severityFilter.length > 0 && !severityFilter.includes(log.severity)) return false;
    if (categoryFilter.length > 0 && !categoryFilter.includes(log.category)) return false;
    return true;
  });

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading audit logs and analytics...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Audit & Analytics
        </Heading>
        <Text color="gray.600">
          Monitor system activity, user actions, and performance metrics
        </Text>
      </Box>

      {/* Analytics Overview */}
      {analyticsData && (
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Users</StatLabel>
                  <StatNumber>{analyticsData.totalUsers.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {((analyticsData.activeUsers / analyticsData.totalUsers) * 100).toFixed(1)}% active
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Conversion Rate</StatLabel>
                  <StatNumber>{analyticsData.conversionRate}%</StatNumber>
                  <StatHelpText>
                    {analyticsData.totalLeads.toLocaleString()} leads → {analyticsData.totalDeals.toLocaleString()} deals
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>System Uptime</StatLabel>
                  <StatNumber>{analyticsData.systemUptime}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Excellent performance
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Storage Usage</StatLabel>
                  <StatNumber>{analyticsData.storageUsed}%</StatNumber>
                  <StatHelpText>
                    {analyticsData.storageUsed}GB of {analyticsData.storageTotal}GB
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <Heading size="md">Audit Log Filters</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>Date Range</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="End date"
                  />
                </HStack>
              </FormControl>
              
              <FormControl>
                <FormLabel>User</FormLabel>
                <Input
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder="Filter by user"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Action</FormLabel>
                <Input
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  placeholder="Filter by action"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Severity</FormLabel>
                <CheckboxGroup value={severityFilter} onChange={(values) => setSeverityFilter(values as string[])}>
                  <Wrap>
                    <WrapItem>
                      <Checkbox value="low">Low</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="medium">Medium</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="high">High</Checkbox>
                    </WrapItem>
                    <WrapItem>
                      <Checkbox value="critical">Critical</Checkbox>
                    </WrapItem>
                  </Wrap>
                </CheckboxGroup>
              </FormControl>
            </SimpleGrid>
            
            <FormControl>
              <FormLabel>Category</FormLabel>
              <CheckboxGroup value={categoryFilter} onChange={(values) => setCategoryFilter(values as string[])}>
                <Wrap>
                  <WrapItem>
                    <Checkbox value="authentication">Authentication</Checkbox>
                  </WrapItem>
                  <WrapItem>
                    <Checkbox value="data_access">Data Access</Checkbox>
                  </WrapItem>
                  <WrapItem>
                    <Checkbox value="data_modification">Data Modification</Checkbox>
                  </WrapItem>
                  <WrapItem>
                    <Checkbox value="system">System</Checkbox>
                  </WrapItem>
                  <WrapItem>
                    <Checkbox value="security">Security</Checkbox>
                  </WrapItem>
                  <WrapItem>
                    <Checkbox value="user_management">User Management</Checkbox>
                  </WrapItem>
                </Wrap>
              </CheckboxGroup>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Export Button */}
      <HStack justify="flex-end">
        <Button
          colorScheme="blue"
          leftIcon={<FiDownload />}
          onClick={onExportOpen}
        >
          Export Logs
        </Button>
      </HStack>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Audit Logs</Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>Severity</Th>
                <Th>Category</Th>
                <Th>IP Address</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredLogs.map((log) => (
                <Tr key={log.id}>
                  <Td>
                    <Text fontSize="sm">
                      {log.timestamp.toLocaleDateString()}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {log.timestamp.toLocaleTimeString()}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontWeight="medium">{log.userName}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {log.userId}
                    </Text>
                  </Td>
                  <Td>
                    <HStack>
                      {getActionIcon(log.action)}
                      <Text>{log.action}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text>{log.resource}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {log.resourceId}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getSeverityColor(log.severity)} variant="subtle">
                      {log.severity.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack>
                      {getCategoryIcon(log.category)}
                      <Text fontSize="sm">{log.category.replace('_', ' ')}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontFamily="mono">
                      {log.ipAddress}
                    </Text>
                  </Td>
                  <Td>
                    <Tooltip label="View details">
                      <IconButton
                        aria-label="View log details"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openViewModal(log)}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* View Log Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Audit Log Details</ModalHeader>
          <ModalBody>
            {selectedLog && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Timestamp</Text>
                    <Text fontSize="sm">
                      {selectedLog.timestamp.toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">User</Text>
                    <Text fontSize="sm">{selectedLog.userName} ({selectedLog.userId})</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Action</Text>
                    <HStack>
                      {getActionIcon(selectedLog.action)}
                      <Text fontSize="sm">{selectedLog.action}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Resource</Text>
                    <Text fontSize="sm">{selectedLog.resource} - {selectedLog.resourceId}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Severity</Text>
                    <Badge colorScheme={getSeverityColor(selectedLog.severity)} variant="subtle">
                      {selectedLog.severity.toUpperCase()}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Category</Text>
                    <HStack>
                      {getCategoryIcon(selectedLog.category)}
                      <Text fontSize="sm">{selectedLog.category.replace('_', ' ')}</Text>
                    </HStack>
                  </Box>
                </SimpleGrid>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2}>Details</Text>
                  <Box p={3} bg="gray.50" borderRadius="md" fontFamily="mono" fontSize="sm">
                    <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                  </Box>
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">IP Address</Text>
                    <Text fontSize="sm" fontFamily="mono">{selectedLog.ipAddress}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">User Agent</Text>
                    <Text fontSize="sm" noOfLines={2}>
                      {selectedLog.userAgent}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Audit Logs</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Export Format</FormLabel>
                <RadioGroup value={exportFormat} onChange={(value) => setExportFormat(value as any)}>
                  <Stack direction="row">
                    <Radio value="csv">CSV</Radio>
                    <Radio value="json">JSON</Radio>
                    <Radio value="pdf">PDF</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Date Range</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={exportDateRange.start}
                    onChange={(e) => setExportDateRange(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={exportDateRange.end}
                    onChange={(e) => setExportDateRange(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="End date"
                  />
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExportClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiDownload />}
              onClick={handleExport}
              isLoading={isExporting}
            >
              Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default AuditAnalytics;
