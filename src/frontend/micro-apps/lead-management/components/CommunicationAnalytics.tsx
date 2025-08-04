import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
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
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { DownloadIcon, SearchIcon, ChartIcon } from '@chakra-ui/icons';
import communicationService from '../../../services/communicationService';

interface CommunicationAnalyticsProps {
  tenantId?: string;
}

const CommunicationAnalytics: React.FC<CommunicationAnalyticsProps> = ({ tenantId }) => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { isOpen: isSearchModalOpen, onOpen: onSearchModalOpen, onClose: onSearchModalClose } = useDisclosure();
  const { isOpen: isExportModalOpen, onOpen: onExportModalOpen, onClose: onExportModalClose } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [dateFrom, dateTo]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsData, analyticsData, costData] = await Promise.all([
        communicationService.getCommunicationStats(),
        communicationService.getCommunicationAnalytics(),
        communicationService.getCostAnalysis(),
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setCostAnalysis(costData);
    } catch (error) {
      toast({
        title: 'Failed to load analytics',
        description: 'Could not load communication analytics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // In real implementation, this would call the export API
      toast({
        title: 'Export started',
        description: 'Communication logs export has been initiated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onExportModalClose();
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export communication logs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading analytics...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Communication Analytics
          </Text>
          <HStack spacing={4}>
            <Button
              leftIcon={<SearchIcon />}
              variant="outline"
              onClick={onSearchModalOpen}
            >
              Search Logs
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="blue"
              onClick={onExportModalOpen}
            >
              Export Data
            </Button>
          </HStack>
        </HStack>

        {/* Date Range Filter */}
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>From Date</FormLabel>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>To Date</FormLabel>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </FormControl>
        </HStack>

        {/* Key Metrics */}
        {stats && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Stat>
              <StatLabel>Total Communications</StatLabel>
              <StatNumber>{stats.totalCommunications}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {formatPercentage(stats.successRate)} success rate
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total SMS</StatLabel>
              <StatNumber>{stats.totalSms}</StatNumber>
              <StatHelpText>Text messages sent</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Voice Calls</StatLabel>
              <StatNumber>{stats.totalVoice}</StatNumber>
              <StatHelpText>Voice calls made</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Cost</StatLabel>
              <StatNumber>{formatCurrency(stats.totalCost)}</StatNumber>
              <StatHelpText>Communication expenses</StatHelpText>
            </Stat>
          </SimpleGrid>
        )}

        <Divider />

        {/* Analytics Tabs */}
        <Tabs>
          <TabList>
            <Tab>Type Distribution</Tab>
            <Tab>Status Distribution</Tab>
            <Tab>Cost Analysis</Tab>
            <Tab>Daily Trends</Tab>
          </TabList>

          <TabPanels>
            {/* Type Distribution */}
            <TabPanel>
              {analytics?.typeDistribution && (
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">
                    Communication Type Distribution
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">SMS</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        {analytics.typeDistribution.sms}
                      </Text>
                    </Box>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">Voice</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {analytics.typeDistribution.voice}
                      </Text>
                    </Box>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">Email</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                        {analytics.typeDistribution.email}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              )}
            </TabPanel>

            {/* Status Distribution */}
            <TabPanel>
              {analytics?.statusDistribution && (
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">
                    Communication Status Distribution
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">Queued</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                        {analytics.statusDistribution.queued}
                      </Text>
                    </Box>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">Sent</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        {analytics.statusDistribution.sent}
                      </Text>
                    </Box>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">Delivered</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {analytics.statusDistribution.delivered}
                      </Text>
                    </Box>
                    <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <Text fontSize="sm" color="gray.500">Failed</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="red.500">
                        {analytics.statusDistribution.failed}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              )}
            </TabPanel>

            {/* Cost Analysis */}
            <TabPanel>
              {costAnalysis && (
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">
                    Cost Analysis
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Stat>
                      <StatLabel>Total Cost</StatLabel>
                      <StatNumber>{formatCurrency(costAnalysis.totalCost)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Average Cost</StatLabel>
                      <StatNumber>{formatCurrency(costAnalysis.averageCost)}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Cost by Type</StatLabel>
                      <VStack align="start" spacing={1}>
                        {Object.entries(costAnalysis.costByType).map(([type, cost]) => (
                          <Text key={type} fontSize="sm">
                            {type.toUpperCase()}: {formatCurrency(cost as number)}
                          </Text>
                        ))}
                      </VStack>
                    </Stat>
                  </SimpleGrid>
                </VStack>
              )}
            </TabPanel>

            {/* Daily Trends */}
            <TabPanel>
              {analytics?.dailyStats && (
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">
                    Daily Communication Trends
                  </Text>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>SMS</Th>
                          <Th>Voice</Th>
                          <Th>Email</Th>
                          <Th>Cost</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {analytics.dailyStats.slice(0, 10).map((day: any) => (
                          <Tr key={day.date}>
                            <Td>{day.date}</Td>
                            <Td>{day.sms}</Td>
                            <Td>{day.voice}</Td>
                            <Td>{day.email}</Td>
                            <Td>{formatCurrency(day.cost)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Search Modal */}
        <Modal isOpen={isSearchModalOpen} onClose={onSearchModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Search Communication Logs</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Communication Type</FormLabel>
                  <Select placeholder="All types">
                    <option value="sms">SMS</option>
                    <option value="voice">Voice</option>
                    <option value="email">Email</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Direction</FormLabel>
                  <Select placeholder="All directions">
                    <option value="outbound">Outbound</option>
                    <option value="inbound">Inbound</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select placeholder="All statuses">
                    <option value="queued">Queued</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Cost Range</FormLabel>
                  <HStack>
                    <Input placeholder="Min cost" type="number" />
                    <Input placeholder="Max cost" type="number" />
                  </HStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onSearchModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue">
                Search
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Export Modal */}
        <Modal isOpen={isExportModalOpen} onClose={onExportModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Export Communication Data</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Export Format</FormLabel>
                  <Select defaultValue="csv">
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="json">JSON</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Date Range</FormLabel>
                  <HStack>
                    <Input type="date" placeholder="From date" />
                    <Input type="date" placeholder="To date" />
                  </HStack>
                </FormControl>
                <FormControl>
                  <FormLabel>Include Fields</FormLabel>
                  <VStack align="start" spacing={2}>
                    {['Type', 'Direction', 'Status', 'Cost', 'Content', 'Timestamp'].map((field) => (
                      <Text key={field} fontSize="sm">
                        ✓ {field}
                      </Text>
                    ))}
                  </VStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onExportModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleExport}>
                Export
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CommunicationAnalytics; 