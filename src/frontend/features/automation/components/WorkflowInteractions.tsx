// WorkflowInteractions Component
// Handles all interactive workflow features including drag/drop, connections, validation, and execution

import React, { useState, useCallback, useRef } from 'react';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowExecution,
  WorkflowTemplate 
} from '../types/automation';
import { useWorkflow } from '../hooks/useWorkflow';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';

interface WorkflowInteractionsProps {
  workflow: Workflow;
  onWorkflowUpdate: (workflow: Workflow) => void;
  onExecutionStart: (execution: WorkflowExecution) => void;
  onExecutionComplete: (execution: WorkflowExecution) => void;
  className?: string;
}

export const WorkflowInteractions: React.FC<WorkflowInteractionsProps> = ({
  workflow,
  onWorkflowUpdate,
  onExecutionStart,
  onExecutionComplete,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  const dragRef = useRef<HTMLDivElement>(null);
  const { validateWorkflow, testWorkflow } = useWorkflow(workflow.id);
  const { executeWorkflow, execution, isPolling } = useWorkflowExecution(workflow.id);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, nodeType: string) => {
    setIsDragging(true);
    setDragSource(nodeType);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, position: { x: number; y: number }) => {
    e.preventDefault();
    setIsDragging(false);
    setDragSource(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: data.type as any,
        position,
        data: {
          label: `New ${data.type}`,
          config: {},
          isValid: false,
        },
      };

      const updatedWorkflow = {
        ...workflow,
        nodes: [...workflow.nodes, newNode],
      };

      onWorkflowUpdate(updatedWorkflow);
    } catch (error) {
      console.error('Error creating node from drop:', error);
    }
  }, [workflow, onWorkflowUpdate]);

  // Handle node connection
  const handleNodeConnect = useCallback((sourceId: string, targetId: string, connectionType?: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: (connectionType as 'default' | 'step' | 'smoothstep') || 'default',
    };

    const updatedWorkflow = {
      ...workflow,
      edges: [...workflow.edges, newEdge],
    };

    onWorkflowUpdate(updatedWorkflow);
  }, [workflow, onWorkflowUpdate]);

  // Handle node disconnection
  const handleNodeDisconnect = useCallback((edgeId: string) => {
    const updatedWorkflow = {
      ...workflow,
      edges: workflow.edges.filter(edge => edge.id !== edgeId),
    };

    onWorkflowUpdate(updatedWorkflow);
  }, [workflow, onWorkflowUpdate]);

  // Handle node configuration
  const handleNodeConfigure = useCallback((nodeId: string, config: any) => {
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...config } }
          : node
      ),
    };

    onWorkflowUpdate(updatedWorkflow);
  }, [workflow, onWorkflowUpdate]);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(node => node.id !== nodeId),
      edges: workflow.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
    };

    onWorkflowUpdate(updatedWorkflow);
  }, [workflow, onWorkflowUpdate]);

  // Validate workflow
  const handleValidateWorkflow = useCallback(async () => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const validation = await validateWorkflow(workflow);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
      } else {
        setValidationErrors([]);
      }
    } catch (error) {
      setValidationErrors(['Validation failed: ' + (error as Error).message]);
    } finally {
      setIsValidating(false);
    }
  }, [workflow, validateWorkflow]);

  // Test workflow
  const handleTestWorkflow = useCallback(async (testData?: Record<string, any>) => {
    try {
      const testResult = await testWorkflow(testData);
      
      if (testResult.success) {
        console.log('Workflow test successful:', testResult.results);
      } else {
        console.error('Workflow test failed:', testResult.logs);
      }
      
      return testResult;
    } catch (error) {
      console.error('Workflow test error:', error);
      throw error;
    }
  }, [testWorkflow]);

  // Execute workflow
  const handleExecuteWorkflow = useCallback(async (parameters?: Record<string, any>) => {
    setExecutionStatus('running');
    
    try {
      const execution = await executeWorkflow(parameters);
      onExecutionStart(execution);
      
      // Monitor execution status
      const checkStatus = () => {
        if (execution.status === 'completed') {
          setExecutionStatus('completed');
          onExecutionComplete(execution);
        } else if (execution.status === 'failed') {
          setExecutionStatus('failed');
          onExecutionComplete(execution);
        } else {
          setTimeout(checkStatus, 1000);
        }
      };
      
      checkStatus();
    } catch (error) {
      setExecutionStatus('failed');
      console.error('Workflow execution error:', error);
    }
  }, [executeWorkflow, onExecutionStart, onExecutionComplete]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleValidateWorkflow();
          break;
        case 't':
          e.preventDefault();
          handleTestWorkflow();
          break;
        case 'e':
          e.preventDefault();
          handleExecuteWorkflow();
          break;
        case 'z':
          e.preventDefault();
          // Undo functionality would go here
          break;
        case 'y':
          e.preventDefault();
          // Redo functionality would go here
          break;
      }
    }
  }, [handleValidateWorkflow, handleTestWorkflow, handleExecuteWorkflow]);

  // Set up keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-validate workflow on changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (workflow.nodes.length > 0) {
        handleValidateWorkflow();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [workflow, handleValidateWorkflow]);

  return (
    <div className={`workflow-interactions ${className}`}>
      {/* Drag and Drop Zone */}
      <div
        ref={dragRef}
        className={`relative w-full h-full min-h-[400px] border-2 border-dashed transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, { x: e.clientX, y: e.clientY })}
      >
        {/* Drop Zone Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center">
            <div className="text-blue-600 text-lg font-medium">
              Drop to create node
            </div>
          </div>
        )}

        {/* Workflow Canvas Content */}
        <div className="p-4">
          {/* Node Palette */}
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Components</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { type: 'trigger', label: 'Trigger', icon: '⚡' },
                { type: 'action', label: 'Action', icon: '⚙️' },
                { type: 'condition', label: 'Condition', icon: '🔀' },
                { type: 'delay', label: 'Delay', icon: '⏰' },
              ].map((component) => (
                <div
                  key={component.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component.type)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-move transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{component.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{component.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Status */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Execution Status */}
          {executionStatus !== 'idle' && (
            <div className={`mb-4 p-4 rounded-lg border ${
              executionStatus === 'running' 
                ? 'bg-blue-50 border-blue-200' 
                : executionStatus === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  executionStatus === 'running' ? 'bg-blue-500 animate-pulse' :
                  executionStatus === 'completed' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {executionStatus === 'running' ? 'Executing workflow...' :
                   executionStatus === 'completed' ? 'Workflow completed successfully' :
                   'Workflow execution failed'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidateWorkflow}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </button>
            
            <button
              onClick={() => handleTestWorkflow()}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Test
            </button>
            
            <button
              onClick={() => handleExecuteWorkflow()}
              disabled={executionStatus === 'running'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Execute
            </button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Ctrl+S: Validate workflow</div>
              <div>Ctrl+T: Test workflow</div>
              <div>Ctrl+E: Execute workflow</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
