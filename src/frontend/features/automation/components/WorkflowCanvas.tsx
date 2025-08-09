// WorkflowCanvas Component
// Enhanced React Flow canvas with additional controls and functionality

import React, { useCallback, useRef } from 'react';
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
  useReactFlow,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { 
  WorkflowCanvasProps, 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge 
} from '../types/automation';

// Custom node types
import { WorkflowNode as WorkflowNodeComponent } from './WorkflowNode';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  nodes: initialNodes,
  edges: initialEdges,
  onNodeAdd,
  onNodeEdit,
  onNodeDelete,
  onEdgeAdd,
  onEdgeDelete,
  onCanvasChange,
  className = '',
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut, setViewport } = useReactFlow();

  // Convert workflow nodes to React Flow format
  const reactFlowNodes: Node[] = initialNodes.map(node => ({
    id: node.id,
    type: 'workflowNode',
    position: node.position,
    data: {
      ...node.data,
      nodeType: node.type,
      onEdit: () => onNodeEdit(node.id, {}),
      onDelete: () => onNodeDelete(node.id),
      onConnect: (targetId: string) => {
        const newEdge: WorkflowEdge = {
          id: `edge-${Date.now()}`,
          source: node.id,
          target: targetId,
          type: 'default',
        };
        onEdgeAdd(newEdge);
      },
    },
    sourcePosition: node.sourcePosition,
    targetPosition: node.targetPosition,
  }));

  const reactFlowEdges: Edge[] = initialEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'default',
    animated: edge.animated,
    style: edge.style,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Handle node changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Handle edge connection
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const newEdge: WorkflowEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'default',
    };
    
    onEdgeAdd(newEdge);
    setEdges(prev => [...prev, newEdge]);
  }, [onEdgeAdd, setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Handle node selection logic here
    console.log('Node clicked:', node.id);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    // Handle edge selection logic here
    console.log('Edge clicked:', edge.id);
  }, []);

  // Handle canvas viewport changes
  const onMove = useCallback((event: any, viewport: Viewport) => {
    onCanvasChange?.(viewport.zoom, { x: viewport.x, y: viewport.y });
  }, [onCanvasChange]);

  // Handle zoom changes
  const onZoom = useCallback((event: any, viewport: Viewport) => {
    onCanvasChange?.(viewport.zoom, { x: viewport.x, y: viewport.y });
  }, [onCanvasChange]);

  // Custom controls
  const CustomControls = () => (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => zoomIn()}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        
        <button
          onClick={() => zoomOut()}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        
        <button
          onClick={() => fitView()}
          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          title="Fit View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        
        <button
          onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          title="Reset View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Mini map with custom styling
  const CustomMiniMap = () => (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
      <MiniMap
        nodeColor={(node) => {
          switch (node.data?.nodeType) {
            case 'trigger':
              return '#10B981';
            case 'action':
              return '#3B82F6';
            case 'condition':
              return '#F59E0B';
            case 'delay':
              return '#8B5CF6';
            default:
              return '#6B7280';
          }
        }}
        nodeStrokeWidth={3}
        zoomable
        pannable
      />
    </div>
  );

  return (
    <div className={`workflow-canvas ${className}`} ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onMove={onMove}
          onZoom={onZoom}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background />
          <Controls />
          <CustomControls />
          <CustomMiniMap />
          
          {/* Status Panel */}
          <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
            <div className="text-sm text-gray-600">
              <div>Nodes: {nodes.length}</div>
              <div>Edges: {edges.length}</div>
              <div>Zoom: {Math.round((window as any).reactFlowInstance?.getViewport().zoom * 100)}%</div>
            </div>
          </Panel>

          {/* Instructions Panel */}
          <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-2">Instructions:</div>
              <div>• Drag nodes to move them</div>
              <div>• Connect nodes by dragging from handles</div>
              <div>• Double-click nodes to edit</div>
              <div>• Use mouse wheel to zoom</div>
            </div>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
