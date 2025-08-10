import { SettingsConfigService } from '../../services/settingsConfigService';
import { SettingsConfig } from '../../types/settings';

// Mock fetch globally
global.fetch = jest.fn();

describe('SettingsConfigService', () => {
  let service: SettingsConfigService;
  let mockConfig: SettingsConfig;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (SettingsConfigService as any).instance = undefined;
    
    // Create mock configuration
    mockConfig = {
      environment: 'development',
      version: '1.0.0',
      lastUpdated: '2024-12-19T00:00:00Z',
      features: {
        aiFeatures: {
          enabled: true,
          debugMode: true,
          logLevel: 'debug',
          maxTokens: 4000,
          temperature: 0.7
        },
        automationFeatures: {
          enabled: true,
          debugMode: true,
          maxWorkflows: 100,
          executionTimeout: 300
        },
        analytics: {
          enabled: true,
          trackingLevel: 'detailed',
          debugMode: true,
          sampleRate: 1.0
        },
        notifications: {
          enabled: true,
          email: true,
          push: true,
          sms: false,
          debugMode: true
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
          offlineSupport: true
        }
      },
      integrations: {
        api: {
          rateLimit: 1000,
          timeout: 30,
          retryAttempts: 3,
          debugMode: true
        },
        thirdParty: {
          googleWorkspace: {
            enabled: false,
            debugMode: true
          },
          slack: {
            enabled: false,
            debugMode: true
          },
          zapier: {
            enabled: false,
            debugMode: true
          }
        }
      },
      workflows: {
        maxSteps: 50,
        executionEngine: 'node',
        debugMode: true,
        logging: 'detailed'
      },
      customFields: {
        maxFields: 100,
        fieldTypes: ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'file'],
        validation: true,
        templates: true
      },
      audit: {
        enabled: true,
        retentionDays: 365,
        logLevel: 'debug',
        exportFormats: ['json', 'csv', 'pdf']
      },
      performance: {
        caching: {
          enabled: true,
          ttl: 300,
          maxSize: '100MB'
        },
        optimization: {
          lazyLoading: true,
          codeSplitting: true,
          imageOptimization: true
        }
      },
      development: {
        debugMode: true,
        hotReload: true,
        sourceMaps: true,
        performanceMonitoring: true,
        errorReporting: {
          enabled: true,
          level: 'debug',
          captureUnhandled: true
        }
      }
    };

    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SettingsConfigService.getInstance();
      const instance2 = SettingsConfigService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment on localhost', () => {
      // Mock window.location.hostname
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      });

      service = SettingsConfigService.getInstance();
      expect(service.getCurrentEnvironment()).toBe('development');
    });

    it('should detect staging environment', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'staging.dealcycle.com' },
        writable: true
      });

      service = SettingsConfigService.getInstance();
      expect(service.getCurrentEnvironment()).toBe('staging');
    });

    it('should detect production environment', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'app.dealcycle.com' },
        writable: true
      });

      service = SettingsConfigService.getInstance();
      expect(service.getCurrentEnvironment()).toBe('production');
    });
  });

  describe('Configuration Loading', () => {
    beforeEach(() => {
      service = SettingsConfigService.getInstance();
    });

    it('should load configuration successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      const config = await service.loadConfig();
      expect(config).toEqual(mockConfig);
      expect(fetch).toHaveBeenCalledWith('/api/config/settings.development.json');
    });

    it('should return cached configuration on subsequent calls', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });

      // First call
      await service.loadConfig();
      // Second call
      const config = await service.loadConfig();
      
      expect(config).toEqual(mockConfig);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should fallback to default config on fetch failure', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const config = await service.loadConfig();
      expect(config.environment).toBe('development');
      expect(config.features.aiFeatures.enabled).toBe(true);
    });

    it('should handle non-ok response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      const config = await service.loadConfig();
      expect(config.environment).toBe('development');
    });
  });

  describe('Configuration Access', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should get configuration value by path', () => {
      const value = service.getConfigValue('features.aiFeatures.enabled');
      expect(value).toBe(true);
    });

    it('should return default value for non-existent path', () => {
      const value = service.getConfigValue('nonexistent.path', 'default');
      expect(value).toBe('default');
    });

    it('should return undefined for non-existent path without default', () => {
      const value = service.getConfigValue('nonexistent.path');
      expect(value).toBeUndefined();
    });

    it('should handle nested object paths', () => {
      const value = service.getConfigValue('security.mfa.methods');
      expect(value).toEqual(['totp', 'sms']);
    });
  });

  describe('Feature Flags', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should check if feature is enabled', () => {
      expect(service.isFeatureEnabled('features.aiFeatures.enabled')).toBe(true);
      expect(service.isFeatureEnabled('features.notifications.sms')).toBe(false);
    });

    it('should return false for non-existent features', () => {
      expect(service.isFeatureEnabled('features.nonexistent')).toBe(false);
    });
  });

  describe('Configuration Getters', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should get security configuration', () => {
      const securityConfig = service.getSecurityConfig();
      expect(securityConfig.mfa.enabled).toBe(true);
      expect(securityConfig.passwordPolicy.minLength).toBe(8);
    });

    it('should get UI configuration', () => {
      const uiConfig = service.getUIConfig();
      expect(uiConfig.theme.default).toBe('light');
      expect(uiConfig.dashboard.maxWidgets).toBe(20);
    });

    it('should get integration configuration', () => {
      const integrationConfig = service.getIntegrationConfig();
      expect(integrationConfig.api.rateLimit).toBe(1000);
      expect(integrationConfig.thirdParty.slack.enabled).toBe(false);
    });

    it('should get workflow configuration', () => {
      const workflowConfig = service.getWorkflowConfig();
      expect(workflowConfig.maxSteps).toBe(50);
      expect(workflowConfig.executionEngine).toBe('node');
    });

    it('should get custom fields configuration', () => {
      const customFieldsConfig = service.getCustomFieldsConfig();
      expect(customFieldsConfig.maxFields).toBe(100);
      expect(customFieldsConfig.fieldTypes).toContain('text');
    });

    it('should get audit configuration', () => {
      const auditConfig = service.getAuditConfig();
      expect(auditConfig.enabled).toBe(true);
      expect(auditConfig.retentionDays).toBe(365);
    });

    it('should get performance configuration', () => {
      const performanceConfig = service.getPerformanceConfig();
      expect(performanceConfig.caching.enabled).toBe(true);
      expect(performanceConfig.optimization.lazyLoading).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should get environment-specific configuration', () => {
      const envConfig = service.getEnvironmentConfig();
      expect(envConfig.debugMode).toBe(true);
      expect(envConfig.hotReload).toBe(true);
    });

    it('should check debug mode', () => {
      expect(service.isDebugMode()).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    beforeEach(() => {
      service = SettingsConfigService.getInstance();
    });

    it('should validate valid configuration', () => {
      const isValid = service.validateConfig(mockConfig);
      expect(isValid).toBe(true);
    });

    it('should reject configuration missing required fields', () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).features;
      
      const isValid = service.validateConfig(invalidConfig);
      expect(isValid).toBe(false);
    });

    it('should reject configuration missing feature fields', () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).features.aiFeatures;
      
      const isValid = service.validateConfig(invalidConfig);
      expect(isValid).toBe(false);
    });

    it('should reject configuration missing security fields', () => {
      const invalidConfig = { ...mockConfig };
      delete (invalidConfig as any).security.mfa;
      
      const isValid = service.validateConfig(invalidConfig);
      expect(isValid).toBe(false);
    });
  });

  describe('Configuration Export', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should export configuration as JSON string', () => {
      const exported = service.exportConfig();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.environment).toBe('development');
      expect(parsed.features.aiFeatures.enabled).toBe(true);
    });

    it('should export default config when no config loaded', () => {
      // Reset service to not have loaded config
      (SettingsConfigService as any).instance = undefined;
      const newService = SettingsConfigService.getInstance();
      
      const exported = newService.exportConfig();
      const parsed = JSON.parse(exported);
      expect(parsed.environment).toBe('development');
    });
  });

  describe('Configuration Metadata', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should return configuration metadata', () => {
      const metadata = service.getConfigMetadata();
      expect(metadata.environment).toBe('development');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.loaded).toBe(true);
    });

    it('should return metadata for unloaded configuration', () => {
      // Reset service to not have loaded config
      (SettingsConfigService as any).instance = undefined;
      const newService = SettingsConfigService.getInstance();
      
      const metadata = newService.getConfigMetadata();
      expect(metadata.loaded).toBe(false);
      expect(metadata.version).toBe('unknown');
    });
  });

  describe('Configuration Reload', () => {
    beforeEach(async () => {
      service = SettingsConfigService.getInstance();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig
      });
      await service.loadConfig();
    });

    it('should reload configuration successfully', async () => {
      const updatedConfig = { ...mockConfig, version: '2.0.0' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedConfig
      });

      const config = await service.reloadConfig();
      expect(config.version).toBe('2.0.0');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Default Configuration', () => {
    it('should provide sensible defaults for development environment', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      });

      service = SettingsConfigService.getInstance();
      const config = service.getConfigValue('features.aiFeatures.debugMode');
      expect(config).toBe(true);
    });

    it('should provide sensible defaults for production environment', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'app.dealcycle.com' },
        writable: true
      });

      service = SettingsConfigService.getInstance();
      const config = service.getConfigValue('features.aiFeatures.debugMode');
      expect(config).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      service = SettingsConfigService.getInstance();
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const config = await service.loadConfig();
      expect(config).toBeDefined();
      expect(config.environment).toBe('development');
    });

    it('should handle malformed JSON responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });
      
      const config = await service.loadConfig();
      expect(config).toBeDefined();
      expect(config.environment).toBe('development');
    });
  });
});
