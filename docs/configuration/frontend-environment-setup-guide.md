# Frontend Environment Setup Guide

This guide provides comprehensive instructions for setting up and configuring the frontend environment for the DealCycle CRM application.

## Table of Contents

1. [Overview](#overview)
2. [Environment Files](#environment-files)
3. [Required Environment Variables](#required-environment-variables)
4. [Optional Environment Variables](#optional-environment-variables)
5. [Environment-Specific Configuration](#environment-specific-configuration)
6. [Setup Instructions](#setup-instructions)
7. [Validation and Testing](#validation-and-testing)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Best Practices](#best-practices)

## Overview

The frontend environment configuration system provides:
- **Environment Detection**: Automatic detection of development, staging, production, or test environments
- **Validation**: Comprehensive validation of environment variables using Zod schemas
- **Type Safety**: Full TypeScript support with typed configuration objects
- **Feature Flags**: Dynamic feature enabling/disabling based on environment
- **Security**: Environment-specific security configurations
- **Monitoring**: Integration with external monitoring and analytics services

## Environment Files

### File Structure

```
src/frontend/
├── env.template          # Template file with all available variables
├── env.development      # Development environment variables
├── .env.local           # Local development overrides (gitignored)
├── .env.production      # Production environment variables
├── .env.staging         # Staging environment variables
└── .env.test            # Test environment variables
```

### Environment File Priority

1. `.env.local` (highest priority, gitignored)
2. `.env.{environment}` (environment-specific)
3. `env.{environment}` (fallback)
4. `env.template` (defaults)

## Required Environment Variables

These variables must be set for the application to function properly:

```bash
# Application Identity
NEXT_PUBLIC_APP_NAME=DealCycle CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## Optional Environment Variables

### Authentication Configuration

```bash
# Auth Bypass (Development Only)
NEXT_PUBLIC_BYPASS_AUTH=false

# Auth0 Configuration
NEXT_PUBLIC_AUTH_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH_AUDIENCE=your-api-audience
NEXT_PUBLIC_AUTH_REDIRECT_URI=http://localhost:3000/callback
```

### External Services

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio Configuration
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=your-twilio-account-sid
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your-twilio-auth-token
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+1234567890
```

### Monitoring & Analytics

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Google Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-google-analytics-id

# Mixpanel Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

### Feature Flags

```bash
# Core Features
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_AUTOMATION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COMMUNICATIONS=true

# Progressive Web App Features
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true
NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT=true
```

### Performance & Caching

```bash
# Cache Configuration
NEXT_PUBLIC_CACHE_DURATION=3600

# API Configuration
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
```

### Security Configuration

```bash
# Security Headers
NEXT_PUBLIC_ENABLE_HTTPS_ONLY=true
NEXT_PUBLIC_ENABLE_CSP=true
NEXT_PUBLIC_ENABLE_HSTS=true
```

### Development Configuration

```bash
# Debug & Logging
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=info

# Build Configuration
ANALYZE=false
GENERATE_SOURCEMAP=true
```

## Environment-Specific Configuration

### Development Environment

```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_BYPASS_AUTH=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Staging Environment

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_API_URL=https://staging-api.dealcycle.com
NEXT_PUBLIC_WS_URL=wss://staging-api.dealcycle.com
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_BYPASS_AUTH=false
NEXT_PUBLIC_LOG_LEVEL=info
```

### Production Environment

```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://api.dealcycle.com
NEXT_PUBLIC_WS_URL=wss://api.dealcycle.com
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_BYPASS_AUTH=false
NEXT_PUBLIC_ENABLE_HTTPS_ONLY=true
NEXT_PUBLIC_ENABLE_CSP=true
NEXT_PUBLIC_ENABLE_HSTS=true
NEXT_PUBLIC_LOG_LEVEL=warn
```

### Test Environment

```bash
NEXT_PUBLIC_APP_ENV=test
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_BYPASS_AUTH=false
NEXT_PUBLIC_LOG_LEVEL=error
```

## Setup Instructions

### 1. Initial Setup

```bash
# Navigate to frontend directory
cd src/frontend

# Copy the template file
cp env.template .env.local

# Edit .env.local with your configuration
nano .env.local
```

### 2. Environment-Specific Setup

```bash
# Development
cp env.template .env.development
nano .env.development

# Staging
cp env.template .env.staging
nano .env.staging

# Production
cp env.template .env.production
nano .env.production

# Test
cp env.template .env.test
nano .env.test
```

### 3. Local Development Overrides

Create `.env.local` for local development overrides:

```bash
# .env.local (gitignored)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_BYPASS_AUTH=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### 4. Docker Environment

For Docker deployments, use environment-specific files:

```bash
# Docker development
docker run --env-file .env.development your-app

# Docker staging
docker run --env-file .env.staging your-app

# Docker production
docker run --env-file .env.production your-app
```

## Validation and Testing

### 1. Environment Validation

The system automatically validates environment configuration on startup:

```typescript
import { FrontendEnvironmentValidator } from '../services/environmentValidationService';

// Validate environment
const result = FrontendEnvironmentValidator.validate();

if (result.isValid) {
  console.log('✅ Environment validation passed');
} else {
  console.error('❌ Environment validation failed:', result.errors);
}
```

### 2. Configuration Service

Use the configuration service to access environment variables:

```typescript
import EnvironmentConfigService from '../services/environmentConfigService';

const configService = EnvironmentConfigService.getInstance();
const config = configService.getConfig();
const apiUrl = config.NEXT_PUBLIC_API_URL;
```

### 3. React Hook

Use the React hook for easy access in components:

```typescript
import { useEnvironmentConfig } from '../hooks/useEnvironmentConfig';

function MyComponent() {
  const { config, isValid, isLoading, error } = useEnvironmentConfig();
  
  if (isLoading) return <div>Loading configuration...</div>;
  if (error) return <div>Configuration error: {error}</div>;
  if (!isValid) return <div>Invalid configuration</div>;
  
  return (
    <div>
      <h1>{config.NEXT_PUBLIC_APP_NAME}</h1>
      <p>API URL: {config.NEXT_PUBLIC_API_URL}</p>
    </div>
  );
}
```

### 4. Running Tests

```bash
# Run environment configuration tests
npm test -- --testPathPattern=environment-configuration.spec.ts

# Run all tests
npm test
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check if .env.local exists
ls -la .env*

# Verify environment variable is set
echo $NEXT_PUBLIC_API_URL

# Restart development server
npm run dev
```

#### 2. Validation Errors

```typescript
// Check validation result
const result = FrontendEnvironmentValidator.validate();
console.log('Validation result:', result);

// Check specific errors
result.errors.forEach(error => console.error(error));
```

#### 3. Configuration Service Issues

```typescript
// Refresh configuration
configService.refreshConfig();

// Check configuration summary
const summary = configService.getConfigurationSummary();
console.log('Configuration summary:', summary);
```

#### 4. Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

## Security Considerations

### 1. Public vs Private Variables

- **NEXT_PUBLIC_***: Exposed to the browser (public)
- **Private variables**: Server-side only (secure)

### 2. Sensitive Information

Never expose sensitive information in `NEXT_PUBLIC_*` variables:

```bash
# ❌ WRONG - Exposed to browser
NEXT_PUBLIC_DATABASE_PASSWORD=secret

# ✅ CORRECT - Server-side only
DATABASE_PASSWORD=secret
```

### 3. Environment File Security

```bash
# .gitignore
.env.local
.env.production
.env.staging
.env.test
*.env
```

### 4. Production Security

```bash
# Enable security headers
NEXT_PUBLIC_ENABLE_HTTPS_ONLY=true
NEXT_PUBLIC_ENABLE_CSP=true
NEXT_PUBLIC_ENABLE_HSTS=true

# Disable debug features
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_BYPASS_AUTH=false
```

## Best Practices

### 1. Environment Management

- Use `.env.local` for local development overrides
- Keep environment-specific files in version control
- Use CI/CD environment variables for production secrets
- Regularly rotate sensitive credentials

### 2. Configuration Organization

- Group related variables together
- Use descriptive variable names
- Document all variables in templates
- Provide sensible defaults

### 3. Validation

- Always validate environment configuration
- Fail fast on critical errors
- Provide helpful error messages
- Log validation results

### 4. Testing

- Test all environment configurations
- Mock environment variables in tests
- Test validation scenarios
- Test environment detection

### 5. Documentation

- Keep templates up to date
- Document all variables
- Provide examples
- Include troubleshooting steps

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Zod Schema Validation](https://zod.dev/)
- [Environment Configuration Best Practices](https://12factor.net/config)
- [Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)

## Support

For issues or questions about environment configuration:

1. Check the troubleshooting section
2. Review the validation logs
3. Check the test suite
4. Consult the development team
5. Review the configuration documentation
