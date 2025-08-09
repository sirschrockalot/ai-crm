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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { FiDownload, FiRefreshCw, FiSearch, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { LeadAnalytics } from '../../features/lead-management/components/LeadAnalytics';
import { Lead } from '../../features/lead-management/types/lead';
import { useLeads } from '../../hooks/services/useLeads';

const LeadAnalyticsPage: React.FC = () => {
  const toast = useToast();
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    leads,
    loading,
    error,
    isAuthenticated,
    user,
    fetchLeads,
    getLeadStats,
  } = useLeads();

  // Fetch leads on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated, fetchLeads]);

  const handleRefresh = () => {
    fetchLeads();
    toast({
      title: 'Analytics Refreshed',
      description: 'Analytics data has been updated',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExport = () => {
    // TODO: Implement analytics export
    toast({
      title: 'Export Analytics',
      description: 'Analytics export functionality coming soon...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Calculate analytics data
  const analyticsData = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.status === 'new').length,
    contactedLeads: leads.filter(lead => lead.status === 'contacted').length,
    qualifiedLeads: leads.filter(lead => lead.status === 'qualified').length,
    convertedLeads: leads.filter(lead => lead.status === 'converted').length,
    lostLeads: leads.filter(lead => lead.status === 'lost').length,
    totalValue: leads.reduce((sum, lead) => sum + lead.estimatedValue, 0),
    avgValue: leads.length > 0 ? leads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / leads.length : 0,
    conversionRate: leads.length > 0 ? (leads.filter(lead => lead.status === 'converted').length / leads.length) * 100 : 0,
  };

  // Calculate trends (mock data for now)
  const trends = {
    totalLeads: { value: 12, direction: 'increase' as const },
    conversionRate: { value: 8.5, direction: 'increase' as const },
    avgValue: { value: 15.2, direction: 'decrease' as const },
    responseTime: { value: 5.3, direction: 'increase' as const },
  };

  // Property type distribution
  const propertyTypeStats = leads.reduce((acc, lead) => {
    acc[lead.propertyType] = (acc[lead.propertyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Status distribution
  const statusStats = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Show authentication error
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
                  Please log in to access lead analytics features.
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
            {/* Breadcrumb */}
            <Breadcrumb fontSize="sm" color="gray.600">
              <BreadcrumbItem>
                <BreadcrumbLink href="/leads">Leads</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Analytics</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Page Header */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                  Lead Analytics
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Comprehensive insights into your lead performance
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  size="sm"
                  maxW="120px"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </Select>
                <Button
                  leftIcon={<FiRefreshCw />}
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  isLoading={loading}
                >
                  Refresh
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  Export
                </Button>
              </HStack>
            </HStack>

            {/* Error Display */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Error Loading Analytics</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Key Metrics */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Leads</StatLabel>
                    <StatNumber>{analyticsData.totalLeads}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={trends.totalLeads.direction} />
                      {trends.totalLeads.value}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Conversion Rate</StatLabel>
                    <StatNumber>{analyticsData.conversionRate.toFixed(1)}%</StatNumber>
                    <StatHelpText>
                      <StatArrow type={trends.conversionRate.direction} />
                      {trends.conversionRate.value}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Avg Lead Value</StatLabel>
                    <StatNumber>${analyticsData.avgValue.toLocaleString()}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={trends.avgValue.direction} />
                      {trends.avgValue.value}%
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Pipeline Value</StatLabel>
                    <StatNumber>${analyticsData.totalValue.toLocaleString()}</StatNumber>
                                         <StatHelpText>
                       <StatArrow type="increase" />
                       12.5%
                     </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Lead Status Distribution */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Lead Status Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    {PIPELINE_COLUMNS.map((status) => {
                      const count = statusStats[status.id] || 0;
                      const percentage = analyticsData.totalLeads > 0 ? (count / analyticsData.totalLeads) * 100 : 0;
                      
                      return (
                        <Box key={status.id} w="full">
                          <HStack justify="space-between" mb={2}>
                            <HStack>
                              <Badge colorScheme={status.id === 'new' ? 'blue' : 
                                                 status.id === 'contacted' ? 'yellow' : 
                                                 status.id === 'qualified' ? 'orange' : 
                                                 status.id === 'converted' ? 'green' : 'red'}>
                                {status.title}
                              </Badge>
                              <Text fontSize="sm" fontWeight="semibold">
                                {count}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {percentage.toFixed(1)}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={percentage} 
                            colorScheme={status.id === 'new' ? 'blue' : 
                                       status.id === 'contacted' ? 'yellow' : 
                                       status.id === 'qualified' ? 'orange' : 
                                       status.id === 'converted' ? 'green' : 'red'}
                            size="sm"
                          />
                        </Box>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Property Type Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    {Object.entries(propertyTypeStats).map(([type, count]) => {
                      const percentage = analyticsData.totalLeads > 0 ? (count / analyticsData.totalLeads) * 100 : 0;
                      
                      return (
                        <Box key={type} w="full">
                          <HStack justify="space-between" mb={2}>
                            <HStack>
                              <Badge colorScheme="gray">
                                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              <Text fontSize="sm" fontWeight="semibold">
                                {count}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {percentage.toFixed(1)}%
                            </Text>
                          </HStack>
                          <Progress value={percentage} colorScheme="gray" size="sm" />
                        </Box>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Analytics Charts */}
            <LeadAnalytics
              leads={leads}
              dateRange={dateRange}
              loading={loading}
            />

            {/* Top Performing Leads */}
            <Card>
              <CardHeader>
                <Heading size="md">Top Performing Leads</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Lead</Th>
                        <Th>Status</Th>
                        <Th>Property Type</Th>
                        <Th>Value</Th>
                        <Th>Created</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {leads
                        .sort((a, b) => b.estimatedValue - a.estimatedValue)
                        .slice(0, 10)
                        .map((lead) => (
                          <Tr key={lead.id}>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold">
                                  {lead.firstName} {lead.lastName}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {lead.email}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  lead.status === 'new' ? 'blue' :
                                  lead.status === 'contacted' ? 'yellow' :
                                  lead.status === 'qualified' ? 'orange' :
                                  lead.status === 'converted' ? 'green' :
                                  'red'
                                }
                              >
                                {lead.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {lead.propertyType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="semibold">
                                ${lead.estimatedValue.toLocaleString()}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

const PIPELINE_COLUMNS = [
  { id: 'new', title: 'New' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'converted', title: 'Converted' },
  { id: 'lost', title: 'Lost' },
];

export default LeadAnalyticsPage;
