// WorkflowBuilder Component
// Main workflow creation and editing interface with React Flow integration

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  Panel,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import {
  FiSave,
  FiPlay,
  FiPause,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiSettings,
  FiHelpCircle,
} from 'react-icons/fi';

import { 
  WorkflowBuilderProps, 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge,
  WorkflowTemplate 
} from '../types/automation';
import { useWorkflow } from '../hooks/useWorkflow';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowComponents } from './WorkflowComponents';
import { TriggerConfigurator } from './TriggerConfigurator';
import { ActionConfigurator } from './ActionConfigurator';

// Custom node types
import { WorkflowNode as WorkflowNodeComponent } from './WorkflowNode';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  templates,
  onSave,
  onTest,
  onExport,
  onImport,
  className = '',
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showComponents, setShowComponents] = useState(true);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [configuratorType, setConfiguratorType] = useState<'trigger' | 'action' | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  // Convert workflow to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    if (!workflow) return [];
    return workflow.nodes.map(node => ({
      id: node.id,
      type: 'workflowNode',
      position: node.position,
      data: {
        ...node.data,
        nodeType: node.type,
        onEdit: () => handleNodeEdit(node.id),
        onDelete: () => handleNodeDelete(node.id),
        onConnect: (targetId: string) => handleNodeConnect(node.id, targetId),
      },
      sourcePosition: node.sourcePosition,
      targetPosition: node.targetPosition,
    }));
  }, [workflow]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!workflow) return [];
    return workflow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default',
      animated: edge.animated,
      style: edge.style,
    }));
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Handle connections
  const handleConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const newEdge: WorkflowEdge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'default',
        animated: true,
      };
      
      setEdges((prev: Edge[]) => [...prev, newEdge]);
      
      toast({
        title: 'Connection Created',
        description: 'Nodes have been connected successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [setEdges, toast]);

  // Handle node edit
  const handleNodeEdit = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodes.find((n: Node) => n.id === nodeId);
    if (node) {
      const nodeType = node.data?.nodeType;
      if (nodeType === 'trigger') {
        setConfiguratorType('trigger');
      } else if (nodeType === 'action') {
        setConfiguratorType('action');
      }
      setShowConfigurator(true);
    }
  }, [nodes]);

  // Handle node delete
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((prev: Node[]) => prev.filter((node: Node) => node.id !== nodeId));
    setEdges((prev: Edge[]) => prev.filter((edge: Edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    toast({
      title: 'Node Deleted',
      description: 'Node has been removed from the workflow',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [setNodes, setEdges, toast]);

  // Handle node connect
  const handleNodeConnect = useCallback((sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'default',
      animated: true,
    };
    
    setEdges((prev: Edge[]) => [...prev, newEdge]);
  }, [setEdges]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!workflow) return;
    
    setIsSaving(true);
    try {
      // Validate workflow
      const errors = validateWorkflow();
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          title: 'Validation Errors',
          description: 'Please fix the validation errors before saving',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Convert React Flow format back to workflow format
      const updatedWorkflow: Workflow = {
        ...workflow,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data?.nodeType || 'action',
          position: node.position,
          data: node.data,
          sourcePosition: node.sourcePosition,
          targetPosition: node.targetPosition,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default',
          animated: edge.animated,
          style: edge.style,
        })),
        updatedAt: new Date(),
      };

      await onSave(updatedWorkflow);
      
      toast({
        title: 'Workflow Saved',
        description: 'Workflow has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save workflow. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [workflow, nodes, edges, onSave, toast]);

  // Handle test
  const handleTest = useCallback(async () => {
    if (!workflow) return;
    
    setIsTesting(true);
    try {
      await onTest(workflow);
      
      toast({
        title: 'Test Started',
        description: 'Workflow test has been initiated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to start workflow test',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTesting(false);
    }
  }, [workflow, onTest, toast]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!workflow || !onExport) return;
    
    try {
      onExport(workflow);
      
      toast({
        title: 'Workflow Exported',
        description: 'Workflow has been exported successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export workflow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [workflow, onExport, toast]);

  // Handle import
  const handleImport = useCallback(() => {
    if (!onImport) return;
    
    // Create file input for import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedWorkflow = JSON.parse(e.target?.result as string);
            onImport(importedWorkflow);
            
            toast({
              title: 'Workflow Imported',
              description: 'Workflow has been imported successfully',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          } catch (error) {
            toast({
              title: 'Import Failed',
              description: 'Invalid workflow file format',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onImport, toast]);

  // Validate workflow
  const validateWorkflow = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }
    
    // Check for disconnected nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id)) {
        errors.push(`Node "${node.data?.label || node.id}" is not connected`);
      }
    });
    
    // Check for cycles (simple check)
    if (edges.length > nodes.length - 1) {
      errors.push('Workflow contains cycles which are not allowed');
    }
    
    return errors;
  }, [nodes, edges]);

  // Get workflow statistics
  const workflowStats = useMemo(() => {
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      triggers: nodes.filter(node => node.data?.nodeType === 'trigger').length,
      actions: nodes.filter(node => node.data?.nodeType === 'action').length,
      conditions: nodes.filter(node => node.data?.nodeType === 'condition').length,
    };
  }, [nodes, edges]);

  return (
    <Box bg={bgColor} minH="calc(100vh - 200px)" p={4}>
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Box bg={cardBg} p={4} borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                {workflow?.name || 'New Workflow'}
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                {workflowStats.totalNodes} nodes • {workflowStats.totalEdges} connections
              </Text>
            </VStack>
            
            <HStack spacing={2}>
              <Tooltip label="Toggle components panel">
                <IconButton
                  aria-label="Toggle components"
                  icon={showComponents ? <FiEyeOff /> : <FiEye />}
                  onClick={() => setShowComponents(!showComponents)}
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="Toggle minimap">
                <IconButton
                  aria-label="Toggle minimap"
                  icon={showMiniMap ? <FiEyeOff /> : <FiEye />}
                  onClick={() => setShowMiniMap(!showMiniMap)}
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>
              
              <Divider orientation="vertical" h="20px" />
              
              <Tooltip label="Import workflow">
                <IconButton
                  aria-label="Import workflow"
                  icon={<FiUpload />}
                  onClick={handleImport}
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>
              
              <Tooltip label="Export workflow">
                <IconButton
                  aria-label="Export workflow"
                  icon={<FiDownload />}
                  onClick={handleExport}
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>
              
              <Divider orientation="vertical" h="20px" />
              
              <Button
                leftIcon={<FiPlay />}
                colorScheme="green"
                size="sm"
                onClick={handleTest}
                isLoading={isTesting}
                loadingText="Testing..."
              >
                Test
              </Button>
              
              <Button
                leftIcon={<FiSave />}
                colorScheme="blue"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                loadingText="Saving..."
              >
                Save
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <VStack align="flex-start" spacing={1}>
                  {validationErrors.map((error, index) => (
                    <Text key={index} fontSize="sm">• {error}</Text>
                  ))}
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Main Content */}
        <Flex flex={1} gap={4} minH="600px">
          {/* Components Panel */}
          {showComponents && (
            <Box w="300px" bg={cardBg} borderRadius="lg" shadow="sm" p={4}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  Components
                </Text>
                <WorkflowComponents
                  components={[
                    { type: 'trigger', name: 'Email Trigger', description: 'Trigger on email events', icon: '📧', category: 'Triggers' },
                    { type: 'trigger', name: 'Form Submission', description: 'Trigger on form submissions', icon: '📝', category: 'Triggers' },
                    { type: 'action', name: 'Send Email', description: 'Send automated emails', icon: '📤', category: 'Actions' },
                    { type: 'action', name: 'Update Lead', description: 'Update lead information', icon: '👤', category: 'Actions' },
                    { type: 'condition', name: 'If/Then', description: 'Conditional logic', icon: '🔀', category: 'Logic' },
                    { type: 'delay', name: 'Delay', description: 'Add delays to workflow', icon: '⏱️', category: 'Timing' },
                  ]}
                  onComponentSelect={(component) => {
                    console.log('Component selected:', component);
                  }}
                  onComponentAdd={(component) => {
                    console.log('Component added:', component);
                  }}
                />
              </VStack>
            </Box>
          )}

          {/* Workflow Canvas */}
          <Box flex={1} bg={cardBg} borderRadius="lg" shadow="sm" position="relative">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
              >
                <Background />
                <Controls />
                {showMiniMap && <MiniMap />}
                
                {/* Custom Controls */}
                <Panel position="top-right">
                  <HStack spacing={2}>
                    <Tooltip label="Zoom in">
                      <IconButton
                        aria-label="Zoom in"
                        icon={<FiZoomIn />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="Zoom out">
                      <IconButton
                        aria-label="Zoom out"
                        icon={<FiZoomOut />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="Reset view">
                      <IconButton
                        aria-label="Reset view"
                        icon={<FiRotateCcw />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          </Box>

          {/* Configurator Panel */}
          {showConfigurator && (
            <Box w="350px" bg={cardBg} borderRadius="lg" shadow="sm" p={4}>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="md" fontWeight="semibold" color={textColor}>
                    {configuratorType === 'trigger' ? 'Trigger Configuration' : 'Action Configuration'}
                  </Text>
                  <IconButton
                    aria-label="Close configurator"
                    icon={<FiEyeOff />}
                    onClick={() => setShowConfigurator(false)}
                    size="sm"
                    variant="ghost"
                  />
                </Flex>
                
                {configuratorType === 'trigger' && (
                  <TriggerConfigurator
                    trigger={{
                      id: selectedNodeId || '',
                      type: 'email',
                      name: '',
                      description: '',
                      config: {},
                      isEnabled: true,
                    }}
                    availableTriggers={[
                      { type: 'email', name: 'Email Trigger', description: 'Trigger on email events', configSchema: {} },
                      { type: 'form_submission', name: 'Form Submission', description: 'Trigger on form submissions', configSchema: {} },
                    ]}
                    onTriggerChange={(trigger) => {
                      console.log('Trigger changed:', trigger);
                    }}
                  />
                )}
                
                {configuratorType === 'action' && (
                  <ActionConfigurator
                    action={{
                      id: selectedNodeId || '',
                      type: 'send_email',
                      name: '',
                      description: '',
                      config: {},
                      isEnabled: true,
                    }}
                    availableActions={[
                      { type: 'send_email', name: 'Send Email', description: 'Send automated emails', configSchema: {} },
                      { type: 'update_lead', name: 'Update Lead', description: 'Update lead information', configSchema: {} },
                    ]}
                    onActionChange={(action) => {
                      console.log('Action changed:', action);
                    }}
                  />
                )}
              </VStack>
            </Box>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};
