import React, { useState, useEffect } from 'react';
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
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Tooltip,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { 
  FiZap, 
  FiBarChart, 
  FiSettings, 
  FiUsers, 
  FiPlus, 
  FiRefreshCw, 
  FiDownload,
  FiFilter,
  FiTrendingUp,
  FiClock,
  FiEdit,
} from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { 
  AutomationErrorBoundary, 
  AutomationLoading,
  AutomationStats,
  WorkflowList,
} from '../../features/automation';
import { useAutomation } from '../../features/automation/hooks/useAutomation';

const AutomationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  
  const {
    workflows,
    stats,
    loading,
    error,
    isAuthenticated,
    // user,
    loadWorkflows,
    loadStats,
  } = useAutomation();
  
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkflows();
      loadStats(timeRange);
    }
  }, [isAuthenticated, loadWorkflows, loadStats, timeRange]);

  const handleNavigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadWorkflows();
      await loadStats(timeRange);
      toast({
        title: 'Data Refreshed',
        description: 'Automation data has been updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh automation data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement automation export functionality
    toast({
      title: 'Export Automation',
      description: 'Automation export functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleFilter = () => {
    // TODO: Implement automation filtering functionality
    toast({
      title: 'Filter Automation',
      description: 'Advanced filtering functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleWorkflowSelect = (workflow: any) => {
    // Navigate to workflow builder
    window.location.href = `/automation/builder?id=${workflow.id}`;
  };

  const handleWorkflowDelete = (_workflowId: string) => {
    // TODO: Implement workflow deletion
    toast({
      title: 'Delete Workflow',
      description: 'Workflow deletion functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleWorkflowDuplicate = (_workflowId: string) => {
    // TODO: Implement workflow duplication
    toast({
      title: 'Duplicate Workflow',
      description: 'Workflow duplication functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleWorkflowExport = (_workflow: any) => {
    // TODO: Implement workflow export
    toast({
      title: 'Export Workflow',
      description: 'Workflow export functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleFilterChange = (_filters: any) => {
    // TODO: Implement filter changes
    console.log('Filter changes:', _filters);
  };

  if (loading && !error) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <AutomationLoading variant="skeleton" message="Loading automation dashboard..." />
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <AutomationErrorBoundary>
        <Box minH="100vh" bg={bgColor}>
          <Header />
          <HStack align="flex-start" spacing={0}>
            <Sidebar />
            <Box flex={1}>
              <Navigation />
              <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
                {/* Page Header */}
                <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                  <Flex justify="space-between" align="center" mb={4}>
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="lg" color={textColor}>
                        Automation Dashboard
                      </Heading>
                      <Text color={subTextColor}>
                        Manage your automation workflows and monitor performance
                      </Text>
                    </VStack>
                    
                    <HStack spacing={3}>
                      <Tooltip label="Refresh data">
                        <IconButton
                          aria-label="Refresh data"
                          icon={<FiRefreshCw />}
                          onClick={handleRefresh}
                          isLoading={isRefreshing}
                          variant="ghost"
                          size="sm"
                        />
                      </Tooltip>
                      
                      <Tooltip label="Filter automation">
                        <IconButton
                          aria-label="Filter automation"
                          icon={<FiFilter />}
                          onClick={handleFilter}
                          variant="ghost"
                          size="sm"
                        />
                      </Tooltip>
                      
                      <Tooltip label="Export automation">
                        <IconButton
                          aria-label="Export automation"
                          icon={<FiDownload />}
                          onClick={handleExport}
                          variant="ghost"
                          size="sm"
                        />
                      </Tooltip>
                      
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleNavigateTo('/automation/builder')}
                      >
                        Create Workflow
                      </Button>
                    </HStack>
                  </Flex>

                  {/* Quick Stats */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Stat>
                      <StatLabel color={subTextColor}>Total Workflows</StatLabel>
                      <StatNumber color={textColor}>{stats?.totalWorkflows || 0}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {stats?.activeWorkflows || 0} active
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel color={subTextColor}>Executions Today</StatLabel>
                      <StatNumber color={textColor}>{stats?.executionsToday || 0}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {stats?.successRate || 0}% success
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel color={subTextColor}>Avg Execution Time</StatLabel>
                      <StatNumber color={textColor}>
                        {stats?.averageExecutionTime ? `${(stats.averageExecutionTime / 1000).toFixed(1)}s` : '0s'}
                      </StatNumber>
                      <StatHelpText>
                        <FiClock size={12} />
                        Last 24 hours
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel color={subTextColor}>Success Rate</StatLabel>
                      <StatNumber color={textColor}>{stats?.successRate || 0}%</StatNumber>
                      <StatHelpText>
                        <Progress 
                          value={stats?.successRate || 0} 
                          size="sm" 
                          colorScheme={stats?.successRate && stats.successRate > 90 ? 'green' : 'orange'}
                        />
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Box>

                {/* Main Content */}
                <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                  <TabList bg={cardBg} borderRadius="lg" p={2}>
                    <Tab>
                      <HStack spacing={2}>
                        <FiBarChart />
                        <Text>Overview</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <FiZap />
                        <Text>Workflows</Text>
                        <Badge colorScheme="blue" size="sm">
                          {workflows?.length || 0}
                        </Badge>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <FiTrendingUp />
                        <Text>Analytics</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <FiSettings />
                        <Text>Settings</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Overview Tab */}
                    <TabPanel p={0} pt={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Recent Activity */}
                        <Card bg={cardBg} shadow="sm">
                          <CardHeader>
                            <Heading size="md" color={textColor}>Recent Activity</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                                                             {workflows?.slice(0, 5).map((workflow: any) => (
                                 <HStack key={workflow.id} justify="space-between" p={3} bg={itemBg} borderRadius="md">
                                  <VStack align="flex-start" spacing={1}>
                                    <Text fontWeight="semibold" color={textColor}>
                                      {workflow.name}
                                    </Text>
                                    <Text fontSize="sm" color={subTextColor}>
                                      Last executed: {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleDateString() : 'Never'}
                                    </Text>
                                  </VStack>
                                  <HStack spacing={2}>
                                    <Badge colorScheme={workflow.isActive ? 'green' : 'gray'}>
                                      {workflow.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <IconButton
                                      aria-label="Edit workflow"
                                      icon={<FiEdit />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleWorkflowSelect(workflow)}
                                    />
                                  </HStack>
                                </HStack>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>

                        {/* Performance Metrics */}
                        <Card bg={cardBg} shadow="sm">
                          <CardHeader>
                            <Heading size="md" color={textColor}>Performance Metrics</Heading>
                          </CardHeader>
                          <CardBody>
                            <AutomationStats
                              stats={stats}
                              timeRange={timeRange}
                              onFilterChange={handleFilterChange}
                            />
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>

                    {/* Workflows Tab */}
                    <TabPanel p={0} pt={6}>
                      <WorkflowList
                        workflows={workflows || []}
                        onWorkflowSelect={handleWorkflowSelect}
                        onWorkflowDelete={handleWorkflowDelete}
                        onWorkflowDuplicate={handleWorkflowDuplicate}
                        onWorkflowExport={handleWorkflowExport}
                      />
                    </TabPanel>

                    {/* Analytics Tab */}
                    <TabPanel p={0} pt={6}>
                      <Card bg={cardBg} shadow="sm">
                        <CardHeader>
                          <Heading size="md" color={textColor}>Analytics Dashboard</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Text color={subTextColor}>
                              Advanced analytics and reporting features coming soon...
                            </Text>
                            <HStack spacing={4}>
                              <Button leftIcon={<FiTrendingUp />} variant="outline">
                                View Reports
                              </Button>
                              <Button leftIcon={<FiDownload />} variant="outline">
                                Export Data
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>

                    {/* Settings Tab */}
                    <TabPanel p={0} pt={6}>
                      <Card bg={cardBg} shadow="sm">
                        <CardHeader>
                          <Heading size="md" color={textColor}>Automation Settings</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Text color={subTextColor}>
                              Automation configuration and settings coming soon...
                            </Text>
                            <HStack spacing={4}>
                              <Button leftIcon={<FiSettings />} variant="outline">
                                General Settings
                              </Button>
                              <Button leftIcon={<FiUsers />} variant="outline">
                                User Permissions
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </Box>
          </HStack>
        </Box>
      </AutomationErrorBoundary>
    </ErrorBoundary>
  );
};

export default AutomationPage; 