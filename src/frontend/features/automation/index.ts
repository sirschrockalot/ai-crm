// Automation feature barrel export
// This file exports all automation components and utilities

// Export automation components
export { WorkflowBuilder } from './components/WorkflowBuilder';
export { WorkflowCanvas } from './components/WorkflowCanvas';
export { WorkflowComponents } from './components/WorkflowComponents';
export { TriggerConfigurator } from './components/TriggerConfigurator';
export { ActionConfigurator } from './components/ActionConfigurator';
export { AutomationStats } from './components/AutomationStats';
export { WorkflowList } from './components/WorkflowList';
export { WorkflowNode } from './components/WorkflowNode';
export { AutomationErrorBoundary } from './components/AutomationErrorBoundary';
export { AutomationLoading } from './components/AutomationLoading';

// Export automation hooks
export { useAutomation } from './hooks/useAutomation';
export { useWorkflow } from './hooks/useWorkflow';
export { useWorkflowExecution } from './hooks/useWorkflowExecution';

// Export automation services
export { automationService } from './services/automationService';

// Export automation types
export * from './types/automation';

// Enhanced Automation Components (Epic 4 Migration)
export { default as EnhancedWorkflowBuilder } from './components/WorkflowBuilder';
export { default as EnhancedWorkflowList } from './components/WorkflowList';
export { default as EnhancedAutomationStats } from './components/AutomationStats';
export { default as EnhancedTriggerConfigurator } from './components/TriggerConfigurator';
export { default as EnhancedActionConfigurator } from './components/ActionConfigurator'; 