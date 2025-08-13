import { z } from 'zod';

// Frontend environment variable schema validation
const FrontendEnvironmentSchema = z.object({
  // Application Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('DealCycle CRM'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // Authentication Configuration
  NEXT_PUBLIC_BYPASS_AUTH: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_AUTH_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_AUTH_AUDIENCE: z.string().optional(),
  NEXT_PUBLIC_AUTH_REDIRECT_URI: z.string().url().optional(),
  
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('10000'),
  NEXT_PUBLIC_API_RETRY_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(1).max(10)).default('3'),
  
  // WebSocket Configuration
  NEXT_PUBLIC_WS_URL: z.string().url().default('ws://localhost:3000'),
  
  // Google OAuth Configuration
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // External Services
  NEXT_PUBLIC_TWILIO_ACCOUNT_SID: z.string().optional(),
  NEXT_PUBLIC_TWILIO_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Monitoring and Analytics
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_FEATURES: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_AUTOMATION: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_COMMUNICATIONS: z.string().transform(val => val === 'true').default('false'),
  
  // Performance Configuration
  NEXT_PUBLIC_ENABLE_SERVICE_WORKER: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_CACHE_DURATION: z.string().transform(Number).pipe(z.number().positive()).default('3600'),
  
  // Security Configuration
  NEXT_PUBLIC_ENABLE_HTTPS_ONLY: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_CSP: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_HSTS: z.string().transform(val => val === 'true').default('false'),
  
  // Development Configuration
  NEXT_PUBLIC_ENABLE_DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_LOGGING: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Build Configuration
  ANALYZE: z.string().transform(val => val === 'true').default('false'),
  GENERATE_SOURCEMAP: z.string().transform(val => val === 'true').default('false'),
});

export type FrontendEnvironmentConfig = z.infer<typeof FrontendEnvironmentSchema>;

// Environment-specific validation rules
const FrontendEnvironmentValidationRules = {
  development: {
    required: ['NEXT_PUBLIC_API_URL'],
    optional: ['NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'NEXT_PUBLIC_TWILIO_ACCOUNT_SID'],
    warnings: ['NEXT_PUBLIC_BYPASS_AUTH'], // Warn if auth bypass is enabled
  },
  staging: {
    required: ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'],
    optional: ['NEXT_PUBLIC_TWILIO_ACCOUNT_SID', 'NEXT_PUBLIC_SENTRY_DSN'],
    warnings: [],
  },
  production: {
    required: [
      'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', 
      'NEXT_PUBLIC_SENTRY_DSN', 'NEXT_PUBLIC_TWILIO_ACCOUNT_SID'
    ],
    optional: [],
    warnings: [],
  },
  test: {
    required: ['NEXT_PUBLIC_API_URL'],
    optional: ['NEXT_PUBLIC_GOOGLE_CLIENT_ID'],
    warnings: [],
  },
};

export interface FrontendEnvironmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  environment: string;
  timestamp: Date;
}

export class FrontendEnvironmentValidator {
  static validate(): FrontendEnvironmentValidationResult {
    const result: FrontendEnvironmentValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingRequired: [],
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      timestamp: new Date(),
    };

    try {
      // Parse and validate environment variables
      const parsed = FrontendEnvironmentSchema.parse(process.env);
      
      // Get validation rules for current environment
      const rules = FrontendEnvironmentValidationRules[result.environment as keyof typeof FrontendEnvironmentValidationRules];
      
      if (rules) {
        // Check required variables
        for (const requiredVar of rules.required) {
          if (!process.env[requiredVar]) {
            result.missingRequired.push(requiredVar);
            result.isValid = false;
          }
        }
        
        // Check for warnings
        for (const warningVar of rules.warnings) {
          if (process.env[warningVar] === 'true') {
            result.warnings.push(`${warningVar} is enabled - this may pose security risks in ${result.environment}`);
          }
        }
      }
      
      // Add validation errors
      if (result.missingRequired.length > 0) {
        result.errors.push(`Missing required environment variables for ${result.environment}: ${result.missingRequired.join(', ')}`);
      }
      
      // Environment-specific validations
      this.validateEnvironmentSpecificRules(result);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors.push(`Environment validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      } else {
        result.errors.push(`Environment validation failed: ${error}`);
      }
      result.isValid = false;
    }

    return result;
  }

  static validateAndThrow(): void {
    const result = this.validate();
    
    if (!result.isValid) {
      console.error('❌ Frontend environment validation failed:');
      result.errors.forEach(error => console.error(`  - ${error}`));
      result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
      throw new Error('Frontend environment validation failed. Please check your environment configuration.');
    }
    
    if (result.warnings.length > 0) {
      console.warn('⚠️  Frontend environment validation warnings:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
    
    console.log('✅ Frontend environment validation passed');
  }

  private static validateEnvironmentSpecificRules(result: FrontendEnvironmentValidationResult): void {
    switch (result.environment) {
      case 'development':
        this.validateDevelopmentRules(result);
        break;
      case 'staging':
        this.validateStagingRules(result);
        break;
      case 'production':
        this.validateProductionRules(result);
        break;
      case 'test':
        this.validateTestRules(result);
        break;
    }
  }

  private static validateDevelopmentRules(result: FrontendEnvironmentValidationResult): void {
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      result.warnings.push('Authentication bypass is enabled in development - this should not be used in production');
    }

    const debugMode = process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true';
    if (!debugMode) {
      result.warnings.push('Debug mode is disabled in development - this may impact development experience');
    }
  }

  private static validateStagingRules(result: FrontendEnvironmentValidationResult): void {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!sentryDsn) {
      result.warnings.push('Sentry DSN not configured in staging - error tracking may be limited');
    }

    const httpsOnly = process.env.NEXT_PUBLIC_ENABLE_HTTPS_ONLY === 'true';
    if (!httpsOnly) {
      result.warnings.push('HTTPS only mode is disabled in staging - consider enabling for security');
    }
  }

  private static validateProductionRules(result: FrontendEnvironmentValidationResult): void {
    const debugMode = process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true';
    if (debugMode) {
      result.errors.push('Debug mode must be disabled in production for security');
      result.isValid = false;
    }

    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    if (bypassAuth) {
      result.errors.push('Authentication bypass must be disabled in production for security');
      result.isValid = false;
    }

    const httpsOnly = process.env.NEXT_PUBLIC_ENABLE_HTTPS_ONLY === 'true';
    if (!httpsOnly) {
      result.errors.push('HTTPS only mode must be enabled in production for security');
      result.isValid = false;
    }

    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!sentryDsn) {
      result.errors.push('Sentry DSN is required in production for error tracking');
      result.isValid = false;
    }

    const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
    if (logLevel === 'debug') {
      result.warnings.push('Log level is set to debug in production - this may impact performance');
    }
  }

  private static validateTestRules(result: FrontendEnvironmentValidationResult): void {
    const testMode = process.env.NEXT_PUBLIC_APP_ENV === 'test';
    if (!testMode) {
      result.warnings.push('Test environment should have NEXT_PUBLIC_APP_ENV set to "test"');
    }

    const debugMode = process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true';
    if (debugMode) {
      result.warnings.push('Debug mode should be disabled in test environment for faster execution');
    }
  }
}

export default FrontendEnvironmentValidator;
