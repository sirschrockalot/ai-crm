import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  useDisclosure,
} from '@chakra-ui/react';
import { FiSave, FiPlay, FiSettings, FiArrowLeft } from 'react-icons/fi';
import { Sidebar, Header, Navigation } from '../../components/layout';
import { Card, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../../components/ui';
import { 
  WorkflowBuilder, 
  AutomationErrorBoundary, 
  AutomationLoading 
} from '../../features/automation';
import { useAutomation } from '../../features/automation/hooks/useAutomation';

const WorkflowBuilderPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    workflows,
    templates,
    loading,
    error,
    isAuthenticated,
    user,
    loadWorkflows,
    loadTemplates,
    createWorkflow,
    updateWorkflow,
    validateWorkflow,
    testWorkflow,
  } = useAutomation();

  const [workflow, setWorkflow] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTemplates();
      if (id && id !== 'new') {
        // Load existing workflow
        const existingWorkflow = workflows.find(w => w.id === id);
        if (existingWorkflow) {
          setWorkflow(existingWorkflow);
        }
      } else {
        // Create new workflow
        setWorkflow({
          name: '',
          description: '',
          isActive: false,
          nodes: [],
          edges: [],
          triggers: [],
          actions: [],
          conditions: [],
          delays: [],
          integrations: [],
          metadata: {
            version: '1.0.0',
            author: user?.id || '',
            tags: [],
            category: 'general',
          },
        });
      }
    }
  }, [isAuthenticated, id, workflows, user, loadTemplates]);

  const handleSaveWorkflow = async (workflowData: any) => {
    setIsSaving(true);
    try {
      if (id && id !== 'new') {
        // Update existing workflow
        await updateWorkflow(id as string, workflowData);
        toast({
          title: 'Workflow updated',
          description: 'Workflow has been successfully updated',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Create new workflow
        const newWorkflow = await createWorkflow(workflowData);
        toast({
          title: 'Workflow created',
          description: 'Workflow has been successfully created',
          status: 'success',
          duration: 3000,
        });
        // Redirect to the new workflow
        router.push(`/automation/builder/${newWorkflow.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error saving workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWorkflow = async (workflowData: any) => {
    setIsTesting(true);
    try {
      const testResult = await testWorkflow(workflowData);
      if (testResult && 'success' in testResult && testResult.success) {
        toast({
          title: 'Workflow test successful',
          description: 'Workflow executed successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Workflow test failed',
          description: (testResult && 'error' in testResult ? testResult.error : null) || 'Workflow execution failed',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error testing workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleValidateWorkflow = async (workflowData: any) => {
    try {
      const validation = await validateWorkflow(workflowData);
      if (validation && 'isValid' in validation && validation.isValid) {
        toast({
          title: 'Workflow validation successful',
          description: 'Workflow configuration is valid',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Handle case where validation might be a Workflow object or validation result
        const errorMessage = validation && 'errors' in validation 
          ? validation.errors.join(', ')
          : 'Workflow validation failed';
        
        toast({
          title: 'Workflow validation failed',
          description: errorMessage,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error validating workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleGoBack = () => {
    router.push('/automation/workflows');
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
                Please log in to access the workflow builder.
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
            <AutomationLoading variant="skeleton" message="Loading workflow builder..." type="workflow" />
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
                  <HStack spacing={3}>
                    <Button
                      leftIcon={<FiArrowLeft />}
                      variant="outline"
                      onClick={handleGoBack}
                      size="sm"
                    >
                      Back to Workflows
                    </Button>
                    <Heading size="lg">
                      {id && id !== 'new' ? 'Edit Workflow' : 'Create New Workflow'}
                    </Heading>
                  </HStack>
                  <Text color="gray.600">
                    {id && id !== 'new' 
                      ? 'Edit your automation workflow configuration'
                      : 'Build a new automation workflow from scratch or templates'
                    }
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiSettings />}
                    variant="outline"
                    onClick={onOpen}
                  >
                    Settings
                  </Button>
                  <Button
                    leftIcon={<FiPlay />}
                    variant="outline"
                    onClick={() => workflow && handleTestWorkflow(workflow)}
                    isLoading={isTesting}
                  >
                    Test Workflow
                  </Button>
                  <Button
                    leftIcon={<FiSave />}
                    colorScheme="blue"
                    onClick={() => workflow && handleSaveWorkflow(workflow)}
                    isLoading={isSaving}
                  >
                    Save Workflow
                  </Button>
                </HStack>
              </HStack>

              {/* Error Display */}
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Error Loading Workflow Builder</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Workflow Builder */}
              {workflow && (
                <Card>
                  <WorkflowBuilder
                    workflow={workflow}
                    templates={templates}
                    onSave={handleSaveWorkflow}
                    onTest={handleTestWorkflow}
                  />
                </Card>
              )}

              {/* Settings Modal */}
              <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Workflow Settings">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Workflow Settings</ModalHeader>
                  <ModalBody>
                    <VStack spacing={4} align="stretch">
                      <Text>Workflow settings and configuration options will be displayed here.</Text>
                      {/* Add workflow settings form here */}
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={onClose}>
                      Save Settings
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </VStack>
          </Box>
        </HStack>
      </Box>
    </AutomationErrorBoundary>
  );
};

export default WorkflowBuilderPage;
