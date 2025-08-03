# 🏗️ Backend Architecture Document - DealCycle CRM

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Document Type** | Backend Architecture Specification |
| **Project** | DealCycle CRM |
| **Version** | 3.0 |
| **Last Updated** | 2024-12-19 |
| **Owner** | Architect Agent |
| **Status** | Updated |

---

## 🔄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 3.0 | Updated to DealCycle CRM with automation workflows and enhanced AI features | Architect Agent |
| 2024-12-19 | 2.0 | Complete backend architecture with NestJS and microservices-ready design | Architect Agent |

---

## 🎯 Backend Architecture Overview

### **Architecture Goals:**
- **Microservices-ready**: Support for future service decomposition
- **Multi-tenant**: Data isolation per tenant
- **Scalable**: Handle multiple development teams and modules
- **Secure**: Robust authentication and authorization
- **Observable**: Comprehensive logging and monitoring
- **API-first**: RESTful APIs with comprehensive documentation

### **Design Principles:**
- **Separation of Concerns**: Clear module boundaries and responsibilities
- **Dependency Injection**: NestJS IoC container for loose coupling
- **Type Safety**: Full TypeScript implementation
- **Testability**: Comprehensive testing strategy
- **Performance**: Caching, indexing, and optimization strategies

---

## 🛠️ Backend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Framework** | NestJS | 10+ | Backend Framework | TypeScript-first, decorators, dependency injection |
| **Language** | TypeScript | 5+ | Type Safety | Complex business logic, team collaboration |
| **Database** | MongoDB | 7+ | Primary Database | Document model, multi-tenant support |
| **ORM/ODM** | Mongoose | 8+ | MongoDB ODM | TypeScript support, schema validation |
| **Authentication** | Passport.js | Latest | Auth Strategy | Multiple strategies, JWT support |
| **API Documentation** | Swagger/OpenAPI | 3.0 | API Docs | Auto-generated, interactive docs |
| **Validation** | class-validator | Latest | Request Validation | DTO validation, type safety |
| **Caching** | Redis | 7+ | Session & Cache | Performance, session management |
| **Message Queue** | Bull/BullMQ | Latest | Background Jobs | Email, notifications, reports |
| **File Storage** | AWS S3/MinIO | Latest | File Management | Document uploads, images |
| **Search** | Meilisearch | Latest | Full-text Search | Lightning-fast search, typo tolerance, real-time updates |
| **Monitoring** | Prometheus + Grafana + Winston | Latest | Metrics, Visualization & Logging | Comprehensive observability, dashboards, alerting |
| **Testing** | Jest + Supertest | Latest | Testing | Unit, integration, e2e tests |
| **Containerization** | Docker | Latest | Deployment | Consistent environments |
| **API Gateway** | Kong/Nginx | Latest | Gateway | Rate limiting, routing, security |

---

## 📁 Enhanced Backend Project Structure

```
/backend
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts                # Health checks, status
│   ├── app.service.ts                   # App-level services
│   ├── config/
│   │   ├── database.config.ts           # MongoDB configuration
│   │   ├── redis.config.ts              # Redis configuration
│   │   ├── auth.config.ts               # Authentication config
│   │   ├── swagger.config.ts            # API documentation
│   │   ├── cors.config.ts               # CORS settings
│   │   ├── rate-limit.config.ts         # Rate limiting
│   │   └── environment.config.ts        # Environment validation
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts       # Role-based access
│   │   │   ├── tenant.decorator.ts      # Tenant injection
│   │   │   ├── current-user.decorator.ts # User injection
│   │   │   └── api-response.decorator.ts # Standardized responses
│   │   ├── guards/
│   │   │   ├── jwt.guard.ts             # JWT authentication
│   │   │   ├── roles.guard.ts           # Role authorization
│   │   │   ├── tenant.guard.ts          # Tenant validation
│   │   │   └── rate-limit.guard.ts      # Rate limiting
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts   # Request/response logging
│   │   │   ├── transform.interceptor.ts # Response transformation
│   │   │   ├── timeout.interceptor.ts   # Request timeout
│   │   │   └── cache.interceptor.ts     # Response caching
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts # Exception handling
│   │   │   ├── validation.filter.ts     # Validation errors
│   │   │   └── mongo-exception.filter.ts # MongoDB errors
│   │   ├── middleware/
│   │   │   ├── tenant.middleware.ts     # Tenant extraction
│   │   │   ├── auth.middleware.ts       # Authentication
│   │   │   ├── cors.middleware.ts       # CORS handling
│   │   │   └── logging.middleware.ts    # Request logging
│   │   ├── dto/
│   │   │   ├── base.dto.ts              # Base DTO class
│   │   │   ├── pagination.dto.ts        # Pagination parameters
│   │   │   ├── search.dto.ts            # Search parameters
│   │   │   └── response.dto.ts          # Standardized responses
│   │   ├── interfaces/
│   │   │   ├── user.interface.ts        # User interface
│   │   │   ├── tenant.interface.ts      # Tenant interface
│   │   │   ├── api-response.interface.ts # API response interface
│   │   │   └── pagination.interface.ts  # Pagination interface
│   │   └── utils/
│   │       ├── validation.util.ts       # Custom validators
│   │       ├── encryption.util.ts       # Data encryption
│   │       ├── date.util.ts             # Date utilities
│   │       └── constants.ts             # Application constants
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts           # Authentication module
│   │   │   ├── auth.controller.ts       # Auth endpoints
│   │   │   ├── auth.service.ts          # Auth business logic
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts      # JWT strategy
│   │   │   │   ├── google.strategy.ts   # Google OAuth
│   │   │   │   ├── local.strategy.ts    # Local strategy
│   │   │   │   └── dev.strategy.ts      # Development strategy
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts        # Authentication guard
│   │   │   └── dto/
│   │   │       ├── login.dto.ts         # Login request
│   │   │       ├── register.dto.ts      # Registration request
│   │   │       └── refresh.dto.ts       # Token refresh
│   │   ├── users/
│   │   │   ├── users.module.ts          # Users module
│   │   │   ├── users.controller.ts      # User endpoints
│   │   │   ├── users.service.ts         # User business logic
│   │   │   ├── user.schema.ts           # User schema
│   │   │   ├── user.repository.ts       # User data access
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts   # Create user
│   │   │       ├── update-user.dto.ts   # Update user
│   │   │       └── user-profile.dto.ts  # User profile
│   │   ├── leads/
│   │   │   ├── leads.module.ts          # Leads module
│   │   │   ├── leads.controller.ts      # Lead endpoints
│   │   │   ├── leads.service.ts         # Lead business logic
│   │   │   ├── lead.schema.ts           # Lead schema
│   │   │   ├── lead.repository.ts       # Lead data access
│   │   │   ├── lead-pipeline.service.ts # Pipeline management
│   │   │   └── dto/
│   │   │       ├── create-lead.dto.ts   # Create lead
│   │   │       ├── update-lead.dto.ts   # Update lead
│   │   │       ├── lead-filter.dto.ts   # Lead filtering
│   │   │       └── lead-export.dto.ts   # Lead export
│   │   ├── buyers/
│   │   │   ├── buyers.module.ts         # Buyers module
│   │   │   ├── buyers.controller.ts     # Buyer endpoints
│   │   │   ├── buyers.service.ts        # Buyer business logic
│   │   │   ├── buyer.schema.ts          # Buyer schema
│   │   │   ├── buyer.repository.ts      # Buyer data access
│   │   │   ├── buyer-matching.service.ts # Buyer matching logic
│   │   │   └── dto/
│   │   │       ├── create-buyer.dto.ts  # Create buyer
│   │   │       ├── update-buyer.dto.ts  # Update buyer
│   │   │       └── buyer-search.dto.ts  # Buyer search
│   │   ├── communications/
│   │   │   ├── communications.module.ts # Communications module
│   │   │   ├── communications.controller.ts # Communication endpoints
│   │   │   ├── communications.service.ts # Communication logic
│   │   │   ├── communication.schema.ts  # Communication schema
│   │   │   ├── sms.service.ts           # SMS integration
│   │   │   ├── email.service.ts         # Email integration
│   │   │   ├── call.service.ts          # Call integration
│   │   │   └── dto/
│   │   │       ├── send-sms.dto.ts      # SMS request
│   │   │       ├── send-email.dto.ts    # Email request
│   │   │       └── call-log.dto.ts      # Call logging
│   │   ├── ai/
│   │   │   ├── ai.module.ts             # AI module
│   │   │   ├── ai.controller.ts         # AI endpoints
│   │   │   ├── ai.service.ts            # AI business logic
│   │   │   ├── lead-analysis.service.ts # Lead analysis
│   │   │   ├── communication-ai.service.ts # Communication AI
│   │   │   ├── lead-scoring.service.ts  # AI-powered lead scoring
│   │   │   ├── buyer-matching.service.ts # AI buyer matching
│   │   │   └── dto/
│   │   │       ├── analyze-lead.dto.ts  # Lead analysis request
│   │   │       ├── generate-response.dto.ts # Response generation
│   │   │       ├── lead-scoring.dto.ts  # Lead scoring request
│   │   │       └── buyer-matching.dto.ts # Buyer matching request
│   │   ├── automation/
│   │   │   ├── automation.module.ts     # Automation module
│   │   │   ├── automation.controller.ts # Automation endpoints
│   │   │   ├── automation.service.ts    # Automation business logic
│   │   │   ├── workflow-engine.service.ts # Workflow execution engine
│   │   │   ├── workflow-builder.service.ts # Visual workflow builder
│   │   │   ├── trigger.service.ts       # Event triggers
│   │   │   ├── action.service.ts        # Automation actions
│   │   │   ├── condition.service.ts     # Automation conditions
│   │   │   └── dto/
│   │   │       ├── create-workflow.dto.ts # Create workflow
│   │   │       ├── update-workflow.dto.ts # Update workflow
│   │   │       ├── workflow-execution.dto.ts # Workflow execution
│   │   │       └── automation-stats.dto.ts # Automation statistics
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts      # Analytics module
│   │   │   ├── analytics.controller.ts  # Analytics endpoints
│   │   │   ├── analytics.service.ts     # Analytics logic
│   │   │   ├── dashboard.service.ts     # Dashboard data
│   │   │   ├── reporting.service.ts     # Report generation
│   │   │   ├── performance-metrics.service.ts # Performance tracking
│   │   │   ├── conversion-analytics.service.ts # Conversion analysis
│   │   │   ├── team-performance.service.ts # Team analytics
│   │   │   └── dto/
│   │   │       ├── analytics-query.dto.ts # Analytics query
│   │   │       ├── report-request.dto.ts # Report request
│   │   │       ├── performance-query.dto.ts # Performance query
│   │   │       └── conversion-query.dto.ts # Conversion query
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts  # Notifications module
│   │   │   ├── notifications.controller.ts # Notification endpoints
│   │   │   ├── notifications.service.ts # Notification logic
│   │   │   ├── email-notification.service.ts # Email notifications
│   │   │   ├── push-notification.service.ts # Push notifications
│   │   │   └── dto/
│   │   │       ├── create-notification.dto.ts # Create notification
│   │   │       └── notification-preference.dto.ts # User preferences
│   │   └── integrations/
│   │       ├── integrations.module.ts   # Integrations module
│   │       ├── integrations.controller.ts # Integration endpoints
│   │       ├── twilio.service.ts        # Twilio integration
│   │       ├── google-calendar.service.ts # Google Calendar
│   │       ├── zapier.service.ts        # Zapier integration
│   │       └── dto/
│   │           ├── webhook.dto.ts       # Webhook handling
│   │           └── integration-config.dto.ts # Integration config
│   ├── database/
│   │   ├── connection.ts                # Database connection
│   │   ├── migrations/                  # Database migrations
│   │   ├── seeds/                       # Database seeding
│   │   └── indexes/                     # Database indexes
│   └── shared/
│       ├── types/                       # Shared TypeScript types
│       ├── enums/                       # Shared enums
│       └── constants/                   # Shared constants
├── test/
│   ├── e2e/                             # End-to-end tests
│   ├── integration/                     # Integration tests
│   └── unit/                            # Unit tests
├── scripts/
│   ├── setup.sh                         # Development setup
│   ├── seed.sh                          # Database seeding
│   ├── migrate.sh                       # Database migration
│   └── deploy.sh                        # Deployment script
├── docker/
│   ├── Dockerfile                       # Backend Dockerfile
│   ├── docker-compose.yml               # Local development
│   └── docker-compose.prod.yml          # Production setup
├── docs/
│   ├── api/                             # API documentation
│   ├── deployment/                      # Deployment guides
│   └── development/                     # Development guides
├── .env.example                         # Environment variables template
├── .env.local                           # Local environment
├── nest-cli.json                        # NestJS CLI configuration
├── tsconfig.json                        # TypeScript configuration
├── jest.config.js                       # Jest configuration
└── package.json                         # Dependencies and scripts
```

---

## 🔐 **Security Architecture**

### **Multi-Strategy Authentication**

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { DevStrategy } from './strategies/dev.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
          issuer: 'presidential-digs-crm',
          audience: 'crm-users',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    LocalStrategy,
    process.env.NODE_ENV === 'development' ? DevStrategy : null,
  ].filter(Boolean),
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

### **Enhanced JWT Strategy with Tenant Support**

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        (request: Request) => {
          const token = request?.cookies?.access_token;
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    // Verify tenant access
    const tenantId = this.extractTenantId(request);
    if (tenantId && user.tenant_id.toString() !== tenantId) {
      throw new UnauthorizedException('Tenant access denied');
    }

    // Add user to request
    request.user = {
      id: user._id,
      email: user.email,
      tenant_id: user.tenant_id,
      roles: user.roles,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return request.user;
  }

  private extractTenantId(request: Request): string | null {
    return (
      request.headers['x-tenant-id'] as string ||
      request.subdomains[0] ||
      request.query.tenant as string ||
      null
    );
  }
}
```

### **Role-Based Access Control (RBAC)**

```typescript
// src/common/constants/permissions.ts
export const PERMISSIONS = {
  // Lead Management
  LEADS_CREATE: 'leads:create',
  LEADS_READ: 'leads:read',
  LEADS_UPDATE: 'leads:update',
  LEADS_DELETE: 'leads:delete',
  LEADS_ASSIGN: 'leads:assign',
  LEADS_EXPORT: 'leads:export',

  // Buyer Management
  BUYERS_CREATE: 'buyers:create',
  BUYERS_READ: 'buyers:read',
  BUYERS_UPDATE: 'buyers:update',
  BUYERS_DELETE: 'buyers:delete',
  BUYERS_ASSIGN: 'buyers:assign',

  // User Management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_ASSIGN_ROLES: 'users:assign_roles',

  // Analytics & Reports
  ANALYTICS_READ: 'analytics:read',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',

  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_INTEGRATIONS: 'system:integrations',
  SYSTEM_BACKUP: 'system:backup',

  // Communication
  COMMUNICATIONS_SEND: 'communications:send',
  COMMUNICATIONS_READ: 'communications:read',
  COMMUNICATIONS_DELETE: 'communications:delete',
} as const;

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  MANAGER: 'MANAGER',
  AGENT: 'AGENT',
  VIEWER: 'VIEWER',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.TENANT_ADMIN]: [
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_UPDATE,
    PERMISSIONS.LEADS_DELETE,
    PERMISSIONS.LEADS_ASSIGN,
    PERMISSIONS.LEADS_EXPORT,
    PERMISSIONS.BUYERS_CREATE,
    PERMISSIONS.BUYERS_READ,
    PERMISSIONS.BUYERS_UPDATE,
    PERMISSIONS.BUYERS_DELETE,
    PERMISSIONS.BUYERS_ASSIGN,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_ASSIGN_ROLES,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_INTEGRATIONS,
    PERMISSIONS.COMMUNICATIONS_SEND,
    PERMISSIONS.COMMUNICATIONS_READ,
    PERMISSIONS.COMMUNICATIONS_DELETE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_UPDATE,
    PERMISSIONS.LEADS_ASSIGN,
    PERMISSIONS.LEADS_EXPORT,
    PERMISSIONS.BUYERS_CREATE,
    PERMISSIONS.BUYERS_READ,
    PERMISSIONS.BUYERS_UPDATE,
    PERMISSIONS.BUYERS_ASSIGN,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.COMMUNICATIONS_SEND,
    PERMISSIONS.COMMUNICATIONS_READ,
  ],
  [ROLES.AGENT]: [
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_UPDATE,
    PERMISSIONS.BUYERS_READ,
    PERMISSIONS.BUYERS_UPDATE,
    PERMISSIONS.COMMUNICATIONS_SEND,
    PERMISSIONS.COMMUNICATIONS_READ,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.BUYERS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
} as const;
```

### **Enhanced Roles Guard**

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Check roles
    if (requiredRoles && !requiredRoles.some(role => user.roles?.includes(role))) {
      return false;
    }

    // Check permissions
    if (requiredPermissions) {
      const userPermissions = this.getUserPermissions(user.roles);
      if (!requiredPermissions.every(permission => userPermissions.includes(permission))) {
        return false;
      }
    }

    return true;
  }

  private getUserPermissions(userRoles: string[]): string[] {
    const permissions = new Set<string>();
    
    userRoles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    return Array.from(permissions);
  }
}
```

### **Permission Decorators**

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from '../constants/permissions';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const RequirePermissions = (...permissions: (keyof typeof PERMISSIONS)[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

// Convenience decorators
export const RequireLeadAccess = () => RequirePermissions('LEADS_READ');
export const RequireLeadWrite = () => RequirePermissions('LEADS_CREATE', 'LEADS_UPDATE');
export const RequireBuyerAccess = () => RequirePermissions('BUYERS_READ');
export const RequireBuyerWrite = () => RequirePermissions('BUYERS_CREATE', 'BUYERS_UPDATE');
export const RequireAdmin = () => Roles('SUPER_ADMIN', 'TENANT_ADMIN');
export const RequireManager = () => Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER');
```

### **Multi-Tenant Security**

```typescript
// src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../../tenants/tenants.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);
    
    if (!tenantId) {
      throw new ForbiddenException('Tenant identifier required');
    }

    // Validate tenant exists and is active
    const tenant = await this.tenantsService.findById(tenantId);
    if (!tenant || tenant.status !== 'active') {
      throw new ForbiddenException('Invalid or inactive tenant');
    }

    // Check subscription status
    if (tenant.subscriptionExpiresAt && tenant.subscriptionExpiresAt < new Date()) {
      throw new ForbiddenException('Tenant subscription expired');
    }

    // Add tenant to request
    req.tenant = tenant;
    req.tenantId = tenantId;

    next();
  }

  private extractTenantId(req: Request): string | null {
    // Priority order for tenant extraction
    return (
      req.headers['x-tenant-id'] as string ||
      req.subdomains[0] ||
      req.query.tenant as string ||
      req.user?.tenant_id ||
      null
    );
  }
}
```

### **Tenant Guard**

```typescript
// src/common/guards/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { user, tenant } = request;

    if (!user || !tenant) {
      throw new ForbiddenException('Tenant access required');
    }

    // Ensure user belongs to the requested tenant
    if (user.tenant_id.toString() !== tenant._id.toString()) {
      throw new ForbiddenException('Tenant access denied');
    }

    return true;
  }
}
```

### **Data Encryption & Security**

```typescript
// src/common/services/encryption.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  constructor(private configService: ConfigService) {}

  encrypt(text: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);
    const key = this.deriveKey(salt);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('presidential-digs-crm', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]).toString('base64');
  }

  decrypt(encryptedData: string): string {
    const data = Buffer.from(encryptedData, 'base64');
    
    const salt = data.subarray(0, this.saltLength);
    const iv = data.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = data.subarray(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
    const encrypted = data.subarray(this.saltLength + this.ivLength + this.tagLength);
    
    const key = this.deriveKey(salt);
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('presidential-digs-crm', 'utf8'));
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private deriveKey(salt: Buffer): Buffer {
    const masterKey = this.configService.get<string>('ENCRYPTION_MASTER_KEY');
    return crypto.pbkdf2Sync(masterKey, salt, 100000, this.keyLength, 'sha512');
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
}
```

### **Rate Limiting & API Security**

```typescript
// src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from '../caching/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { user, ip } = request;

    // Get rate limit configuration
    const rateLimit = this.reflector.get<{
      window: number;
      limit: number;
      keyPrefix: string;
    }>('rateLimit', context.getHandler());

    if (!rateLimit) {
      return true;
    }

    const key = this.generateKey(request, rateLimit.keyPrefix);
    const current = await this.redisService.incrementRateLimit(key, rateLimit.window);

    if (current > rateLimit.limit) {
      throw new HttpException(
        {
          message: 'Rate limit exceeded',
          retryAfter: rateLimit.window,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', rateLimit.limit);
    response.header('X-RateLimit-Remaining', Math.max(0, rateLimit.limit - current));
    response.header('X-RateLimit-Reset', Date.now() + rateLimit.window * 1000);

    return true;
  }

  private generateKey(request: Request, prefix: string): string {
    const { user, ip, tenant } = request;
    const identifier = user?.id || ip;
    const tenantId = tenant?._id || 'anonymous';
    
    return `rate_limit:${prefix}:${tenantId}:${identifier}`;
  }
}
```

### **Rate Limit Decorators**

```typescript
// src/common/decorators/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (window: number, limit: number, keyPrefix: string = 'default') =>
  SetMetadata(RATE_LIMIT_KEY, { window, limit, keyPrefix });

// Predefined rate limits
export const StrictRateLimit = () => RateLimit(60, 10, 'strict');
export const StandardRateLimit = () => RateLimit(60, 100, 'standard');
export const LooseRateLimit = () => RateLimit(60, 1000, 'loose');
export const AuthRateLimit = () => RateLimit(300, 5, 'auth'); // 5 attempts per 5 minutes
```

### **Security Audit & Logging**

```typescript
// src/common/services/security-logger.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityEvent } from '../schemas/security-event.schema';

@Injectable()
export class SecurityLoggerService {
  constructor(
    @InjectModel(SecurityEvent.name) private securityEventModel: Model<SecurityEvent>,
  ) {}

  async logSecurityEvent(data: {
    event: string;
    userId?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }) {
    const securityEvent = new this.securityEventModel({
      ...data,
      timestamp: new Date(),
    });

    await securityEvent.save();

    // Log to console for immediate visibility
    console.log(`[SECURITY] ${data.severity.toUpperCase()}: ${data.event}`, {
      userId: data.userId,
      tenantId: data.tenantId,
      ipAddress: data.ipAddress,
      details: data.details,
    });
  }

  async logLoginAttempt(userId: string, tenantId: string, success: boolean, ipAddress: string, userAgent: string) {
    await this.logSecurityEvent({
      event: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      userId,
      tenantId,
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'medium',
      details: { success },
    });
  }

  async logPermissionDenied(userId: string, tenantId: string, resource: string, action: string, ipAddress: string) {
    await this.logSecurityEvent({
      event: 'PERMISSION_DENIED',
      userId,
      tenantId,
      ipAddress,
      severity: 'high',
      details: { resource, action },
    });
  }

  async logDataAccess(userId: string, tenantId: string, resource: string, action: string, ipAddress: string) {
    await this.logSecurityEvent({
      event: 'DATA_ACCESS',
      userId,
      tenantId,
      ipAddress,
      severity: 'low',
      details: { resource, action },
    });
  }
}
```

### **Security Event Schema**

```typescript
// src/common/schemas/security-event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SecurityEvent extends Document {
  @Prop({ required: true })
  event: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant' })
  tenantId?: Types.ObjectId;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  details?: any;

  @Prop({ required: true, enum: ['low', 'medium', 'high', 'critical'] })
  severity: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export const SecurityEventSchema = SchemaFactory.createForClass(SecurityEvent);

// Indexes for efficient querying
SecurityEventSchema.index({ tenantId: 1, timestamp: -1 });
SecurityEventSchema.index({ userId: 1, timestamp: -1 });
SecurityEventSchema.index({ event: 1, timestamp: -1 });
SecurityEventSchema.index({ severity: 1, timestamp: -1 });
SecurityEventSchema.index({ ipAddress: 1, timestamp: -1 });
```

### **Security Configuration**

```typescript
// src/config/security.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'presidential-digs-crm',
    audience: 'crm-users',
  },
  
  encryption: {
    masterKey: process.env.ENCRYPTION_MASTER_KEY,
    algorithm: 'aes-256-gcm',
  },
  
  rateLimiting: {
    default: {
      window: 60,
      limit: 100,
    },
    auth: {
      window: 300,
      limit: 5,
    },
    api: {
      window: 60,
      limit: 1000,
    },
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  },
  
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },
}));
```

---

## 📊 Database Architecture

### **MongoDB Schema Design**

```typescript
// src/modules/leads/lead.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  tenant_id: Types.ObjectId;

  @Prop({ required: true })
  propertyAddress: string;

  @Prop({ required: true })
  ownerName: string;

  @Prop()
  ownerPhone: string;

  @Prop()
  ownerEmail: string;

  @Prop({ type: String, enum: ['new', 'contacted', 'qualified', 'under_contract', 'closed'], default: 'new' })
  status: string;

  @Prop({ type: Object })
  propertyDetails: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    yearBuilt: number;
    condition: string;
  };

  @Prop({ type: Object })
  financialDetails: {
    estimatedValue: number;
    askingPrice: number;
    arv: number;
    repairCosts: number;
    offerPrice: number;
  };

  @Prop({ type: [Object] })
  notes: Array<{
    content: string;
    created_by: Types.ObjectId;
    created_at: Date;
  }>;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: Object })
  ai_summary: {
    sentiment: string;
    urgency: string;
    motivation: string;
    suggested_actions: string[];
    lead_score: number;
    qualification_probability: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_to: Types.ObjectId;

  @Prop({ type: Date })
  last_contact_date: Date;

  @Prop({ type: Date })
  next_follow_up: Date;

  @Prop({ type: Number, default: 0 })
  lead_score: number;

  @Prop({ type: String })
  source: string;

  @Prop({ type: Object })
  automation_data: {
    workflow_id: Types.ObjectId;
    last_automation_step: string;
    automation_history: Array<{
      step: string;
      executed_at: Date;
      result: string;
    }>;
  };
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Indexes for performance
LeadSchema.index({ tenant_id: 1, status: 1 });
LeadSchema.index({ tenant_id: 1, assigned_to: 1 });
LeadSchema.index({ tenant_id: 1, propertyAddress: 'text' });
LeadSchema.index({ tenant_id: 1, created_at: -1 });
LeadSchema.index({ tenant_id: 1, lead_score: -1 });
LeadSchema.index({ tenant_id: 1, source: 1 });
```

```typescript
// src/modules/automation/workflow.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Workflow extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  tenant_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' })
  status: string;

  @Prop({ type: Object })
  trigger: {
    type: string; // lead_created, status_changed, communication_sent, scheduled
    conditions: Object;
    schedule?: {
      frequency: string;
      time: string;
      timezone: string;
    };
  };

  @Prop({ type: [Object] })
  steps: Array<{
    id: string;
    type: string; // action, condition, delay
    name: string;
    config: Object;
    order: number;
    next_step_id?: string;
    condition_branch?: {
      true_step_id: string;
      false_step_id: string;
    };
  }>;

  @Prop({ type: Object })
  statistics: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    last_executed: Date;
    average_execution_time: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId;

  @Prop({ type: [String] })
  tags: string[];
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);

// Indexes for performance
WorkflowSchema.index({ tenant_id: 1, status: 1 });
WorkflowSchema.index({ tenant_id: 1, 'trigger.type': 1 });
WorkflowSchema.index({ tenant_id: 1, created_by: 1 });
```

```typescript
// src/modules/analytics/analytics.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Analytics extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  tenant_id: Types.ObjectId;

  @Prop({ required: true })
  metric_name: string;

  @Prop({ required: true })
  metric_value: number;

  @Prop({ type: String })
  metric_unit: string;

  @Prop({ type: Object })
  dimensions: {
    user_id?: Types.ObjectId;
    lead_source?: string;
    lead_status?: string;
    date?: Date;
    automation_workflow?: string;
  };

  @Prop({ type: Date, required: true })
  recorded_at: Date;

  @Prop({ type: String, enum: ['daily', 'hourly', 'real_time'], default: 'daily' })
  aggregation_period: string;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

// Indexes for performance
AnalyticsSchema.index({ tenant_id: 1, metric_name: 1, recorded_at: -1 });
AnalyticsSchema.index({ tenant_id: 1, 'dimensions.user_id': 1, recorded_at: -1 });
AnalyticsSchema.index({ tenant_id: 1, 'dimensions.lead_source': 1, recorded_at: -1 });
```

### **Database Optimization**

```typescript
// src/database/indexes/lead.indexes.ts
import { Connection } from 'mongoose';

export async function createLeadIndexes(connection: Connection) {
  const leadCollection = connection.collection('leads');

  // Compound indexes for common queries
  await leadCollection.createIndex(
    { tenant_id: 1, status: 1, created_at: -1 },
    { name: 'tenant_status_created' }
  );

  await leadCollection.createIndex(
    { tenant_id: 1, assigned_to: 1, status: 1 },
    { name: 'tenant_assigned_status' }
  );

  // Text search index
  await leadCollection.createIndex(
    { 
      tenant_id: 1,
      propertyAddress: 'text',
      ownerName: 'text',
      'notes.content': 'text'
    },
    { 
      name: 'tenant_text_search',
      weights: {
        propertyAddress: 10,
        ownerName: 5,
        'notes.content': 1
      }
    }
  );

  // Geospatial index for location-based queries
  await leadCollection.createIndex(
    { tenant_id: 1, location: '2dsphere' },
    { name: 'tenant_location' }
  );
}
```

---

## 🔍 **Search Engine Integration (Meilisearch)**

### **Meilisearch Configuration**

```yaml
# monitoring/meilisearch/meilisearch.yml
# Meilisearch configuration file
env: production
server_providers: []
master_key: "your-master-key-here"
no_analytics: true
max_index_size: "100GB"
max_db_size: "100GB"
http_addr: "0.0.0.0"
http_port: 7700
http_payload_size_limit: "100MB"
log_level: "INFO"
db_path: "/data.ms"
dumps_dir: "/dumps"
snapshot_dir: "/snapshots"
ssl_auth_path: ""
ssl_cert_path: ""
ssl_key_path: ""
ssl_require_auth: false
ssl_resumption: true
ssl_tickets: true
experimental_enable_metrics: true
```

### **Meilisearch Service**

```typescript
// src/modules/search/meilisearch.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MeiliSearch from 'meilisearch';

@Injectable()
export class MeilisearchService {
  private client: MeiliSearch;
  private leadsIndex: any;
  private buyersIndex: any;

  constructor(private configService: ConfigService) {
    this.client = new MeiliSearch({
      host: this.configService.get('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: this.configService.get('MEILISEARCH_MASTER_KEY'),
    });

    this.initializeIndexes();
  }

  private async initializeIndexes() {
    // Initialize leads index
    this.leadsIndex = this.client.index('leads');
    
    // Configure leads index settings
    await this.leadsIndex.updateSettings({
      searchableAttributes: [
        'propertyAddress',
        'ownerName',
        'ownerPhone',
        'ownerEmail',
        'notes.content',
        'tags'
      ],
      filterableAttributes: [
        'tenant_id',
        'status',
        'assigned_to',
        'source',
        'tags',
        'propertyDetails.type',
        'propertyDetails.condition'
      ],
      sortableAttributes: [
        'created_at',
        'last_contact_date',
        'next_follow_up',
        'financialDetails.askingPrice',
        'financialDetails.estimatedValue'
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness'
      ],
      distinctAttribute: null,
      pagination: {
        maxTotalHits: 1000
      }
    });

    // Initialize buyers index
    this.buyersIndex = this.client.index('buyers');
    
    // Configure buyers index settings
    await this.buyersIndex.updateSettings({
      searchableAttributes: [
        'name',
        'email',
        'phone',
        'address.city',
        'address.state',
        'preferences.propertyTypes',
        'preferences.locations'
      ],
      filterableAttributes: [
        'tenant_id',
        'status',
        'assigned_to',
        'source',
        'tags',
        'preferences.propertyTypes',
        'preferences.locations'
      ],
      sortableAttributes: [
        'created_at',
        'lastContactDate',
        'nextFollowUp',
        'financial.budget'
      ]
    });
  }

  async indexLead(lead: any) {
    const document = {
      id: lead._id.toString(),
      tenant_id: lead.tenant_id.toString(),
      propertyAddress: lead.propertyAddress,
      location: lead.location,
      ownerName: lead.ownerName,
      ownerPhone: lead.ownerPhone,
      ownerEmail: lead.ownerEmail,
      status: lead.status,
      propertyDetails: lead.propertyDetails,
      financialDetails: lead.financialDetails,
      tags: lead.tags,
      assigned_to: lead.assigned_to?.toString(),
      created_at: lead.created_at,
      last_contact_date: lead.last_contact_date,
      next_follow_up: lead.next_follow_up,
      source: lead.source,
      ai_summary: lead.ai_summary,
      notes: lead.notes?.map((note: any) => note.content).join(' '),
    };

    return this.leadsIndex.addDocuments([document]);
  }

  async indexBuyer(buyer: any) {
    const document = {
      id: buyer._id.toString(),
      tenant_id: buyer.tenant_id.toString(),
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      address: buyer.address,
      preferences: buyer.preferences,
      financial: buyer.financial,
      tags: buyer.tags,
      assigned_to: buyer.assigned_to?.toString(),
      status: buyer.status,
      source: buyer.source,
      created_at: buyer.created_at,
      lastContactDate: buyer.lastContactDate,
      nextFollowUp: buyer.nextFollowUp,
    };

    return this.buyersIndex.addDocuments([document]);
  }

  async searchLeads(tenantId: string, query: any) {
    const { searchTerm, filters, sort, page = 1, limit = 20 } = query;

    const searchParams: any = {
      filter: [`tenant_id = "${tenantId}"`],
      offset: (page - 1) * limit,
      limit: limit,
    };

    // Add filters
    if (filters?.status) {
      searchParams.filter.push(`status = "${filters.status}"`);
    }

    if (filters?.assigned_to) {
      searchParams.filter.push(`assigned_to = "${filters.assigned_to}"`);
    }

    if (filters?.tags?.length) {
      const tagFilters = filters.tags.map((tag: string) => `tags = "${tag}"`);
      searchParams.filter.push(`(${tagFilters.join(' OR ')})`);
    }

    if (filters?.source) {
      searchParams.filter.push(`source = "${filters.source}"`);
    }

    if (filters?.priceRange) {
      searchParams.filter.push(
        `financialDetails.askingPrice >= ${filters.priceRange.min} AND financialDetails.askingPrice <= ${filters.priceRange.max}`
      );
    }

    // Add sorting
    if (sort) {
      searchParams.sort = [sort];
    }

    // Perform search
    const result = await this.leadsIndex.search(searchTerm || '', searchParams);

    return {
      hits: result.hits,
      total: result.estimatedTotalHits,
      processingTimeMs: result.processingTimeMs,
      query: result.query,
    };
  }

  async searchBuyers(tenantId: string, query: any) {
    const { searchTerm, filters, sort, page = 1, limit = 20 } = query;

    const searchParams: any = {
      filter: [`tenant_id = "${tenantId}"`],
      offset: (page - 1) * limit,
      limit: limit,
    };

    // Add filters
    if (filters?.status) {
      searchParams.filter.push(`status = "${filters.status}"`);
    }

    if (filters?.assigned_to) {
      searchParams.filter.push(`assigned_to = "${filters.assigned_to}"`);
    }

    if (filters?.propertyTypes?.length) {
      const typeFilters = filters.propertyTypes.map((type: string) => 
        `preferences.propertyTypes = "${type}"`
      );
      searchParams.filter.push(`(${typeFilters.join(' OR ')})`);
    }

    // Add sorting
    if (sort) {
      searchParams.sort = [sort];
    }

    // Perform search
    const result = await this.buyersIndex.search(searchTerm || '', searchParams);

    return {
      hits: result.hits,
      total: result.estimatedTotalHits,
      processingTimeMs: result.processingTimeMs,
      query: result.query,
    };
  }

  async deleteLead(leadId: string) {
    return this.leadsIndex.deleteDocument(leadId);
  }

  async deleteBuyer(buyerId: string) {
    return this.buyersIndex.deleteDocument(buyerId);
  }

  async updateLead(leadId: string, updates: any) {
    return this.leadsIndex.updateDocuments([{ id: leadId, ...updates }]);
  }

  async updateBuyer(buyerId: string, updates: any) {
    return this.buyersIndex.updateDocuments([{ id: buyerId, ...updates }]);
  }

  async getIndexStats() {
    const [leadsStats, buyersStats] = await Promise.all([
      this.leadsIndex.getStats(),
      this.buyersIndex.getStats(),
    ]);

    return {
      leads: leadsStats,
      buyers: buyersStats,
    };
  }
}
```

---

## 🗄️ **Enhanced Redis Caching Strategy**

### **Redis Configuration**

```yaml
# monitoring/redis/redis.conf
# Redis configuration for CRM application
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
slave-serve-stale-data yes
slave-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-ping-slave-period 10
repl-timeout 60
repl-disable-tcp-nodelay no
slave-priority 100
maxmemory 2gb
maxmemory-policy allkeys-lru
lazyfree-lazy-eviction no
lazyfree-lazy-expire no
lazyfree-lazy-server-del no
slave-lazy-flush no
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
```

### **Redis Service with Advanced Caching**

```typescript
// src/common/caching/redis.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;
  private redisCluster: Redis.Cluster;

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private initializeRedis() {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      keyPrefix: 'crm:',
    };

    // Use cluster if configured, otherwise single instance
    if (this.configService.get('REDIS_CLUSTER_ENABLED', false)) {
      this.redisCluster = new Redis.Cluster([
        {
          host: this.configService.get('REDIS_CLUSTER_HOST'),
          port: this.configService.get('REDIS_CLUSTER_PORT'),
        },
      ], {
        redisOptions: redisConfig,
        clusterRetryStrategy: (times: number) => Math.min(times * 50, 2000),
      });
    } else {
      this.redis = new Redis(redisConfig);
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    const client = this.redis || this.redisCluster;
    
    client.on('connect', () => {
      console.log('Redis connected');
    });

    client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    client.on('ready', () => {
      console.log('Redis ready');
    });
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    const client = this.redis || this.redisCluster;
    return client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    const client = this.redis || this.redisCluster;
    if (ttl) {
      return client.setex(key, ttl, value);
    }
    return client.set(key, value);
  }

  async del(key: string): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.del(key);
  }

  async exists(key: string): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.exists(key);
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    const client = this.redis || this.redisCluster;
    return client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const client = this.redis || this.redisCluster;
    return client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.hdel(key, ...fields);
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.lpush(key, ...values);
  }

  async rpop(key: string): Promise<string | null> {
    const client = this.redis || this.redisCluster;
    return client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const client = this.redis || this.redisCluster;
    return client.lrange(key, start, stop);
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    const client = this.redis || this.redisCluster;
    return client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.srem(key, ...members);
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    const client = this.redis || this.redisCluster;
    return client.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    const client = this.redis || this.redisCluster;
    return client.zrange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const client = this.redis || this.redisCluster;
    return client.zrevrange(key, start, stop);
  }

  // Advanced caching operations
  async cacheGet<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  async cacheSet<T>(key: string, value: T, ttl?: number): Promise<'OK'> {
    const serialized = JSON.stringify(value);
    return this.set(key, serialized, ttl);
  }

  async cacheDelete(pattern: string): Promise<void> {
    const client = this.redis || this.redisCluster;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<'OK'> {
    return this.set(`session:${sessionId}`, JSON.stringify(data), ttl);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<number> {
    return this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key: string, window: number): Promise<number> {
    const client = this.redis || this.redisCluster;
    const multi = client.multi();
    multi.incr(key);
    multi.expire(key, window);
    const results = await multi.exec();
    return results?.[0]?.[1] as number || 0;
  }

  async getRateLimit(key: string): Promise<number> {
    const value = await this.get(key);
    return value ? parseInt(value) : 0;
  }

  // Cache invalidation patterns
  async invalidateTenantCache(tenantId: string): Promise<void> {
    await this.cacheDelete(`tenant:${tenantId}:*`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheDelete(`user:${userId}:*`);
  }

  async invalidateLeadCache(leadId: string): Promise<void> {
    await this.cacheDelete(`lead:${leadId}:*`);
  }

  // Health check
  async ping(): Promise<string> {
    const client = this.redis || this.redisCluster;
    return client.ping();
  }

  async getInfo(): Promise<string> {
    const client = this.redis || this.redisCluster;
    return client.info();
  }
}
```

### **Advanced Caching Interceptor**

```typescript
// src/common/interceptors/cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../caching/redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Skip caching for non-GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(request, user);
    
    // Try to get from cache
    const cachedData = await this.redisService.cacheGet(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // If not in cache, execute request and cache result
    return next.handle().pipe(
      tap(async (data) => {
        // Cache the response with TTL based on endpoint
        const ttl = this.getCacheTTL(url);
        await this.redisService.cacheSet(cacheKey, data, ttl);
      })
    );
  }

  private generateCacheKey(request: any, user: any): string {
    const { url, query, params } = request;
    const tenantId = user?.tenant_id || 'anonymous';
    
    // Create a unique key based on URL, query params, and tenant
    const queryString = Object.keys(query).length > 0 
      ? `?${new URLSearchParams(query).toString()}` 
      : '';
    
    return `cache:${tenantId}:${url}${queryString}`;
  }

  private getCacheTTL(url: string): number {
    // Different TTL for different endpoints
    if (url.includes('/leads')) {
      return 300; // 5 minutes for leads
    }
    if (url.includes('/buyers')) {
      return 600; // 10 minutes for buyers
    }
    if (url.includes('/analytics')) {
      return 1800; // 30 minutes for analytics
    }
    return 60; // 1 minute default
  }
}
```

---

## 🔄 API Design Patterns

### **RESTful API Structure**

```typescript
// src/modules/leads/leads.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, LeadFilterDto } from './dto';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @Roles('ACQUISITION_REP', 'ADMIN')
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  async getLeads(
    @Query() filterDto: LeadFilterDto,
    @CurrentUser() user: any
  ) {
    return this.leadsService.findAll(filterDto, user.tenant_id);
  }

  @Get(':id')
  @Roles('ACQUISITION_REP', 'ADMIN')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  async getLead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.findById(id, user.tenant_id);
  }

  @Post()
  @Roles('ACQUISITION_REP', 'ADMIN')
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  async createLead(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: any
  ) {
    return this.leadsService.create(createLeadDto, user.tenant_id, user._id);
  }

  @Put(':id')
  @Roles('ACQUISITION_REP', 'ADMIN')
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any
  ) {
    return this.leadsService.update(id, updateLeadDto, user.tenant_id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  async deleteLead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.delete(id, user.tenant_id);
  }

  @Post(':id/notes')
  @Roles('ACQUISITION_REP', 'ADMIN')
  @ApiOperation({ summary: 'Add note to lead' })
  @ApiResponse({ status: 201, description: 'Note added successfully' })
  async addNote(
    @Param('id') id: string,
    @Body() body: { note: string },
    @CurrentUser() user: any
  ) {
    return this.leadsService.addNote(id, body.note, user.tenant_id, user._id);
  }
}
```

### **DTO Validation**

```typescript
// src/modules/leads/dto/create-lead.dto.ts
import { IsString, IsOptional, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PropertyDetailsDto {
  @ApiProperty({ description: 'Property type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Number of bedrooms' })
  @IsNumber()
  bedrooms: number;

  @ApiProperty({ description: 'Number of bathrooms' })
  @IsNumber()
  bathrooms: number;

  @ApiProperty({ description: 'Square footage' })
  @IsNumber()
  squareFeet: number;

  @ApiProperty({ description: 'Year built' })
  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @ApiProperty({ description: 'Property condition' })
  @IsString()
  condition: string;
}

class FinancialDetailsDto {
  @ApiProperty({ description: 'Estimated property value' })
  @IsNumber()
  estimatedValue: number;

  @ApiProperty({ description: 'Asking price' })
  @IsNumber()
  askingPrice: number;

  @ApiProperty({ description: 'After repair value' })
  @IsNumber()
  arv: number;

  @ApiProperty({ description: 'Estimated repair costs' })
  @IsNumber()
  repairCosts: number;

  @ApiProperty({ description: 'Offer price' })
  @IsOptional()
  @IsNumber()
  offerPrice?: number;
}

export class CreateLeadDto {
  @ApiProperty({ description: 'Property address' })
  @IsString()
  propertyAddress: string;

  @ApiProperty({ description: 'Owner name' })
  @IsString()
  ownerName: string;

  @ApiProperty({ description: 'Owner phone number' })
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @ApiProperty({ description: 'Owner email' })
  @IsOptional()
  @IsString()
  ownerEmail?: string;

  @ApiProperty({ description: 'Property details' })
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  propertyDetails: PropertyDetailsDto;

  @ApiProperty({ description: 'Financial details' })
  @IsObject()
  @ValidateNested()
  @Type(() => FinancialDetailsDto)
  financialDetails: FinancialDetailsDto;
}
```

---

## 📈 Performance & Scalability

### **Caching Strategy**

```typescript
// src/common/interceptors/cache.interceptor.ts
import { Injectable, CacheInterceptor, ExecutionContext } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;

    // Don't cache if not GET request
    if (request.method !== 'GET') {
      return undefined;
    }

    // Create cache key based on URL and tenant
    const tenantId = request.user?.tenant_id || 'anonymous';
    const url = httpAdapter.getRequestUrl(request);
    
    return `${tenantId}:${url}`;
  }
}
```

### **Rate Limiting**

```typescript
// src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard implements CanActivate {
  protected getTracker(req: Record<string, any>): string {
    return req.user?.id || req.ip; // Track by user ID or IP
  }
}
```

---

## 🔍 Monitoring & Observability

### **Monitoring Stack Overview**

**Components:**
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Winston**: Application logging
- **Alertmanager**: Alert routing and notification
- **Custom Metrics**: Business-specific monitoring

### **Prometheus Integration**

```typescript
// src/common/monitoring/prometheus.service.ts
import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService {
  private registry: Registry;

  // HTTP Request Metrics
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private httpRequestsInProgress: Gauge<string>;

  // Business Metrics
  private leadsCreatedTotal: Counter<string>;
  private leadsStatusChanges: Counter<string>;
  private activeUsersGauge: Gauge<string>;
  private databaseConnectionsGauge: Gauge<string>;

  // Error Metrics
  private errorsTotal: Counter<string>;
  private apiErrorsTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'tenant_id'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'tenant_id'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently in progress',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });

    // Business Metrics
    this.leadsCreatedTotal = new Counter({
      name: 'leads_created_total',
      help: 'Total number of leads created',
      labelNames: ['tenant_id', 'source'],
      registers: [this.registry],
    });

    this.leadsStatusChanges = new Counter({
      name: 'leads_status_changes_total',
      help: 'Total number of lead status changes',
      labelNames: ['tenant_id', 'from_status', 'to_status'],
      registers: [this.registry],
    });

    this.activeUsersGauge = new Gauge({
      name: 'active_users_total',
      help: 'Number of active users',
      labelNames: ['tenant_id'],
      registers: [this.registry],
    });

    this.databaseConnectionsGauge = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    // Error Metrics
    this.errorsTotal = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'module', 'tenant_id'],
      registers: [this.registry],
    });

    this.apiErrorsTotal = new Counter({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['endpoint', 'method', 'status_code', 'tenant_id'],
      registers: [this.registry],
    });
  }

  // HTTP Metrics Methods
  recordHttpRequest(method: string, route: string, statusCode: number, tenantId?: string) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString(), tenant_id: tenantId || 'unknown' });
  }

  startHttpRequestTimer(method: string, route: string, tenantId?: string) {
    return this.httpRequestDuration.startTimer({ method, route, tenant_id: tenantId || 'unknown' });
  }

  incrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestsInProgress.inc({ method, route });
  }

  decrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestsInProgress.dec({ method, route });
  }

  // Business Metrics Methods
  recordLeadCreated(tenantId: string, source: string) {
    this.leadsCreatedTotal.inc({ tenant_id: tenantId, source });
  }

  recordLeadStatusChange(tenantId: string, fromStatus: string, toStatus: string) {
    this.leadsStatusChanges.inc({ tenant_id: tenantId, from_status: fromStatus, to_status: toStatus });
  }

  setActiveUsers(tenantId: string, count: number) {
    this.activeUsersGauge.set({ tenant_id: tenantId }, count);
  }

  setDatabaseConnections(count: number) {
    this.databaseConnectionsGauge.set(count);
  }

  // Error Metrics Methods
  recordError(type: string, module: string, tenantId?: string) {
    this.errorsTotal.inc({ type, module, tenant_id: tenantId || 'unknown' });
  }

  recordApiError(endpoint: string, method: string, statusCode: number, tenantId?: string) {
    this.apiErrorsTotal.inc({ endpoint, method, status_code: statusCode.toString(), tenant_id: tenantId || 'unknown' });
  }

  // Registry Methods
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }
}
```

### **Prometheus Interceptor**

```typescript
// src/common/interceptors/prometheus.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrometheusService } from '../monitoring/prometheus.service';

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, route, user } = request;
    const tenantId = user?.tenant_id || 'anonymous';

    // Increment in-progress requests
    this.prometheusService.incrementHttpRequestsInProgress(method, route);

    // Start timer
    const timer = this.prometheusService.startHttpRequestTimer(method, route, tenantId);

    return next.handle().pipe(
      tap(() => {
        // Record successful request
        this.prometheusService.recordHttpRequest(method, route, response.statusCode, tenantId);
        timer(); // Stop timer
        this.prometheusService.decrementHttpRequestsInProgress(method, route);
      }),
      catchError((error) => {
        // Record error
        this.prometheusService.recordHttpRequest(method, route, error.status || 500, tenantId);
        this.prometheusService.recordApiError(route, method, error.status || 500, tenantId);
        this.prometheusService.recordError('http_error', 'api', tenantId);
        timer(); // Stop timer
        this.prometheusService.decrementHttpRequestsInProgress(method, route);
        throw error;
      })
    );
  }
}
```

### **Prometheus Controller**

```typescript
// src/common/controllers/prometheus.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PrometheusService } from '../monitoring/prometheus.service';

@ApiTags('Monitoring')
@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(@Res() res: Response) {
    const metrics = await this.prometheusService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  }
}
```

### **Logging Configuration**

```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `${method} ${url} ${responseTime}ms - User: ${user?.email || 'anonymous'} - Tenant: ${user?.tenant_id || 'none'}`
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.error(
          `${method} ${url} ${responseTime}ms - Error: ${error.message} - User: ${user?.email || 'anonymous'} - Tenant: ${user?.tenant_id || 'none'}`
        );
        throw error;
      })
    );
  }
}
```

### **Health Checks**

```typescript
// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator, RedisHealthIndicator } from '@nestjs/terminus';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

### **Grafana Dashboard Configuration**

```json
// monitoring/grafana/dashboards/crm-overview.json
{
  "dashboard": {
    "id": null,
    "title": "CRM Overview Dashboard",
    "tags": ["crm", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "HTTP Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests per second"
          }
        ]
      },
      {
        "id": 2,
        "title": "HTTP Request Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Duration (seconds)"
          }
        ]
      },
      {
        "id": 3,
        "title": "Leads Created",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(leads_created_total[5m])",
            "legendFormat": "{{tenant_id}} - {{source}}"
          }
        ],
        "yAxes": [
          {
            "label": "Leads per second"
          }
        ]
      },
      {
        "id": 4,
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(active_users_total)",
            "legendFormat": "Total Active Users"
          }
        ]
      },
      {
        "id": 5,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(errors_total[5m])",
            "legendFormat": "{{type}} - {{module}}"
          }
        ],
        "yAxes": [
          {
            "label": "Errors per second"
          }
        ]
      },
      {
        "id": 6,
        "title": "Database Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "database_connections_active",
            "legendFormat": "Active Connections"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "max": 100,
            "thresholds": {
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 50 },
                { "color": "red", "value": 80 }
              ]
            }
          }
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### **Alerting Configuration**

```yaml
# monitoring/prometheus/alerts/crm-alerts.yml
groups:
  - name: crm_alerts
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # High Response Time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      # Database Connection Issues
      - alert: HighDatabaseConnections
        expr: database_connections_active > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High database connection count"
          description: "Database has {{ $value }} active connections"

      # API Errors
      - alert: APIErrors
        expr: rate(api_errors_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High API error rate"
          description: "API error rate is {{ $value }} errors per second"

      # No Leads Created
      - alert: NoLeadsCreated
        expr: rate(leads_created_total[1h]) == 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "No leads created in the last hour"
          description: "No leads have been created for 1 hour"

      # Service Down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} is down"
```

### **Docker Compose for Monitoring**

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: crm-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/alerts:/etc/prometheus/alerts
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: crm-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    restart: unless-stopped
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    container_name: crm-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

### **Prometheus Configuration**

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'crm-backend'
    static_configs:
      - targets: ['backend:3002']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'crm-frontend'
    static_configs:
      - targets: ['host:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 30s

  - job_name: 'meilisearch'
    static_configs:
      - targets: ['meilisearch:7700']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

---

## 🐳 **Docker Compose for Open Source Stack**

```yaml
# docker-compose.opensource.yml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:7.0
    container_name: crm-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: presidential_digs_crm
    volumes:
      - mongodb_data:/data/db
      - ./monitoring/mongodb/init:/docker-entrypoint-initdb.d
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis
  redis:
    image: redis:7.2-alpine
    container_name: crm-redis
    ports:
      - "6379:6379"
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - redis_data:/data
      - ./monitoring/redis/redis.conf:/usr/local/etc/redis/redis.conf
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cluster (for production)
  redis-cluster:
    image: redis:7.2-alpine
    container_name: crm-redis-cluster
    ports:
      - "7000-7005:7000-7005"
    command: redis-server /usr/local/etc/redis/redis-cluster.conf
    volumes:
      - redis_cluster_data:/data
      - ./monitoring/redis/redis-cluster.conf:/usr/local/etc/redis/redis-cluster.conf
    restart: unless-stopped
    profiles:
      - production

  # Meilisearch
  meilisearch:
    image: getmeili/meilisearch:latest
    container_name: crm-meilisearch
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=your-master-key-here
      - MEILI_NO_ANALYTICS=true
      - MEILI_ENV=production
    volumes:
      - meilisearch_data:/data.ms
      - ./monitoring/meilisearch/dumps:/dumps
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Meilisearch Admin UI
  meilisearch-admin:
    image: getmeili/meilisearch-admin:latest
    container_name: crm-meilisearch-admin
    ports:
      - "7701:80"
    environment:
      - MEILI_MASTER_KEY=your-master-key-here
      - MEILI_URL=http://meilisearch:7700
    depends_on:
      - meilisearch
    restart: unless-stopped

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: crm-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/alerts:/etc/prometheus/alerts
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: crm-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    restart: unless-stopped
    depends_on:
      - prometheus

  # MongoDB Exporter for Prometheus
  mongodb-exporter:
    image: percona/mongodb_exporter:latest
    container_name: crm-mongodb-exporter
    ports:
      - "9216:9216"
    command:
      - '--mongodb.uri=mongodb://admin:password@mongodb:27017/presidential_digs_crm?authSource=admin'
    restart: unless-stopped
    depends_on:
      - mongodb

  # Redis Exporter for Prometheus
  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: crm-redis-exporter
    ports:
      - "9121:9121"
    command:
      - '--redis.addr=redis://redis:6379'
    restart: unless-stopped
    depends_on:
      - redis

  # Backend Application
  backend:
    build: ./backend
    container_name: crm-backend
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/presidential_digs_crm?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MEILISEARCH_HOST=http://meilisearch:7700
      - MEILISEARCH_MASTER_KEY=your-master-key-here
    depends_on:
      - mongodb
      - redis
      - meilisearch
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:
  redis_data:
  redis_cluster_data:
  meilisearch_data:
  prometheus_data:
  grafana_data:
```

---

## 🚀 Deployment Architecture

### **Docker Configuration**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start application
CMD ["node", "dist/main"]
```

---

## 🔄 **GitHub Actions CI/CD Pipeline**

### **Main CI/CD Workflow**

```yaml
# .github/workflows/main-ci-cd.yml
name: Main CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
      image_tag:
        description: 'Image tag to deploy'
        required: false
        type: string

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: presidential-digs-crm
  AWS_REGION: us-east-1

jobs:
  # Code Quality & Security
  code-quality:
    name: Code Quality & Security
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install backend dependencies
        run: |
          cd backend
          npm ci

      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci

      - name: Run ESLint (Backend)
        run: |
          cd backend
          npm run lint

      - name: Run ESLint (Frontend)
        run: |
          cd frontend
          npm run lint

      - name: Run Prettier check
        run: |
          cd backend && npm run format:check
          cd ../frontend && npm run format:check

      - name: Run security audit
        run: |
          cd backend && npm audit --audit-level=moderate
          cd ../frontend && npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          working-directory: ./backend

      - name: Run Snyk security scan (Frontend)
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          working-directory: ./frontend

  # Testing Matrix
  test-matrix:
    name: Test Matrix
    runs-on: ubuntu-latest
    strategy:
      matrix:
        component: [backend, frontend]
        node-version: [18, 20]
        include:
          - component: backend
            test-command: "npm run test:ci"
            coverage-command: "npm run test:coverage"
          - component: frontend
            test-command: "npm run test:ci"
            coverage-command: "npm run test:coverage"
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd ${{ matrix.component }}
          npm ci

      - name: Run unit tests
        run: |
          cd ${{ matrix.component }}
          ${{ matrix.test-command }}

      - name: Run coverage
        run: |
          cd ${{ matrix.component }}
          ${{ matrix.coverage-command }}

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./${{ matrix.component }}/coverage/lcov.info
          flags: ${{ matrix.component }}
          name: ${{ matrix.component }}-coverage

  # Integration Tests
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [code-quality, test-matrix]
    services:
      mongodb:
        image: mongo:7.0
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017
      redis:
        image: redis:7.2-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install backend dependencies
        run: |
          cd backend
          npm ci

      - name: Run integration tests
        run: |
          cd backend
          npm run test:integration
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/test?authSource=admin
          REDIS_HOST: localhost
          REDIS_PORT: 6379

  # E2E Tests
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [code-quality, test-matrix]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Playwright
        run: |
          cd frontend
          npm ci
          npx playwright install --with-deps

      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30

  # Build & Package
  build:
    name: Build Applications
    runs-on: ubuntu-latest
    needs: [code-quality, test-matrix, integration-tests, e2e-tests]
    strategy:
      matrix:
        component: [backend, frontend]
    outputs:
      image-tag: ${{ steps.build.outputs.image-tag }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd ${{ matrix.component }}
          npm ci

      - name: Build application
        run: |
          cd ${{ matrix.component }}
          npm run build

      - name: Generate image tag
        id: build
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "image-tag=${{ github.event.inputs.image_tag || 'latest' }}" >> $GITHUB_OUTPUT
          else
            echo "image-tag=${{ github.sha }}" >> $GITHUB_OUTPUT
          fi

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.component }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=${{ steps.build.outputs.image-tag }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.component }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/develop' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
    environment: staging
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.5.0'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Terraform Init
        run: |
          cd infrastructure/terraform/staging
          terraform init

      - name: Terraform Plan
        run: |
          cd infrastructure/terraform/staging
          terraform plan -var="image_tag=${{ needs.build.outputs.image-tag }}" -out=tfplan

      - name: Terraform Apply
        run: |
          cd infrastructure/terraform/staging
          terraform apply tfplan

      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/presidential-digs-backend -n presidential-digs --timeout=300s

      - name: Run smoke tests
        run: |
          ./scripts/smoke-tests.sh staging

      - name: Notify deployment
        run: |
          ./scripts/notify-deployment.sh staging ${{ needs.build.outputs.image-tag }}

  # Deploy to Production
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' || (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'production')
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.5.0'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Terraform Init
        run: |
          cd infrastructure/terraform/production
          terraform init

      - name: Terraform Plan
        run: |
          cd infrastructure/terraform/production
          terraform plan -var="image_tag=${{ needs.build.outputs.image-tag }}" -out=tfplan

      - name: Manual approval
        run: echo "Waiting for manual approval..."

      - name: Terraform Apply
        run: |
          cd infrastructure/terraform/production
          terraform apply tfplan

      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/presidential-digs-backend -n presidential-digs --timeout=300s

      - name: Run smoke tests
        run: |
          ./scripts/smoke-tests.sh production

      - name: Run performance tests
        run: |
          ./scripts/performance-tests.sh production

      - name: Notify deployment
        run: |
          ./scripts/notify-deployment.sh production ${{ needs.build.outputs.image-tag }}

  # Post-deployment verification
  post-deployment:
    name: Post-deployment Verification
    runs-on: ubuntu-latest
    needs: [deploy-staging, deploy-production]
    if: always() && (needs.deploy-staging.result == 'success' || needs.deploy-production.result == 'success')
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run health checks
        run: |
          if [ "${{ needs.deploy-staging.result }}" = "success" ]; then
            ./scripts/health-check.sh staging
          fi
          if [ "${{ needs.deploy-production.result }}" = "success" ]; then
            ./scripts/health-check.sh production
          fi

      - name: Generate deployment report
        run: |
          ./scripts/generate-deployment-report.sh

      - name: Upload deployment report
        uses: actions/upload-artifact@v4
        with:
          name: deployment-report
          path: deployment-report.json
          retention-days: 30
```

### **Feature Branch Workflow**

```yaml
# .github/workflows/feature-branch.yml
name: Feature Branch CI

on:
  push:
    branches-ignore: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: presidential-digs-crm

jobs:
  # Quick validation for feature branches
  quick-validation:
    name: Quick Validation
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run linting
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

      - name: Run unit tests
        run: |
          cd backend && npm run test
          cd ../frontend && npm run test

      - name: Build applications
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build

  # Build feature branch images
  build-feature:
    name: Build Feature Images
    runs-on: ubuntu-latest
    needs: [quick-validation]
    if: github.event_name == 'push'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### **Release Workflow**

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: presidential-digs-crm

jobs:
  # Create release
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    outputs:
      release_id: ${{ steps.create_release.outputs.id }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false

      - name: Generate changelog
        run: |
          ./scripts/generate-changelog.sh ${{ github.ref }} > CHANGELOG.md

      - name: Upload changelog
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.create_release.outputs.upload_url }}
          asset_path: ./CHANGELOG.md
          asset_name: CHANGELOG.md
          asset_content_type: text/markdown

  # Build release images
  build-release:
    name: Build Release Images
    runs-on: ubuntu-latest
    needs: [create-release]
    strategy:
      matrix:
        component: [backend, frontend]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.component }}
          tags: |
            type=ref,event=tag
            type=raw,value=latest

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.component }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy release to production
  deploy-release:
    name: Deploy Release
    runs-on: ubuntu-latest
    needs: [create-release, build-release]
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.5.0'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to production
        run: |
          cd infrastructure/terraform/production
          terraform init
          terraform apply -var="image_tag=${{ github.ref_name }}" -auto-approve

      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/presidential-digs-backend -n presidential-digs --timeout=300s

      - name: Run comprehensive tests
        run: |
          ./scripts/smoke-tests.sh production
          ./scripts/performance-tests.sh production
          ./scripts/security-tests.sh production

      - name: Update release notes
        run: |
          ./scripts/update-release-notes.sh ${{ needs.create-release.outputs.release_id }}
```

### **Security & Compliance Workflow**

```yaml
# .github/workflows/security-compliance.yml
name: Security & Compliance

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:
  push:
    branches: [main, develop]

jobs:
  # Security scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/presidential-digs-crm/backend:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run OWASP ZAP scan
        uses: zaproxy/action-full-scan@v0.8.0
        with:
          target: 'https://staging-api.presidentialdigs.com'

  # Dependency scanning
  dependency-scan:
    name: Dependency Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Dependabot alerts check
        uses: actions/github-script@v7
        with:
          script: |
            const { data: alerts } = await github.rest.dependabot.listAlertsForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open'
            });
            
            if (alerts.length > 0) {
              core.setFailed(`Found ${alerts.length} open Dependabot alerts`);
            }

      - name: Run npm audit
        run: |
          cd backend && npm audit --audit-level=moderate
          cd ../frontend && npm audit --audit-level=moderate

  # Compliance check
  compliance-check:
    name: Compliance Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run license compliance check
        run: |
          npx license-checker --summary --onlyAllow "MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause"

      - name: Run GDPR compliance check
        run: |
          ./scripts/gdpr-compliance-check.sh

      - name: Run accessibility check
        run: |
          cd frontend
          npm run test:a11y
```

### **Performance & Load Testing Workflow**

```yaml
# .github/workflows/performance-testing.yml
name: Performance Testing

on:
  workflow_dispatch:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * 0'  # Weekly on Sunday at 4 AM

jobs:
  # Load testing
  load-test:
    name: Load Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Artillery
        run: npm install -g artillery

      - name: Run load tests
        run: |
          artillery run infrastructure/testing/load-tests.yml

      - name: Upload load test results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: artillery-report.json
          retention-days: 30

  # Performance monitoring
  performance-monitoring:
    name: Performance Monitoring
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend && npm ci

      - name: Run performance tests
        run: |
          cd backend && npm run test:performance

      - name: Generate performance report
        run: |
          ./scripts/generate-performance-report.sh

      - name: Upload performance report
        uses: actions/upload-artifact@v4
        with:
          name: performance-report
          path: performance-report.json
          retention-days: 30

      - name: Send performance alert
        if: failure()
        run: |
          ./scripts/send-performance-alert.sh
```

### **Database Migration Workflow**

```yaml
# .github/workflows/database-migration.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to migrate'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production
      migration_type:
        description: 'Migration type'
        required: true
        default: 'up'
        type: choice
        options:
        - up
        - down
        - status

jobs:
  # Database migration
  migrate:
    name: Database Migration
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend && npm ci

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Run database migration
        run: |
          cd backend
          npm run migrate:${{ github.event.inputs.migration_type }} -- --env ${{ github.event.inputs.environment }}

      - name: Verify migration
        run: |
          cd backend
          npm run migrate:status -- --env ${{ github.event.inputs.environment }}

      - name: Run database tests
        run: |
          cd backend
          npm run test:database -- --env ${{ github.event.inputs.environment }}

      - name: Notify migration completion
        run: |
          ./scripts/notify-migration.sh ${{ github.event.inputs.environment }} ${{ github.event.inputs.migration_type }}
```

---

## 📋 **GitHub Actions CI/CD Features Checklist**

### **🔄 Core CI/CD Features**
- [x] Multi-stage pipeline with parallel jobs
- [x] Matrix testing across Node.js versions
- [x] Automated testing (unit, integration, E2E)
- [x] Security scanning and vulnerability assessment
- [x] Code quality checks (linting, formatting)
- [x] Docker image building and pushing
- [x] Terraform infrastructure deployment

### **🚀 Advanced Features**
- [x] Feature branch workflows
- [x] Release management with changelog generation
- [x] Manual deployment triggers
- [x] Environment-specific deployments
- [x] Post-deployment verification
- [x] Performance testing and monitoring
- [x] Database migration automation

### **🔒 Security & Compliance**
- [x] Automated security scanning (Trivy, Snyk)
- [x] Dependency vulnerability checks
- [x] OWASP ZAP security testing
- [x] GDPR compliance checks
- [x] License compliance verification
- [x] Accessibility testing

### **📊 Monitoring & Reporting**
- [x] Coverage reporting with Codecov
- [x] Performance test results
- [x] Load testing with Artillery
- [x] Deployment reports
- [x] Notification systems
- [x] Artifact retention

### **🔄 Workflow Features**
- [x] Conditional job execution
- [x] Manual approval gates
- [x] Environment protection rules
- [x] Workflow reusability
- [x] Error handling and retries
- [x] Parallel job execution

### **Environment Configuration**

```bash
# .env.example
# Application
NODE_ENV=production
PORT=3002
API_PREFIX=api

# Database
MONGODB_URI=mongodb://localhost:27017/presidential-digs-crm
MONGODB_URI_PROD=mongodb://mongodb:27017/presidential-digs-crm

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_CLUSTER_ENABLED=false

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=your-master-key-here

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Storage
AWS_S3_BUCKET=presidential-digs-crm
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_PORT=9090

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 🧪 Testing Strategy

### **Test Structure**

```typescript
// test/unit/leads/leads.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeadsService } from '../../../src/modules/leads/leads.service';
import { Lead } from '../../../src/modules/leads/lead.schema';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockLeadModel: any;

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getModelToken(Lead.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    mockLeadModel = module.get(getModelToken(Lead.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of leads', async () => {
      const mockLeads = [
        { id: '1', propertyAddress: '123 Main St' },
        { id: '2', propertyAddress: '456 Oak Ave' },
      ];

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeads),
      });

      const result = await service.findAll({}, 'tenant123');
      expect(result).toEqual(mockLeads);
      expect(mockLeadModel.find).toHaveBeenCalledWith({ tenant_id: 'tenant123' });
    });
  });
});
```

### **Integration Testing**

```typescript
// test/integration/leads/leads.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('LeadsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/leads (GET)', () => {
    return request(app.getHttpServer())
      .get('/leads')
      .expect(401); // Should require authentication
  });

  it('/leads (POST)', () => {
    return request(app.getHttpServer())
      .post('/leads')
      .send({
        propertyAddress: '123 Main St',
        ownerName: 'John Doe',
        propertyDetails: {
          type: 'single_family',
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          condition: 'good'
        },
        financialDetails: {
          estimatedValue: 200000,
          askingPrice: 180000,
          arv: 250000,
          repairCosts: 20000
        }
      })
      .expect(401); // Should require authentication
  });
});
```

---

## 📊 API Documentation

### **Swagger Configuration**

```typescript
// src/config/swagger.config.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Presidential Digs CRM API')
    .setDescription('API documentation for Presidential Digs CRM')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Leads', 'Lead management endpoints')
    .addTag('Buyers', 'Buyer management endpoints')
    .addTag('Communications', 'Communication endpoints')
    .addTag('AI', 'AI-powered features')
    .addTag('Analytics', 'Analytics and reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
```

---

## 🔄 Background Jobs & Queues

### **Bull Queue Configuration**

```typescript
// src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {}

  async sendEmailNotification(data: any) {
    await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendSMSNotification(data: any) {
    await this.smsQueue.add('send-sms', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
```

---

## 🔗 External Integrations

### **Twilio Integration**

```typescript
// src/modules/integrations/twilio.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendSMS(to: string, message: string) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: to,
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async makeCall(to: string, twimlUrl: string) {
    try {
      const result = await this.client.calls.create({
        url: twimlUrl,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: to,
      });

      return {
        success: true,
        callId: result.sid,
        status: result.status,
      };
    } catch (error) {
      throw new Error(`Failed to make call: ${error.message}`);
    }
  }
}
```

---

## 📈 Future Considerations

### **Microservices Migration Path**

1. **Service Decomposition**
   - Split modules into independent services
   - Implement service-to-service communication
   - Add API gateway for service orchestration

2. **Event-Driven Architecture**
   - Implement event sourcing
   - Add message brokers (RabbitMQ, Apache Kafka)
   - Create event-driven workflows

3. **Database Sharding**
   - Implement horizontal partitioning
   - Add read replicas for performance
   - Implement database per tenant strategy

4. **Container Orchestration**
   - Kubernetes deployment
   - Service mesh implementation
   - Auto-scaling configuration

5. **Advanced Monitoring**
   - Distributed tracing (Jaeger, Zipkin)
   - APM integration (New Relic, DataDog)
   - Custom metrics and dashboards

---

## ✅ **Security Architecture Checklist**

### **🔐 Authentication & Authorization**
- [x] Multi-strategy authentication (JWT, OAuth, Local)
- [x] Role-based access control (RBAC)
- [x] Permission-based authorization
- [x] Multi-tenant isolation
- [x] Session management
- [x] Token refresh mechanism

### **🛡️ Data Protection**
- [x] Encryption at rest and in transit
- [x] Secure password hashing (PBKDF2)
- [x] Data sanitization and validation
- [x] Input/output filtering
- [x] AES-256-GCM encryption

### **🚨 API Security**
- [x] Rate limiting with Redis
- [x] CORS configuration
- [x] Request validation
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection

### **📊 Audit & Compliance**
- [x] Security event logging
- [x] Complete audit trail
- [x] GDPR compliance ready
- [x] Data retention policies
- [x] Security monitoring

### **🔒 Multi-Tenant Security**
- [x] Tenant isolation middleware
- [x] Tenant validation guards
- [x] Subscription status checking
- [x] Cross-tenant access prevention
- [x] Tenant-specific rate limiting

---

## ✅ **Benefits of Open Source Stack**

### **🎯 Meilisearch Advantages:**
- **Lightning Fast**: Sub-50ms search results
- **Simple Setup**: Easy configuration and deployment
- **Typo Tolerance**: Built-in fuzzy search
- **Real-time Updates**: Instant indexing
- **Small Footprint**: Low resource usage
- **No Dependencies**: Self-contained binary
- **Open Source**: No licensing fees, full control

### **🗄️ Redis Advantages:**
- **Proven Technology**: Battle-tested in production
- **Rich Data Types**: Strings, hashes, lists, sets, sorted sets
- **Persistence**: RDB and AOF persistence options
- **Clustering**: Horizontal scaling support
- **Pub/Sub**: Real-time messaging capabilities
- **Lua Scripting**: Custom operations support
- **Open Source**: No licensing fees, community support

### **💰 Cost Benefits:**
- **No Licensing Fees**: Completely free to use
- **Self-hosted**: Full control over infrastructure
- **Community Support**: Active open source communities
- **Customization**: Modify source code as needed
- **Vendor Lock-in**: No proprietary dependencies
- **Scalability**: Scale without vendor limitations

### **🔧 Technical Benefits:**
- **Performance**: Optimized for specific use cases
- **Reliability**: Proven in production environments
- **Flexibility**: Custom configurations and extensions
- **Security**: Full control over security measures
- **Monitoring**: Comprehensive observability
- **Integration**: Easy integration with existing systems

---

*This document serves as the comprehensive backend architecture specification for the Presidential Digs CRM project. It should be updated as the project evolves and new requirements are identified.* 