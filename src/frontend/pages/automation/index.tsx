import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Heading, Text, useDisclosure, useToast, Switch } from '@chakra-ui/react';
import { Sidebar, Header, Navigation, SearchBar } from '../../components/layout';
import { Card, Button, Badge, Table, Modal, ErrorBoundary } from '../../components/ui';
import { WorkflowBuilder, WorkflowExecution } from '../../components/automation';
import { useAutomation } from '../../hooks/useAutomation';
import { Workflow, WorkflowTriggerType, WorkflowPriority } from '../../types';

const AutomationPage: React.FC = () => {
  const {
    workflows,
    loading,
    error,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    executeWorkflow,
    fetchExecutions,
  } = useAutomation();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerTypeFilter, setTriggerTypeFilter] = useState<WorkflowTriggerType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<WorkflowPriority | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<boolean | 'all'>('all');
  const [showExecution, setShowExecution] = useState(false);
  const toast = useToast();

  // Mock data for workflows
  const mockWorkflows: Workflow[] = [
    {
      id: '1',
      name: 'Welcome Email Sequence',
      description: 'Send welcome emails to new leads',
      triggerType: 'automatic',
      triggerCondition: 'Lead status = new',
      actions: [
        { type: 'email', config: { template: 'welcome', delay: '1h' } },
        { type: 'notification', config: { message: 'Welcome email sent' } }
      ],
      isActive: true,
      priority: 'high',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Follow-up Reminder',
      description: 'Send follow-up reminders for contacted leads',
      triggerType: 'scheduled',
      triggerCondition: 'Lead status = contacted AND days since last contact > 3',
      actions: [
        { type: 'email', config: { template: 'follow-up', delay: '3d' } },
        { type: 'sms', config: { message: 'Follow-up reminder sent' } }
      ],
      isActive: true,
      priority: 'medium',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Qualification Check',
      description: 'Automatically qualify leads based on criteria',
      triggerType: 'automatic',
      triggerCondition: 'Lead property value > 100000 AND lead source = website',
      actions: [
        { type: 'status_change', config: { newStatus: 'qualified' } },
        { type: 'notification', config: { message: 'Lead auto-qualified' } }
      ],
      isActive: false,
      priority: 'low',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25')
    }
  ];

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateWorkflow = async (data: any) => {
    try {
      await createWorkflow(data);
      toast({
        title: 'Workflow created successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleUpdateWorkflow = async (data: any) => {
    if (!selectedWorkflow) return;
    try {
      await updateWorkflow(selectedWorkflow.id, data);
      toast({
        title: 'Workflow updated successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating workflow',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflow(id);
      toast({
        title: 'Workflow deleted successfully',
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

  const handleToggleWorkflow = async (id: string) => {
    try {
      const workflow = workflows.find(w => w.id === id);
      if (workflow) {
        await toggleWorkflow(id, !workflow.isActive);
        toast({
          title: 'Workflow status updated',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating workflow status',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTriggerType = triggerTypeFilter === 'all' || workflow.triggerType === triggerTypeFilter;
    const matchesPriority = priorityFilter === 'all' || workflow.priority === priorityFilter;
    const matchesActive = activeFilter === 'all' || workflow.isActive === activeFilter;
    
    return matchesSearch && matchesTriggerType && matchesPriority && matchesActive;
  });

  const getTriggerTypeColor = (type: WorkflowTriggerType) => {
    switch (type) {
      case 'manual': return 'blue';
      case 'automatic': return 'green';
      case 'scheduled': return 'purple';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: WorkflowPriority) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Workflow Name',
      accessor: (workflow: Workflow) => workflow.name,
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (workflow: Workflow) => workflow.description,
    },
    {
      key: 'triggerType',
      header: 'Trigger Type',
      accessor: (workflow: Workflow) => (
        <Badge colorScheme={getTriggerTypeColor(workflow.triggerType)}>
          {workflow.triggerType}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (workflow: Workflow) => (
        <Badge colorScheme={getPriorityColor(workflow.priority)}>
          {workflow.priority}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      accessor: (workflow: Workflow) => (
        <Badge colorScheme={workflow.isActive ? 'green' : 'red'}>
          {workflow.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (workflow: Workflow) => (
        <HStack spacing={2}>
          <Switch
            isChecked={workflow.isActive}
            onChange={() => handleToggleWorkflow(workflow.id)}
            size="sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedWorkflow(workflow);
              onOpen();
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteWorkflow(workflow.id)}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <Box minH="100vh" bg="gray.50">
        <Header />
        <HStack align="flex-start" spacing={0}>
          <Sidebar />
          <Box flex={1} p={6}>
            <Navigation />
            <VStack align="stretch" spacing={6}>
              <HStack justify="space-between">
                <Heading size="lg">Automation Workflows</Heading>
                <Button variant="primary" onClick={onOpen}>
                  Create Workflow
                </Button>
              </HStack>

            {/* Filters */}
            <Card>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Filters</Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setTriggerTypeFilter('all');
                      setPriorityFilter('all');
                      setActiveFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </HStack>
                <HStack spacing={4} wrap="wrap">
                  <SearchBar />
                  <select
                    value={triggerTypeFilter}
                    onChange={(e) => setTriggerTypeFilter(e.target.value as WorkflowTriggerType | 'all')}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Trigger Types</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as WorkflowPriority | 'all')}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <select
                    value={activeFilter === 'all' ? 'all' : activeFilter.toString()}
                    onChange={(e) => setActiveFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </HStack>
              </VStack>
            </Card>

            {/* Stats */}
            <HStack spacing={4}>
              <Card>
                <Text fontSize="sm" color="gray.600">Total Workflows</Text>
                <Text fontSize="2xl" fontWeight="bold">{workflows.length}</Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Active Workflows</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {workflows.filter(w => w.isActive).length}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">Automatic Triggers</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {workflows.filter(w => w.triggerType === 'automatic').length}
                </Text>
              </Card>
              <Card>
                <Text fontSize="sm" color="gray.600">High Priority</Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {workflows.filter(w => w.priority === 'high').length}
                </Text>
              </Card>
            </HStack>

            {/* Workflows Table */}
            <Card header="Workflows">
              {loading ? (
                <Text>Loading workflows...</Text>
              ) : error ? (
                <Text color="red.500">Error loading workflows: {error}</Text>
              ) : (
                <Table
                  data={filteredWorkflows}
                  columns={columns}
                  sortable
                  pagination
                  pageSize={10}
                />
              )}
            </Card>

            {/* Workflow Performance */}
            <Card header="Workflow Performance">
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Recent Executions</Text>
                  <Button size="sm" variant="outline">View All</Button>
                </HStack>
                <VStack align="stretch" spacing={3}>
                  {[
                    { workflow: 'Welcome Email Sequence', status: 'Success', time: '2 minutes ago', executions: 15 },
                    { workflow: 'Follow-up Reminder', status: 'Success', time: '15 minutes ago', executions: 8 },
                    { workflow: 'Qualification Check', status: 'Failed', time: '1 hour ago', executions: 3 },
                    { workflow: 'Welcome Email Sequence', status: 'Success', time: '2 hours ago', executions: 12 },
                  ].map((execution, index) => (
                    <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{execution.workflow}</Text>
                        <Text fontSize="sm" color="gray.500">{execution.time}</Text>
                      </VStack>
                      <HStack spacing={4}>
                        <Badge colorScheme={execution.status === 'Success' ? 'green' : 'red'}>
                          {execution.status}
                        </Badge>
                        <Text fontSize="sm">{execution.executions} executions</Text>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Card>
          </VStack>
        </Box>
      </HStack>

      {/* Workflow Builder Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
        size="xl"
      >
        <WorkflowBuilder
          workflow={selectedWorkflow || undefined}
          onSave={selectedWorkflow ? handleUpdateWorkflow : handleCreateWorkflow}
          onCancel={onClose}
          loading={loading}
        />
      </Modal>

      {/* Workflow Execution Modal */}
      <Modal
        isOpen={showExecution}
        onClose={() => setShowExecution(false)}
        title="Workflow Execution"
        size="xl"
      >
        <WorkflowExecution
          workflow={selectedWorkflow}
          onClose={() => setShowExecution(false)}
        />
      </Modal>
    </Box>
    </ErrorBoundary>
  );
};

export default AutomationPage; 