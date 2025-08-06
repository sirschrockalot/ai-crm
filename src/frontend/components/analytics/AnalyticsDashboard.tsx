import React from 'react';
import { Box, VStack, HStack, Heading, Text, Grid, Select, useToast } from '@chakra-ui/react';
import { Card, Chart, ErrorBoundary } from '../../components/ui';
import { LeadStatus, PropertyType, BuyerType } from '../../types';

interface AnalyticsDashboardProps {
  leads: any[];
  buyers: any[];
  loading: boolean;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  leads,
  buyers,
  loading,
  timeRange,
  onTimeRangeChange,
}) => {
  const toast = useToast();

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
      case 'land': return '#D69E2E';
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

  const handleExport = (type: 'pdf' | 'csv') => {
    try {
      // In a real implementation, this would generate and download the file
      toast({
        title: `${type.toUpperCase()} export started`,
        description: `Analytics data is being exported as ${type.toUpperCase()}`,
        status: 'info',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading analytics data...</Text>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box p={6}>
        <VStack align="stretch" spacing={6}>
          {/* Header */}
          <HStack justify="space-between">
            <Heading size="lg">Analytics Dashboard</Heading>
            <HStack spacing={4}>
              <Select
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value)}
                size="sm"
                maxW="150px"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </Select>
              <HStack spacing={2}>
                <button onClick={() => handleExport('pdf')}>Export PDF</button>
                <button onClick={() => handleExport('csv')}>Export CSV</button>
              </HStack>
            </HStack>
          </HStack>

          {/* Key Metrics */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Card>
              <VStack align="center" spacing={2}>
                <Text fontSize="sm" color="gray.600">Total Leads</Text>
                <Text fontSize="2xl" fontWeight="bold">{totalLeads}</Text>
              </VStack>
            </Card>
            <Card>
              <VStack align="center" spacing={2}>
                <Text fontSize="sm" color="gray.600">Conversion Rate</Text>
                <Text fontSize="2xl" fontWeight="bold">{conversionRate}%</Text>
              </VStack>
            </Card>
            <Card>
              <VStack align="center" spacing={2}>
                <Text fontSize="sm" color="gray.600">Avg Lead Value</Text>
                <Text fontSize="2xl" fontWeight="bold">${averageLeadValue}</Text>
              </VStack>
            </Card>
            <Card>
              <VStack align="center" spacing={2}>
                <Text fontSize="sm" color="gray.600">Pipeline Value</Text>
                <Text fontSize="2xl" fontWeight="bold">${totalPipelineValue.toLocaleString()}</Text>
              </VStack>
            </Card>
            <Card>
              <VStack align="center" spacing={2}>
                <Text fontSize="sm" color="gray.600">Total Buyers</Text>
                <Text fontSize="2xl" fontWeight="bold">{totalBuyers}</Text>
              </VStack>
            </Card>
            <Card>
              <VStack align="center" spacing={2}>
                <Text fontSize="sm" color="gray.600">Active Buyers</Text>
                <Text fontSize="2xl" fontWeight="bold">{activeBuyers}</Text>
              </VStack>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
            <Card header="Lead Status Distribution">
              <Chart
                type="pie"
                data={leadStatusData}
                height={300}
                colors={Object.values(leadStatusData).map(() => getStatusColor('new'))}
              />
            </Card>
            <Card header="Property Type Distribution">
              <Chart
                type="pie"
                data={propertyTypeData}
                height={300}
                colors={Object.values(propertyTypeData).map(() => getPropertyTypeColor('single_family'))}
              />
            </Card>
            <Card header="Monthly Lead Growth">
              <Chart
                type="line"
                data={monthlyLeadGrowth}
                height={300}
                xKey="name"
                yKey="value"
              />
            </Card>
            <Card header="Conversion Rate Over Time">
              <Chart
                type="line"
                data={conversionRateData}
                height={300}
                xKey="name"
                yKey="value"
              />
            </Card>
            <Card header="Buyer Type Distribution">
              <Chart
                type="bar"
                data={buyerTypeData}
                height={300}
                xKey="name"
                yKey="value"
                colors={Object.values(buyerTypeData).map(() => getBuyerTypeColor('individual'))}
              />
            </Card>
          </Grid>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}; 