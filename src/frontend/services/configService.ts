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
  userManagement: ServiceConfig;
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
        userManagement: {
          url: process.env.NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL || 'http://localhost:3005',
          apiUrl: process.env.NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL || 'http://localhost:3005/api/v1',
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
   * Get user management service configuration
   */
  getUserManagementServiceConfig(): ServiceConfig {
    return this.config.microservices.userManagement;
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
    return process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENV === 'staging';
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

// Export individual getters for convenience with fallback
export const getConfig = () => {
  try {
    return configService.getConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback config');
    return getDefaultConfig();
  }
};

export const getApiConfig = () => {
  try {
    return configService.getApiConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback API config');
    return getDefaultConfig().api;
  }
};

export const getWebSocketConfig = () => {
  try {
    return configService.getWebSocketConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback WebSocket config');
    return { url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000' };
  }
};

export const getMicroservicesConfig = () => {
  try {
    return configService.getMicroservicesConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback microservices config');
    return getDefaultConfig().microservices;
  }
};

export const getServiceConfig = (service: keyof MicroservicesConfig) => {
  try {
    return configService.getServiceConfig(service);
  } catch (error) {
    console.error('ConfigService not available, using fallback service config for', service);
    return getDefaultConfig().microservices[service];
  }
};

export const getAuthServiceConfig = () => {
  try {
    return configService.getAuthServiceConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback auth service config');
    return {
      url: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
      apiUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_API_URL || 'http://localhost:3001/api'
    };
  }
};

export const getLeadsServiceConfig = () => {
  try {
    return configService.getLeadsServiceConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback leads service config');
    return {
      url: process.env.NEXT_PUBLIC_LEADS_SERVICE_URL || 'http://localhost:3002',
      apiUrl: process.env.NEXT_PUBLIC_LEADS_SERVICE_API_URL || 'http://localhost:3002/api'
    };
  }
};

export const getTransactionsServiceConfig = () => {
  try {
    return configService.getTransactionsServiceConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback transactions service config');
    return {
      url: process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_URL || 'http://localhost:3003',
      apiUrl: process.env.NEXT_PUBLIC_TRANSACTIONS_SERVICE_API_URL || 'http://localhost:3003/api'
    };
  }
};

export const getTimesheetServiceConfig = () => {
  try {
    return configService.getTimesheetServiceConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback timesheet service config');
    return {
      url: process.env.NEXT_PUBLIC_TIMESHEET_SERVICE_URL || 'http://localhost:3004',
      apiUrl: process.env.NEXT_PUBLIC_TIMESHEET_SERVICE_API_URL || 'http://localhost:3004/api'
    };
  }
};

export const getLeadImportServiceConfig = () => {
  try {
    return configService.getLeadImportServiceConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback lead import service config');
    return {
      url: process.env.NEXT_PUBLIC_LEAD_IMPORT_SERVICE_URL || 'http://localhost:3005',
      apiUrl: process.env.NEXT_PUBLIC_LEAD_IMPORT_SERVICE_API_URL || 'http://localhost:3005/api'
    };
  }
};

export const getUserManagementServiceConfig = () => {
  try {
    return configService.getUserManagementServiceConfig();
  } catch (error) {
    console.error('ConfigService not available, using fallback user management service config');
    return {
      url: process.env.NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL || 'http://localhost:3005',
      apiUrl: process.env.NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_API_URL || 'http://localhost:3005/api/v1'
    };
  }
};

export const isDevelopment = () => {
  try {
    return configService.isDevelopment();
  } catch (error) {
    return process.env.NODE_ENV === 'development';
  }
};

export const isProduction = () => {
  try {
    return configService.isProduction();
  } catch (error) {
    return process.env.NODE_ENV === 'production';
  }
};

export const isStaging = () => {
  try {
    return configService.isStaging();
  } catch (error) {
    return process.env.NODE_ENV === 'staging';
  }
};

export const getEnvironment = () => {
  try {
    return configService.getEnvironment();
  } catch (error) {
    return process.env.NODE_ENV || 'development';
  }
};

export const isAuthBypassEnabled = () => {
  try {
    return configService.isAuthBypassEnabled();
  } catch (error) {
    return process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  }
};

export default configService;
