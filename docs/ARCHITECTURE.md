# Architecture Guide

System architecture and design for DealCycle CRM.

## Overview

DealCycle CRM is built as a microservices architecture with the following components:

- **Frontend**: Next.js 14 application serving the UI
- **Microservices**: Independent backend services for different domains
- **Database**: MongoDB for data persistence
- **Cache**: Redis for caching and session storage
- **Storage**: Google Cloud Storage for file uploads

## Microservices Architecture

### Services

1. **Auth Service** (Port 3001)
   - User authentication
   - JWT token management
   - User registration and login

2. **Leads Service** (Port 3008)
   - Lead management
   - Lead import/export
   - Lead events and timeline
   - Tasks management
   - Pipeline reports

3. **Transactions Service** (Port 3003)
   - Transaction processing
   - Deal management

4. **User Management Service** (Port 3005)
   - User roles and permissions
   - Organization management

5. **Timesheet Service** (Port 3007)
   - Time tracking
   - Timesheet management

### Communication

- Services communicate via HTTP REST APIs
- Frontend uses Next.js API routes as proxies
- Services are independently deployable
- Shared MongoDB database for data persistence

## Database Schema

### Leads Collection

- Lead information (name, contact, address)
- Status and priority
- Assignment and ownership
- Timeline events
- Tasks

### Users Collection

- User authentication data
- Roles and permissions
- Organization membership

### Events Collection

- Immutable event log
- Lead timeline events
- Audit trail

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Environment-based secret management (Doppler)
- Production-safe authentication (no bypass in production)

## Integration Patterns

- External service clients (Underwriting, Comms)
- Graceful error handling
- Timeout management
- Retry logic

## Deployment

- Docker containers for local development
- Heroku for production deployment
- Environment-based configuration
- Health check endpoints

## Additional Resources

- [Setup Guide](./SETUP.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
