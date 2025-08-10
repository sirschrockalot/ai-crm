// PerformanceOptimization Component
// Handles performance optimization for large workflows including virtual rendering and memoization

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge 
} from '../types/automation';

interface PerformanceOptimizationProps {
  workflow: Workflow;
  onPerformanceUpdate: (metrics: PerformanceMetrics) => void;
  className?: string;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  nodeCount: number;
  edgeCount: number;
  fps: number;
  isOptimized: boolean;
}

interface VirtualNode {
  id: string;
  node: WorkflowNode;
  isVisible: boolean;
  position: { x: number; y: number };
}

export const PerformanceOptimization: React.FC<PerformanceOptimizationProps> = ({
  workflow,
  onPerformanceUpdate,
  className = '',
}) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [virtualRendering, setVirtualRendering] = useState(false);
  const [memoizationEnabled, setMemoizationEnabled] = useState(true);
  const [lazyLoadingEnabled, setLazyLoadingEnabled] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    nodeCount: 0,
    edgeCount: 0,
    fps: 60,
    isOptimized: false,
  });

  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Virtual rendering for large workflows
  const virtualNodes = useMemo(() => {
    if (!virtualRendering || workflow.nodes.length < 100) {
      return workflow.nodes.map(node => ({
        id: node.id,
        node,
        isVisible: true,
        position: node.position,
      }));
    }

    // Implement virtual rendering for large workflows
    const viewport = { x: 0, y: 0, width: 1200, height: 800 };
    const nodeSize = 150;
    const buffer = 200;

    return workflow.nodes.map(node => {
      const isInViewport = 
        node.position.x >= viewport.x - buffer &&
        node.position.x <= viewport.x + viewport.width + buffer &&
        node.position.y >= viewport.y - buffer &&
        node.position.y <= viewport.y + viewport.height + buffer;

      return {
        id: node.id,
        node,
        isVisible: isInViewport,
        position: node.position,
      };
    });
  }, [workflow.nodes, virtualRendering]);

  // Memoized node components
  const MemoizedNode = React.memo(({ node }: { node: WorkflowNode }) => {
    const nodeStyle = useMemo(() => ({
      position: 'absolute' as const,
      left: node.position.x,
      top: node.position.y,
      width: 150,
      height: 80,
      backgroundColor: getNodeColor(node.type),
      border: '2px solid',
      borderRadius: '8px',
      padding: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }), [node.position.x, node.position.y, node.type]);

    const handleClick = useCallback(() => {
      console.log('Node clicked:', node.id);
    }, [node.id]);

    return (
      <div style={nodeStyle} onClick={handleClick}>
        <div className="text-sm font-medium truncate">{node.data.label}</div>
        <div className="text-xs opacity-75">{node.type}</div>
      </div>
    );
  });

  // Get node color based on type
  const getNodeColor = useCallback((nodeType: string) => {
    switch (nodeType) {
      case 'trigger': return '#10b981';
      case 'action': return '#3b82f6';
      case 'condition': return '#f59e0b';
      case 'delay': return '#8b5cf6';
      default: return '#6b7280';
    }
  }, []);

  // Lazy loading for heavy components
  const LazyWorkflowCanvas = React.lazy(() => 
    import('./WorkflowCanvas').then(module => ({ default: module.WorkflowCanvas }))
  );

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    renderStartTime.current = performance.now();
    
    // Monitor FPS
    const measureFPS = () => {
      const now = performance.now();
      frameCount.current++;
      
      if (now - lastFrameTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current));
        setPerformanceMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setPerformanceMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  // Memory usage monitoring
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      setPerformanceMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Optimize workflow rendering
  const optimizeWorkflow = useCallback(() => {
    const nodeCount = workflow.nodes.length;
    const edgeCount = workflow.edges.length;
    
    // Enable optimizations for large workflows
    if (nodeCount > 50) {
      setVirtualRendering(true);
    }
    
    if (nodeCount > 100) {
      setMemoizationEnabled(true);
      setLazyLoadingEnabled(true);
    }
    
    const isOptimized = virtualRendering || memoizationEnabled || lazyLoadingEnabled;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      nodeCount,
      edgeCount,
      isOptimized,
    }));
    
    setIsOptimized(isOptimized);
  }, [workflow.nodes.length, workflow.edges.length, virtualRendering, memoizationEnabled, lazyLoadingEnabled]);

  // Debounced optimization
  const debouncedOptimize = useCallback(
    debounce(optimizeWorkflow, 500),
    [optimizeWorkflow]
  );

  // Debounce utility
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Performance monitoring effect
  useEffect(() => {
    startPerformanceMonitoring();
    
    const interval = setInterval(() => {
      measureMemoryUsage();
      measureRenderTime();
      debouncedOptimize();
    }, 1000);

    return () => clearInterval(interval);
  }, [startPerformanceMonitoring, measureMemoryUsage, measureRenderTime, debouncedOptimize]);

  // Update performance metrics
  useEffect(() => {
    onPerformanceUpdate(performanceMetrics);
  }, [performanceMetrics, onPerformanceUpdate]);

  // Virtual rendering viewport
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  const handleViewportChange = useCallback((zoom: number, pan: { x: number; y: number }) => {
    setViewport({ x: pan.x, y: pan.y, zoom });
  }, []);

  return (
    <div className={`performance-optimization ${className}`}>
      {/* Performance Controls */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Performance Optimizations</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="virtual-rendering"
              checked={virtualRendering}
              onChange={(e) => setVirtualRendering(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="virtual-rendering" className="text-sm text-gray-700">
              Virtual Rendering
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="memoization"
              checked={memoizationEnabled}
              onChange={(e) => setMemoizationEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="memoization" className="text-sm text-gray-700">
              Memoization
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="lazy-loading"
              checked={lazyLoadingEnabled}
              onChange={(e) => setLazyLoadingEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="lazy-loading" className="text-sm text-gray-700">
              Lazy Loading
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOptimized ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">
              {isOptimized ? 'Optimized' : 'Not Optimized'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Performance Metrics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">Render Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {performanceMetrics.renderTime.toFixed(2)}ms
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">Memory Usage</div>
            <div className="text-lg font-semibold text-gray-900">
              {performanceMetrics.memoryUsage.toFixed(1)}MB
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">FPS</div>
            <div className="text-lg font-semibold text-gray-900">
              {performanceMetrics.fps}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">Nodes</div>
            <div className="text-lg font-semibold text-gray-900">
              {performanceMetrics.nodeCount}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">Edges</div>
            <div className="text-lg font-semibold text-gray-900">
              {performanceMetrics.edgeCount}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div className={`text-lg font-semibold ${
              performanceMetrics.isOptimized ? 'text-green-600' : 'text-red-600'
            }`}>
              {performanceMetrics.isOptimized ? 'Optimized' : 'Needs Optimization'}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Rendering Viewport */}
      {virtualRendering && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Virtual Rendering Viewport</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">X Position:</span>
              <input
                type="range"
                min="-1000"
                max="1000"
                value={viewport.x}
                onChange={(e) => setViewport(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                className="w-32"
              />
              <span className="text-xs text-gray-600 w-16">{viewport.x}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Y Position:</span>
              <input
                type="range"
                min="-1000"
                max="1000"
                value={viewport.y}
                onChange={(e) => setViewport(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                className="w-32"
              />
              <span className="text-xs text-gray-600 w-16">{viewport.y}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Zoom:</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={viewport.zoom}
                onChange={(e) => setViewport(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                className="w-32"
              />
              <span className="text-xs text-gray-600 w-16">{viewport.zoom.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Workflow Canvas */}
      <div className="relative w-full h-96 border border-gray-200 rounded-lg overflow-hidden">
        {lazyLoadingEnabled ? (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading workflow canvas...</div>
            </div>
          }>
            <LazyWorkflowCanvas
              workflow={workflow}
              nodes={virtualNodes.filter(vn => vn.isVisible).map(vn => vn.node)}
              edges={workflow.edges}
              onNodeAdd={() => {}}
              onNodeEdit={() => {}}
              onNodeDelete={() => {}}
              onEdgeAdd={() => {}}
              onEdgeDelete={() => {}}
              onCanvasChange={handleViewportChange}
            />
          </React.Suspense>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Workflow canvas disabled for performance</div>
          </div>
        )}
      </div>

      {/* Performance Recommendations */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Performance Recommendations</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {performanceMetrics.nodeCount > 100 && (
            <li>• Consider enabling virtual rendering for large workflows</li>
          )}
          {performanceMetrics.renderTime > 16 && (
            <li>• Render time is high, consider optimizing node components</li>
          )}
          {performanceMetrics.memoryUsage > 100 && (
            <li>• Memory usage is high, consider implementing cleanup</li>
          )}
          {performanceMetrics.fps < 30 && (
            <li>• FPS is low, consider reducing animation complexity</li>
          )}
        </ul>
      </div>
    </div>
  );
};
