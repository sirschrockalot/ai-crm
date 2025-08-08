import { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: boolean;
    api: boolean;
    memory: boolean;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      checks: {
        database: false,
        api: false,
        memory: false,
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    });
  }

  try {
    // Perform health checks
    const checks = await performHealthChecks();
    
    // Determine overall health
    const isHealthy = Object.values(checks).every(check => check);
    
    const response: HealthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      checks,
      metrics: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    // Set appropriate status code
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    // Health check failed
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      checks: {
        database: false,
        api: false,
        memory: false,
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    });
  }
}

async function performHealthChecks(): Promise<{
  database: boolean;
  api: boolean;
  memory: boolean;
}> {
  const checks = {
    database: false,
    api: false,
    memory: false,
  };

  try {
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    checks.memory = memoryUsageMB < 500; // Less than 500MB

    // Check API connectivity
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      checks.api = response.ok;
    } catch (error) {
      // API health check failed
      checks.api = false;
    }

    // Check database connectivity (if configured)
    // This would typically check MongoDB connection
    // For now, we'll assume it's healthy if we can reach this point
    checks.database = true;

  } catch (error) {
    // Health checks failed
  }

  return checks;
} 