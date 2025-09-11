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
} from '@chakra-ui/react';
import { FiPlus, FiFilter, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { ErrorBoundary, Card, Loading } from '../../components/ui';
import { 
  WorkflowList, 
  AutomationErrorBoundary, 
  AutomationLoading 
} from '../../features/automation';
import { useAutomation } from '../../features/automation/hooks/useAutomation';
import { AutomationFilters } from '../../features/automation/types/automation';

const WorkflowsPage: React.FC = () => {
  const {
    workflows,
    loading,
    error,
    isAuthenticated,
    user,
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    exportWorkflow,
    updateFilters,
  } = useAutomation();

  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [filters, setFilters] = useState<AutomationFilters>({
    status: 'all',
    category: 'all',
    search: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkflows();
    }
  }, [isAuthenticated, loadWorkflows]);

  const handleWorkflowSelect = (workflow: any) => {
    setSelectedWorkflow(workflow);
  };

  const handleWorkflowDelete = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      toast({
        title: 'Workflow deleted',
        description: 'Workflow has been successfully deleted',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error deleting workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleWorkflowDuplicate = async (workflowId: string) => {
    try {
      await duplicateWorkflow(workflowId);
      toast({
        title: 'Workflow duplicated',
        description: 'Workflow has been successfully duplicated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error duplicating workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleWorkflowExport = async (workflow: any) => {
    try {
      const exportData = await exportWorkflow(workflow.id);
      // Handle the response data - it might be a string or an object with data property
      const jsonData = typeof exportData === 'string'
        ? exportData
        : (exportData as any)?.workflow || JSON.stringify(exportData, null, 2);
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Workflow exported',
        description: 'Workflow has been successfully exported',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error exporting workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    updateFilters(newFilters);
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
                Please log in to access automation workflows.
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
            <AutomationLoading variant="skeleton" message="Loading workflows..." />
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
                  <Heading size="lg">Workflow Management</Heading>
                  <Text color="gray.600">
                    Create, manage, and monitor your automation workflows
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    variant="outline"
                    onClick={() => loadWorkflows()}
                    isLoading={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => window.location.href = '/automation/builder'}
                  >
                    Create Workflow
                  </Button>
                </HStack>
              </HStack>

              {/* Error Display */}
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Error Loading Workflows</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Workflow List */}
              <Card>
                <WorkflowList
                  workflows={workflows}
                  filters={filters}
                  onWorkflowSelect={handleWorkflowSelect}
                  onWorkflowDelete={handleWorkflowDelete}
                  onWorkflowDuplicate={handleWorkflowDuplicate}
                  onWorkflowExport={handleWorkflowExport}
                />
              </Card>

              {/* Empty State */}
              {!loading && workflows.length === 0 && !error && (
                <Card>
                  <VStack spacing={4} p={8} textAlign="center">
                    <Text fontSize="lg" fontWeight="medium" color="gray.600">
                      No workflows found
                    </Text>
                    <Text color="gray.500">
                      Create your first workflow to get started with automation
                    </Text>
                    <Button
                      leftIcon={<FiPlus />}
                      colorScheme="blue"
                      onClick={() => window.location.href = '/automation/builder'}
                    >
                      Create Your First Workflow
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

export default WorkflowsPage;
