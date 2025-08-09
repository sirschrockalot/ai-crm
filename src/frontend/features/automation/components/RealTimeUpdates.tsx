// RealTimeUpdates Component
// Handles real-time workflow execution updates with WebSocket and polling fallback

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WorkflowExecution, 
  ExecutionLog,
  Workflow 
} from '../types/automation';
import { automationService } from '../services/automationService';

interface RealTimeUpdatesProps {
  workflowId: string;
  executionId?: string;
  onExecutionUpdate: (execution: WorkflowExecution) => void;
  onConnectionStatusChange: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  className?: string;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  workflowId,
  executionId,
  onExecutionUpdate,
  onConnectionStatusChange,
  className = '',
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(2000);
  const [cache, setCache] = useState<Map<string, any>>(new Map());

  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/automation/${workflowId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for workflow:', workflowId);
        setConnectionStatus('connected');
        onConnectionStatusChange('connected');
        reconnectAttempts.current = 0;
        
        // Subscribe to workflow updates
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe',
            workflowId,
            executionId,
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected for workflow:', workflowId);
        setConnectionStatus('disconnected');
        onConnectionStatusChange('disconnected');
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setConnectionStatus('reconnecting');
          onConnectionStatusChange('reconnecting');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 1000 * reconnectAttempts.current);
        } else {
          // Fall back to polling
          startPolling();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        onConnectionStatusChange('disconnected');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      startPolling();
    }
  }, [workflowId, executionId, onConnectionStatusChange]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'execution_update':
        if (data.execution) {
          const execution = data.execution as WorkflowExecution;
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
          onExecutionUpdate(execution);
          
          // Update logs
          if (execution.logs) {
            setLogs(prev => [...prev, ...execution.logs]);
          }
          
          // Cache execution data
          setCache(prev => new Map(prev.set(`execution_${execution.id}`, execution)));
        }
        break;
        
      case 'log_update':
        if (data.log) {
          const log = data.log as ExecutionLog;
          setLogs(prev => [...prev, log]);
        }
        break;
        
      case 'status_update':
        if (data.status) {
          console.log('Workflow status update:', data.status);
        }
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, [onExecutionUpdate]);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsPolling(true);
    pollingRef.current = setInterval(async () => {
      try {
        if (executionId) {
          const execution = await automationService.getWorkflowExecution(executionId);
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
          onExecutionUpdate(execution);
          
          if (execution.logs) {
            setLogs(prev => [...prev, ...execution.logs]);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, pollingInterval);
  }, [executionId, pollingInterval, onExecutionUpdate]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Handle connection status changes
  const handleConnectionStatusChange = useCallback((status: 'connected' | 'disconnected' | 'reconnecting') => {
    setConnectionStatus(status);
    onConnectionStatusChange(status);
    
    if (status === 'connected') {
      stopPolling();
    } else if (status === 'disconnected' && !isPolling) {
      startPolling();
    }
  }, [onConnectionStatusChange, stopPolling, startPolling, isPolling]);

  // Set polling interval
  const setPollingIntervalMs = useCallback((interval: number) => {
    setPollingInterval(interval);
    if (isPolling) {
      stopPolling();
      startPolling();
    }
  }, [isPolling, stopPolling, startPolling]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Filter logs by level
  const filterLogs = useCallback((level?: 'info' | 'warning' | 'error' | 'debug') => {
    if (!level) return logs;
    return logs.filter(log => log.level === level);
  }, [logs]);

  // Get connection status indicator
  const getConnectionStatusIndicator = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-green-500', text: 'Connected' };
      case 'disconnected':
        return { color: 'bg-red-500', text: 'Disconnected' };
      case 'reconnecting':
        return { color: 'bg-yellow-500', text: 'Reconnecting' };
      default:
        return { color: 'bg-gray-500', text: 'Unknown' };
    }
  };

  // Initialize connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Update connection status handler
  useEffect(() => {
    handleConnectionStatusChange(connectionStatus);
  }, [connectionStatus, handleConnectionStatusChange]);

  return (
    <div className={`real-time-updates ${className}`}>
      {/* Connection Status */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getConnectionStatusIndicator().color}`} />
            <span className="text-sm font-medium text-gray-900">
              {getConnectionStatusIndicator().text}
            </span>
            {isPolling && (
              <span className="text-xs text-gray-500">(Polling fallback)</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Updates: {updateCount}
            </span>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Polling Interval (ms)
            </label>
            <input
              type="number"
              min="1000"
              max="30000"
              step="1000"
              value={pollingInterval}
              onChange={(e) => setPollingIntervalMs(parseInt(e.target.value))}
              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Clear Logs
          </button>
          
          <button
            onClick={() => setUpdateCount(0)}
            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reset Counter
          </button>
        </div>
      </div>

      {/* Real-time Logs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Real-time Logs</h3>
          <p className="text-xs text-gray-500">
            {logs.length} log entries
          </p>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No logs yet. Start a workflow execution to see real-time updates.
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {logs.slice(-20).map((log, index) => (
                <div
                  key={`${log.id}-${index}`}
                  className={`text-xs p-2 rounded ${
                    log.level === 'error' ? 'bg-red-50 text-red-800' :
                    log.level === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    log.level === 'debug' ? 'bg-gray-50 text-gray-800' :
                    'bg-blue-50 text-blue-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      [{log.level.toUpperCase()}] {log.message}
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.nodeId && (
                    <div className="text-gray-600 mt-1">
                      Node: {log.nodeId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cache Information */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Cache Information</h4>
        <div className="text-xs text-gray-600">
          <div>Cached items: {cache.size}</div>
          <div>Memory usage: {Math.round(JSON.stringify(Array.from(cache.entries())).length / 1024)}KB</div>
        </div>
      </div>
    </div>
  );
};
