// Dashboard Types Barrel Export
// This file exports all types used by dashboard components

// Priority Alerts Types
export interface PriorityAlert {
  id: string;
  title: string;
  count: number;
  details: string;
  urgency: 'urgent' | 'warning' | 'info';
  type: 'inspection' | 'closing' | 'followup' | 'general';
  expiresAt?: Date;
}

// Deal Types
export interface Deal {
  id: string;
  address: string;
  status: 'new-contract' | 'active-disposition' | 'assigned' | 'closing' | 'closed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  buyer: string;
  price: number;
  profit: number;
  inspectionEnds?: Date;
  closingDate?: Date;
  lastUpdated: Date;
  assignedTo: string;
}

// Buyer Types
export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'qualified' | 'inactive' | 'prospect';
  priority: 'high' | 'medium' | 'low';
  location: string;
  budget: { min: number; max: number };
  preferredAreas: string[];
  lastContact: Date;
  totalDeals: number;
  successfulDeals: number;
  averageDealSize: number;
  tags: string[];
}

// Communication Types
export interface Communication {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'text';
  direction: 'inbound' | 'outbound';
  date: Date;
  summary: string;
  outcome: 'positive' | 'negative' | 'neutral';
  nextAction?: string;
  nextActionDate?: Date;
}

// Disposition Metrics Types
export interface DispositionMetrics {
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  cancelledDeals: number;
  totalValue: number;
  averageDealSize: number;
  averageDaysToClose: number;
  successRate: number;
  profitMargin: number;
  buyerSatisfaction: number;
  monthlyTrends: Array<{
    month: string;
    deals: number;
    value: number;
    profit: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  priorityBreakdown: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  topPerformers: Array<{
    name: string;
    deals: number;
    value: number;
    successRate: number;
  }>;
}

// Quick Action Types
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  category: 'deal' | 'buyer' | 'communication' | 'analytics' | 'general';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  action: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Dashboard Preferences Types
export interface DashboardPreferences {
  showPriorityAlerts: boolean;
  showDealPipeline: boolean;
  showBuyerManagement: boolean;
  showAnalytics: boolean;
  showQuickActions: boolean;
  layout: 'default' | 'compact' | 'detailed';
  refreshInterval: number;
  autoRefresh: boolean;
}

// Export Options Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  timeRange: '7d' | '30d' | '90d' | '1y';
  includeCharts: boolean;
  includeData: boolean;
  includeMetrics: boolean;
}
