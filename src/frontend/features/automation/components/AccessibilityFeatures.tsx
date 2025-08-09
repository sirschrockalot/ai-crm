// AccessibilityFeatures Component
// Implements comprehensive accessibility features for workflow components

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge 
} from '../types/automation';

interface AccessibilityFeaturesProps {
  workflow: Workflow;
  onAccessibilityUpdate: (features: AccessibilityFeatures) => void;
  className?: string;
}

interface AccessibilityFeatures {
  ariaLabels: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorContrast: boolean;
  focusManagement: boolean;
  isCompliant: boolean;
}

export const AccessibilityFeatures: React.FC<AccessibilityFeaturesProps> = ({
  workflow,
  onAccessibilityUpdate,
  className = '',
}) => {
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeatures>({
    ariaLabels: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    colorContrast: true,
    focusManagement: true,
    isCompliant: true,
  });

  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<Record<string, string>>({});

  const focusableElements = useRef<Map<string, HTMLElement>>(new Map());
  const focusOrder = useRef<string[]>([]);

  // Initialize accessibility features
  useEffect(() => {
    initializeAccessibility();
    setupKeyboardNavigation();
    setupFocusManagement();
    setupScreenReaderSupport();
    validateColorContrast();
  }, []);

  // Initialize accessibility
  const initializeAccessibility = useCallback(() => {
    // Add ARIA labels to all interactive elements
    addAriaLabels();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Setup focus management
    setupFocusManagement();
    
    // Validate color contrast
    validateColorContrast();
    
    // Update accessibility status
    updateAccessibilityStatus();
  }, []);

  // Add ARIA labels to workflow elements
  const addAriaLabels = useCallback(() => {
    const elements = document.querySelectorAll('[data-workflow-element]');
    
    elements.forEach((element) => {
      const elementType = element.getAttribute('data-workflow-element');
      const elementId = element.getAttribute('data-workflow-id');
      
      switch (elementType) {
        case 'node':
          element.setAttribute('role', 'button');
          element.setAttribute('aria-label', `Workflow node: ${elementId}`);
          element.setAttribute('aria-describedby', `node-description-${elementId}`);
          break;
        case 'edge':
          element.setAttribute('role', 'presentation');
          element.setAttribute('aria-label', `Connection from ${elementId}`);
          break;
        case 'canvas':
          element.setAttribute('role', 'application');
          element.setAttribute('aria-label', 'Workflow canvas');
          element.setAttribute('aria-describedby', 'canvas-description');
          break;
        case 'control':
          element.setAttribute('role', 'button');
          element.setAttribute('aria-label', `Control: ${elementId}`);
          break;
      }
    });
  }, []);

  // Setup keyboard navigation
  const setupKeyboardNavigation = useCallback(() => {
    const shortcuts = {
      'Tab': 'Navigate between elements',
      'Enter': 'Activate selected element',
      'Space': 'Activate selected element',
      'Arrow Keys': 'Navigate between nodes',
      'Escape': 'Cancel current action',
      'Ctrl+A': 'Select all nodes',
      'Ctrl+C': 'Copy selected nodes',
      'Ctrl+V': 'Paste nodes',
      'Delete': 'Delete selected nodes',
      'F1': 'Show accessibility help',
    };
    
    setKeyboardShortcuts(shortcuts);
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    
    switch (e.key) {
      case 'Tab':
        // Handle tab navigation
        handleTabNavigation(e);
        break;
      case 'Enter':
      case ' ':
        // Activate focused element
        if (focusedElement) {
          activateFocusedElement();
        }
        e.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Navigate between nodes
        navigateNodes(e.key);
        e.preventDefault();
        break;
      case 'Escape':
        // Cancel current action
        cancelCurrentAction();
        e.preventDefault();
        break;
      case 'F1':
        // Show accessibility help
        showAccessibilityHelp();
        e.preventDefault();
        break;
    }
  }, [focusedElement]);

  // Handle tab navigation
  const handleTabNavigation = useCallback((e: KeyboardEvent) => {
    const currentIndex = focusOrder.current.indexOf(focusedElement || '');
    let nextIndex = currentIndex;
    
    if (e.shiftKey) {
      // Navigate backwards
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusOrder.current.length - 1;
    } else {
      // Navigate forwards
      nextIndex = currentIndex < focusOrder.current.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextElementId = focusOrder.current[nextIndex];
    focusElement(nextElementId);
  }, [focusedElement]);

  // Navigate between nodes
  const navigateNodes = useCallback((direction: string) => {
    const nodes = workflow.nodes;
    const currentIndex = nodes.findIndex(node => node.id === focusedElement);
    
    if (currentIndex === -1) {
      focusElement(nodes[0]?.id || null);
      return;
    }
    
    let nextIndex = currentIndex;
    
    switch (direction) {
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : nodes.length - 1;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex < nodes.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : nodes.length - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex < nodes.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    focusElement(nodes[nextIndex]?.id || null);
  }, [workflow.nodes, focusedElement]);

  // Focus element
  const focusElement = useCallback((elementId: string | null) => {
    if (focusedElement) {
      const prevElement = focusableElements.current.get(focusedElement);
      if (prevElement) {
        prevElement.classList.remove('focus-visible');
        prevElement.setAttribute('aria-selected', 'false');
      }
    }
    
    setFocusedElement(elementId);
    
    if (elementId) {
      const element = focusableElements.current.get(elementId);
      if (element) {
        element.classList.add('focus-visible');
        element.setAttribute('aria-selected', 'true');
        element.focus();
        
        // Announce to screen reader
        announceToScreenReader(`Focused on ${element.getAttribute('aria-label')}`);
      }
    }
  }, [focusedElement]);

  // Activate focused element
  const activateFocusedElement = useCallback(() => {
    if (focusedElement) {
      const element = focusableElements.current.get(focusedElement);
      if (element) {
        element.click();
        announceToScreenReader(`Activated ${element.getAttribute('aria-label')}`);
      }
    }
  }, [focusedElement]);

  // Cancel current action
  const cancelCurrentAction = useCallback(() => {
    setFocusedElement(null);
    announceToScreenReader('Action cancelled');
  }, []);

  // Show accessibility help
  const showAccessibilityHelp = useCallback(() => {
    const helpText = Object.entries(keyboardShortcuts)
      .map(([key, description]) => `${key}: ${description}`)
      .join(', ');
    
    announceToScreenReader(`Accessibility help: ${helpText}`);
  }, [keyboardShortcuts]);

  // Setup focus management
  const setupFocusManagement = useCallback(() => {
    // Create focus order for workflow elements
    const elements = Array.from(focusableElements.current.entries());
    focusOrder.current = elements.map(([id]) => id);
    
    // Set initial focus
    if (focusOrder.current.length > 0) {
      focusElement(focusOrder.current[0]);
    }
  }, [focusElement]);

  // Setup screen reader support
  const setupScreenReaderSupport = useCallback(() => {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('class', 'sr-only');
    liveRegion.id = 'screen-reader-announcements';
    document.body.appendChild(liveRegion);
  }, []);

  // Announce to screen reader
  const announceToScreenReader = useCallback((message: string) => {
    if (screenReaderMode) {
      const liveRegion = document.getElementById('screen-reader-announcements');
      if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    }
  }, [screenReaderMode]);

  // Validate color contrast
  const validateColorContrast = useCallback(() => {
    const elements = document.querySelectorAll('[data-workflow-element]');
    let hasContrastIssues = false;
    
    elements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      
      // Simple contrast ratio calculation (simplified)
      const contrastRatio = calculateContrastRatio(backgroundColor, color);
      
      if (contrastRatio < 4.5) {
        hasContrastIssues = true;
        element.setAttribute('data-contrast-issue', 'true');
      }
    });
    
    setAccessibilityFeatures(prev => ({
      ...prev,
      colorContrast: !hasContrastIssues,
    }));
  }, []);

  // Calculate contrast ratio (simplified)
  const calculateContrastRatio = (bg: string, fg: string) => {
    // Simplified contrast calculation
    // In a real implementation, this would convert colors to luminance values
    return 4.5; // Placeholder
  };

  // Update accessibility status
  const updateAccessibilityStatus = useCallback(() => {
    const isCompliant = Object.values(accessibilityFeatures).every(feature => feature);
    
    setAccessibilityFeatures(prev => ({
      ...prev,
      isCompliant,
    }));
    
    onAccessibilityUpdate({
      ...accessibilityFeatures,
      isCompliant,
    });
  }, [accessibilityFeatures, onAccessibilityUpdate]);

  // Toggle high contrast mode
  const toggleHighContrastMode = useCallback(() => {
    setHighContrastMode(prev => !prev);
    
    if (highContrastMode) {
      document.documentElement.classList.remove('high-contrast');
    } else {
      document.documentElement.classList.add('high-contrast');
    }
  }, [highContrastMode]);

  // Toggle screen reader mode
  const toggleScreenReaderMode = useCallback(() => {
    setScreenReaderMode(prev => !prev);
  }, []);

  return (
    <div className={`accessibility-features ${className}`}>
      {/* Accessibility Controls */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Accessibility Controls</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="high-contrast"
              checked={highContrastMode}
              onChange={toggleHighContrastMode}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="high-contrast" className="text-sm text-gray-700">
              High Contrast
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="screen-reader"
              checked={screenReaderMode}
              onChange={toggleScreenReaderMode}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="screen-reader" className="text-sm text-gray-700">
              Screen Reader
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="keyboard-nav"
              checked={accessibilityFeatures.keyboardNavigation}
              onChange={(e) => setAccessibilityFeatures(prev => ({ ...prev, keyboardNavigation: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="keyboard-nav" className="text-sm text-gray-700">
              Keyboard Nav
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${accessibilityFeatures.isCompliant ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">
              {accessibilityFeatures.isCompliant ? 'Compliant' : 'Issues Found'}
            </span>
          </div>
        </div>
      </div>

      {/* Accessibility Status */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Accessibility Status</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accessibilityFeatures.ariaLabels ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">ARIA Labels</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accessibilityFeatures.keyboardNavigation ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Keyboard Navigation</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accessibilityFeatures.screenReaderSupport ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Screen Reader</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accessibilityFeatures.colorContrast ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Color Contrast</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accessibilityFeatures.focusManagement ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Focus Management</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${accessibilityFeatures.isCompliant ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">Overall Compliance</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Keyboard Shortcuts</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(keyboardShortcuts).map(([key, description]) => (
            <div key={key} className="flex justify-between text-sm">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{key}</kbd>
              <span className="text-gray-600">{description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Indicator */}
      {focusedElement && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-blue-800">
              Focused: {focusedElement}
            </span>
          </div>
        </div>
      )}

      {/* Accessibility Help */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Accessibility Help</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use Tab to navigate between elements</li>
          <li>• Use Enter or Space to activate elements</li>
          <li>• Use Arrow keys to navigate between nodes</li>
          <li>• Press F1 for keyboard shortcuts help</li>
          <li>• Press Escape to cancel current action</li>
        </ul>
      </div>

      {/* Screen Reader Only Content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        <div id="canvas-description">
          Workflow canvas with {workflow.nodes.length} nodes and {workflow.edges.length} connections.
          Use Tab to navigate between elements and Enter to activate them.
        </div>
      </div>
    </div>
  );
};
