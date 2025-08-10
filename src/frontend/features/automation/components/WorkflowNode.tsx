// WorkflowNode Component
// Custom React Flow node for workflow elements

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeProps, WorkflowNode as WorkflowNodeType } from '../types/automation';

export const WorkflowNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeType = data.nodeType;
  const label = data.label;
  const isValid = data.isValid;
  const error = data.error;
  const onEdit = data.onEdit;
  const onDelete = data.onDelete;
  const onConnect = data.onConnect;

  // Get node styling based on type
  const getNodeStyle = () => {
    const baseStyle: React.CSSProperties = {
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid',
      minWidth: '150px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };

    switch (nodeType) {
      case 'trigger':
        return {
          ...baseStyle,
          backgroundColor: '#f0fdf4',
          borderColor: '#10b981',
          color: '#065f46',
        };
      case 'action':
        return {
          ...baseStyle,
          backgroundColor: '#eff6ff',
          borderColor: '#3b82f6',
          color: '#1e40af',
        };
      case 'condition':
        return {
          ...baseStyle,
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b',
          color: '#92400e',
        };
      case 'delay':
        return {
          ...baseStyle,
          backgroundColor: '#faf5ff',
          borderColor: '#8b5cf6',
          color: '#5b21b6',
        };
      case 'integration':
        return {
          ...baseStyle,
          backgroundColor: '#f0f9ff',
          borderColor: '#0ea5e9',
          color: '#0c4a6e',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f9fafb',
          borderColor: '#6b7280',
          color: '#374151',
        };
    }
  };

  // Get node icon based on type
  const getNodeIcon = () => {
    switch (nodeType) {
      case 'trigger':
        return '⚡';
      case 'action':
        return '⚙️';
      case 'condition':
        return '🔀';
      case 'delay':
        return '⏰';
      case 'integration':
        return '🔗';
      default:
        return '📦';
    }
  };

  // Get node color for handles
  const getHandleColor = () => {
    switch (nodeType) {
      case 'trigger':
        return '#10b981';
      case 'action':
        return '#3b82f6';
      case 'condition':
        return '#f59e0b';
      case 'delay':
        return '#8b5cf6';
      case 'integration':
        return '#0ea5e9';
      default:
        return '#6b7280';
    }
  };

  const nodeStyle = getNodeStyle();
  const icon = getNodeIcon();
  const handleColor = getHandleColor();

  return (
    <div
      style={{
        ...nodeStyle,
        boxShadow: selected ? '0 0 0 2px #3b82f6' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        opacity: isValid ? 1 : 0.7,
      }}
      className="workflow-node"
    >
      {/* Input Handle (for non-trigger nodes) */}
      {nodeType !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: handleColor,
            border: '2px solid white',
            width: '12px',
            height: '12px',
          }}
        />
      )}

      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-medium uppercase tracking-wide opacity-75">
            {nodeType}
          </span>
        </div>
        
        {/* Node Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit node"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete node"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className="text-center">
        <div className="font-medium text-sm mb-1 truncate" title={label}>
          {label}
        </div>
        
        {/* Error indicator */}
        {!isValid && error && (
          <div className="text-xs text-red-600 mt-1">
            ⚠️ {error}
          </div>
        )}
        
        {/* Status indicator */}
        <div className="flex items-center justify-center mt-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isValid ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs ml-1 opacity-75">
            {isValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
      </div>

      {/* Output Handle (for non-action nodes) */}
      {nodeType !== 'action' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: handleColor,
            border: '2px solid white',
            width: '12px',
            height: '12px',
          }}
        />
      )}

      {/* Connection Points for Conditions */}
      {nodeType === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{
              background: '#10b981',
              border: '2px solid white',
              width: '12px',
              height: '12px',
            }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            style={{
              background: '#ef4444',
              border: '2px solid white',
              width: '12px',
              height: '12px',
            }}
          />
        </>
      )}

      {/* Hover overlay for better UX */}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 transition-all duration-200 rounded-md pointer-events-none" />
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
