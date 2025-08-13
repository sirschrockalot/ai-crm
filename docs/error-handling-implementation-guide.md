# Error Handling Implementation Guide

## Overview

The Presidential Digs CRM implements a comprehensive error handling system that provides consistent error responses, proper error categorization, and user-friendly error messages across both backend and frontend components.

## Architecture

### Backend Error Handling

#### 1. Global Exception Filter
- **File**: `src/backend/common/filters/global-exception.filter.ts`
- **Purpose**: Catches all unhandled exceptions and provides consistent error responses
- **Features**:
  - Automatic error categorization
  - User-friendly error messages
  - Request context preservation
  - Development mode debug information

#### 2. Error Handling Interceptor
- **File**: `src/backend/common/interceptors/error-handling.interceptor.ts`
- **Purpose**: Intercepts requests and handles errors with retry logic
- **Features**:
  - Error categorization by type and severity
  - Automatic retry for retryable errors
  - Comprehensive error logging
  - Error transformation for consistent responses

#### 3. Global Error Handler
- **File**: `src/backend/src/utils/error-handler.ts`
- **Purpose**: Handles process-level errors and provides recovery mechanisms
- **Features**:
  - Uncaught exception handling
  - Process information logging
  - Error recovery strategies
  - Port conflict resolution

### Frontend Error Handling

#### 1. Error Boundaries
- **File**: `src/frontend/components/shared/ErrorBoundaries/ErrorBoundaries.tsx`
- **Purpose**: Catches React component errors and provides fallback UI
- **Features**:
  - Component error isolation
  - Retry mechanisms
  - Navigation fallbacks
  - Development mode error details

#### 2. Error Display Components
- **File**: `src/frontend/components/ui/ErrorDisplay.tsx`
- **Purpose**: Displays errors in a user-friendly format
- **Features**:
  - Global error capture
  - Console error/warning interception
  - Error categorization
  - User action buttons

#### 3. Error Utilities
- **File**: `src/frontend/utils/error.ts`
- **Purpose**: Provides error formatting and handling utilities
- **Features**:
  - Error formatting for users
  - Retry logic determination
  - Error logging
  - Async error handling wrapper

## Error Categories

### Backend Error Types

| Type | Severity | Retryable | Max Retries | HTTP Status |
|------|----------|-----------|-------------|--------------|
| VALIDATION | Low | No | 0 | 400 |
| AUTHENTICATION | Medium | No | 0 | 401 |
| AUTHORIZATION | Medium | No | 0 | 403 |
| NOT_FOUND | Low | No | 0 | 404 |
| RATE_LIMIT | Medium | Yes | 3 | 429 |
| DATABASE | High | Yes | 3 | 500 |
| NETWORK | High | Yes | 3 | 503 |
| EXTERNAL_SERVICE | High | Yes | 3 | 502 |
| INTERNAL | Critical | No | 0 | 500 |
| TIMEOUT | Medium | Yes | 2 | 408 |

### Frontend Error Types

| Type | Description | User Action |
|------|-------------|-------------|
| NETWORK_ERROR | Connection issues | Check connection, retry |
| UNAUTHORIZED | Authentication required | Log in |
| FORBIDDEN | Permission denied | Contact admin |
| NOT_FOUND | Resource missing | Check URL, go home |
| VALIDATION_ERROR | Input validation failed | Check input, retry |
| RATE_LIMIT_EXCEEDED | Too many requests | Wait, retry later |
| SERVER_ERROR | Backend issues | Retry, contact support |

## Usage Examples

### Backend Error Handling

#### 1. Throwing Categorized Errors
```typescript
import { CategorizedError, ErrorCategory } from '../utils/error-handler';

// Throw a categorized error
throw new CategorizedError(
  'User not found in database',
  ErrorCategory.NOT_FOUND,
  'USER_NOT_FOUND',
  { userId: '123' }
);
```

#### 2. Using Error Handling Interceptor
```typescript
// The interceptor automatically handles errors
@Get(':id')
async getUser(@Param('id') id: string) {
  const user = await this.usersService.findById(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
```

#### 3. Custom Error Recovery
```typescript
import { ErrorRecovery } from '../utils/error-handler';

// Attempt to recover from port conflict
const newPort = await ErrorRecovery.recoverFromPortConflict(3000);
if (newPort) {
  // Use new port
}
```

### Frontend Error Handling

#### 1. Using Error Boundaries
```typescript
import { ErrorBoundary } from '../components/shared/ErrorBoundaries/ErrorBoundaries';

<ErrorBoundary
  onError={(error, errorInfo) => console.error('Error caught:', error)}
  onReset={() => window.location.reload()}
  showDetails={process.env.NODE_ENV === 'development'}
>
  <YourComponent />
</ErrorBoundary>
```

#### 2. Error Handling in Hooks
```typescript
import { withErrorHandling } from '../utils/error';

const executeWithErrorHandling = useCallback(
  withErrorHandling(async (data) => {
    const response = await apiService.request(data);
    return response;
  }, (error) => {
    console.error('API call failed:', error);
    // Custom error handling
  }),
  []
);
```

#### 3. User-Friendly Error Messages
```typescript
import { formatErrorForUser } from '../utils/error';

try {
  await apiCall();
} catch (error) {
  const userMessage = formatErrorForUser(error);
  toast({
    title: 'Error',
    description: userMessage,
    status: 'error',
  });
}
```

## Configuration

### Environment Variables

```bash
# Error handling configuration
NODE_ENV=development  # Enable debug information
LOG_LEVEL=info        # Logging level for errors
ERROR_REPORTING_ENABLED=true  # Enable error reporting
```

### Backend Configuration

```typescript
// main.ts
app.useGlobalFilters(new GlobalExceptionFilter());

// common.module.ts
{
  provide: APP_INTERCEPTOR,
  useClass: ErrorHandlingInterceptor,
}
```

### Frontend Configuration

```typescript
// _app.tsx
<ErrorBoundary>
  <ChakraProvider theme={theme}>
    <Component {...pageProps} />
    <ErrorDisplay />
  </ChakraProvider>
</ErrorBoundary>
```

## Testing

### Backend Tests

```bash
# Run error handling tests
npm run test:backend -- --testPathPattern=error-handling
npm run test:backend -- --testPathPattern=global-exception.filter
```

### Frontend Tests

```bash
# Run error handling tests
npm run test:frontend -- --testPathPattern=ErrorBoundary
npm run test:frontend -- --testPathPattern=error
```

## Best Practices

### 1. Error Categorization
- Always categorize errors appropriately
- Use consistent error codes
- Provide meaningful user messages

### 2. Error Logging
- Log errors with sufficient context
- Include request information
- Don't log sensitive data

### 3. User Experience
- Provide actionable error messages
- Include retry mechanisms where appropriate
- Graceful degradation for non-critical errors

### 4. Security
- Don't expose internal error details in production
- Sanitize error messages
- Log security-related errors appropriately

## Monitoring and Alerting

### Error Metrics
- Error rate by type
- Error rate by endpoint
- Response time impact
- User impact metrics

### Alerting Rules
- High error rates (>5%)
- Critical error spikes
- Service unavailability
- Authentication failures

## Troubleshooting

### Common Issues

1. **Errors not being caught**: Ensure global filters are properly configured
2. **Missing error context**: Check request headers and middleware
3. **Retry loops**: Verify retry configuration and max attempts
4. **Memory leaks**: Check error logging for large objects

### Debug Mode
Enable development mode to see detailed error information:
```bash
NODE_ENV=development
```

## Future Enhancements

1. **Error Analytics Dashboard**: Real-time error monitoring
2. **Automated Error Recovery**: Self-healing mechanisms
3. **Error Prediction**: ML-based error prevention
4. **User Feedback Integration**: Error reporting from users
5. **Performance Impact Analysis**: Error correlation with performance metrics
