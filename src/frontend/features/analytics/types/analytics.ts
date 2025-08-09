export interface AnalyticsData {
  leads: Lead[];
  buyers: Buyer[];
  metrics: AnalyticsMetrics;
  charts: AnalyticsCharts;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  propertyType: PropertyType;
  estimatedValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Buyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  buyerType: BuyerType;
  isActive: boolean;
  createdAt: Date;
}

export interface AnalyticsMetrics {
  totalLeads: number;
  totalBuyers: number;
  conversionRate: number;
  averageLeadValue: number;
  totalPipelineValue: number;
  activeBuyers: number;
  monthlyGrowth: number;
  averageResponseTime: number;
}

export interface AnalyticsCharts {
  leadStatusDistribution: ChartDataPoint[];
  propertyTypeDistribution: ChartDataPoint[];
  buyerTypeDistribution: ChartDataPoint[];
  monthlyLeadGrowth: ChartDataPoint[];
  conversionRateOverTime: ChartDataPoint[];
  teamPerformance: TeamPerformanceData[];
  revenueByMonth: ChartDataPoint[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
  [key: string]: any; // Allow additional properties for different chart types
}

export interface TeamPerformanceData {
  memberId: string;
  memberName: string;
  leadsAssigned: number;
  leadsConverted: number;
  conversionRate: number;
  averageValue: number;
  totalRevenue: number;
}

export interface AnalyticsFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  status?: LeadStatus;
  propertyType?: PropertyType;
  buyerType?: BuyerType;
  dateFrom?: string;
  dateTo?: string;
  teamMember?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  includeMetrics: boolean;
  dateRange?: string;
  filters?: AnalyticsFilters;
}

export interface CustomReportConfig {
  name: string;
  description?: string;
  metrics: string[];
  charts: string[];
  filters: AnalyticsFilters;
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'funnel';
  data: ChartDataPoint[];
  options?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    animate?: boolean;
    xAxisDataKey?: string;
    yAxisDataKey?: string;
    dataKey?: string;
  };
  height?: number;
  width?: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  color?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface FilterPanelProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: Partial<AnalyticsFilters>) => void;
  availableFilters?: {
    statuses?: LeadStatus[];
    propertyTypes?: PropertyType[];
    buyerTypes?: BuyerType[];
    teamMembers?: string[];
  };
}

export interface DashboardWidgetProps {
  title: string;
  type: 'chart' | 'metric' | 'table' | 'custom';
  config: ChartConfig | MetricCardProps | any;
  size?: 'small' | 'medium' | 'large';
  refreshInterval?: number;
  onRefresh?: () => void;
}

export interface AnalyticsNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  availableTabs?: string[];
}

export interface AnalyticsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export interface AnalyticsLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showSpinner?: boolean;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type PropertyType = 'single_family' | 'multi_family' | 'commercial' | 'land';
export type BuyerType = 'individual' | 'company' | 'investor';
