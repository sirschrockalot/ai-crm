import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { useAuth } from '../../contexts/AuthContext';

interface PipelineReport {
  dateRange?: {
    from?: string;
    to?: string;
  };
  countsByStatus: Record<string, number>;
  conversions: {
    contactedToApptSet: number;
    apptSetToUnderContract: number;
  };
}

const PipelineReportPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [report, setReport] = useState<PipelineReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
      
      const headers: Record<string, string> = {};
      
      if (token && !bypassAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!bypassAuth) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('from', fromDate);
      if (toDate) queryParams.append('to', toDate);

      const queryString = queryParams.toString();
      const url = `/api/reports/pipeline${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load report');
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast({
        title: 'Error loading report',
        description: error.message || 'Failed to load pipeline report',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, toast]);

  const handleGenerateReport = () => {
    fetchReport();
  };

  // Set default date range (last 30 days) and fetch report on mount
  React.useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const toDateStr = today.toISOString().split('T')[0];
    const fromDateStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    setToDate(toDateStr);
    setFromDate(fromDateStr);
    
    // Fetch report after dates are set
    const fetchWithDates = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        
        const headers: Record<string, string> = {};
        
        if (token && !bypassAuth) {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (!bypassAuth) {
          return;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('from', fromDateStr);
        queryParams.append('to', toDateStr);

        const url = `/api/reports/pipeline?${queryParams.toString()}`;
        const response = await fetch(url, { headers });

        if (response.ok) {
          const data = await response.json();
          setReport(data);
        }
      } catch (error: any) {
        console.error('Error loading report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWithDates();
  }, []);

  const statusLabels: Record<string, string> = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    APPT_SET: 'Appointment Set',
    OFFER_SENT: 'Offer Sent',
    UNDER_CONTRACT: 'Under Contract',
    DEAD: 'Dead',
    NURTURE: 'Nurture',
    FOLLOW_UP: 'Follow Up',
  };

  const statusOrder = [
    'NEW',
    'CONTACTED',
    'APPT_SET',
    'OFFER_SENT',
    'UNDER_CONTRACT',
    'DEAD',
    'NURTURE',
    'FOLLOW_UP',
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      <Header />
      <HStack align="flex-start" spacing={0}>
        <Sidebar />
        <Box flex={1} p={6}>
          <Navigation />
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Heading size="lg">Pipeline Report</Heading>
                <Text color="gray.600">Lead status counts and conversion metrics</Text>
              </VStack>
              <Button
                leftIcon={<FiRefreshCw />}
                colorScheme="blue"
                onClick={handleGenerateReport}
                isLoading={isLoading}
              >
                Generate Report
              </Button>
            </HStack>

            {/* Date Range Inputs */}
            <Card bg={cardBg}>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>From Date</FormLabel>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>To Date</FormLabel>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {isLoading ? (
              <Flex justify="center" p={8}>
                <Spinner size="xl" />
              </Flex>
            ) : report ? (
              <>
                {/* Status Counts */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Status Counts</Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {statusOrder.map((status) => (
                        <Stat key={status}>
                          <StatLabel>{statusLabels[status] || status}</StatLabel>
                          <StatNumber>{report.countsByStatus[status] || 0}</StatNumber>
                        </Stat>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Conversion Metrics */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4}>Conversion Metrics</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Stat>
                        <StatLabel>Contacted → Appointment Set</StatLabel>
                        <StatNumber>{report.conversions.contactedToApptSet}</StatNumber>
                        <StatHelpText>
                          Leads that moved from CONTACTED to APPT_SET
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Appointment Set → Under Contract</StatLabel>
                        <StatNumber>{report.conversions.apptSetToUnderContract}</StatNumber>
                        <StatHelpText>
                          Leads that moved from APPT_SET to UNDER_CONTRACT
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </>
            ) : (
              <Card bg={cardBg}>
                <CardBody>
                  <Text textAlign="center" color="gray.500" p={8}>
                    No report data. Click "Generate Report" to load data.
                  </Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default PipelineReportPage;
