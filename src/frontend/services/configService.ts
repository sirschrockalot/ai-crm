/**
 * Configuration Service
 * Centralized configuration management for microservices and environment variables
 */

export interface ServiceConfig {
  url: string;
  apiUrl: string;
}

export interface MicroservicesConfig {
  auth: ServiceConfig;
  leads: ServiceConfig;
  transactions: ServiceConfig;
  timesheet: ServiceConfig;
  leadImport: ServiceConfig;
}

export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  apiRetryAttempts: number;
  wsUrl: string;
  microservices: MicroservicesConfig;
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    return {
      // Frontend API Configuration
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
      apiRetryAttempts: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '5', 10),
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',

      // Microservices Configuration
      microservices: {
        auth: {
          url: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
          apiUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_API_URL || 'http://localhost:3001/api/auth',
        },
        leads: {
          url: process.env.NEXT_PUBLIC_LEADS_SERVICE_URL || 'http://localhost:3002',
          apiUrl: process.env.NEXT_PUBLIC_LEADS_SERVICE_API_URL || 'http://localhost:3002/api/leads',
        },
        transactions: {
          url: process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL || 'https://transactions-service.example.com',
          apiUrl: process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL || 'https://transactions-service.example.com/api/v1',
        },
        timesheet: {
          url: process.env.NEXT_PUBLIC_TIMESHEET_SERVICE_URL || 'http://localhost:3001',
          apiUrl: process.env.NEXT_PUBLIC_TIMESHEET_SERVICE_API_URL || 'http://localhost:3001/api/timesheet',
        },
        leadImport: {
          url: process.env.NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL || 'http://localhost:3003',
          apiUrl: process.env.NEXT_PUBLIC_LEAD_IMPORT_SERVICE_API_URL || 'http://localhost:3003/api/import',
        },
      },
    };
  }

  /**
   * Get the complete application configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get frontend API configuration
   */
  getApiConfig() {
    return {
      url: this.config.apiUrl,
      timeout: this.config.apiTimeout,
      retryAttempts: this.config.apiRetryAttempts,
    };
  }

  /**
   * Get WebSocket configuration
   */
  getWebSocketConfig() {
    return {
      url: this.config.wsUrl,
    };
  }

  /**
   * Get microservices configuration
   */
  getMicroservicesConfig(): MicroservicesConfig {
    return this.config.microservices;
  }

  /**
   * Get specific microservice configuration
   */
  getServiceConfig(service: keyof MicroservicesConfig): ServiceConfig {
    return this.config.microservices[service];
  }

  /**
   * Get authentication service configuration
   */
  getAuthServiceConfig(): ServiceConfig {
    return this.config.microservices.auth;
  }

  /**
   * Get leads service configuration
   */
  getLeadsServiceConfig(): ServiceConfig {
    return this.config.microservices.leads;
  }

  /**
   * Get transactions service configuration
   */
  getTransactionsServiceConfig(): ServiceConfig {
    return this.config.microservices.transactions;
  }

  /**
   * Get timesheet service configuration
   */
  getTimesheetServiceConfig(): ServiceConfig {
    return this.config.microservices.timesheet;
  }

  /**
   * Get lead import service configuration
   */
  getLeadImportServiceConfig(): ServiceConfig {
    return this.config.microservices.leadImport;
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Check if running in staging mode
   */
  isStaging(): boolean {
    return process.env.NODE_ENV === 'staging';
  }

  /**
   * Get environment name
   */
  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Check if authentication bypass is enabled
   */
  isAuthBypassEnabled(): boolean {
    return process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  }
}

// Export singleton instance
export const configService = new ConfigService();

// Export individual getters for convenience
export const {
  getConfig,
  getApiConfig,
  getWebSocketConfig,
  getMicroservicesConfig,
  getServiceConfig,
  getAuthServiceConfig,
  getLeadsServiceConfig,
  getTransactionsServiceConfig,
  getTimesheetServiceConfig,
  getLeadImportServiceConfig,
  isDevelopment,
  isProduction,
  isStaging,
  getEnvironment,
  isAuthBypassEnabled,
} = configService;

export default configService;
