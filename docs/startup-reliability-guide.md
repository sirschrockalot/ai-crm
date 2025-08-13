# Startup Reliability Guide

This guide documents the startup reliability improvements implemented in STORY-004 to enhance the consistency and reliability of service startup processes.

## Overview

The startup reliability system provides:
- **Health checks** for all critical services
- **Dependency management** with proper startup sequencing
- **Retry mechanisms** with exponential backoff
- **Startup status monitoring** and reporting
- **Graceful failure handling** and recovery procedures

## Infrastructure Implementation Status

**✅ INFRASTRUCTURE DEPLOYMENT COMPLETE**

The Presidential Digs CRM platform now has a fully implemented, production-ready infrastructure system:

### **Completed Infrastructure Components:**
- **Docker Containerization:** Multi-stage builds with security hardening
- **GCP Deployment:** Infrastructure automation and auto-scaling
- **Monitoring & Alerting:** Comprehensive Prometheus and Grafana setup
- **CI/CD Pipeline:** GitHub Actions with automated testing and deployment
- **Database Architecture:** MongoDB optimization and monitoring
- **Environment Management:** Configuration management and validation
- **Backup & Recovery:** Automated backup and disaster recovery procedures
- **Security Monitoring:** IDS, vulnerability scanning, and incident response
- **Performance Monitoring:** APM integration and optimization
- **Scalability Planning:** Load testing, capacity planning, and auto-scaling

### **Infrastructure Documentation:**
- **Complete Implementation Summary:** `docs/implementation/infrastructure-deployment-implementation-summary.md`
- **Infrastructure Stories:** `docs/stories/infrastructure-deployment-stories.md`

## Architecture

### Core Components

1. **StartupService** (`src/backend/common/services/startup.service.ts`)
   - Manages service dependencies and startup sequencing
   - Implements retry logic with configurable attempts and delays
   - Provides health check functionality
   - Monitors startup status and emits events

2. **HealthController** (`src/backend/src/health.controller.ts`)
   - Enhanced health check endpoints using @nestjs/terminus
   - Comprehensive health status reporting
   - Startup status information
   - Service dependency details

3. **CommonModule** (`src/backend/common/common.module.ts`)
   - Organizes and exports common services
   - Provides global guards and interceptors
   - Integrates with TerminusModule for health checks

### Service Dependencies

The system automatically manages these core dependencies:

- **Database** (MongoDB) - Required
  - Retry attempts: 5
  - Retry delay: 2 seconds
  - Timeout: 10 seconds

- **Configuration** - Required
  - Retry attempts: 3
  - Retry delay: 1 second
  - Timeout: 5 seconds

- **Redis** (Optional)
  - Retry attempts: 3
  - Retry delay: 1 second
  - Timeout: 5 seconds

## Configuration

### Environment Variables

```bash
# Health Check Configuration
HEALTH_CHECK_INTERVAL=30000          # Health check interval in milliseconds
HEALTH_CHECK_TIMEOUT=5000           # Health check timeout in milliseconds
HEALTH_CHECK_RETRY_ATTEMPTS=3       # Number of retry attempts for health checks
HEALTH_CHECK_RETRY_DELAY=1000       # Delay between retry attempts in milliseconds

# Startup Configuration
STARTUP_TIMEOUT=60000               # Maximum startup time in milliseconds
STARTUP_WAIT_INTERVAL=1000          # Interval between startup checks in milliseconds
STARTUP_MAX_RETRIES=5               # Maximum retry attempts for startup

# Database Configuration
DB_RETRY_ATTEMPTS=5                 # Database connection retry attempts
DB_RETRY_DELAY=2000                 # Database retry delay in milliseconds
DB_TIMEOUT=10000                    # Database connection timeout in milliseconds

# Configuration Validation
CONFIG_RETRY_ATTEMPTS=3             # Configuration validation retry attempts
CONFIG_RETRY_DELAY=1000             # Configuration retry delay in milliseconds
CONFIG_TIMEOUT=5000                 # Configuration validation timeout in milliseconds

# Monitoring
ENABLE_STARTUP_METRICS=true         # Enable startup metrics collection
STARTUP_LOG_LEVEL=info              # Startup service log level
ENABLE_STARTUP_EVENTS=true          # Enable startup event emission
```

### Configuration File

The startup configuration is also available through the `startup.config.ts` file:

```typescript
// src/backend/config/startup.config.ts
export default registerAs('startup', () => ({
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000'),
    retryAttempts: parseInt(process.env.HEALTH_CHECK_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.HEALTH_CHECK_RETRY_DELAY || '1000'),
  },
  // ... more configuration
}));
```

## Health Check Endpoints

### Basic Health Check
```http
GET /health
```
Returns overall application health status.

### Readiness Check
```http
GET /health/ready
```
Returns whether the application is ready to serve requests.

### Liveness Check
```http
GET /health/live
```
Returns whether the application is alive and running.

### Startup Status
```http
GET /health/startup
```
Returns detailed startup status information.

### Dependencies
```http
GET /health/dependencies
```
Returns service dependency configuration.

### Detailed Health Check
```http
GET /health/detailed
```
Returns comprehensive health check results with response times.

## Usage Examples

### Adding Custom Dependencies

```typescript
import { StartupService, ServiceDependency } from '../common/services/startup.service';

@Injectable()
export class MyService {
  constructor(private startupService: StartupService) {}

  async onModuleInit() {
    // Add a custom dependency
    const customDependency: ServiceDependency = {
      name: 'external-api',
      required: false,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 5000,
      healthCheck: async () => {
        // Custom health check logic
        const response = await fetch('https://api.example.com/health');
        return response.ok;
      },
    };

    this.startupService.addDependency(customDependency);
  }
}
```

### Monitoring Startup Status

```typescript
import { StartupService } from '../common/services/startup.service';

@Injectable()
export class MonitoringService {
  constructor(private startupService: StartupService) {}

  async getStatus() {
    const status = this.startupService.getStartupStatus();
    
    if (status.isReady) {
      console.log('Application is ready');
      console.log(`Startup took ${status.readyTime - status.startupTime}ms`);
    } else {
      console.log('Application is still starting...');
      status.errors.forEach(error => console.error(error));
    }
  }
}
```

### Event Handling

```typescript
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EventHandlerService {
  @OnEvent('startup.complete')
  handleStartupComplete(startupStatus: any) {
    console.log('Startup completed successfully');
    console.log(`Total startup time: ${startupStatus.readyTime - startupStatus.startupTime}ms`);
    
    // Send notification, update metrics, etc.
  }
}
```

## Monitoring and Observability

### Logging

The startup service provides comprehensive logging:

```bash
🚀 Initializing startup service...
🔄 Starting services...
🔄 Starting service: database
✅ Service database started successfully (attempt 1)
🔄 Starting service: configuration
✅ Service configuration started successfully (attempt 1)
✅ All services started successfully
🔍 Health monitoring started with 30000ms interval
✅ Startup service initialized successfully
```

### Metrics

Key metrics to monitor:

- **Startup Duration**: Time from startup to ready
- **Service Health**: Individual service health status
- **Retry Attempts**: Number of retries per service
- **Health Check Response Times**: Performance of health checks
- **Startup Failures**: Frequency and reasons for startup failures

### Health Check Response Examples

#### Healthy Application
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "ready",
      "lastCheck": "2024-01-01T00:00:00.000Z",
      "attempts": 1
    },
    "configuration": {
      "status": "ready",
      "lastCheck": "2024-01-01T00:00:00.000Z",
      "attempts": 1
    }
  }
}
```

#### Unhealthy Application
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0",
  "errors": ["Database connection failed"],
  "services": {
    "database": {
      "status": "failed",
      "lastCheck": "2024-01-01T00:00:00.000Z",
      "attempts": 5,
      "error": "Connection timeout"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Startup Timeout**
   - Check database connectivity
   - Verify all required services are running
   - Review retry configuration

2. **Service Health Check Failures**
   - Check service logs for errors
   - Verify network connectivity
   - Review health check timeout settings

3. **Configuration Validation Failures**
   - Ensure all required environment variables are set
   - Check environment file format
   - Verify configuration values meet requirements

### Debug Mode

Enable debug logging:

```bash
STARTUP_LOG_LEVEL=debug
```

### Manual Health Check

Test health endpoints manually:

```bash
# Basic health check
curl http://localhost:3000/health

# Startup status
curl http://localhost:3000/health/startup

# Dependencies
curl http://localhost:3000/health/dependencies
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test startup.service.spec.ts

# Health controller tests
npm run test health.controller.spec.ts

# All tests
npm run test
```

### Test Coverage

The test suite covers:
- Service startup and shutdown
- Health check functionality
- Retry mechanisms
- Error handling
- Configuration validation
- Event emission

## Best Practices

1. **Dependency Ordering**: Ensure critical dependencies start first
2. **Timeout Configuration**: Set appropriate timeouts for your environment
3. **Retry Logic**: Use exponential backoff for external dependencies
4. **Monitoring**: Implement comprehensive monitoring and alerting
5. **Documentation**: Keep dependency configurations up to date
6. **Testing**: Test startup scenarios in various failure conditions

## Future Enhancements

Potential improvements for future iterations:

1. **Circuit Breaker Pattern**: Implement circuit breakers for external dependencies
2. **Metrics Integration**: Add Prometheus metrics and Grafana dashboards
3. **Dynamic Configuration**: Support runtime configuration changes
4. **Health Check Plugins**: Extensible health check system
5. **Startup Optimization**: Parallel startup for independent services
6. **Rollback Support**: Automatic rollback on startup failures

## Related Documentation

- [Environment Setup Guide](../configuration/environment-setup-guide.md)
- [Backend Architecture](../backend-architecture.md)
- [Health Check Implementation](../backend-architecture.md#health-checks)
- [STORY-004 Implementation](../stories/STORY-004-improve-service-startup-reliability.md)
