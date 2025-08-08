import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Heading, Text, Button, useToast, Progress, Badge } from '@chakra-ui/react';
import { Card, ErrorBoundary } from '../../components/ui';
import { Workflow } from '../../types';

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  logs: ExecutionLog[];
}

interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
}

interface WorkflowExecutionProps {
  workflow?: Workflow;
  onClose: () => void;
}

export const WorkflowExecution: React.FC<WorkflowExecutionProps> = ({
  workflow,
  onClose,
}) => {
  const toast = useToast();
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  // Mock execution data
  const mockExecutions: WorkflowExecution[] = [
    {
      id: '1',
      workflowId: workflow?.id || '1',
      workflowName: workflow?.name || 'Welcome Email Sequence',
      status: 'completed',
      progress: 100,
      totalSteps: 3,
      completedSteps: 3,
      failedSteps: 0,
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      completedAt: new Date(Date.now() - 60000), // 1 minute ago
      logs: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 300000),
          level: 'info',
          message: 'Workflow execution started',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 240000),
          level: 'success',
          message: 'Welcome email sent successfully',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 180000),
          level: 'success',
          message: 'Notification sent to team',
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 60000),
          level: 'info',
          message: 'Workflow execution completed',
        },
      ],
    },
    {
      id: '2',
      workflowId: workflow?.id || '1',
      workflowName: workflow?.name || 'Welcome Email Sequence',
      status: 'running',
      progress: 66,
      totalSteps: 3,
      completedSteps: 2,
      failedSteps: 0,
      startedAt: new Date(Date.now() - 120000), // 2 minutes ago
      logs: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 120000),
          level: 'info',
          message: 'Workflow execution started',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000),
          level: 'success',
          message: 'Welcome email sent successfully',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30000),
          level: 'info',
          message: 'Processing notification step...',
        },
      ],
    },
  ];

  useEffect(() => {
    setExecutions(mockExecutions);
  }, [workflow]);

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getLogLevelColor = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      case 'success': return 'green';
      default: return 'gray';
    }
  };

  const handleCancelExecution = (executionId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? { ...exec, status: 'cancelled' as const }
        : exec
    ));
    toast({
      title: 'Execution cancelled',
      status: 'info',
      duration: 3000,
    });
  };

  const handleRetryExecution = (executionId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? { ...exec, status: 'pending' as const, progress: 0, completedSteps: 0, failedSteps: 0 }
        : exec
    ));
    toast({
      title: 'Execution retry started',
      status: 'info',
      duration: 3000,
    });
  };

  return (
    <ErrorBoundary>
      <Box p={6}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Heading size="lg">Workflow Execution</Heading>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </HStack>

          {executions.map((execution) => (
            <Card key={execution.id}>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">{execution.workflowName}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Started {execution.startedAt.toLocaleString()}
                    </Text>
                  </VStack>
                  <Badge colorScheme={getStatusColor(execution.status)}>
                    {execution.status.toUpperCase()}
                  </Badge>
                </HStack>

                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">Progress</Text>
                    <Text fontSize="sm">{execution.progress}%</Text>
                  </HStack>
                  <Progress value={execution.progress} colorScheme={getStatusColor(execution.status)} />
                </Box>

                <HStack justify="space-between" fontSize="sm">
                  <Text>Steps: {execution.completedSteps}/{execution.totalSteps}</Text>
                  <Text>Failed: {execution.failedSteps}</Text>
                  {execution.completedAt && (
                    <Text>Completed: {execution.completedAt.toLocaleString()}</Text>
                  )}
                </HStack>

                {execution.status === 'running' && (
                  <HStack spacing={3}>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleCancelExecution(execution.id)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                )}

                {execution.status === 'failed' && (
                  <HStack spacing={3}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleRetryExecution(execution.id)}
                    >
                      Retry
                    </Button>
                  </HStack>
                )}

                {execution.error && (
                  <Box p={3} bg="red.50" borderRadius="md">
                    <Text fontSize="sm" color="red.600" fontWeight="semibold">Error:</Text>
                    <Text fontSize="sm" color="red.600">{execution.error}</Text>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="semibold" mb={3}>Execution Logs</Text>
                  <VStack align="stretch" spacing={2} maxH="300px" overflow="auto">
                    {execution.logs.map((log) => (
                      <HStack key={log.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Badge size="sm" colorScheme={getLogLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <Text fontSize="sm">{log.message}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {log.timestamp.toLocaleTimeString()}
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </Card>
          ))}

          {executions.length === 0 && (
            <Card>
              <VStack align="center" spacing={4} py={8}>
                <Text color="gray.500">No executions found</Text>
                <Text fontSize="sm" color="gray.400">
                  Workflow executions will appear here when they run
                </Text>
              </VStack>
            </Card>
          )}
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}; 