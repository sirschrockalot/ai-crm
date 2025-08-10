import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormErrorMessage,
  Textarea,
  SimpleGrid,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from '@chakra-ui/react';
import { FiGitBranch, FiPlus, FiEdit2, FiTrash2, FiEye, FiSave, FiX, FiSettings, FiPlay, FiPause, FiCopy } from 'react-icons/fi';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'task' | 'notification' | 'webhook' | 'delay' | 'condition';
  order: number;
  config: any;
  active: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'lead_created' | 'lead_status_changed' | 'deal_stage_changed' | 'time_based' | 'webhook';
  triggerConfig: any;
  steps: WorkflowStep[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  runCount: number;
}

const WorkflowManagement: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  
  // Form states
  const [createForm, setCreateForm] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    trigger: 'manual',
    triggerConfig: {},
    steps: [],
    active: true,
  });
  
  const [editForm, setEditForm] = useState<Workflow | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [viewWorkflow, setViewWorkflow] = useState<Workflow | null>(null);
  
  const toast = useToast();
  const textColor = useColorModeValue('gray.800', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      // This would call the settings service
      // const workflows = await settingsService.getWorkflows();
      // setWorkflows(workflows);
      
      // Mock data for now
      setWorkflows([
        {
          id: '1',
          name: 'New Lead Welcome',
          description: 'Automatically welcome new leads with email and task creation',
          trigger: 'lead_created',
          triggerConfig: { status: 'new' },
          steps: [
            {
              id: '1-1',
              name: 'Send Welcome Email',
              type: 'email',
              order: 1,
              config: { template: 'welcome_email', delay: 0 },
              active: true,
            },
            {
              id: '1-2',
              name: 'Create Follow-up Task',
              type: 'task',
              order: 2,
              config: { title: 'Follow up with new lead', dueInDays: 2 },
              active: true,
            },
          ],
          active: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastRun: new Date('2024-01-15'),
          runCount: 45,
        },
        {
          id: '2',
          name: 'Deal Stage Follow-up',
          description: 'Automated follow-up when deals move to specific stages',
          trigger: 'deal_stage_changed',
          triggerConfig: { stages: ['proposal', 'negotiation'] },
          steps: [
            {
              id: '2-1',
              name: 'Send Stage Email',
              type: 'email',
              order: 1,
              config: { template: 'stage_followup', delay: 1 },
              active: true,
            },
          ],
          active: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          lastRun: new Date('2024-01-10'),
          runCount: 23,
        },
      ]);
    } catch (error) {
      toast({
        title: 'Error loading workflows',
        description: 'Failed to load workflows',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      setIsSaving(true);
      // This would call the settings service
      // const newWorkflow = await settingsService.createWorkflow(createForm);
      // setWorkflows(prev => [...prev, newWorkflow]);
      
      // Mock creation for now
      const newWorkflow: Workflow = {
        id: Date.now().toString(),
        ...createForm as Workflow,
        createdAt: new Date(),
        updatedAt: new Date(),
        runCount: 0,
      };
      setWorkflows(prev => [...prev, newWorkflow]);
      
      toast({
        title: 'Workflow created',
        description: 'Workflow has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCreateClose();
      setCreateForm({
        name: '',
        description: '',
        trigger: 'manual',
        triggerConfig: {},
        steps: [],
        active: true,
      });
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: 'Failed to create workflow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditWorkflow = async () => {
    if (!editForm) return;
    
    try {
      setIsSaving(true);
      // This would call the settings service
      // const updatedWorkflow = await settingsService.updateWorkflow(editForm.id, editForm);
      // setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
      
      // Mock update for now
      const updatedWorkflow = { ...editForm, updatedAt: new Date() };
      setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
      
      toast({
        title: 'Workflow updated',
        description: 'Workflow has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onEditClose();
      setEditForm(null);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update workflow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    
    try {
      setIsSaving(true);
      // This would call the settings service
      // await settingsService.deleteWorkflow(workflowToDelete.id);
      // setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id));
      
      // Mock deletion for now
      setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id));
      
      toast({
        title: 'Workflow deleted',
        description: 'Workflow has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteClose();
      setWorkflowToDelete(null);
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Failed to delete workflow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWorkflowStatus = async (workflow: Workflow) => {
    try {
      const updatedWorkflow = { ...workflow, active: !workflow.active, updatedAt: new Date() };
      // This would call the settings service
      // await settingsService.updateWorkflow(workflow.id, updatedWorkflow);
      // setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
      
      // Mock update for now
      setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
      
      toast({
        title: `Workflow ${updatedWorkflow.active ? 'activated' : 'deactivated'}`,
        description: `Workflow has been ${updatedWorkflow.active ? 'activated' : 'deactivated'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Status update failed',
        description: 'Failed to update workflow status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openEditModal = (workflow: Workflow) => {
    setEditForm({ ...workflow });
    onEditOpen();
  };

  const openDeleteModal = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
    onDeleteOpen();
  };

  const openViewModal = (workflow: Workflow) => {
    setViewWorkflow(workflow);
    onViewOpen();
  };

  const triggerTypes = [
    { value: 'manual', label: 'Manual Trigger' },
    { value: 'lead_created', label: 'Lead Created' },
    { value: 'lead_status_changed', label: 'Lead Status Changed' },
    { value: 'deal_stage_changed', label: 'Deal Stage Changed' },
    { value: 'time_based', label: 'Time Based' },
    { value: 'webhook', label: 'Webhook' },
  ];

  const stepTypes = [
    { value: 'email', label: 'Send Email' },
    { value: 'sms', label: 'Send SMS' },
    { value: 'task', label: 'Create Task' },
    { value: 'notification', label: 'Send Notification' },
    { value: 'webhook', label: 'Webhook Call' },
    { value: 'delay', label: 'Delay' },
    { value: 'condition', label: 'Condition' },
  ];

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading workflows...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="lg" color={textColor} mb={2}>
          Workflow Management
        </Heading>
        <Text color="gray.600">
          Create and manage automated workflows for lead and deal management
        </Text>
      </Box>

      {/* Create New Workflow Button */}
      <HStack justify="flex-end">
        <Button
          colorScheme="blue"
          leftIcon={<FiPlus />}
          onClick={onCreateOpen}
        >
          Create Workflow
        </Button>
      </HStack>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Automated Workflows</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Workflow Name</Th>
                <Th>Trigger</Th>
                <Th>Steps</Th>
                <Th>Status</Th>
                <Th>Last Run</Th>
                <Th>Run Count</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {workflows.map((workflow) => (
                <Tr key={workflow.id}>
                  <Td>
                    <Text fontWeight="medium">{workflow.name}</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {workflow.description}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" variant="subtle">
                      {triggerTypes.find(t => t.value === workflow.trigger)?.label}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{workflow.steps.length} steps</Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {workflow.active ? (
                        <Badge colorScheme="green">Active</Badge>
                      ) : (
                        <Badge colorScheme="gray">Inactive</Badge>
                      )}
                      <IconButton
                        aria-label="Toggle workflow status"
                        icon={workflow.active ? <FiPause /> : <FiPlay />}
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleWorkflowStatus(workflow)}
                      />
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {workflow.lastRun ? workflow.lastRun.toLocaleDateString() : 'Never'}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{workflow.runCount}</Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="View workflow">
                        <IconButton
                          aria-label="View workflow"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openViewModal(workflow)}
                        />
                      </Tooltip>
                      <Tooltip label="Edit workflow">
                        <IconButton
                          aria-label="Edit workflow"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(workflow)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete workflow">
                        <IconButton
                          aria-label="Delete workflow"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteModal(workflow)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Create Workflow Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Workflow</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Workflow Name</FormLabel>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., New Lead Welcome"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Trigger Type</FormLabel>
                <Select
                  value={createForm.trigger}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, trigger: e.target.value as any }))}
                >
                  {triggerTypes.map((trigger) => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  isChecked={createForm.active}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, active: e.target.checked }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleCreateWorkflow}
              isLoading={isSaving}
            >
              Create Workflow
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Workflow Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Workflow</ModalHeader>
          <ModalBody>
            {editForm && (
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Workflow Name</FormLabel>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="e.g., New Lead Welcome"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Describe what this workflow does"
                    rows={3}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Trigger Type</FormLabel>
                  <Select
                    value={editForm.trigger}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, trigger: e.target.value as any } : null)}
                  >
                    {triggerTypes.map((trigger) => (
                      <option key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch
                    isChecked={editForm.active}
                    onChange={(e) => setEditForm(prev => prev ? { ...prev, active: e.target.checked } : null)}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleEditWorkflow}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Workflow Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Workflow Details</ModalHeader>
          <ModalBody>
            {viewWorkflow && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{viewWorkflow.name}</Text>
                  <Text color="gray.600" mt={1}>{viewWorkflow.description}</Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="semibold" mb={2}>Trigger</Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {triggerTypes.find(t => t.value === viewWorkflow.trigger)?.label}
                  </Badge>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold" mb={2}>Workflow Steps</Text>
                  <OrderedList spacing={2}>
                    {viewWorkflow.steps.map((step) => (
                      <ListItem key={step.id}>
                        <HStack>
                          <Badge colorScheme="green" variant="subtle">
                            {stepTypes.find(t => t.value === step.type)?.label}
                          </Badge>
                          <Text>{step.name}</Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </OrderedList>
                </Box>
                
                <Divider />
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Status</Text>
                    <Text fontSize="sm">
                      {viewWorkflow.active ? 'Active' : 'Inactive'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Run Count</Text>
                    <Text fontSize="sm">{viewWorkflow.runCount}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Last Run</Text>
                    <Text fontSize="sm">
                      {viewWorkflow.lastRun ? viewWorkflow.lastRun.toLocaleDateString() : 'Never'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Created</Text>
                    <Text fontSize="sm">{viewWorkflow.createdAt.toLocaleDateString()}</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Workflow</ModalHeader>
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Are you sure you want to delete the workflow &quot;{workflowToDelete?.name}&quot;? 
                  This action cannot be undone and will stop all automated processes.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={handleDeleteWorkflow}
              isLoading={isSaving}
            >
              Delete Workflow
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default WorkflowManagement;
