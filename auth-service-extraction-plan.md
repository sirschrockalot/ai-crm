# Auth Service Repository Extraction Plan

## Overview
Extract the auth-service from the main ai-crm repository into its own independent repository with dedicated CI/CD pipeline.

## Current Structure Analysis
- **Location**: `src/auth-service/`
- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **Port**: 3001
- **Dependencies**: Authentication, JWT, Passport, Google OAuth, etc.

## New Repository Structure

### Repository Name: `dealcycle-auth-service`

### Directory Structure:
```
dealcycle-auth-service/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd-staging.yml
│       └── cd-production.yml
├── src/
│   ├── auth/
│   ├── users/
│   ├── database/
│   ├── security/
│   ├── app.module.ts
│   └── main.ts
├── tests/
├── docs/
├── scripts/
├── .env.example
├── .env.development
├── .env.production
├── .env.staging
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

## Migration Steps

### 1. Create New Repository
- Create new GitHub repository: `dealcycle-auth-service`
- Initialize with proper README and .gitignore

### 2. Extract Auth Service Code
- Copy `src/auth-service/` contents to new repository root
- Update package.json name and repository references
- Remove any references to parent project

### 3. Update Configuration Files
- Update Dockerfile for standalone deployment
- Create environment-specific configs
- Update database connection strings
- Configure CORS for frontend communication

### 4. Create CI/CD Pipeline
- GitHub Actions for testing, building, and deployment
- Multi-environment support (dev, staging, production)
- Docker image building and pushing
- Automated testing and security scanning

### 5. Update Frontend Integration
- Update frontend to use new auth service URL
- Update environment variables
- Test authentication flow

### 6. Documentation Updates
- API documentation
- Deployment guides
- Integration guides
- Troubleshooting guides

## CI/CD Pipeline Design

### GitHub Actions Workflows:

1. **CI Pipeline** (`ci.yml`)
   - Trigger: Push to any branch, PR
   - Steps: Lint, Test, Build, Security scan

2. **Staging Deployment** (`cd-staging.yml`)
   - Trigger: Push to `develop` branch
   - Steps: Build, Test, Deploy to staging

3. **Production Deployment** (`cd-production.yml`)
   - Trigger: Release/tag creation
   - Steps: Build, Test, Deploy to production

## Environment Configuration

### Required Environment Variables:
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CORS_ORIGIN`
- `LOG_LEVEL`

## Security Considerations
- Environment variable management
- Secrets handling in CI/CD
- CORS configuration
- Rate limiting
- Input validation
- Security headers

## Integration Points
- Frontend authentication calls
- Database connections
- External OAuth providers
- Monitoring and logging
- Health checks

## Rollback Strategy
- Docker image versioning
- Database migration safety
- Blue-green deployment
- Monitoring and alerting

