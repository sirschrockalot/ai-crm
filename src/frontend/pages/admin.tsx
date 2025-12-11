import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Flex,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Stack,
} from '@chakra-ui/react';
import UserManagement from '../components/settings/UserManagement';
import ServiceHealthStatus from '../components/admin/ServiceHealthStatus';
import {
  FiUsers,
  FiSettings,
  FiShield,
  FiBarChart,
  FiActivity,
  FiDatabase,
  FiMail,
  FiBell,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiMoreVertical,
  FiUserPlus,
  FiKey,
  FiGlobe,
  FiServer,
  FiHardDrive,
  FiCpu,
  FiWifi,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { mockUsers } from '../services/mockDataService';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalLeads: number;
  totalBuyers: number;
  systemUptime: string;
  storageUsed: string;
  apiCalls: number;
  errorRate: number;
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  source: string;
}

const AdminPage: React.FC = () => {
  const { user, isAuthenticated, hasPermission, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const { isOpen: isSystemModalOpen, onOpen: onSystemModalOpen, onClose: onSystemModalClose } = useDisclosure();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 24,
    activeUsers: 18,
    totalLeads: 156,
    totalBuyers: 89,
    systemUptime: '99.9%',
    storageUsed: '2.4 GB',
    apiCalls: 15420,
    errorRate: 0.2,
  });

  const [userActivity, setUserActivity] = useState<UserActivity[]>([
    {
      id: '1',
      user: 'john.doe@presidentialdigs.com',
      action: 'Logged in',
      timestamp: new Date('2024-01-20T10:30:00Z'),
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      user: 'sarah.smith@presidentialdigs.com',
      action: 'Created new lead',
      timestamp: new Date('2024-01-20T10:25:00Z'),
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: '3',
      user: 'mike.johnson@presidentialdigs.com',
      action: 'Failed login attempt',
      timestamp: new Date('2024-01-20T10:20:00Z'),
      ipAddress: '192.168.1.102',
      status: 'error',
    },
  ]);

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: '1',
      level: 'info',
      message: 'Database backup completed successfully',
      timestamp: new Date('2024-01-20T10:00:00Z'),
      source: 'Database',
    },
    {
      id: '2',
      level: 'warning',
      message: 'High memory usage detected on server',
      timestamp: new Date('2024-01-20T09:45:00Z'),
      source: 'System',
    },
    {
      id: '3',
      level: 'error',
      message: 'API rate limit exceeded for user',
      timestamp: new Date('2024-01-20T09:30:00Z'),
      source: 'API',
    },
  ]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check authentication and permissions
  useEffect(() => {
    if (authIsLoading) return; // Wait for auth to initialize before redirecting
    // Check if we're in bypass auth mode
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    
    if (!bypassAuth && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the admin panel.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      router.push('/auth/login');
      return;
    }

    if (!bypassAuth && !hasPermission('system:admin')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/dashboard');
      return;
    }
  }, [authIsLoading, isAuthenticated, hasPermission, router, toast]);

  const handleUserAction = (action: string, userId: string) => {
    toast({
      title: `${action} User`,
      description: `User ${action.toLowerCase()} action initiated.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleBulkUserAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Users Selected',
        description: 'Please select users to perform bulk actions.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: `Bulk ${action}`,
      description: `${action} action applied to ${selectedUsers.length} users.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setSelectedUsers([]);
  };

  const handleSystemAction = (action: string) => {
    toast({
      title: 'System Action',
      description: `${action} action initiated.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'debug': return 'gray';
      default: return 'gray';
    }
  };

  // Check if we're in bypass auth mode
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  
  if (authIsLoading) {
    return (
      <DashboardLayout isAuthenticated={true} showNavigation={true}>
        <Box p={8}>
          <Text>Loading...</Text>
        </Box>
      </DashboardLayout>
    );
  }

  if (!bypassAuth && (!isAuthenticated || !hasPermission('system:admin'))) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin panel.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <DashboardLayout isAuthenticated={true} showNavigation={true}>
      <Box bg={bgColor} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color={textColor}>
                System Administration
              </Heading>
              <Text color={subTextColor}>
                Manage users, monitor system health, and configure settings
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                onClick={() => handleSystemAction('Export Data')}
              >
                Export Data
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* System Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Users</StatLabel>
                  <StatNumber>{systemStats.totalUsers}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Active Users</StatLabel>
                  <StatNumber>{systemStats.activeUsers}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    8% from last week
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>System Uptime</StatLabel>
                  <StatNumber>{systemStats.systemUptime}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Last 30 days
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Error Rate</StatLabel>
                  <StatNumber>{systemStats.errorRate}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    0.1% from last week
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Main Content Tabs */}
        <Card bg={cardBg}>
          <CardBody>
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <FiUsers />
                    <Text>User Management</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <FiActivity />
                    <Text>System Monitoring</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <FiSettings />
                    <Text>System Settings</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <FiShield />
                    <Text>Security & Logs</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* User Management Tab */}
                <TabPanel>
                  {/* Replace mock UI with the real UserManagement component that calls the service */}
                  <UserManagement />
                </TabPanel>

                {/* System Monitoring Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Service Health Status */}
                    <ServiceHealthStatus autoRefresh={false} />

                    {/* System Health */}
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                      <GridItem>
                        <Card bg={cardBg}>
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color={subTextColor}>CPU Usage</Text>
                                <Text fontSize="2xl" fontWeight="bold">45%</Text>
                              </VStack>
                              <FiCpu size={24} color="green" />
                            </HStack>
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card bg={cardBg}>
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color={subTextColor}>Memory Usage</Text>
                                <Text fontSize="2xl" fontWeight="bold">67%</Text>
                              </VStack>
                              <FiHardDrive size={24} color="yellow" />
                            </HStack>
                          </CardBody>
                        </Card>
                      </GridItem>
                      <GridItem>
                        <Card bg={cardBg}>
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color={subTextColor}>Network</Text>
                                <Text fontSize="2xl" fontWeight="bold">23%</Text>
                              </VStack>
                              <FiWifi size={24} color="green" />
                            </HStack>
                          </CardBody>
                        </Card>
                      </GridItem>
                    </Grid>

                    {/* Recent Activity */}
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">Recent User Activity</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          {userActivity.map((activity) => (
                            <HStack key={activity.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">{activity.user}</Text>
                                <Text fontSize="sm" color={subTextColor}>{activity.action}</Text>
                              </VStack>
                              <VStack align="end" spacing={1}>
                                <Badge colorScheme={getStatusColor(activity.status)} variant="subtle">
                                  {activity.status}
                                </Badge>
                                <Text fontSize="sm" color={subTextColor}>
                                  {new Date(activity.timestamp).toLocaleString()}
                                </Text>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* System Settings Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">General Settings</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <FormControl>
                            <FormLabel>System Name</FormLabel>
                            <Input defaultValue="Presidential Digs CRM" />
                            <FormHelperText>The name displayed throughout the system</FormHelperText>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Default Timezone</FormLabel>
                            <Select defaultValue="America/Chicago">
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                            </Select>
                          </FormControl>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Enable Email Notifications</FormLabel>
                            <Switch defaultChecked />
                          </FormControl>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Enable SMS Notifications</FormLabel>
                            <Switch />
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg}>
                      <CardHeader>
                        <Heading size="md">Security Settings</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <FormControl>
                            <FormLabel>Session Timeout (minutes)</FormLabel>
                            <Input type="number" defaultValue="30" />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Password Policy</FormLabel>
                            <Select defaultValue="strong">
                              <option value="basic">Basic (8+ characters)</option>
                              <option value="strong">Strong (12+ chars, mixed case, numbers)</option>
                              <option value="strict">Strict (16+ chars, special chars required)</option>
                            </Select>
                          </FormControl>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Require MFA for Admins</FormLabel>
                            <Switch defaultChecked />
                          </FormControl>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Enable IP Whitelisting</FormLabel>
                            <Switch />
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Security & Logs Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Card bg={cardBg}>
                      <CardHeader>
                        <HStack justify="space-between">
                          <Heading size="md">System Logs</Heading>
                          <HStack spacing={2}>
                            <Select placeholder="Filter by level" maxW="150px">
                              <option value="info">Info</option>
                              <option value="warning">Warning</option>
                              <option value="error">Error</option>
                              <option value="debug">Debug</option>
                            </Select>
                            <Button size="sm" variant="outline" onClick={() => handleSystemAction('Clear Logs')}>
                              Clear Logs
                            </Button>
                          </HStack>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          {systemLogs.map((log) => (
                            <HStack key={log.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                              <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                  <Badge colorScheme={getLogLevelColor(log.level)} variant="subtle">
                                    {log.level.toUpperCase()}
                                  </Badge>
                                  <Text fontSize="sm" color={subTextColor}>{log.source}</Text>
                                </HStack>
                                <Text fontSize="sm">{log.message}</Text>
                              </VStack>
                              <Text fontSize="sm" color={subTextColor}>
                                {new Date(log.timestamp).toLocaleString()}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>

      {/* Add User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input placeholder="Enter first name" />
              </FormControl>
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input placeholder="Enter last name" />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Enter email address" />
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select placeholder="Select role">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="agent">Agent</option>
                  <option value="user">User</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Permissions</FormLabel>
                <CheckboxGroup>
                  <Stack spacing={2}>
                    <Checkbox value="leads:read">Read Leads</Checkbox>
                    <Checkbox value="leads:write">Write Leads</Checkbox>
                    <Checkbox value="buyers:read">Read Buyers</Checkbox>
                    <Checkbox value="buyers:write">Write Buyers</Checkbox>
                    <Checkbox value="reports:read">Read Reports</Checkbox>
                    <Checkbox value="system:admin">System Admin</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUserModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={() => {
              handleUserAction('Create', 'new');
              onUserModalClose();
            }}>
              Create User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false });
