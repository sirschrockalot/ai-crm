import React, { useState, useEffect } from 'react';
import { Box, Grid, Heading, Text, VStack, HStack, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import { Sidebar, Header, Navigation, SearchBar } from '../components/layout';
import { Card, Button, Badge, Chart, ErrorBoundary } from '../components/ui';
import { DashboardOverview, DashboardCharts } from '../components/dashboard';
import { useDashboard } from '../hooks/useDashboard';

const DashboardPage: React.FC = () => {
  const {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    refreshDashboard,
  } = useDashboard();

  // Mock data for demonstration
  const mockStats = {
    totalLeads: 1234,
    conversionRate: 12.5,
    activeBuyers: 89,
    revenue: 45678,
    leadGrowth: 23.36,
    conversionGrowth: 5.2,
    buyerGrowth: -2.1,
    revenueGrowth: 18.7,
  };

  const mockLeadPipelineData = [
    { name: 'New Leads', value: 45, color: '#2196f3' },
    { name: 'Contacted', value: 32, color: '#ff9800' },
    { name: 'Qualified', value: 28, color: '#4caf50' },
    { name: 'Converted', value: 15, color: '#9c27b0' },
  ];

  const mockMonthlyGrowthData = [
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 35 },
    { name: 'Apr', value: 60 },
    { name: 'May', value: 50 },
    { name: 'Jun', value: 75 },
  ];

  const mockConversionTrendData = [
    { name: 'Jan', value: 8.5 },
    { name: 'Feb', value: 10.2 },
    { name: 'Mar', value: 12.1 },
    { name: 'Apr', value: 11.8 },
    { name: 'May', value: 13.5 },
    { name: 'Jun', value: 12.5 },
  ];

  const mockRevenueData = [
    { name: 'Jan', value: 25000 },
    { name: 'Feb', value: 32000 },
    { name: 'Mar', value: 28000 },
    { name: 'Apr', value: 45000 },
    { name: 'May', value: 38000 },
    { name: 'Jun', value: 52000 },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            
            {/* Dashboard Overview */}
            <DashboardOverview
              stats={mockStats}
              loading={loading}
              onRefresh={refreshDashboard}
            />

            {/* Dashboard Charts */}
            <DashboardCharts
              leadPipelineData={mockLeadPipelineData}
              monthlyGrowthData={mockMonthlyGrowthData}
              conversionTrendData={mockConversionTrendData}
              revenueData={mockRevenueData}
              loading={loading}
            />
          </Box>
        </HStack>
      </Box>
    </ErrorBoundary>
  );
};

export default DashboardPage; 