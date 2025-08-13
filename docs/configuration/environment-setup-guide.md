# Environment Setup Guide for AI CRM

## Overview
This guide provides comprehensive instructions for setting up environment configurations across different deployment stages for the DealCycle CRM application.

## Environment Files Structure

The project uses the following environment file structure:

```
ai_crm/
├── .env                    # Root environment file (gitignored)
├── env.dev                # Development environment
├── env.development        # Development environment (alternative)
├── env.test               # Test environment
├── env.staging            # Staging environment
├── env.production         # Production environment
├── env.template           # Base template
├── env.development.template
├── env.staging.template
├── env.production.template
├── env.test.template
└── src/
    ├── backend/
    │   └── config/
    │       └── environment.config.ts    # Backend environment configuration
    └── frontend/
        ├── env.template                 # Frontend environment template
        ├── env.development             # Frontend development environment
        ├── .env.local                  # Frontend local overrides (gitignored)
        ├── .env.production             # Frontend production environment
        ├── .env.staging                # Frontend staging environment
        └── .env.test                   # Frontend test environment
```

### Frontend vs Backend Environment Variables

- **Backend**: Server-side environment variables (secure, not exposed to browser)
- **Frontend**: Client-side environment variables (prefixed with `NEXT_PUBLIC_*`, exposed to browser)

## Environment Types

### 1. Development Environment (`env.development`)
- **Purpose**: Local development and testing
- **Features**: Debug mode, hot reload, mock data, relaxed security
- **Database**: Local MongoDB instance
- **Port**: 3000 (backend), 3001 (frontend)

**Key Features Enabled:**
- `ENABLE_DEBUG_MODE=true`
- `ENABLE_TEST_MODE=true`
- `ENABLE_MOCK_DATA=true`
- `ENABLE_HOT_RELOAD=true`
- `SKIP_AUTH_CHECK=false`

### 2. Test Environment (`env.test`)
- **Purpose**: Automated testing and CI/CD
- **Features**: Test mode, minimal logging, fast execution
- **Database**: Test database instance
- **Port**: 3001 (backend), 3002 (frontend)

**Key Features Enabled:**
- `ENABLE_TEST_MODE=true`
- `SKIP_AUTH_CHECK=true`
- `ENABLE_MOCK_DATA=true`
- `LOG_LEVEL=error`

### 3. Staging Environment (`env.staging`)
- **Purpose**: Pre-production testing and validation
- **Features**: Production-like settings, monitoring, external services
- **Database**: Staging database cluster
- **Port**: 3000 (standard)

**Key Features Enabled:**
- `ENABLE_GOOGLE_OAUTH=true`
- `ENABLE_EMAIL_VERIFICATION=true`
- `ENABLE_SMS_VERIFICATION=true`
- `SENTRY_DSN` configured

### 4. Production Environment (`env.production`)
- **Purpose**: Live production deployment
- **Features**: Maximum security, performance, monitoring
- **Database**: Production database cluster
- **Port**: 3000 (standard)

**Key Features Enabled:**
- Strict security settings
- Performance optimizations
- Comprehensive monitoring
- All external services enabled

## Required Environment Variables

### Backend Core Application Variables
```bash
NODE_ENV=development|staging|production|test
PORT=3000
API_PREFIX=/api
CORS_ORIGIN=<frontend-url>
```

### Frontend Core Application Variables
```bash
# Application Identity
NEXT_PUBLIC_APP_NAME=DealCycle CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Database Configuration
```bash
MONGODB_URI=mongodb://<host>:<port>/<database>
MONGO_ROOT_USERNAME=<username>
MONGO_ROOT_PASSWORD=<password>
```

### Security Configuration
```bash
JWT_SECRET=<32+ character secret>
SESSION_SECRET=<32+ character secret>
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
```

### External Services (Required for Staging/Production)
```bash
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_CALLBACK_URL=<callback-url>

TWILIO_ACCOUNT_SID=<twilio-account-sid>
TWILIO_AUTH_TOKEN=<twilio-auth-token>
TWILIO_PHONE_NUMBER=<twilio-phone>

SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<smtp-user>
SMTP_PASS=<smtp-password>
```

### Monitoring and Logging
```bash
LOG_LEVEL=debug|info|warn|error
SENTRY_DSN=<sentry-dsn-url>
ENABLE_REQUEST_LOGGING=true|false
ENABLE_SQL_LOGGING=true|false
```

## Setup Instructions

### 1. Development Setup
```bash
# Copy development template
cp env.development.template env.development

# Edit environment variables
nano env.development

# Update required values:
# - MONGODB_URI (point to your local MongoDB)
# - JWT_SECRET (generate a secure secret)
# - SESSION_SECRET (generate a secure secret)
```

### 2. Test Setup
```bash
# Copy test template
cp env.test.template env.test

# Edit environment variables
nano env.test

# Update required values:
# - MONGODB_URI (point to test database)
# - JWT_SECRET (generate a secure secret)
```

### 3. Staging Setup
```bash
# Copy staging template
cp env.staging.template env.staging

# Edit environment variables
nano env.staging

# Update required values:
# - All database credentials
# - All external service credentials
# - Monitoring configuration
# - Security settings
```

### 4. Production Setup
```bash
# Copy production template
cp env.production.template env.production

# Edit environment variables
nano env.production

# Update required values:
# - All database credentials
# - All external service credentials
# - Monitoring configuration
# - Security settings (strict)
```

## Security Best Practices

### 1. Secret Management
- **Never commit secrets to version control**
- Use environment variables for all sensitive data
- Generate strong, unique secrets for each environment
- Rotate secrets regularly in production

### 2. Environment Isolation
- Use separate databases for each environment
- Use separate external service accounts
- Implement proper network isolation
- Use different API keys and secrets

### 3. Production Security
- Disable debug features
- Enable comprehensive logging
- Use strong encryption
- Implement rate limiting
- Enable monitoring and alerting

## Validation and Testing

### 1. Environment Validation
The application automatically validates environment configuration on startup:

```typescript
// Environment validation is performed automatically
EnvironmentValidator.validateAndThrow();
```

### 2. Configuration Testing
Run configuration tests to ensure proper setup:

```bash
cd src/backend
npm test -- --testNamePattern="Environment Configuration System"
```

### 3. Manual Validation
Check that all required variables are set:

```bash
# Check environment loading
node -e "
const { loadEnvironment } = require('./src/backend/utils/env-loader');
const result = loadEnvironment({ environment: 'development' });
console.log('Environment loaded:', result.success);
console.log('Loaded files:', result.loadedFiles);
console.log('Missing required:', result.missingFiles);
"
```

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables
**Error**: `Required environment variable not set: MONGODB_URI`
**Solution**: Ensure all required variables are defined in your environment file

#### 2. Invalid Configuration Values
**Error**: `JWT secret must be at least 32 characters`
**Solution**: Generate longer, more secure secrets

#### 3. Environment File Not Found
**Error**: `Required environment file not found`
**Solution**: Check file paths and naming conventions

#### 4. Configuration Validation Failed
**Error**: `Environment validation failed`
**Solution**: Review validation errors and fix configuration issues

### Debug Commands

```bash
# Check environment file loading
npm run dev:env:check

# Validate configuration
npm run dev:config:validate

# Show environment summary
npm run dev:env:summary
```

## Environment-Specific Considerations

### Development
- Use local services when possible
- Enable debug features for troubleshooting
- Use relaxed security settings
- Enable hot reload for faster development

### Staging
- Mirror production configuration
- Use staging external services
- Enable comprehensive testing
- Monitor performance and errors

### Production
- Use production-grade services
- Implement strict security
- Enable monitoring and alerting
- Use load balancing and scaling

## Maintenance

### Regular Tasks
- Review and update environment configurations
- Rotate secrets and credentials
- Monitor configuration validation
- Update documentation

### Version Control
- Keep templates updated
- Document configuration changes
- Review security settings
- Maintain environment parity

## Support

For additional support with environment configuration:

1. Check the configuration validation service logs
2. Review environment setup documentation
3. Run configuration tests
4. Contact the development team

## Frontend Environment Configuration

The frontend environment configuration system provides comprehensive environment variable management for the Next.js frontend application.

### Key Features

- **Environment Detection**: Automatic detection of development, staging, production, or test environments
- **Validation**: Comprehensive validation using Zod schemas
- **Type Safety**: Full TypeScript support with typed configuration objects
- **Feature Flags**: Dynamic feature enabling/disabling based on environment
- **Security**: Environment-specific security configurations
- **Monitoring**: Integration with external monitoring and analytics services

### Services and Hooks

- **EnvironmentConfigService**: Singleton service for managing environment configuration
- **FrontendEnvironmentValidator**: Zod-based validation service
- **useEnvironmentConfig**: React hook for easy access to configuration

### Quick Start

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

### Environment Files

The frontend uses environment-specific files with the following priority:
1. `.env.local` (highest priority, gitignored)
2. `.env.{environment}` (environment-specific)
3. `env.{environment}` (fallback)
4. `env.template` (defaults)

For detailed frontend environment setup instructions, see [Frontend Environment Setup Guide](./frontend-environment-setup-guide.md).

## Related Documentation

- [Configuration Validation Service](../src/backend/common/services/configuration-validation.service.ts)
- [Environment Configuration](../src/backend/config/environment.config.ts)
- [Environment Loader](../src/backend/utils/env-loader.ts)
- [Frontend Environment Setup Guide](./frontend-environment-setup-guide.md)
- [Testing Guide](../testing/test-implementation-guide.md)
