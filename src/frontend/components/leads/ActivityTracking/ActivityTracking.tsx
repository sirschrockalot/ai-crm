import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
  useToast,
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
  IconButton,
  Tooltip,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Link,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiEye, FiDownload, FiRefreshCw, FiCalendar, FiUser, FiActivity } from 'react-icons/fi';
import { useApi } from '../../../hooks/useApi';

interface ActivityRecord {
  id: string;
  operationType: 'import' | 'export' | 'bulk_operation';
  status: 'success' | 'failed' | 'in_progress';
  userId: string;
  userName: string;
  timestamp: Date;
  recordCount: number;
  successCount: number;
  failureCount: number;
  filename?: string;
  operationDetails: string;
  duration?: number;
  errors?: string[];
  warnings?: string[];
  downloadUrl?: string;
}

interface ActivityFilters {
  operationType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  search?: string;
}

interface ActivityMetrics {
  totalOperations: number;
  successRate: number;
  averageDuration: number;
  totalRecords: number;
  operationsByType: Record<string, number>;
  operationsByStatus: Record<string, number>;
}

export const ActivityTracking: React.FC = () => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const api = useApi();
  const toast = useToast();

  useEffect(() => {
    loadActivities();
    loadUsers();
    loadMetrics();
  }, [filters]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const response = await api.execute({ 
        method: 'GET', 
        url: '/leads/import-export/activity', 
        params: filters 
      });
      setActivities(response);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast({
        title: 'Failed to Load Activities',
        description: 'Unable to load activity history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.execute({ 
        method: 'GET', 
        url: '/users' 
      });
      setUsers(response);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await api.execute({ 
        method: 'GET', 
        url: '/leads/import-export/activity/metrics', 
        params: filters 
      });
      setMetrics(response);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'in_progress': return 'blue';
      default: return 'gray';
    }
  };

  const getOperationTypeIcon = (type: string) => {
    switch (type) {
      case 'import': return '📥';
      case 'export': return '📤';
      case 'bulk_operation': return '⚡';
      default: return '📋';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const exportActivityLog = async () => {
    try {
      const response = await api.execute({ 
        method: 'GET', 
        url: '/leads/import-export/activity/export',
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-log-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Activity Log Exported',
        description: 'Activity log has been downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to export activity log:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export activity log',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Activity Tracking</Heading>
          <HStack>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={loadActivities}
              isLoading={isLoading}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiDownload />}
              onClick={exportActivityLog}
              variant="outline"
              size="sm"
            >
              Export Log
            </Button>
          </HStack>
        </HStack>

        {/* Metrics Dashboard */}
        {metrics && (
          <Box p={4} bg="blue.50" borderRadius="lg">
            <Heading size="sm" mb={4}>Performance Overview</Heading>
            <HStack spacing={6} justify="space-around">
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {metrics.totalOperations}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Operations</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {metrics.successRate.toFixed(1)}%
                </Text>
                <Text fontSize="sm" color="gray.600">Success Rate</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {formatDuration(metrics.averageDuration)}
                </Text>
                <Text fontSize="sm" color="gray.600">Avg Duration</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {metrics.totalRecords.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Records</Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Filters */}
        <Box p={4} bg="gray.50" borderRadius="lg">
          <Heading size="sm" mb={3}>Filters</Heading>
          <HStack spacing={4} wrap="wrap">
            <Select
              placeholder="Operation Type"
              value={filters.operationType || ''}
              onChange={(e) => handleFilterChange('operationType', e.target.value)}
              size="sm"
              maxW="200px"
            >
              <option value="import">Import</option>
              <option value="export">Export</option>
              <option value="bulk_operation">Bulk Operation</option>
            </Select>
            
            <Select
              placeholder="Status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="sm"
              maxW="200px"
            >
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
            </Select>
            
            <Input
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              size="sm"
              maxW="200px"
            />
            
            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              size="sm"
              maxW="200px"
            />
            
            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              size="sm"
              maxW="200px"
            />
            
            <Button size="sm" onClick={clearFilters} variant="outline">
              Clear
            </Button>
          </HStack>
        </Box>

        {/* Activity Table */}
        <Box>
          <Heading size="sm" mb={3}>Recent Activity</Heading>
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="lg" />
              <Text mt={2}>Loading activities...</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Operation</Th>
                    <Th>User</Th>
                    <Th>Status</Th>
                    <Th>Records</Th>
                    <Th>Duration</Th>
                    <Th>Timestamp</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activities.map((activity) => (
                    <Tr key={activity.id}>
                      <Td>
                        <HStack>
                          <Text fontSize="lg">{getOperationTypeIcon(activity.operationType)}</Text>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {activity.operationType.replace('_', ' ').toUpperCase()}
                            </Text>
                            {activity.filename && (
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {activity.filename}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{activity.userName}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(activity.status)} size="sm">
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{activity.recordCount.toLocaleString()}</Text>
                          {activity.successCount > 0 && (
                            <Text fontSize="xs" color="green.600">
                              +{activity.successCount}
                            </Text>
                          )}
                          {activity.failureCount > 0 && (
                            <Text fontSize="xs" color="red.600">
                              -{activity.failureCount}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{formatDuration(activity.duration)}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="View Details">
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              aria-label="View details"
                              onClick={() => {
                                setSelectedActivity(activity);
                                setShowDetails(true);
                              }}
                              variant="ghost"
                            />
                          </Tooltip>
                          {activity.downloadUrl && (
                            <Tooltip label="Download Result">
                              <IconButton
                                size="sm"
                                icon={<FiDownload />}
                                aria-label="Download result"
                                onClick={() => window.open(activity.downloadUrl, '_blank')}
                                variant="ghost"
                                colorScheme="green"
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>

      {/* Activity Details Modal */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Activity Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedActivity && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Operation Summary</Text>
                    <Badge colorScheme={getStatusColor(selectedActivity.status)} size="lg">
                      {selectedActivity.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </HStack>
                  <Divider my={2} />
                  <HStack justify="space-between" fontSize="sm">
                    <Text>Type: {selectedActivity.operationType.replace('_', ' ').toUpperCase()}</Text>
                    <Text>User: {selectedActivity.userName}</Text>
                  </HStack>
                  <HStack justify="space-between" fontSize="sm">
                    <Text>Records: {selectedActivity.recordCount.toLocaleString()}</Text>
                    <Text>Duration: {formatDuration(selectedActivity.duration)}</Text>
                  </HStack>
                  <HStack justify="space-between" fontSize="sm">
                    <Text>Success: {selectedActivity.successCount}</Text>
                    <Text>Failures: {selectedActivity.failureCount}</Text>
                  </HStack>
                </Box>

                {selectedActivity.operationDetails && (
                  <Box>
                    <Heading size="sm" mb={2}>Operation Details</Heading>
                    <Text fontSize="sm" p={3} bg="blue.50" borderRadius="md">
                      {selectedActivity.operationDetails}
                    </Text>
                  </Box>
                )}

                {selectedActivity.errors && selectedActivity.errors.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2} color="red.600">Errors</Heading>
                    <VStack spacing={2} align="stretch">
                      {selectedActivity.errors.map((error, index) => (
                        <Text key={index} fontSize="sm" p={2} bg="red.50" borderRadius="md" color="red.700">
                          {error}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                {selectedActivity.warnings && selectedActivity.warnings.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2} color="orange.600">Warnings</Heading>
                    <VStack spacing={2} align="stretch">
                      {selectedActivity.warnings.map((warning, index) => (
                        <Text key={index} fontSize="sm" p={2} bg="orange.50" borderRadius="md" color="orange.700">
                          {warning}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}

                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Timestamp: {new Date(selectedActivity.timestamp).toLocaleString()}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setShowDetails(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
