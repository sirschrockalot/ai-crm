/**
 * Service Health Check Utility
 * 
 * Verifies that all backend services are accessible and responding correctly.
 * This is useful for debugging integration issues and ensuring production readiness.
 */

import { configService } from '../services/configService';

export interface ServiceHealthStatus {
  service: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
  lastChecked?: Date;
}

export interface HealthCheckResult {
  overall: 'healthy' | 'unhealthy' | 'partial';
  services: ServiceHealthStatus[];
  timestamp: Date;
}

/**
 * Check health of a single service
 */
async function checkServiceHealth(
  serviceName: string,
  healthUrl: string
): Promise<ServiceHealthStatus> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        service: serviceName,
        url: healthUrl,
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
      };
    } else {
      return {
        service: serviceName,
        url: healthUrl,
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        lastChecked: new Date(),
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      service: serviceName,
      url: healthUrl,
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date(),
    };
  }
}

/**
 * Check health of all configured services
 */
export async function checkAllServicesHealth(): Promise<HealthCheckResult> {
  const config = configService.getConfig();
  const services: ServiceHealthStatus[] = [];
  
  // Check Auth Service - try multiple paths
  let authHealthUrl = `${config.microservices.auth.url}/api/health`;
  let authHealth = await checkServiceHealth('Auth Service', authHealthUrl);
  if (authHealth.status === 'unhealthy') {
    // Try alternative path
    authHealthUrl = `${config.microservices.auth.url}/health`;
    authHealth = await checkServiceHealth('Auth Service', authHealthUrl);
  }
  services.push(authHealth);
  
  // Check Leads Service - uses /health (skip if not configured or localhost)
  if (config.microservices.leads.url && !config.microservices.leads.url.includes('localhost')) {
    const leadsHealthUrl = `${config.microservices.leads.url}/health`;
    services.push(await checkServiceHealth('Leads Service', leadsHealthUrl));
  }
  
  // Check User Management Service - uses /api/v1/health (has global prefix)
  const userMgmtHealthUrl = `${config.microservices.userManagement.url}/api/v1/health`;
  services.push(await checkServiceHealth('User Management Service', userMgmtHealthUrl));
  
  // Check Timesheet Service - uses /health
  const timesheetHealthUrl = `${config.microservices.timesheet.url}/health`;
  services.push(await checkServiceHealth('Timesheet Service', timesheetHealthUrl));
  
  // Determine overall status
  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const totalCount = services.length;
  
  let overall: 'healthy' | 'unhealthy' | 'partial';
  if (healthyCount === totalCount) {
    overall = 'healthy';
  } else if (healthyCount === 0) {
    overall = 'unhealthy';
  } else {
    overall = 'partial';
  }
  
  return {
    overall,
    services,
    timestamp: new Date(),
  };
}

/**
 * Check health of a specific service by name
 */
export async function checkServiceHealthByName(
  serviceName: string
): Promise<ServiceHealthStatus | null> {
  const config = configService.getConfig();
  let healthUrl: string;
  
  switch (serviceName.toLowerCase()) {
    case 'auth':
      healthUrl = `${config.microservices.auth.url}/health`;
      break;
    case 'leads':
      healthUrl = `${config.microservices.leads.url}/health`;
      break;
    case 'usermanagement':
    case 'user-management':
      healthUrl = `${config.microservices.userManagement.url}/api/v1/health`;
      break;
    case 'timesheet':
      healthUrl = `${config.microservices.timesheet.url}/health`;
      break;
    default:
      return null;
  }
  
  return checkServiceHealth(serviceName, healthUrl);
}

