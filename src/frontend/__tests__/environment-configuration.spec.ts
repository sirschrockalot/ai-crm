import { FrontendEnvironmentValidator, FrontendEnvironmentValidationResult } from '../services/environmentValidationService';
import EnvironmentConfigService from '../services/environmentConfigService';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_APP_NAME: 'Test CRM',
  NEXT_PUBLIC_APP_VERSION: '1.0.0',
  NEXT_PUBLIC_APP_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:3001',
  NEXT_PUBLIC_WS_URL: 'ws://localhost:3001',
  NEXT_PUBLIC_ENABLE_AI_FEATURES: 'true',
  NEXT_PUBLIC_ENABLE_AUTOMATION: 'true',
  NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
  NEXT_PUBLIC_ENABLE_COMMUNICATIONS: 'true',
  NEXT_PUBLIC_ENABLE_DEBUG_MODE: 'true',
  NEXT_PUBLIC_ENABLE_LOGGING: 'true',
  NEXT_PUBLIC_LOG_LEVEL: 'debug',
  NEXT_PUBLIC_BYPASS_AUTH: 'false',
  NEXT_PUBLIC_ENABLE_HTTPS_ONLY: 'false',
  NEXT_PUBLIC_ENABLE_CSP: 'false',
  NEXT_PUBLIC_ENABLE_HSTS: 'false',
  NEXT_PUBLIC_API_TIMEOUT: '5000',
  NEXT_PUBLIC_API_RETRY_ATTEMPTS: '2',
  NEXT_PUBLIC_CACHE_DURATION: '1800',
  NEXT_PUBLIC_ENABLE_SERVICE_WORKER: 'true',
  NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT: 'true',
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'test-google-client-id',
  NEXT_PUBLIC_TWILIO_ACCOUNT_SID: 'test-twilio-sid',
  NEXT_PUBLIC_SENTRY_DSN: 'test-sentry-dsn',
  NEXT_PUBLIC_ANALYTICS_ID: 'test-analytics-id',
  NEXT_PUBLIC_MIXPANEL_TOKEN: 'test-mixpanel-token',
  ANALYZE: 'false',
  GENERATE_SOURCEMAP: 'true',
};

describe('Frontend Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Store original environment
    originalEnv = process.env;
    
    // Mock environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('FrontendEnvironmentValidator', () => {
    it('should validate a complete environment configuration', () => {
      const result = FrontendEnvironmentValidator.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle missing optional environment variables', () => {
      // Remove some optional variables
      delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      delete process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
      
      const result = FrontendEnvironmentValidator.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = mockEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID = mockEnv.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
    });

    it('should validate required environment variables', () => {
      const result = FrontendEnvironmentValidator.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate environment-specific rules', () => {
      // Test development environment
      process.env.NEXT_PUBLIC_APP_ENV = 'development';
      let result = FrontendEnvironmentValidator.validate();
      expect(result.isValid).toBe(true);
      
      // Test production environment
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      result = FrontendEnvironmentValidator.validate();
      expect(result.isValid).toBe(true);
      
      // Test staging environment
      process.env.NEXT_PUBLIC_APP_ENV = 'staging';
      result = FrontendEnvironmentValidator.validate();
      expect(result.isValid).toBe(true);
      
      // Test test environment
      process.env.NEXT_PUBLIC_APP_ENV = 'test';
      result = FrontendEnvironmentValidator.validate();
      expect(result.isValid).toBe(true);
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_APP_ENV = mockEnv.NEXT_PUBLIC_APP_ENV;
    });

    it('should validate URL formats', () => {
      const result = FrontendEnvironmentValidator.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate numeric values', () => {
      const result = FrontendEnvironmentValidator.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate boolean values', () => {
      const result = FrontendEnvironmentValidator.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('EnvironmentConfigService', () => {
    let configService: EnvironmentConfigService;

    beforeEach(() => {
      // Reset singleton instance for each test
      (EnvironmentConfigService as any).instance = undefined;
      configService = EnvironmentConfigService.getInstance();
    });

    it('should be a singleton', () => {
      const instance1 = EnvironmentConfigService.getInstance();
      const instance2 = EnvironmentConfigService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should detect environment correctly', () => {
      const environment = configService.getCurrentEnvironment();
      expect(environment).toBe('test');
    });

    it('should get configuration object', () => {
      const config = configService.getConfig();
      
      expect(config.NEXT_PUBLIC_APP_NAME).toBe('Test CRM');
      expect(config.NEXT_PUBLIC_API_URL).toBe('http://localhost:3001');
      expect(config.NEXT_PUBLIC_ENABLE_AI_FEATURES).toBe(true);
      expect(config.NEXT_PUBLIC_API_TIMEOUT).toBe(5000);
    });

    it('should validate configuration', () => {
      const isValid = configService.validateConfig();
      expect(isValid).toBe(true);
    });

    it('should get environment-specific configuration', () => {
      const envConfig = configService.getEnvironmentConfig();
      
      expect(envConfig).toBeDefined();
      expect(envConfig.debugMode).toBeDefined();
      expect(envConfig.logLevel).toBeDefined();
    });

    it('should check feature flags', () => {
      expect(configService.isFeatureEnabled('NEXT_PUBLIC_ENABLE_AI_FEATURES')).toBe(true);
      expect(configService.isFeatureEnabled('NEXT_PUBLIC_ENABLE_AUTOMATION')).toBe(true);
      expect(configService.isFeatureEnabled('NEXT_PUBLIC_ENABLE_ANALYTICS')).toBe(true);
      expect(configService.isFeatureEnabled('NEXT_PUBLIC_ENABLE_COMMUNICATIONS')).toBe(true);
    });

    it('should check debug mode', () => {
      expect(configService.isDebugMode()).toBe(true);
    });

    it('should get API configuration', () => {
      const apiConfig = configService.getApiConfig();
      
      expect(apiConfig.baseUrl).toBe('http://localhost:3001');
      expect(apiConfig.timeout).toBe(5000);
      expect(apiConfig.retryAttempts).toBe(2);
      expect(apiConfig.wsUrl).toBe('ws://localhost:3001');
    });

    it('should get security configuration', () => {
      const securityConfig = configService.getSecurityConfig();
      
      expect(securityConfig.httpsOnly).toBe(false);
      expect(securityConfig.csp).toBe(false);
      expect(securityConfig.hsts).toBe(false);
      expect(securityConfig.bypassAuth).toBe(false);
    });

    it('should get monitoring configuration', () => {
      const monitoringConfig = configService.getMonitoringConfig();
      
      expect(monitoringConfig.sentryDsn).toBe('test-sentry-dsn');
      expect(monitoringConfig.analyticsId).toBe('test-analytics-id');
      expect(monitoringConfig.mixpanelToken).toBe('test-mixpanel-token');
      expect(monitoringConfig.logLevel).toBe('debug');
      expect(monitoringConfig.enableLogging).toBe(true);
    });

    it('should get external service configuration', () => {
      const externalConfig = configService.getExternalServiceConfig();
      
      expect(externalConfig.google.clientId).toBe('test-google-client-id');
      expect(externalConfig.twilio.accountSid).toBe('test-twilio-sid');
    });

    it('should get configuration summary', () => {
      const summary = configService.getConfigurationSummary();
      
      expect(summary.environment).toBe('test');
      expect(summary.core.appName).toBe('Test CRM');
      expect(summary.core.apiUrl).toBe('http://localhost:3001');
      expect(summary.features.aiFeatures).toBe(true);
      expect(summary.validation.isValid).toBe(true);
    });

    it('should refresh configuration', () => {
      const originalConfig = configService.getConfig();
      
      configService.refreshConfig();
      
      const newConfig = configService.getConfig();
      expect(newConfig).toBeDefined();
      expect(newConfig.NEXT_PUBLIC_APP_NAME).toBe(originalConfig.NEXT_PUBLIC_APP_NAME);
    });

    it('should handle missing required fields', () => {
      // Temporarily remove required field
      const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      
      // Reset service to pick up changes
      (EnvironmentConfigService as any).instance = undefined;
      const newConfigService = EnvironmentConfigService.getInstance();
      
      const isValid = newConfigService.validateConfig();
      expect(isValid).toBe(false);
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    });

    it('should handle invalid API URL format', () => {
      // Temporarily set invalid API URL
      const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = 'invalid-url';
      
      // Reset service to pick up changes
      (EnvironmentConfigService as any).instance = undefined;
      const newConfigService = EnvironmentConfigService.getInstance();
      
      const isValid = newConfigService.validateConfig();
      expect(isValid).toBe(false);
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    });
  });

  describe('Environment Configuration Integration', () => {
    it('should work with different environment types', () => {
      const environments = ['development', 'staging', 'production', 'test'];
      
      environments.forEach(env => {
        process.env.NEXT_PUBLIC_APP_ENV = env;
        
        // Reset service to pick up changes
        (EnvironmentConfigService as any).instance = undefined;
        const configService = EnvironmentConfigService.getInstance();
        
        expect(configService.getCurrentEnvironment()).toBe(env);
        expect(configService.getConfig()).toBeDefined();
        expect(configService.validateConfig()).toBe(true);
      });
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_APP_ENV = mockEnv.NEXT_PUBLIC_APP_ENV;
    });

    it('should handle feature flag changes', () => {
      // Test with features disabled
      process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES = 'false';
      process.env.NEXT_PUBLIC_ENABLE_AUTOMATION = 'false';
      
      // Reset service to pick up changes
      (EnvironmentConfigService as any).instance = undefined;
      const configService = EnvironmentConfigService.getInstance();
      
      expect(configService.isFeatureEnabled('NEXT_PUBLIC_ENABLE_AI_FEATURES')).toBe(false);
      expect(configService.isFeatureEnabled('NEXT_PUBLIC_ENABLE_AUTOMATION')).toBe(false);
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES = mockEnv.NEXT_PUBLIC_ENABLE_AI_FEATURES;
      process.env.NEXT_PUBLIC_ENABLE_AUTOMATION = mockEnv.NEXT_PUBLIC_ENABLE_AUTOMATION;
    });

    it('should handle security configuration changes', () => {
      // Test with security enabled
      process.env.NEXT_PUBLIC_ENABLE_HTTPS_ONLY = 'true';
      process.env.NEXT_PUBLIC_ENABLE_CSP = 'true';
      process.env.NEXT_PUBLIC_ENABLE_HSTS = 'true';
      
      // Reset service to pick up changes
      (EnvironmentConfigService as any).instance = undefined;
      const configService = EnvironmentConfigService.getInstance();
      
      const securityConfig = configService.getSecurityConfig();
      expect(securityConfig.httpsOnly).toBe(true);
      expect(securityConfig.csp).toBe(true);
      expect(securityConfig.hsts).toBe(true);
      
      // Restore for other tests
      process.env.NEXT_PUBLIC_ENABLE_HTTPS_ONLY = mockEnv.NEXT_PUBLIC_ENABLE_HTTPS_ONLY;
      process.env.NEXT_PUBLIC_ENABLE_CSP = mockEnv.NEXT_PUBLIC_ENABLE_CSP;
      process.env.NEXT_PUBLIC_ENABLE_HSTS = mockEnv.NEXT_PUBLIC_ENABLE_HSTS;
    });
  });
});
