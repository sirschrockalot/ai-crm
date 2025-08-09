// Shared Types Library
// This file consolidates common TypeScript types and interfaces for the monolithic application

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  lastLoginAt?: string;
  mfaEnabled: boolean;
}

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  status: TenantStatus;
  settings: TenantSettings;
}

// Enums
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  EMAIL = 'email',
  PHONE = 'phone',
  OTHER = 'other',
}

export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  MEETING = 'meeting',
  OTHER = 'other',
}

export enum AutomationTrigger {
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_STATUS_CHANGED = 'lead_status_changed',
  EMAIL_RECEIVED = 'email_received',
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
}

export enum AutomationAction {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  UPDATE_LEAD = 'update_lead',
  CREATE_TASK = 'create_task',
  NOTIFY_USER = 'notify_user',
  WEBHOOK = 'webhook',
}

// Settings Types
export interface TenantSettings {
  features: FeatureFlags;
  integrations: IntegrationSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface FeatureFlags {
  automation: boolean;
  analytics: boolean;
  communications: boolean;
  buyerManagement: boolean;
  advancedReporting: boolean;
}

export interface IntegrationSettings {
  email: EmailIntegration;
  sms: SMSIntegration;
  calendar: CalendarIntegration;
  crm: CRMIntegration;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export interface SecuritySettings {
  mfaRequired: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  ipWhitelist: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

// Integration Types
export interface EmailIntegration {
  provider: 'gmail' | 'outlook' | 'smtp';
  enabled: boolean;
  settings: EmailSettings;
}

export interface EmailSettings {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  secure: boolean;
}

export interface SMSIntegration {
  provider: 'twilio' | 'aws-sns' | 'other';
  enabled: boolean;
  settings: SMSSettings;
}

export interface SMSSettings {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'other';
  enabled: boolean;
  settings: CalendarSettings;
}

export interface CalendarSettings {
  calendarId?: string;
  syncEnabled: boolean;
  syncDirection: 'one-way' | 'two-way';
}

export interface CRMIntegration {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'other';
  enabled: boolean;
  settings: CRMSettings;
}

export interface CRMSettings {
  apiKey?: string;
  apiUrl?: string;
  syncEnabled: boolean;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// UI Types
export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor: keyof T | ((item: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface TableFilters {
  search?: string;
  status?: string;
  dateRange?: DateRange;
  [key: string]: any;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Event Types
export interface AppEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
  tenantId: string;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
}

// Notification Types
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: any;
  actionUrl?: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
}

// Workflow Types
export interface Workflow extends BaseEntity {
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
  tenantId: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface WorkflowAction {
  type: AutomationAction;
  config: any;
  order: number;
}

// Analytics Types
export interface AnalyticsMetric {
  name: string;
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  format?: 'number' | 'currency' | 'percentage' | 'duration';
}

export interface AnalyticsChart {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: any;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  filters: TableFilters;
  dateRange: DateRange;
  createdAt: string;
}

// All types are already exported when defined above
