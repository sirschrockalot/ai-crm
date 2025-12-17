// WorkflowList Component
// Workflow management interface with search and filtering

import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Tooltip,
  Badge,
  Flex,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Avatar,
  Progress,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiPlay,
  FiPause,
  FiMoreVertical,
  FiEye,
  FiSettings,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiZap,
} from 'react-icons/fi';
import { Workflow, AutomationFilters } from '../types/automation';

interface WorkflowListProps {
  workflows: Workflow[];
  filters?: AutomationFilters;
  onWorkflowSelect: (workflow: Workflow) => void;
  onWorkflowDelete: (workflowId: string) => void;
  onWorkflowDuplicate: (workflowId: string) => void;
  onWorkflowExport: (workflow: Workflow) => void;
  className?: string;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  filters,
  onWorkflowSelect,
  onWorkflowDelete,
  onWorkflowDuplicate,
  onWorkflowExport,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');

  // Filter and sort workflows
  const filteredAndSortedWorkflows = useMemo(() => {
    let filtered = workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && workflow.isActive) ||
                           (statusFilter === 'inactive' && !workflow.isActive);
      const matchesCategory = categoryFilter === 'all' || 
                             workflow.metadata?.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort workflows
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'nodes':
          aValue = a.nodes.length;
          bValue = b.nodes.length;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [workflows, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = workflows.map(w => w.metadata?.category).filter(Boolean);
    return ['all', ...Array.from(new Set(cats))];
  }, [workflows]);

  // Get workflow statistics
  const stats = useMemo(() => {
    return {
      total: workflows.length,
      active: workflows.filter(w => w.isActive).length,
      inactive: workflows.filter(w => !w.isActive).length,
      avgNodes: workflows.length > 0 ? 
        Math.round(workflows.reduce((sum, w) => sum + w.nodes.length, 0) / workflows.length) : 0,
    };
  }, [workflows]);

  const handleWorkflowAction = (workflow: Workflow, action: string) => {
    switch (action) {
      case 'edit':
        onWorkflowSelect(workflow);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
          onWorkflowDelete(workflow.id);
          toast({
            title: 'Workflow Deleted',
            description: `"${workflow.name}" has been deleted`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        break;
      case 'duplicate':
        onWorkflowDuplicate(workflow.id);
        toast({
          title: 'Workflow Duplicated',
          description: `"${workflow.name}" has been duplicated`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'export':
        onWorkflowExport(workflow);
        toast({
          title: 'Workflow Exported',
          description: `"${workflow.name}" has been exported`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        break;
      case 'toggle':
        // TODO: Implement workflow toggle functionality
        toast({
          title: 'Workflow Toggled',
          description: `"${workflow.name}" has been ${workflow.isActive ? 'deactivated' : 'activated'}`,
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        break;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWorkflowIcon = (workflow: Workflow) => {
    const triggerCount = workflow.triggers.length;
    const actionCount = workflow.actions.length;
    
    if (triggerCount > 0 && actionCount > 0) return '⚡';
    if (triggerCount > 0) return '📧';
    if (actionCount > 0) return '🔧';
    return '📋';
  };

  if (workflows.length === 0) {
    return (
      <Card bg={bgColor} shadow="sm">
        <CardBody>
          <VStack spacing={4} p={8} textAlign="center">
            <Box p={4} bg="blue.100" borderRadius="full" color="blue.600">
              <FiZap size={32} />
            </Box>
            <VStack spacing={2}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                No workflows found
              </Text>
              <Text color={subTextColor}>
                Create your first workflow to get started with automation
              </Text>
            </VStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => window.location.href = '/automation/builder'}
            >
              Create Your First Workflow
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with Stats */}
      <Card bg={bgColor} shadow="sm">
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Workflows ({filteredAndSortedWorkflows.length})
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                {stats.active} active • {stats.inactive} inactive • {stats.avgNodes} avg nodes
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="sm"
                onClick={() => window.location.href = '/automation/builder'}
              >
                Create Workflow
              </Button>
            </HStack>
          </Flex>

          {/* Filters */}
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <FiSearch size={16} />
                </InputLeftElement>
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="150px"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                maxW="150px"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </Select>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                maxW="150px"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="nodes">Node Count</option>
              </Select>
              
              <IconButton
                aria-label="Toggle sort order"
                icon={sortOrder === 'asc' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                variant="ghost"
                size="sm"
              />
              
              <IconButton
                aria-label="Toggle view mode"
                icon={viewMode === 'table' ? <FiSettings /> : <FiSettings />}
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                variant="ghost"
                size="sm"
              />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Workflows List */}
      {viewMode === 'table' ? (
        <Card bg={bgColor} shadow="sm">
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Workflow</Th>
                  <Th>Status</Th>
                  <Th>Category</Th>
                  <Th>Nodes</Th>
                  <Th>Last Updated</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAndSortedWorkflows.map((workflow) => (
                  <Tr key={workflow.id} _hover={{ bg: rowHoverBg }}>
                    <Td>
                      <HStack spacing={3}>
                        <Box fontSize="xl">{getWorkflowIcon(workflow)}</Box>
                        <VStack align="flex-start" spacing={1}>
                          <Text fontWeight="semibold" color={textColor}>
                            {workflow.name}
                          </Text>
                          <Text fontSize="sm" color={subTextColor} noOfLines={1}>
                            {workflow.description || 'No description'}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={workflow.isActive ? 'green' : 'gray'} size="sm">
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color={subTextColor}>
                        {workflow.metadata?.category || 'Uncategorized'}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color={textColor}>
                        {workflow.nodes.length} nodes
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color={subTextColor}>
                        {formatDate(workflow.updatedAt)}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tooltip label="Edit workflow">
                          <IconButton
                            aria-label="Edit workflow"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWorkflowAction(workflow, 'edit')}
                          />
                        </Tooltip>
                        
                        <Tooltip label={workflow.isActive ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            aria-label="Toggle workflow"
                            icon={workflow.isActive ? <FiPause /> : <FiPlay />}
                            size="sm"
                            variant="ghost"
                            colorScheme={workflow.isActive ? 'orange' : 'green'}
                            onClick={() => handleWorkflowAction(workflow, 'toggle')}
                          />
                        </Tooltip>
                        
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                          />
                          <MenuList>
                            <MenuItem icon={<FiCopy />} onClick={() => handleWorkflowAction(workflow, 'duplicate')}>
                              Duplicate
                            </MenuItem>
                            <MenuItem icon={<FiDownload />} onClick={() => handleWorkflowAction(workflow, 'export')}>
                              Export
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleWorkflowAction(workflow, 'delete')}>
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        // Grid View
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filteredAndSortedWorkflows.map((workflow) => (
            <Card key={workflow.id} bg={bgColor} shadow="sm" cursor="pointer" _hover={{ shadow: 'md' }}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box fontSize="2xl">{getWorkflowIcon(workflow)}</Box>
                    <Badge colorScheme={workflow.isActive ? 'green' : 'gray'} size="sm">
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </HStack>
                  
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="semibold" color={textColor} noOfLines={1}>
                      {workflow.name}
                    </Text>
                    <Text fontSize="sm" color={subTextColor} noOfLines={2}>
                      {workflow.description || 'No description'}
                    </Text>
                  </VStack>
                  
                  <HStack justify="space-between" fontSize="sm" color={subTextColor}>
                    <Text>{workflow.nodes.length} nodes</Text>
                    <Text>{formatDate(workflow.updatedAt)}</Text>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      flex={1}
                      onClick={() => handleWorkflowAction(workflow, 'edit')}
                    >
                      Edit
                    </Button>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        size="sm"
                        variant="outline"
                      />
                      <MenuList>
                        <MenuItem icon={<FiCopy />} onClick={() => handleWorkflowAction(workflow, 'duplicate')}>
                          Duplicate
                        </MenuItem>
                        <MenuItem icon={<FiDownload />} onClick={() => handleWorkflowAction(workflow, 'export')}>
                          Export
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleWorkflowAction(workflow, 'delete')}>
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};
