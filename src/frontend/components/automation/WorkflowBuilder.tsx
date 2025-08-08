import React, { useState } from 'react';
import { Box, VStack, HStack, Heading, Text, Button, useToast, Select, Input, Textarea } from '@chakra-ui/react';
import { Card, ErrorBoundary } from '../../components/ui';
import { Workflow, WorkflowAction } from '../../types';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave: (workflow: Partial<Workflow>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onSave,
  onCancel,
  loading = false,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<Partial<Workflow>>({
    name: workflow?.name || '',
    description: workflow?.description || '',
    triggerType: workflow?.triggerType || 'automatic',
    triggerCondition: workflow?.triggerCondition || '',
    actions: workflow?.actions || [],
    isActive: workflow?.isActive ?? true,
    priority: workflow?.priority || 'medium',
  });

  const [newAction, setNewAction] = useState({
    type: 'email',
    config: { template: '', delay: '' }
  });

  const handleInputChange = (field: keyof Workflow, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAction = () => {
    if (newAction.type && newAction.config.template) {
      const action: WorkflowAction = {
        type: newAction.type as WorkflowAction['type'],
        config: newAction.config
      };
      setFormData(prev => ({
        ...prev,
        actions: [...(prev.actions || []), action]
      }));
      setNewAction({ type: 'email', config: { template: '', delay: '' } });
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.triggerCondition) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    onSave(formData);
  };

  return (
    <ErrorBoundary>
      <Box p={6}>
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">
            {workflow ? 'Edit Workflow' : 'Create New Workflow'}
          </Heading>

          <Card>
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="semibold">Basic Information</Text>
              
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontSize="sm" mb={1}>Workflow Name *</Text>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter workflow name"
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" mb={1}>Description *</Text>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this workflow does"
                    rows={3}
                  />
                </Box>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="sm" mb={1}>Trigger Type</Text>
                    <Select
                      value={formData.triggerType}
                      onChange={(e) => handleInputChange('triggerType', e.target.value)}
                    >
                      <option value="automatic">Automatic</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="manual">Manual</option>
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <Text fontSize="sm" mb={1}>Priority</Text>
                    <Select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </Box>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          <Card>
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="semibold">Trigger Conditions</Text>
              
              <Box>
                <Text fontSize="sm" mb={1}>Trigger Condition *</Text>
                <Textarea
                  value={formData.triggerCondition}
                  onChange={(e) => handleInputChange('triggerCondition', e.target.value)}
                  placeholder="e.g., Lead status = new AND lead source = website"
                  rows={3}
                />
              </Box>
            </VStack>
          </Card>

          <Card>
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="semibold">Actions</Text>
              
              {formData.actions?.map((action, index) => (
                <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">{action.type}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {action.config.template || 'No details'}
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => handleRemoveAction(index)}
                  >
                    Remove
                  </Button>
                </HStack>
              ))}

              <VStack align="stretch" spacing={3} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold">Add New Action</Text>
                
                <HStack spacing={3}>
                  <Box flex={1}>
                    <Text fontSize="sm" mb={1}>Action Type</Text>
                    <Select
                      value={newAction.type}
                      onChange={(e) => setNewAction(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="notification">Notification</option>
                      <option value="status_change">Status Change</option>
                      <option value="assignment">Assignment</option>
                    </Select>
                  </Box>

                  <Box flex={2}>
                    <Text fontSize="sm" mb={1}>Configuration</Text>
                    <Input
                      value={newAction.config.template || ''}
                      onChange={(e) => setNewAction(prev => ({
                        ...prev,
                        config: { ...prev.config, template: e.target.value }
                      }))}
                      placeholder="Template name or configuration"
                    />
                  </Box>

                  <Box flex={1}>
                    <Text fontSize="sm" mb={1}>Delay (optional)</Text>
                    <Input
                      value={newAction.config.delay || ''}
                      onChange={(e) => setNewAction(prev => ({
                        ...prev,
                        config: { ...prev.config, delay: e.target.value }
                      }))}
                      placeholder="1h, 1d, etc."
                    />
                  </Box>
                </HStack>

                <Button
                  size="sm"
                  onClick={handleAddAction}
                  isDisabled={!newAction.type || !newAction.config.template}
                >
                  Add Action
                </Button>
              </VStack>
            </VStack>
          </Card>

          <HStack justify="flex-end" spacing={3}>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={loading}
              isDisabled={!formData.name || !formData.description || !formData.triggerCondition}
            >
              {workflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </ErrorBoundary>
  );
}; 