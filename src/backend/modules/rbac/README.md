# RBAC (Role-Based Access Control) Module

## Overview

The RBAC module provides a comprehensive role-based access control system for the DealCycle CRM platform. It supports custom roles, permission management, user-role assignments, and dynamic permission checking.

## Features

- **Custom Role Management**: Create, update, and delete custom roles
- **System Roles**: Pre-defined system roles (SUPER_ADMIN, TENANT_ADMIN, MANAGER, AGENT, VIEWER)
- **Permission System**: Granular permissions for all system features
- **User-Role Assignments**: Assign multiple roles to users with expiration dates
- **Dynamic Permission Checking**: Real-time permission validation
- **Role Inheritance**: Support for role inheritance and permission aggregation
- **Multi-Tenant Support**: Tenant-scoped roles and permissions
- **Audit Logging**: Track role changes and assignments

## Architecture

### Core Components

1. **Role Schema**: Defines role structure with permissions and inheritance
2. **UserRole Schema**: Manages user-role assignments with metadata
3. **RBAC Service**: Core business logic for role and permission management
4. **RBAC Controller**: REST API endpoints for role management
5. **Roles Guard**: Authentication guard for permission checking
6. **Permission Decorators**: Decorators for protecting endpoints

### Data Models

#### Role Schema
```typescript
{
  name: string;              // Unique role name
  displayName: string;       // Human-readable name
  description?: string;      // Role description
  type: RoleType;           // 'system' or 'custom'
  tenantId?: ObjectId;      // Tenant scope (optional)
  permissions: string[];    // Array of permission strings
  inheritedRoles: string[]; // Inherited role names
  isActive: boolean;        // Role status
  metadata?: object;        // Additional data
  createdBy?: ObjectId;     // Creator reference
  updatedBy?: ObjectId;     // Last updater reference
}
```

#### UserRole Schema
```typescript
{
  userId: ObjectId;         // User reference
  roleId: ObjectId;         // Role reference
  tenantId?: ObjectId;      // Tenant scope
  isActive: boolean;        // Assignment status
  assignedAt: Date;         // Assignment timestamp
  expiresAt?: Date;         // Expiration date (optional)
  assignedBy?: ObjectId;    // Assigner reference
  revokedBy?: ObjectId;     // Revoker reference
  revokedAt?: Date;         // Revocation timestamp
  reason?: string;          // Assignment/revocation reason
  metadata?: object;        // Additional data
}
```

## Permissions

### Available Permissions

The system defines granular permissions for all major features:

#### Lead Management
- `leads:create` - Create new leads
- `leads:read` - View leads
- `leads:update` - Update lead information
- `leads:delete` - Delete leads
- `leads:assign` - Assign leads to users
- `leads:export` - Export lead data

#### Buyer Management
- `buyers:create` - Create new buyers
- `buyers:read` - View buyers
- `buyers:update` - Update buyer information
- `buyers:delete` - Delete buyers
- `buyers:assign` - Assign buyers to users

#### User Management
- `users:create` - Create new users
- `users:read` - View users
- `users:update` - Update user information
- `users:delete` - Delete users
- `users:assign_roles` - Assign roles to users

#### Analytics & Reports
- `analytics:read` - View analytics
- `reports:generate` - Generate reports
- `reports:export` - Export reports

#### System Administration
- `system:settings` - Manage system settings
- `system:integrations` - Manage integrations
- `system:backup` - Access backup features

#### Communication
- `communications:send` - Send communications
- `communications:read` - View communications
- `communications:delete` - Delete communications

#### Automation
- `automation:create` - Create automation rules
- `automation:read` - View automation rules
- `automation:update` - Update automation rules
- `automation:delete` - Delete automation rules
- `automation:execute` - Execute automation rules

#### Tenant Management
- `tenant:read` - View tenant information
- `tenant:update` - Update tenant settings
- `tenant:delete` - Delete tenants

### System Roles

#### SUPER_ADMIN
- **Description**: Full system access with all permissions
- **Permissions**: All permissions in the system
- **Scope**: Global (no tenant restriction)

#### TENANT_ADMIN
- **Description**: Tenant-level administrator with full tenant access
- **Permissions**: All tenant-scoped permissions plus user management
- **Scope**: Tenant-specific

#### MANAGER
- **Description**: Team manager with lead and user management capabilities
- **Permissions**: Lead management, buyer management, user viewing, analytics, reports, communications
- **Scope**: Tenant-specific

#### AGENT
- **Description**: Standard agent with lead and buyer access
- **Permissions**: Lead viewing/updating, buyer viewing/updating, communications
- **Scope**: Tenant-specific

#### VIEWER
- **Description**: Read-only access to leads and analytics
- **Permissions**: Lead viewing, buyer viewing, analytics viewing
- **Scope**: Tenant-specific

## API Endpoints

### Role Management

#### Create Role
```http
POST /rbac/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "CUSTOM_ROLE",
  "displayName": "Custom Role",
  "description": "A custom role for specific tasks",
  "permissions": ["leads:read", "leads:update"],
  "inheritedRoles": ["AGENT"]
}
```

#### Get Roles
```http
GET /rbac/roles?page=1&limit=10&search=manager&type=custom&isActive=true
Authorization: Bearer <token>
```

#### Update Role
```http
PUT /rbac/roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Updated Role Name",
  "permissions": ["leads:read", "leads:update", "leads:delete"]
}
```

#### Delete Role
```http
DELETE /rbac/roles/:id
Authorization: Bearer <token>
```

### User-Role Management

#### Assign Role to User
```http
POST /rbac/users/:userId/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleId": "role_id_here",
  "expiresAt": "2024-12-31T23:59:59Z",
  "reason": "Temporary assignment for project"
}
```

#### Revoke Role from User
```http
DELETE /rbac/users/:userId/roles/:roleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Project completed"
}
```

#### Get User Roles
```http
GET /rbac/users/:userId/roles
Authorization: Bearer <token>
```

#### Get User Permissions
```http
GET /rbac/users/:userId/permissions
Authorization: Bearer <token>
```

### Permission Checking

#### Check Single Permission
```http
GET /rbac/users/:userId/permissions/check/leads:create
Authorization: Bearer <token>
```

#### Check Multiple Permissions (Any)
```http
POST /rbac/users/:userId/permissions/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": ["leads:create", "leads:update"]
}
```

#### Check Multiple Permissions (All)
```http
POST /rbac/users/:userId/permissions/check-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": ["leads:read", "leads:update"]
}
```

## Usage Examples

### Protecting Endpoints

#### Using Role Decorators
```typescript
import { RequireAdmin, RequireLeadAccess, RequireUserWrite } from '../../common/decorators/roles.decorator';

@Controller('leads')
export class LeadsController {
  @Get()
  @RequireLeadAccess()
  async getLeads() {
    // Only users with leads:read permission can access
  }

  @Post()
  @RequireUserWrite()
  async createLead() {
    // Only users with users:write permission can access
  }

  @Delete(':id')
  @RequireAdmin()
  async deleteLead() {
    // Only admin users can access
  }
}
```

#### Using Permission Decorators
```typescript
import { RequirePermissions } from '../../common/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  @Get()
  @RequirePermissions('reports:generate', 'reports:export')
  async generateReport() {
    // User must have both permissions
  }
}
```

### Service Usage

#### Creating Custom Roles
```typescript
import { RbacService } from './rbac.service';

@Injectable()
export class SomeService {
  constructor(private rbacService: RbacService) {}

  async createCustomRole() {
    const role = await this.rbacService.createRole({
      name: 'SALES_MANAGER',
      displayName: 'Sales Manager',
      description: 'Manages sales team and leads',
      permissions: [
        'leads:create',
        'leads:read',
        'leads:update',
        'leads:assign',
        'buyers:read',
        'buyers:update',
        'analytics:read',
        'reports:generate'
      ]
    });
  }
}
```

#### Checking Permissions
```typescript
async checkUserAccess(userId: string, permission: string) {
  const hasPermission = await this.rbacService.hasPermission(userId, permission);
  
  if (!hasPermission) {
    throw new ForbiddenException('Insufficient permissions');
  }
}
```

#### Getting User Permissions
```typescript
async getUserCapabilities(userId: string) {
  const permissions = await this.rbacService.getUserPermissions(userId);
  
  return {
    canCreateLeads: permissions.includes('leads:create'),
    canDeleteLeads: permissions.includes('leads:delete'),
    canManageUsers: permissions.includes('users:assign_roles'),
    // ... other capabilities
  };
}
```

## Security Considerations

### Best Practices

1. **Principle of Least Privilege**: Always assign the minimum permissions necessary
2. **Regular Audits**: Review role assignments and permissions regularly
3. **Role Expiration**: Use expiration dates for temporary role assignments
4. **Permission Validation**: Always validate permissions on both client and server
5. **Audit Logging**: Log all role changes and permission checks

### Security Features

- **Tenant Isolation**: Roles and permissions are scoped to tenants
- **System Role Protection**: System roles cannot be modified or deleted
- **Assignment Validation**: Prevents duplicate role assignments
- **Permission Validation**: Validates all permissions against allowed list
- **Inheritance Validation**: Ensures inherited roles exist and are valid

## Testing

### Unit Tests
```bash
npm run test src/backend/modules/rbac/rbac.service.spec.ts
```

### Integration Tests
```bash
npm run test:e2e rbac
```

## Migration Guide

### From Single Role to Multiple Roles

If migrating from a single role system:

1. **Update User Schema**: Change `role` field to `roles` array
2. **Migrate Existing Data**: Convert single roles to arrays
3. **Update Controllers**: Use new role assignment endpoints
4. **Update Guards**: Ensure guards work with role arrays
5. **Test Permissions**: Verify all permission checks work correctly

### Example Migration Script
```typescript
// Migrate existing single roles to role arrays
const users = await UserModel.find({});
for (const user of users) {
  if (user.role && !user.roles) {
    user.roles = [user.role];
    await user.save();
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if user has required roles and permissions
2. **Role Not Found**: Verify role exists and is active
3. **Tenant Mismatch**: Ensure roles are assigned within correct tenant
4. **Expired Assignment**: Check if role assignment has expired

### Debug Commands

```typescript
// Check user's current roles
const roles = await rbacService.getUserRoles(userId);

// Check user's effective permissions
const permissions = await rbacService.getUserPermissions(userId);

// Validate specific permission
const hasPermission = await rbacService.hasPermission(userId, 'leads:create');
```

## Performance Considerations

1. **Permission Caching**: Consider caching user permissions for frequently accessed data
2. **Role Indexing**: Ensure proper database indexes on role queries
3. **Batch Operations**: Use batch operations for multiple role assignments
4. **Lazy Loading**: Load permissions only when needed

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission creation
2. **Permission Groups**: Group related permissions
3. **Conditional Permissions**: Context-based permission rules
4. **Advanced Inheritance**: Complex role inheritance hierarchies
5. **Permission Analytics**: Track permission usage and effectiveness 