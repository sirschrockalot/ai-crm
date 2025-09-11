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
  Select,
} from '@chakra-ui/react';
import { FiRefreshCw, FiDownload, FiFilter } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { Card } from '../../components/ui';
import { 
  AutomationStats, 
  AutomationErrorBoundary, 
  AutomationLoading 
} from '../../features/automation';
import { useAutomation } from '../../features/automation/hooks/useAutomation';
import { AutomationFilters } from '../../features/automation/types/automation';

const AutomationStatsPage: React.FC = () => {
  const {
    stats,
    loading,
    error,
    isAuthenticated,
    user,
    loadStats,
    exportAnalytics,
  } = useAutomation();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [filters, setFilters] = useState<AutomationFilters>({
    category: 'all',
    status: 'all',
  });
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadStats(timeRange);
    }
  }, [isAuthenticated, timeRange, loadStats]);

  const handleTimeRangeChange = (range: string) => {
    if (range === 'today' || range === 'week' || range === 'month' || range === 'year') {
      setTimeRange(range);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExportStats = async () => {
    try {
      const exportData = await exportAnalytics({
        timeRange,
        filters,
        format: 'csv',
      });
      
      // Handle the response data - it might be a string or an object with data property
      const csvData = typeof exportData === 'string'
        ? exportData
        : (exportData as any)?.data || JSON.stringify(exportData, null, 2);
      
      // Create download link
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `automation-stats-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Stats exported',
        description: 'Automation statistics have been exported successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error exporting stats',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleRefreshStats = () => {
    loadStats(timeRange);
    toast({
      title: 'Stats refreshed',
      description: 'Automation statistics have been refreshed',
      status: 'success',
      duration: 2000,
    });
  };

  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to access automation statistics.
              </AlertDescription>
            </Alert>
          </Box>
        </HStack>
      </Box>
    );
  }

  if (loading && !error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <AutomationLoading variant="skeleton" message="Loading automation statistics..." />
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <AutomationErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1}>
            <Navigation />
            <VStack align="stretch" spacing={6} p={{ base: 4, md: 6 }}>
              {/* Page Header */}
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg">Automation Statistics</Heading>
                  <Text color="gray.600">
                    Monitor workflow performance and execution metrics
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  <Select
                    value={timeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    size="sm"
                    width="auto"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </Select>
                  <Button
                    leftIcon={<FiFilter />}
                    variant="outline"
                    size="sm"
                  >
                    Filters
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    variant="outline"
                    onClick={handleExportStats}
                    size="sm"
                  >
                    Export
                  </Button>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    variant="outline"
                    onClick={handleRefreshStats}
                    isLoading={loading}
                    size="sm"
                  >
                    Refresh
                  </Button>
                </HStack>
              </HStack>

              {/* Error Display */}
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Error Loading Statistics</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Automation Stats */}
              {stats && (
                <Card>
                  <AutomationStats
                    stats={stats}
                    timeRange={timeRange}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </Card>
              )}

              {/* Empty State */}
              {!loading && !stats && !error && (
                <Card>
                  <VStack spacing={4} p={8} textAlign="center">
                    <Text fontSize="lg" fontWeight="medium" color="gray.600">
                      No statistics available
                    </Text>
                    <Text color="gray.500">
                      Statistics will appear here once you have active workflows
                    </Text>
                    <Button
                      colorScheme="blue"
                      onClick={() => window.location.href = '/automation/workflows'}
                    >
                      View Workflows
                    </Button>
                  </VStack>
                </Card>
              )}
            </VStack>
          </Box>
        </HStack>
      </Box>
    </AutomationErrorBoundary>
  );
};

export default AutomationStatsPage;
