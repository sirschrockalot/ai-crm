import { SettingsConfig } from '../types/settings';

/**
 * Settings Configuration Service
 * Manages environment-specific settings and configuration
 */
export class SettingsConfigService {
  private static instance: SettingsConfigService;
  private config: SettingsConfig | null = null;
  private environment: string = 'development';

  private constructor() {
    this.environment = this.detectEnvironment();
  }

  public static getInstance(): SettingsConfigService {
    if (!SettingsConfigService.instance) {
      SettingsConfigService.instance = new SettingsConfigService();
    }
    return SettingsConfigService.instance;
  }

  /**
   * Detect the current environment
   */
  private detectEnvironment(): string {
    if (typeof window !== 'undefined') {
      // Client-side environment detection
      const hostname = window.location.hostname;
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
      } else if (hostname.includes('staging') || hostname.includes('dev')) {
        return 'staging';
      } else {
        return 'production';
      }
    } else {
      // Server-side environment detection
      return process.env.NODE_ENV || 'development';
    }
  }

  /**
   * Load configuration for the current environment
   */
  public async loadConfig(): Promise<SettingsConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const response = await fetch(`/api/config/settings.${this.environment}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load settings config: ${response.statusText}`);
      }
      
      this.config = await response.json();
      return this.config;
    } catch (error) {
      console.error('Failed to load settings configuration:', error);
      // Fallback to default configuration
      return this.getDefaultConfig();
    }
  }

  /**
   * Get configuration value by path
   * @param path - Dot notation path to configuration value
   * @param defaultValue - Default value if path not found
   */
  public getConfigValue<T>(path: string, defaultValue?: T): T | undefined {
    if (!this.config) {
      return defaultValue;
    }

    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value as T;
  }

  /**
   * Check if a feature is enabled
   * @param featurePath - Path to feature configuration
   */
  public isFeatureEnabled(featurePath: string): boolean {
    return this.getConfigValue<boolean>(featurePath, false);
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig() {
    return {
      mfa: this.getConfigValue('security.mfa', {}),
      passwordPolicy: this.getConfigValue('security.passwordPolicy', {}),
      sessionManagement: this.getConfigValue('security.sessionManagement', {})
    };
  }

  /**
   * Get UI configuration
   */
  public getUIConfig() {
    return {
      theme: this.getConfigValue('ui.theme', {}),
      dashboard: this.getConfigValue('ui.dashboard', {}),
      mobile: this.getConfigValue('ui.mobile', {})
    };
  }

  /**
   * Get integration configuration
   */
  public getIntegrationConfig() {
    return {
      api: this.getConfigValue('integrations.api', {}),
      thirdParty: this.getConfigValue('integrations.thirdParty', {})
    };
  }

  /**
   * Get workflow configuration
   */
  public getWorkflowConfig() {
    return {
      maxSteps: this.getConfigValue('workflows.maxSteps', 50),
      executionEngine: this.getConfigValue('workflows.executionEngine', 'node'),
      debugMode: this.getConfigValue('workflows.debugMode', false),
      logging: this.getConfigValue('workflows.logging', 'standard')
    };
  }

  /**
   * Get custom fields configuration
   */
  public getCustomFieldsConfig() {
    return {
      maxFields: this.getConfigValue('customFields.maxFields', 100),
      fieldTypes: this.getConfigValue('customFields.fieldTypes', []),
      validation: this.getConfigValue('customFields.validation', true),
      templates: this.getConfigValue('customFields.templates', true)
    };
  }

  /**
   * Get audit configuration
   */
  public getAuditConfig() {
    return {
      enabled: this.getConfigValue('audit.enabled', true),
      retentionDays: this.getConfigValue('audit.retentionDays', 365),
      logLevel: this.getConfigValue('audit.logLevel', 'info'),
      exportFormats: this.getConfigValue('audit.exportFormats', [])
    };
  }

  /**
   * Get performance configuration
   */
  public getPerformanceConfig() {
    return {
      caching: this.getConfigValue('performance.caching', {}),
      optimization: this.getConfigValue('performance.optimization', {})
    };
  }

  /**
   * Get environment-specific configuration
   */
  public getEnvironmentConfig(): Partial<SettingsConfig> & { debugMode?: boolean } {
    switch (this.environment) {
      case 'development':
        return this.getConfigValue('development', { debugMode: true });
      case 'staging':
        return this.getConfigValue('staging', { debugMode: false });
      case 'production':
        return this.getConfigValue('production', { debugMode: false });
      default:
        return { debugMode: false };
    }
  }

  /**
   * Get current environment
   */
  public getCurrentEnvironment(): string {
    return this.environment;
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    const envConfig = this.getEnvironmentConfig();
    return envConfig.debugMode || false;
  }

  /**
   * Get default configuration (fallback)
   */
  private getDefaultConfig(): SettingsConfig {
    return {
      environment: this.environment,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      features: {
        aiFeatures: {
          enabled: true,
          debugMode: this.environment === 'development',
          logLevel: 'info',
          maxTokens: 4000,
          temperature: 0.7
        },
        automationFeatures: {
          enabled: true,
          debugMode: this.environment === 'development',
          maxWorkflows: 100,
          executionTimeout: 300
        },
        analytics: {
          enabled: true,
          trackingLevel: 'standard',
          debugMode: this.environment === 'development',
          sampleRate: 0.5
        },
        notifications: {
          enabled: true,
          email: true,
          push: true,
          sms: false,
          debugMode: this.environment === 'development'
        }
      },
      security: {
        mfa: {
          enabled: true,
          methods: ['totp', 'sms'],
          backupCodes: 10,
          sessionTimeout: 3600
        },
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90
        },
        sessionManagement: {
          maxConcurrentSessions: 5,
          inactivityTimeout: 1800,
          absoluteTimeout: 86400
        }
      },
      ui: {
        theme: {
          default: 'light',
          available: ['light', 'dark', 'auto'],
          customColors: true
        },
        dashboard: {
          defaultLayout: 'grid',
          customizable: true,
          maxWidgets: 20
        },
        mobile: {
          responsive: true,
          touchOptimized: true,
          offlineSupport: this.environment !== 'production'
        }
      },
      integrations: {
        api: {
          rateLimit: this.environment === 'production' ? 200 : 1000,
          timeout: 30,
          retryAttempts: this.environment === 'production' ? 2 : 3,
          debugMode: this.environment === 'development'
        },
        thirdParty: {
          googleWorkspace: {
            enabled: false,
            debugMode: this.environment === 'development'
          },
          slack: {
            enabled: false,
            debugMode: this.environment === 'development'
          },
          zapier: {
            enabled: false,
            debugMode: this.environment === 'development'
          }
        }
      },
      workflows: {
        maxSteps: 50,
        executionEngine: 'node',
        debugMode: this.environment === 'development',
        logging: this.environment === 'production' ? 'minimal' : 'standard'
      },
      customFields: {
        maxFields: 100,
        fieldTypes: ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'file'],
        validation: true,
        templates: true
      },
      audit: {
        enabled: true,
        retentionDays: this.environment === 'production' ? 2555 : 365,
        logLevel: this.environment === 'production' ? 'warn' : 'info',
        exportFormats: ['json', 'csv', 'pdf']
      },
      performance: {
        caching: {
          enabled: true,
          ttl: this.environment === 'production' ? 1800 : 600,
          maxSize: this.environment === 'production' ? '500MB' : '200MB'
        },
        optimization: {
          lazyLoading: true,
          codeSplitting: true,
          imageOptimization: true
        }
      }
    };
  }

  /**
   * Reload configuration (useful for testing or dynamic updates)
   */
  public async reloadConfig(): Promise<SettingsConfig> {
    this.config = null;
    return this.loadConfig();
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: any): boolean {
    try {
      // Basic validation - check required fields
      const requiredFields = ['environment', 'version', 'features', 'security', 'ui'];
      
      for (const field of requiredFields) {
        if (!config[field]) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate feature configurations
      if (config.features) {
        const featureFields = ['aiFeatures', 'automationFeatures', 'analytics', 'notifications'];
        for (const feature of featureFields) {
          if (!config.features[feature]) {
            console.error(`Missing required feature: ${feature}`);
            return false;
          }
        }
      }

      // Validate security configurations
      if (config.security) {
        const securityFields = ['mfa', 'passwordPolicy', 'sessionManagement'];
        for (const security of securityFields) {
          if (!config.security[security]) {
            console.error(`Missing required security field: ${security}`);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Export configuration
   */
  public exportConfig(): string {
    if (!this.config) {
      return JSON.stringify(this.getDefaultConfig(), null, 2);
    }
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Get configuration metadata
   */
  public getConfigMetadata() {
    if (!this.config) {
      return {
        environment: this.environment,
        version: 'unknown',
        lastUpdated: 'unknown',
        loaded: false
      };
    }

    return {
      environment: this.config.environment,
      version: this.config.version,
      lastUpdated: this.config.lastUpdated,
      loaded: true
    };
  }
}

// Export singleton instance
export const settingsConfigService = SettingsConfigService.getInstance();
