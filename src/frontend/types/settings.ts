/**
 * Settings Configuration Types
 * Defines the structure for environment-specific settings and configuration
 */

export interface SettingsConfig {
  environment: string;
  version: string;
  lastUpdated: string;
  
  features: FeatureConfig;
  security: SecurityConfig;
  ui: UIConfig;
  integrations: IntegrationConfig;
  workflows: WorkflowConfig;
  customFields: CustomFieldsConfig;
  audit: AuditConfig;
  performance: PerformanceConfig;
  
  // Environment-specific configurations
  development?: EnvironmentSpecificConfig;
  staging?: EnvironmentSpecificConfig;
  production?: EnvironmentSpecificConfig;
}

export interface FeatureConfig {
  aiFeatures: AIFeaturesConfig;
  automationFeatures: AutomationFeaturesConfig;
  analytics: AnalyticsConfig;
  notifications: NotificationConfig;
}

export interface AIFeaturesConfig {
  enabled: boolean;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxTokens: number;
  temperature: number;
}

export interface AutomationFeaturesConfig {
  enabled: boolean;
  debugMode: boolean;
  maxWorkflows: number;
  executionTimeout: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingLevel: 'minimal' | 'standard' | 'detailed';
  debugMode: boolean;
  sampleRate: number;
}

export interface NotificationConfig {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  debugMode: boolean;
}

export interface SecurityConfig {
  mfa: MFAConfig;
  passwordPolicy: PasswordPolicyConfig;
  sessionManagement: SessionManagementConfig;
}

export interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms')[];
  backupCodes: number;
  sessionTimeout: number;
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
}

export interface SessionManagementConfig {
  maxConcurrentSessions: number;
  inactivityTimeout: number;
  absoluteTimeout: number;
}

export interface UIConfig {
  theme: ThemeConfig;
  dashboard: DashboardConfig;
  mobile: MobileConfig;
}

export interface ThemeConfig {
  default: 'light' | 'dark' | 'auto';
  available: ('light' | 'dark' | 'auto')[];
  customColors: boolean;
}

export interface DashboardConfig {
  defaultLayout: 'grid' | 'list' | 'kanban';
  customizable: boolean;
  maxWidgets: number;
}

export interface MobileConfig {
  responsive: boolean;
  touchOptimized: boolean;
  offlineSupport: boolean;
}

export interface IntegrationConfig {
  api: APIConfig;
  thirdParty: ThirdPartyConfig;
}

export interface APIConfig {
  rateLimit: number;
  timeout: number;
  retryAttempts: number;
  debugMode: boolean;
}

export interface ThirdPartyConfig {
  googleWorkspace: ThirdPartyServiceConfig;
  slack: ThirdPartyServiceConfig;
  zapier: ThirdPartyServiceConfig;
}

export interface ThirdPartyServiceConfig {
  enabled: boolean;
  debugMode: boolean;
}

export interface WorkflowConfig {
  maxSteps: number;
  executionEngine: 'node' | 'python' | 'java';
  debugMode: boolean;
  logging: 'minimal' | 'standard' | 'detailed';
}

export interface CustomFieldsConfig {
  maxFields: number;
  fieldTypes: string[];
  validation: boolean;
  templates: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  exportFormats: string[];
}

export interface PerformanceConfig {
  caching: CachingConfig;
  optimization: OptimizationConfig;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  maxSize: string;
}

export interface OptimizationConfig {
  lazyLoading: boolean;
  codeSplitting: boolean;
  imageOptimization: boolean;
}

export interface EnvironmentSpecificConfig {
  debugMode: boolean;
  hotReload?: boolean;
  sourceMaps?: boolean;
  performanceMonitoring: boolean;
  errorReporting: ErrorReportingConfig;
}

export interface ErrorReportingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  captureUnhandled: boolean;
}

// Configuration validation types
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuration update types
export interface ConfigUpdateRequest {
  path: string;
  value: any;
  environment?: string;
  description?: string;
}

export interface ConfigUpdateResult {
  success: boolean;
  message: string;
  updatedConfig?: Partial<SettingsConfig>;
  errors?: string[];
}

// Configuration metadata types
export interface ConfigMetadata {
  environment: string;
  version: string;
  lastUpdated: string;
  loaded: boolean;
  lastModified?: string;
  checksum?: string;
}

// Feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  environment: string;
  description?: string;
  defaultValue?: boolean;
  overrides?: Record<string, boolean>;
}

// Configuration change tracking
export interface ConfigChange {
  id: string;
  timestamp: string;
  environment: string;
  path: string;
  oldValue: any;
  newValue: any;
  userId: string;
  description?: string;
  rollbackAvailable: boolean;
}

// Configuration import/export types
export interface ConfigExportOptions {
  format: 'json' | 'yaml' | 'env';
  includeSecrets: boolean;
  includeMetadata: boolean;
  environment: string;
}

export interface ConfigImportOptions {
  validate: boolean;
  backup: boolean;
  environment: string;
  mergeStrategy: 'replace' | 'merge' | 'selective';
}

// Configuration deployment types
export interface ConfigDeployment {
  id: string;
  environment: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'rolled-back';
  changes: ConfigChange[];
  deployedBy: string;
  deploymentNotes?: string;
  rollbackAvailable: boolean;
}

// Configuration monitoring types
export interface ConfigHealthCheck {
  environment: string;
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical';
  checks: HealthCheckResult[];
  overallScore: number;
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

// Configuration backup types
export interface ConfigBackup {
  id: string;
  environment: string;
  timestamp: string;
  description: string;
  configSnapshot: SettingsConfig;
  metadata: ConfigMetadata;
  backupSize: number;
  checksum: string;
  retentionDays: number;
}

// Configuration template types
export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  environment: string;
  template: Partial<SettingsConfig>;
  variables: ConfigTemplateVariable[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ConfigTemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  required: boolean;
  validation?: string;
}

// Configuration permission types
export interface ConfigPermission {
  userId: string;
  environment: string;
  permissions: ConfigPermissionType[];
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

export type ConfigPermissionType = 
  | 'read'
  | 'write'
  | 'deploy'
  | 'rollback'
  | 'admin';

// Configuration notification types
export interface ConfigNotification {
  id: string;
  type: 'change' | 'deployment' | 'rollback' | 'error' | 'warning';
  title: string;
  message: string;
  environment: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

// Configuration search and filter types
export interface ConfigSearchOptions {
  query: string;
  environment?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ConfigSearchResult {
  results: ConfigSearchItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ConfigSearchItem {
  id: string;
  type: 'config' | 'change' | 'deployment' | 'template';
  title: string;
  description: string;
  environment: string;
  timestamp: string;
  relevance: number;
  url: string;
}
