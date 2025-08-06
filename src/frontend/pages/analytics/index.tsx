import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Heading, Text, Grid, Select } from '@chakra-ui/react';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { Card, Chart, ErrorBoundary } from '../../components/ui';
import { AnalyticsDashboard } from '../../components/analytics';
import { useLeads } from '../../hooks/services/useLeads';
import { useBuyers } from '../../hooks/services/useBuyers';
import { useAnalytics } from '../../hooks/useAnalytics';
import { LeadStatus, PropertyType, BuyerType } from '../../types';

const AnalyticsPage: React.FC = () => {
  const { leads, loading: leadsLoading, fetchLeads } = useLeads();
  const { buyers, loading: buyersLoading, fetchBuyers } = useBuyers();
  const { analyticsData, loading: analyticsLoading, fetchAnalyticsData, exportAnalytics } = useAnalytics();
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeads(), 
        fetchBuyers(),
        fetchAnalyticsData({ timeRange })
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchLeads, fetchBuyers, fetchAnalyticsData, timeRange]);

  // Lead Status Distribution
  const leadStatusData = [
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { name: 'Converted', value: leads.filter(l => l.status === 'converted').length },
    { name: 'Lost', value: leads.filter(l => l.status === 'lost').length },
  ];

  // Property Type Distribution
  const propertyTypeData = [
    { name: 'Single Family', value: leads.filter(l => l.propertyType === 'single_family').length },
    { name: 'Multi Family', value: leads.filter(l => l.propertyType === 'multi_family').length },
    { name: 'Commercial', value: leads.filter(l => l.propertyType === 'commercial').length },
    { name: 'Land', value: leads.filter(l => l.propertyType === 'land').length },
  ];

  // Buyer Type Distribution
  const buyerTypeData = [
    { name: 'Individual', value: buyers.filter(b => b.buyerType === 'individual').length },
    { name: 'Company', value: buyers.filter(b => b.buyerType === 'company').length },
    { name: 'Investor', value: buyers.filter(b => b.buyerType === 'investor').length },
  ];

  // Monthly Lead Growth (mock data)
  const monthlyLeadGrowth = [
    { name: 'Jan', value: 45 },
    { name: 'Feb', value: 52 },
    { name: 'Mar', value: 48 },
    { name: 'Apr', value: 67 },
    { name: 'May', value: 73 },
    { name: 'Jun', value: 89 },
    { name: 'Jul', value: 95 },
    { name: 'Aug', value: 102 },
    { name: 'Sep', value: 87 },
    { name: 'Oct', value: 113 },
    { name: 'Nov', value: 128 },
    { name: 'Dec', value: 145 },
  ];

  // Conversion Rate Over Time (mock data)
  const conversionRateData = [
    { name: 'Jan', value: 12.5 },
    { name: 'Feb', value: 14.2 },
    { name: 'Mar', value: 13.8 },
    { name: 'Apr', value: 16.1 },
    { name: 'May', value: 15.7 },
    { name: 'Jun', value: 18.3 },
    { name: 'Jul', value: 17.9 },
    { name: 'Aug', value: 19.2 },
    { name: 'Sep', value: 18.7 },
    { name: 'Oct', value: 20.1 },
    { name: 'Nov', value: 21.5 },
    { name: 'Dec', value: 22.8 },
  ];

  // Calculate key metrics
  const totalLeads = leads.length;
  const totalBuyers = buyers.length;
  const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.status === 'converted').length / totalLeads) * 100).toFixed(1) : '0';
  const averageLeadValue = totalLeads > 0 ? (leads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / totalLeads).toFixed(0) : '0';
  const totalPipelineValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const activeBuyers = buyers.filter(b => b.isActive).length;

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return '#3182CE';
      case 'contacted': return '#D69E2E';
      case 'qualified': return '#38A169';
      case 'converted': return '#805AD5';
      case 'lost': return '#E53E3E';
      default: return '#718096';
    }
  };

  const getPropertyTypeColor = (type: PropertyType) => {
    switch (type) {
      case 'single_family': return '#3182CE';
      case 'multi_family': return '#38A169';
      case 'commercial': return '#805AD5';
      case 'land': return '#DD6B20';
      default: return '#718096';
    }
  };

  const getBuyerTypeColor = (type: BuyerType) => {
    switch (type) {
      case 'individual': return '#3182CE';
      case 'company': return '#38A169';
      case 'investor': return '#805AD5';
      default: return '#718096';
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Text>Loading analytics...</Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <AnalyticsDashboard
              leads={leads}
              buyers={buyers}
              loading={loading || leadsLoading || buyersLoading || analyticsLoading}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </Box>
        </HStack>
      </Box>
    </ErrorBoundary>
  );
};

export default AnalyticsPage; 