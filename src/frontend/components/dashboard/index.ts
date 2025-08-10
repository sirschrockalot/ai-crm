// Dashboard Components barrel export
// This file exports all dashboard components for clean imports

export { default as DashboardLayout } from './DashboardLayout';
export { DashboardOverview } from './DashboardOverview';
export { DashboardCharts } from './DashboardCharts';
export { DashboardWidget } from './DashboardWidget';
export { DashboardErrorBoundary } from './DashboardErrorBoundary';
export { DashboardLoading } from './DashboardLoading';

// New enhanced dashboard components
export { DashboardStats } from './DashboardStats';
export { RecentLeads } from './RecentLeads';
export { QuickActions, getDefaultDispositionActions } from './QuickActions';
export { ActivityFeed } from './ActivityFeed';
export { PerformanceCharts } from './PerformanceCharts';
export { NotificationCenter } from './NotificationCenter';
export { TeamPerformance } from './TeamPerformance';
export { AutomationStatus } from './AutomationStatus';
export { StrategicInsights } from './StrategicInsights';
export { MarketIntelligence } from './MarketIntelligence';
export { ComplianceOverview } from './ComplianceOverview';

// Disposition Dashboard Components
export { PriorityAlerts } from './PriorityAlerts';
export { DealPipeline } from './DealPipeline';
export { BuyerManagement } from './BuyerManagement';
export { DispositionAnalytics } from './DispositionAnalytics';

// Dashboard Types
export type {
  PriorityAlert,
  Deal,
  Buyer,
  Communication,
  DispositionMetrics,
  QuickAction,
  DashboardPreferences,
  ExportOptions,
} from './types'; 