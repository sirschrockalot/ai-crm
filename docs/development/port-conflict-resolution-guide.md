# Port Conflict Resolution Guide

## Overview

The DealCycle CRM backend implements a comprehensive port conflict resolution system to prevent and resolve "EADDRINUSE: address already in use" errors. This system ensures reliable service startup and graceful shutdown procedures.

## Architecture

### Core Components

1. **Port Manager (`src/utils/port-manager.ts`)**
   - Process tracking and management
   - Port availability checking
   - Automatic port finding and fallback
   - Port reservation and locking
   - Graceful shutdown coordination

2. **Main Bootstrap (`src/main.ts`)**
   - Enhanced error handling
   - Port conflict detection
   - Automatic resolution
   - Comprehensive diagnostics

3. **Development Scripts**
   - Port cleanup utilities
   - Process monitoring
   - Health checks
   - Conflict resolution tools

## How It Works

### 1. Startup Process

```typescript
// Enhanced port finding with conflict resolution
const port = await findAvailablePortEnhanced(preferredPort);

// Port reservation with retry logic
const portReserved = await reservePort(port);
if (!portReserved) {
  // Retry with additional cleanup
  await cleanupExistingProcesses(port);
  const retryReservation = await reservePort(port);
}

// Graceful shutdown setup
setupGracefulShutdown(app, port);
```

### 2. Port Conflict Detection

The system performs multiple checks:

- **Port Health Check**: Comprehensive analysis of port status
- **Process Tracking**: Monitors processes using specific ports
- **System Status**: Overview of all port usage across the system
- **Lock Verification**: Ensures port isn't locked by another instance

### 3. Automatic Resolution

When conflicts are detected:

1. **Enhanced Cleanup**: Removes orphaned processes
2. **Port Finding**: Automatically finds alternative ports
3. **Reservation**: Locks the port to prevent future conflicts
4. **Fallback**: Uses configurable port ranges if needed

### 4. Graceful Shutdown

```typescript
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Release port lock
  await portLockManager.releaseLock(port, process.pid);
  
  // Close application
  await app.close();
  
  // Cleanup process tracking
  ProcessTracker.getInstance().removeProcess(process.pid);
  
  process.exit(0);
};
```

## Development Scripts

### Port Management

```bash
# Clean up ports and processes
npm run dev:cleanup

# Force cleanup all processes
npm run dev:force-cleanup

# Check port status
npm run dev:status

# Check port health
npm run dev:health

# Kill processes on specific port
npm run dev:kill-port -- 3000

# Reset process tracking
npm run dev:reset

# Test port conflict resolution
npm run test:port-conflicts
```

### Script Descriptions

- **`dev:cleanup`**: Standard cleanup of orphaned processes
- **`dev:force-cleanup`**: Aggressive cleanup for stubborn processes
- **`dev:status`**: Comprehensive port and process status
- **`dev:health`**: Detailed health analysis of specific ports
- **`dev:kill-port`**: Kill processes using a specific port
- **`dev:reset`**: Reset process tracking and port locks
- **`test:port-conflicts`**: End-to-end testing of conflict resolution

## Configuration

### Environment Variables

```bash
# Preferred port (default: 3000)
PORT=3000

# Test mode for development
TEST_MODE_ENABLED=true

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3001
```

### Port Ranges

The system uses configurable port ranges for fallback:

```typescript
const PORT_RANGES = [
  { start: 3000, end: 3010 },  // Primary range
  { start: 8000, end: 8010 },  // Alternative range
  { start: 9000, end: 9010 },  // Fallback range
];
```

## Testing

### Unit Tests

```bash
# Run port manager tests
npm test -- --testPathPattern=port-manager

# Run integration tests
npm test -- --testPathPattern=port-conflict.integration

# Run bootstrap tests
npm test -- --testPathPattern=bootstrap-port-conflict
```

### Integration Tests

The system includes comprehensive integration tests:

- **Port Conflict Creation**: Simulates real port conflicts
- **Cleanup Verification**: Ensures cleanup scripts work correctly
- **Process Tracking**: Tests process lifecycle management
- **Error Handling**: Verifies graceful error handling
- **Performance**: Ensures operations complete within time limits

### End-to-End Testing

```bash
# Run comprehensive port conflict tests
npm run test:port-conflicts
```

This script:
1. Creates actual port conflicts
2. Tests all cleanup mechanisms
3. Verifies resolution works
4. Tests graceful shutdown
5. Provides detailed results

## Troubleshooting

### Common Issues

1. **Port Still in Use After Cleanup**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Force cleanup
   npm run dev:force-cleanup
   
   # Check process tracking
   npm run dev:status
   ```

2. **Process Tracking Issues**
   ```bash
   # Reset tracking
   npm run dev:reset
   
   # Check for stale files
   ls -la .process-tracker.json .port-lock.json
   ```

3. **Permission Denied**
   ```bash
   # Use higher port number
   PORT=3001 npm run start:dev
   
   # Check file permissions
   ls -la scripts/
   ```

### Debug Information

The system provides comprehensive debug information:

```typescript
// System port summary
const systemStatus = await getSystemPortStatus();
console.log('System ports:', {
  total: systemStatus.summary.totalPorts,
  free: systemStatus.summary.freePorts,
  inUse: systemStatus.summary.inUsePorts,
  tracked: systemStatus.summary.trackedPorts,
  locked: systemStatus.summary.lockedPorts,
  errors: systemStatus.summary.errorPorts
});

// Port health details
const portHealth = await checkPortHealth(port);
console.log('Port health:', {
  healthy: portHealth.healthy,
  inUse: portHealth.inUse,
  available: portHealth.available,
  recommendations: portHealth.recommendations
});
```

## Best Practices

### Development

1. **Always use cleanup scripts** before starting development
2. **Check port status** if you encounter conflicts
3. **Use the test script** to verify resolution works
4. **Monitor process tracking** for orphaned processes

### Production

1. **Use process managers** like PM2 for production
2. **Monitor port usage** with health checks
3. **Implement logging** for port conflicts
4. **Use environment-specific** port configurations

### Testing

1. **Run integration tests** regularly
2. **Test conflict scenarios** in CI/CD
3. **Verify cleanup** after tests
4. **Monitor performance** of resolution

## Monitoring and Logging

### Health Checks

The system provides health check endpoints:

```typescript
// Health check for port status
GET /api/health/ports

// Detailed port information
GET /api/health/ports/:port

// System-wide port summary
GET /api/health/ports/system
```

### Logging

Comprehensive logging for debugging:

```typescript
console.log(`🚀 Starting DealCycle CRM Backend...`);
console.log(`🎯 Preferred port: ${preferredPort}`);
console.log(`🔍 Checking system port status...`);
console.log(`🧹 Port ${port} is in use, performing enhanced cleanup...`);
console.log(`✅ Port ${port} reserved successfully`);
console.log(`🔒 Port ${port} is now locked and monitored`);
```

## Future Enhancements

1. **Port Pool Management**: Dynamic port allocation
2. **Load Balancing**: Automatic port distribution
3. **Metrics Collection**: Port usage analytics
4. **Alerting**: Notifications for port conflicts
5. **Auto-scaling**: Port management for multiple instances

## Support

For issues with port conflict resolution:

1. **Check the logs** for detailed error information
2. **Run diagnostic scripts** to identify the problem
3. **Review process tracking** for orphaned processes
4. **Test with the test script** to verify functionality
5. **Check environment configuration** for port settings

The system is designed to be self-healing and provide clear guidance for any issues that arise.
