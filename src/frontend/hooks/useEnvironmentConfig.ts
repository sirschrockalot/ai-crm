import { useState, useEffect, useCallback } from 'react';
import EnvironmentConfigService from '../services/environmentConfigService';
import { FrontendEnvironmentConfig } from '../services/environmentValidationService';

/**
 * React hook for accessing environment configuration
 * Provides easy access to environment variables and configuration
 */
export const useEnvironmentConfig = () => {
  const [config, setConfig] = useState<FrontendEnvironmentConfig | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const configService = EnvironmentConfigService.getInstance();

  // Initialize configuration
  useEffect(() => {
    try {
      const environmentConfig = configService.getConfig();
      const validationResult = configService.getValidationResult();
      
      setConfig(environmentConfig);
      setIsValid(configService.isEnvironmentValid());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load environment configuration');
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [configService]);

  // Refresh configuration
  const refreshConfig = useCallback(() => {
    try {
      configService.refreshConfig();
      const environmentConfig = configService.getConfig();
      const validationResult = configService.getValidationResult();
      
      setConfig(environmentConfig);
      setIsValid(configService.isEnvironmentValid());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh environment configuration');
      setIsValid(false);
    }
  }, [configService]);

  // Get current environment
  const getCurrentEnvironment = useCallback(() => {
    return configService.getCurrentEnvironment();
  }, [configService]);

  // Check if feature is enabled
  const isFeatureEnabled = useCallback((feature: keyof Pick<FrontendEnvironmentConfig, 
    'NEXT_PUBLIC_ENABLE_AI_FEATURES' | 
    'NEXT_PUBLIC_ENABLE_AUTOMATION' | 
    'NEXT_PUBLIC_ENABLE_ANALYTICS' | 
    'NEXT_PUBLIC_ENABLE_COMMUNICATIONS'
  >) => {
    return configService.isFeatureEnabled(feature);
  }, [configService]);

  // Check if debug mode is enabled
  const isDebugMode = useCallback(() => {
    return configService.isDebugMode();
  }, [configService]);

  // Get API configuration
  const getApiConfig = useCallback(() => {
    return configService.getApiConfig();
  }, [configService]);

  // Get security configuration
  const getSecurityConfig = useCallback(() => {
    return configService.getSecurityConfig();
  }, [configService]);

  // Get monitoring configuration
  const getMonitoringConfig = useCallback(() => {
    return configService.getMonitoringConfig();
  }, [configService]);

  // Get external service configuration
  const getExternalServiceConfig = useCallback(() => {
    return configService.getExternalServiceConfig();
  }, [configService]);

  // Get environment-specific configuration
  const getEnvironmentConfig = useCallback(() => {
    return configService.getEnvironmentConfig();
  }, [configService]);

  // Get configuration summary
  const getConfigurationSummary = useCallback(() => {
    return configService.getConfigurationSummary();
  }, [configService]);

  // Validate configuration
  const validateConfig = useCallback(() => {
    return configService.validateConfig();
  }, [configService]);

  return {
    // State
    config,
    isValid,
    isLoading,
    error,
    
    // Actions
    refreshConfig,
    
    // Getters
    getCurrentEnvironment,
    isFeatureEnabled,
    isDebugMode,
    getApiConfig,
    getSecurityConfig,
    getMonitoringConfig,
    getExternalServiceConfig,
    getEnvironmentConfig,
    getConfigurationSummary,
    validateConfig,
    
    // Utility
    environment: getCurrentEnvironment(),
    isDevelopment: getCurrentEnvironment() === 'development',
    isStaging: getCurrentEnvironment() === 'staging',
    isProduction: getCurrentEnvironment() === 'production',
    isTest: getCurrentEnvironment() === 'test',
  };
};

export default useEnvironmentConfig;
