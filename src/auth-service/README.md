# DealCycle CRM Authentication Service

A standalone microservice for handling all authentication and user management functionality in the DealCycle CRM platform.

## Features

### 🔐 Authentication
- **JWT-based authentication** with access and refresh tokens
- **Password-based login** with secure password hashing
- **Google OAuth integration** (ready for implementation)
- **Multi-factor authentication (MFA)** with TOTP support
- **Session management** with device tracking

### 👥 User Management
- **User registration** with email verification
- **Password reset** via secure tokens
- **Profile management** with role-based access control
- **User activity logging** for security monitoring
- **Tenant isolation** for multi-tenant support

### 🛡️ Security Features
- **Rate limiting** to prevent brute force attacks
- **Account lockout** after failed login attempts
- **IP blocking** for suspicious activity
- **Suspicious activity detection** with real-time monitoring
- **Comprehensive audit logging** for compliance

### 🚀 Performance & Scalability
- **MongoDB Atlas integration** with connection pooling
- **In-memory caching** for session data
- **Horizontal scaling** ready architecture
- **Health checks** for container orchestration

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │  Auth Service   │
│   (Next.js)     │◄──►│   (Nginx/Envoy) │◄──►│   (NestJS)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   MongoDB       │
                                              │   Atlas         │
                                              └─────────────────┘
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/logout/all` - Logout from all sessions
- `GET /api/auth/me` - Get current user
- `POST /api/auth/validate` - Validate JWT token

### Password Management
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Confirm password reset
- `POST /api/auth/change-password` - Change password

### Email Verification
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email

### Multi-Factor Authentication
- `POST /api/auth/mfa/setup` - Setup MFA
- `POST /api/auth/mfa/verify` - Verify MFA code
- `POST /api/auth/mfa/disable` - Disable MFA

### User Management
- `GET /api/auth/users/profile` - Get user profile
- `PUT /api/auth/users/profile` - Update user profile
- `GET /api/auth/users/activity` - Get user activity
- `GET /api/auth/users/sessions` - Get user sessions

### Health & Monitoring
- `GET /api/auth/health` - Service health check

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  email: string,
  password: string, // hashed
  firstName: string,
  lastName: string,
  companyName: string,
  role: 'admin' | 'agent' | 'buyer' | 'user',
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification',
  tenantId: ObjectId,
  isEmailVerified: boolean,
  mfaEnabled: boolean,
  mfaSecret?: string,
  backupCodes: string[],
  lastLoginAt?: Date,
  loginAttempts: number,
  lockUntil?: Date,
  sessions: Session[],
  activityLog: ActivityLog[]
}
```

### User Activity Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: ActivityType,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  ip: string,
  userAgent: string,
  timestamp: Date,
  metadata?: any
}
```

### Password Reset Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  token: string,
  expiresAt: Date,
  isUsed: boolean,
  ip: string,
  userAgent: string
}
```

## Environment Variables

```bash
# Service Configuration
NODE_ENV=development
PORT=3001
API_PREFIX=api/auth

# Database
MONGODB_URI=mongodb://localhost:27017/dealcycle

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker (optional)

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.development .env.local

# Start MongoDB (if running locally)
docker run -d -p 27017:27017 mongo:6.0

# Start the service
npm run start:dev
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run individually
docker build -t dealcycle-auth-service .
docker run -p 3001:3001 dealcycle-auth-service
```

### Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Password reset tokens expire after 1 hour
- Account lockout after 5 failed login attempts

### JWT Security
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Tokens include issuer and audience claims
- Secure token validation with proper error handling

### Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per IP
- Automatic IP blocking for excessive failed attempts

### Session Management
- Unique session IDs for each login
- Device and location tracking
- Session revocation capabilities
- Automatic cleanup of expired sessions

## Monitoring & Health Checks

### Health Endpoint
The service provides a health check endpoint at `/api/auth/health` that returns:
- Service status
- Uptime information
- Timestamp
- Service identifier

### Docker Health Checks
The Docker container includes built-in health checks that verify the service is responding correctly.

### Logging
- Structured logging with different levels (debug, info, warn, error)
- Security event logging for audit purposes
- User activity tracking for compliance

## Deployment

### Kubernetes
The service is designed to be deployed on Kubernetes with:
- Horizontal Pod Autoscaler (HPA)
- Service mesh integration
- ConfigMap and Secret management
- Health check probes

### Google Cloud Platform
- Cloud Run deployment ready
- Cloud SQL for MongoDB compatibility
- Cloud Monitoring integration
- Load balancer configuration

## Development

### Code Structure
```
src/
├── auth/           # Authentication logic
├── users/          # User management
├── security/       # Security features
├── database/       # Database configuration
├── main.ts         # Application entry point
└── app.module.ts   # Main module configuration
```

### Adding New Features
1. Create the feature module in `src/`
2. Add the module to `app.module.ts`
3. Create corresponding tests
4. Update documentation

### Testing Strategy
- Unit tests for all services
- Integration tests for database operations
- E2E tests for API endpoints
- Security testing for authentication flows

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure security best practices are followed
5. Run the full test suite before submitting

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Create an issue in the repository
- Contact the development team
- Check the documentation and examples
