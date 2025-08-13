import { FrontendEnvironmentValidator, FrontendEnvironmentValidationResult, FrontendEnvironmentConfig } from './environmentValidationService';

/**
 * Frontend Environment Configuration Service
 * Manages environment-specific configuration and validation
 */
export class EnvironmentConfigService {
  private static instance: EnvironmentConfigService;
  private config: FrontendEnvironmentConfig | null = null;
  private validationResult: FrontendEnvironmentValidationResult | null = null;
  private environment: string = 'development';

  private constructor() {
    this.environment = this.detectEnvironment();
    this.validateEnvironment();
  }

  public static getInstance(): EnvironmentConfigService {
    if (!EnvironmentConfigService.instance) {
      EnvironmentConfigService.instance = new EnvironmentConfigService();
    }
    return EnvironmentConfigService.instance;
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
      return process.env.NEXT_PUBLIC_APP_ENV || 'development';
    }
  }

  /**
   * Validate environment configuration
   */
  private validateEnvironment(): void {
    try {
      this.validationResult = FrontendEnvironmentValidator.validate();
      
      if (!this.validationResult.isValid) {
        console.error('❌ Frontend environment validation failed:');
        this.validationResult.errors.forEach(error => console.error(`  - ${error}`));
        
        if (this.validationResult.warnings.length > 0) {
          console.warn('⚠️  Frontend environment validation warnings:');
          this.validationResult.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }
        
        // In development, we might want to continue with warnings
        if (this.environment === 'production') {
          throw new Error('Frontend environment validation failed in production');
        }
      } else {
        console.log('✅ Frontend environment validation passed');
        if (this.validationResult.warnings.length > 0) {
          console.warn('⚠️  Frontend environment validation warnings:');
          this.validationResult.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }
      }
    } catch (error) {
      console.error('Frontend environment validation error:', error);
      // In development, we might want to continue with errors
      if (this.environment === 'production') {
        throw error;
      }
    }
  }

  /**
   * Get the current environment
   */
  public getCurrentEnvironment(): string {
    return this.environment;
  }

  /**
   * Get environment configuration
   */
  public getConfig(): FrontendEnvironmentConfig {
    if (!this.config) {
      // Parse environment variables into config object
      this.config = {
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DealCycle CRM',
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        NEXT_PUBLIC_APP_ENV: (process.env.NEXT_PUBLIC_APP_ENV as any) || 'development',
        NEXT_PUBLIC_BYPASS_AUTH: process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true',
        NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
        NEXT_PUBLIC_AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
        NEXT_PUBLIC_AUTH_AUDIENCE: process.env.NEXT_PUBLIC_AUTH_AUDIENCE,
        NEXT_PUBLIC_AUTH_REDIRECT_URI: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        NEXT_PUBLIC_API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
        NEXT_PUBLIC_API_RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        NEXT_PUBLIC_TWILIO_ACCOUNT_SID: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        NEXT_PUBLIC_TWILIO_AUTH_TOKEN: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
        NEXT_PUBLIC_TWILIO_PHONE_NUMBER: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
        NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
        NEXT_PUBLIC_ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
        NEXT_PUBLIC_ENABLE_AUTOMATION: process.env.NEXT_PUBLIC_ENABLE_AUTOMATION === 'true',
        NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        NEXT_PUBLIC_ENABLE_COMMUNICATIONS: process.env.NEXT_PUBLIC_ENABLE_COMMUNICATIONS === 'true',
        NEXT_PUBLIC_ENABLE_SERVICE_WORKER: process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === 'true',
        NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT === 'true',
        NEXT_PUBLIC_CACHE_DURATION: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '3600'),
        NEXT_PUBLIC_ENABLE_HTTPS_ONLY: process.env.NEXT_PUBLIC_ENABLE_HTTPS_ONLY === 'true',
        NEXT_PUBLIC_ENABLE_CSP: process.env.NEXT_PUBLIC_ENABLE_CSP === 'true',
        NEXT_PUBLIC_ENABLE_HSTS: process.env.NEXT_PUBLIC_ENABLE_HSTS === 'true',
        NEXT_PUBLIC_ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
        NEXT_PUBLIC_ENABLE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
        NEXT_PUBLIC_LOG_LEVEL: (process.env.NEXT_PUBLIC_LOG_LEVEL as any) || 'info',
        ANALYZE: process.env.ANALYZE === 'true',
        GENERATE_SOURCEMAP: process.env.GENERATE_SOURCEMAP === 'true',
      };
    }
    return this.config;
  }

  /**
   * Get validation result
   */
  public getValidationResult(): FrontendEnvironmentValidationResult | null {
    return this.validationResult;
  }

  /**
   * Check if environment is valid
   */
  public isEnvironmentValid(): boolean {
    return this.validationResult?.isValid ?? false;
  }

  /**
   * Get environment-specific configuration
   */
  public getEnvironmentConfig() {
    const config = this.getConfig();
    
    switch (this.environment) {
      case 'development':
        return {
          debugMode: config.NEXT_PUBLIC_ENABLE_DEBUG_MODE,
          hotReload: true,
          mockData: true,
          bypassAuth: config.NEXT_PUBLIC_BYPASS_AUTH,
          logLevel: config.NEXT_PUBLIC_LOG_LEVEL,
        };
      case 'staging':
        return {
          debugMode: false,
          hotReload: false,
          mockData: false,
          bypassAuth: false,
          logLevel: 'info',
          monitoring: true,
        };
      case 'production':
        return {
          debugMode: false,
          hotReload: false,
          mockData: false,
          bypassAuth: false,
          logLevel: 'warn',
          monitoring: true,
          security: 'strict',
        };
      case 'test':
        return {
          debugMode: false,
          hotReload: false,
          mockData: true,
          bypassAuth: false,
          logLevel: 'error',
        };
      default:
        return {};
    }
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    const config = this.getConfig();
    return config.NEXT_PUBLIC_ENABLE_DEBUG_MODE;
  }

  /**
   * Check if a feature is enabled
   */
  public isFeatureEnabled(feature: keyof Pick<FrontendEnvironmentConfig, 
    'NEXT_PUBLIC_ENABLE_AI_FEATURES' | 
    'NEXT_PUBLIC_ENABLE_AUTOMATION' | 
    'NEXT_PUBLIC_ENABLE_ANALYTICS' | 
    'NEXT_PUBLIC_ENABLE_COMMUNICATIONS'
  >): boolean {
    const config = this.getConfig();
    return config[feature];
  }

  /**
   * Get API configuration
   */
  public getApiConfig() {
    const config = this.getConfig();
    return {
      baseUrl: config.NEXT_PUBLIC_API_URL,
      timeout: config.NEXT_PUBLIC_API_TIMEOUT,
      retryAttempts: config.NEXT_PUBLIC_API_RETRY_ATTEMPTS,
      wsUrl: config.NEXT_PUBLIC_WS_URL,
    };
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig() {
    const config = this.getConfig();
    return {
      httpsOnly: config.NEXT_PUBLIC_ENABLE_HTTPS_ONLY,
      csp: config.NEXT_PUBLIC_ENABLE_CSP,
      hsts: config.NEXT_PUBLIC_ENABLE_HSTS,
      bypassAuth: config.NEXT_PUBLIC_BYPASS_AUTH,
    };
  }

  /**
   * Get monitoring configuration
   */
  public getMonitoringConfig() {
    const config = this.getConfig();
    return {
      sentryDsn: config.NEXT_PUBLIC_SENTRY_DSN,
      analyticsId: config.NEXT_PUBLIC_ANALYTICS_ID,
      mixpanelToken: config.NEXT_PUBLIC_MIXPANEL_TOKEN,
      logLevel: config.NEXT_PUBLIC_LOG_LEVEL,
      enableLogging: config.NEXT_PUBLIC_ENABLE_LOGGING,
    };
  }

  /**
   * Get external service configuration
   */
  public getExternalServiceConfig() {
    const config = this.getConfig();
    return {
      google: {
        clientId: config.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: config.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      },
      twilio: {
        accountSid: config.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        authToken: config.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
        phoneNumber: config.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
      },
    };
  }

  /**
   * Validate configuration
   */
  public validateConfig(): boolean {
    try {
      const config = this.getConfig();
      
      // Basic validation - check required fields
      const requiredFields = ['NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_API_URL'];
      
      for (const field of requiredFields) {
        if (!config[field as keyof FrontendEnvironmentConfig]) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Validate API URL format
      try {
        new URL(config.NEXT_PUBLIC_API_URL);
      } catch {
        console.error('Invalid API URL format');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Get configuration summary
   */
  public getConfigurationSummary(): Record<string, any> {
    const config = this.getConfig();
    
    return {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      validation: {
        isValid: this.isEnvironmentValid(),
        errors: this.validationResult?.errors || [],
        warnings: this.validationResult?.warnings || [],
      },
      core: {
        appName: config.NEXT_PUBLIC_APP_NAME,
        appVersion: config.NEXT_PUBLIC_APP_VERSION,
        apiUrl: config.NEXT_PUBLIC_API_URL,
        wsUrl: config.NEXT_PUBLIC_WS_URL,
      },
      features: {
        aiFeatures: config.NEXT_PUBLIC_ENABLE_AI_FEATURES,
        automation: config.NEXT_PUBLIC_ENABLE_AUTOMATION,
        analytics: config.NEXT_PUBLIC_ENABLE_ANALYTICS,
        communications: config.NEXT_PUBLIC_ENABLE_COMMUNICATIONS,
      },
      security: {
        httpsOnly: config.NEXT_PUBLIC_ENABLE_HTTPS_ONLY,
        csp: config.NEXT_PUBLIC_ENABLE_CSP,
        hsts: config.NEXT_PUBLIC_ENABLE_HSTS,
        bypassAuth: config.NEXT_PUBLIC_BYPASS_AUTH,
      },
      development: {
        debugMode: config.NEXT_PUBLIC_ENABLE_DEBUG_MODE,
        logging: config.NEXT_PUBLIC_ENABLE_LOGGING,
        logLevel: config.NEXT_PUBLIC_LOG_LEVEL,
      },
      externalServices: {
        googleOAuth: config.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
        twilio: config.NEXT_PUBLIC_TWILIO_ACCOUNT_SID ? 'configured' : 'not configured',
      },
      monitoring: {
        sentry: config.NEXT_PUBLIC_SENTRY_DSN ? 'configured' : 'not configured',
        analytics: config.NEXT_PUBLIC_ANALYTICS_ID ? 'configured' : 'not configured',
        mixpanel: config.NEXT_PUBLIC_MIXPANEL_TOKEN ? 'configured' : 'not configured',
      },
    };
  }

  /**
   * Refresh configuration (useful for hot reloading in development)
   */
  public refreshConfig(): void {
    this.config = null;
    this.validationResult = null;
    this.validateEnvironment();
  }
}

export default EnvironmentConfigService;
