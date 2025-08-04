import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { RbacModule } from './rbac.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { Role, RoleDocument } from './schemas/role.schema';
import { UserRole, UserRoleDocument } from './schemas/user-role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RbacService } from './rbac.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { PERMISSIONS, ROLES } from '../../common/constants/permissions';

describe('RBAC Integration Tests', () => {
  let app: INestApplication;
  let mongoMemoryServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let roleModel: Model<RoleDocument>;
  let userRoleModel: Model<UserRoleDocument>;
  let userModel: Model<UserDocument>;
  let rbacService: RbacService;
  let usersService: UsersService;
  let authService: AuthService;
  let jwtService: JwtService;

  // Test data
  let superAdminUser: User;
  let tenantAdminUser: User;
  let managerUser: User;
  let agentUser: User;
  let viewerUser: User;
  let customRole: Role;
  let superAdminToken: string;
  let tenantAdminToken: string;
  let managerToken: string;
  let agentToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    mongoConnection = await connect(mongoUri);

    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RbacModule,
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get model instances
    roleModel = moduleFixture.get<Model<RoleDocument>>(getModelToken(Role.name));
    userRoleModel = moduleFixture.get<Model<UserRoleDocument>>(getModelToken(UserRole.name));
    userModel = moduleFixture.get<Model<UserDocument>>(getModelToken(User.name));

    // Get service instances
    rbacService = moduleFixture.get<RbacService>(RbacService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Initialize system roles
    await rbacService.initializeSystemRoles();
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
    await mongoMemoryServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await roleModel.deleteMany({});
    await userRoleModel.deleteMany({});
    await userModel.deleteMany({});

    // Re-initialize system roles
    await rbacService.initializeSystemRoles();

    // Create test users
    await createTestUsers();
    await createTestTokens();
  });

  describe('RBAC System Initialization', () => {
    it('should initialize system roles correctly', async () => {
      const systemRoles = await roleModel.find({ type: 'system' }).exec();
      
      expect(systemRoles).toHaveLength(5);
      expect(systemRoles.map(r => r.name)).toEqual([
        ROLES.SUPER_ADMIN,
        ROLES.TENANT_ADMIN,
        ROLES.MANAGER,
        ROLES.AGENT,
        ROLES.VIEWER,
      ]);

      // Verify SUPER_ADMIN has all permissions
      const superAdminRole = systemRoles.find(r => r.name === ROLES.SUPER_ADMIN);
      expect(superAdminRole.permissions).toContain(PERMISSIONS.LEADS_CREATE);
      expect(superAdminRole.permissions).toContain(PERMISSIONS.USERS_CREATE);
      expect(superAdminRole.permissions).toContain(PERMISSIONS.SYSTEM_SETTINGS);
    });

    it('should not duplicate system roles on multiple initializations', async () => {
      await rbacService.initializeSystemRoles();
      await rbacService.initializeSystemRoles();

      const systemRoles = await roleModel.find({ type: 'system' }).exec();
      expect(systemRoles).toHaveLength(5);
    });
  });

  describe('Role Management API', () => {
    it('should create custom role via API', async () => {
      const createRoleDto = {
        name: 'SALES_MANAGER',
        displayName: 'Sales Manager',
        description: 'Manages sales team and leads',
        permissions: [PERMISSIONS.LEADS_CREATE, PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE],
      };

      const response = await request(app.getHttpServer())
        .post('/rbac/roles')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(createRoleDto)
        .expect(201);

      expect(response.body.name).toBe('SALES_MANAGER');
      expect(response.body.permissions).toContain(PERMISSIONS.LEADS_CREATE);
      expect(response.body.type).toBe('custom');
    });

    it('should reject role creation without admin permissions', async () => {
      const createRoleDto = {
        name: 'UNAUTHORIZED_ROLE',
        displayName: 'Unauthorized Role',
        permissions: [PERMISSIONS.LEADS_READ],
      };

      await request(app.getHttpServer())
        .post('/rbac/roles')
        .set('Authorization', `Bearer ${agentToken}`)
        .send(createRoleDto)
        .expect(403);
    });

    it('should search and filter roles', async () => {
      // Create a custom role first
      await rbacService.createRole({
        name: 'TEST_ROLE',
        displayName: 'Test Role',
        permissions: [PERMISSIONS.LEADS_READ],
      }, undefined, superAdminUser._id);

      const response = await request(app.getHttpServer())
        .get('/rbac/roles?search=test&type=custom&isActive=true')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.roles).toHaveLength(1);
      expect(response.body.roles[0].name).toBe('TEST_ROLE');
      expect(response.body.total).toBe(1);
    });

    it('should update custom role', async () => {
      // Create a custom role
      const role = await rbacService.createRole({
        name: 'UPDATE_TEST_ROLE',
        displayName: 'Update Test Role',
        permissions: [PERMISSIONS.LEADS_READ],
      }, undefined, superAdminUser._id);

      const updateDto = {
        displayName: 'Updated Role Name',
        permissions: [PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE],
      };

      const response = await request(app.getHttpServer())
        .put(`/rbac/roles/${role._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.displayName).toBe('Updated Role Name');
      expect(response.body.permissions).toContain(PERMISSIONS.LEADS_UPDATE);
    });

    it('should reject updating system roles', async () => {
      const systemRole = await roleModel.findOne({ name: ROLES.SUPER_ADMIN }).exec();

      const updateDto = {
        displayName: 'Modified System Role',
      };

      await request(app.getHttpServer())
        .put(`/rbac/roles/${systemRole._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateDto)
        .expect(400);
    });

    it('should delete custom role', async () => {
      // Create a custom role
      const role = await rbacService.createRole({
        name: 'DELETE_TEST_ROLE',
        displayName: 'Delete Test Role',
        permissions: [PERMISSIONS.LEADS_READ],
      }, undefined, superAdminUser._id);

      await request(app.getHttpServer())
        .delete(`/rbac/roles/${role._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Verify role is deleted
      const deletedRole = await roleModel.findById(role._id).exec();
      expect(deletedRole).toBeNull();
    });

    it('should reject deleting system roles', async () => {
      const systemRole = await roleModel.findOne({ name: ROLES.SUPER_ADMIN }).exec();

      await request(app.getHttpServer())
        .delete(`/rbac/roles/${systemRole._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);
    });
  });

  describe('User-Role Assignment API', () => {
    it('should assign role to user', async () => {
      const role = await roleModel.findOne({ name: ROLES.MANAGER }).exec();

      const assignRoleDto = {
        roleId: role._id.toString(),
        reason: 'Promotion to manager position',
      };

      const response = await request(app.getHttpServer())
        .post(`/rbac/users/${agentUser._id}/roles`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(assignRoleDto)
        .expect(201);

      expect(response.body.userId).toBe(agentUser._id.toString());
      expect(response.body.roleId).toBe(role._id.toString());
      expect(response.body.isActive).toBe(true);
    });

    it('should reject duplicate role assignment', async () => {
      const role = await roleModel.findOne({ name: ROLES.AGENT }).exec();

      const assignRoleDto = {
        roleId: role._id.toString(),
      };

      // First assignment should succeed
      await request(app.getHttpServer())
        .post(`/rbac/users/${agentUser._id}/roles`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(assignRoleDto)
        .expect(201);

      // Second assignment should fail
      await request(app.getHttpServer())
        .post(`/rbac/users/${agentUser._id}/roles`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(assignRoleDto)
        .expect(409);
    });

    it('should revoke role from user', async () => {
      const role = await roleModel.findOne({ name: ROLES.AGENT }).exec();

      // First assign the role
      await rbacService.assignRoleToUser({
        userId: agentUser._id.toString(),
        roleId: role._id.toString(),
      }, undefined, superAdminUser._id);

      // Then revoke it
      const revokeDto = {
        reason: 'Role no longer needed',
      };

      await request(app.getHttpServer())
        .delete(`/rbac/users/${agentUser._id}/roles/${role._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(revokeDto)
        .expect(200);

      // Verify role is revoked
      const userRoles = await rbacService.getUserRoles(agentUser._id.toString());
      const hasRole = userRoles.some(r => r._id.toString() === role._id.toString());
      expect(hasRole).toBe(false);
    });

    it('should get user roles', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rbac/users/${managerUser._id}/roles`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Permission Checking API', () => {
    it('should get user permissions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rbac/users/${superAdminUser._id}/permissions`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toContain(PERMISSIONS.LEADS_CREATE);
      expect(response.body).toContain(PERMISSIONS.USERS_CREATE);
      expect(response.body).toContain(PERMISSIONS.SYSTEM_SETTINGS);
    });

    it('should check single permission', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rbac/users/${superAdminUser._id}/permissions/check/${PERMISSIONS.LEADS_CREATE}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.hasPermission).toBe(true);
    });

    it('should check multiple permissions (any)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/rbac/users/${managerUser._id}/permissions/check`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          permissions: [PERMISSIONS.LEADS_CREATE, PERMISSIONS.LEADS_READ],
        })
        .expect(200);

      expect(response.body.hasAnyPermission).toBe(true);
    });

    it('should check multiple permissions (all)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/rbac/users/${viewerUser._id}/permissions/check-all`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          permissions: [PERMISSIONS.LEADS_READ, PERMISSIONS.BUYERS_READ],
        })
        .expect(200);

      expect(response.body.hasAllPermissions).toBe(true);
    });

    it('should return false for insufficient permissions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rbac/users/${viewerUser._id}/permissions/check/${PERMISSIONS.LEADS_CREATE}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.hasPermission).toBe(false);
    });
  });

  describe('Integration with User Management', () => {
    it('should update user roles via user management API', async () => {
      const updateRolesDto = {
        roles: [ROLES.MANAGER, ROLES.AGENT],
        reason: 'Role update for testing',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${agentUser._id}/roles`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateRolesDto)
        .expect(200);

      expect(response.body.data.user.roles).toContain(ROLES.MANAGER);
      expect(response.body.data.user.roles).toContain(ROLES.AGENT);
    });

    it('should search users by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?role=AGENT')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.users[0].roles).toContain('AGENT');
    });
  });

  describe('Permission Inheritance', () => {
    it('should inherit permissions from parent roles', async () => {
      // Create a custom role that inherits from AGENT
      const customRole = await rbacService.createRole({
        name: 'SENIOR_AGENT',
        displayName: 'Senior Agent',
        description: 'Senior agent with additional permissions',
        permissions: [PERMISSIONS.LEADS_EXPORT],
        inheritedRoles: [ROLES.AGENT],
      }, undefined, superAdminUser._id);

      // Assign the custom role to a user
      await rbacService.assignRoleToUser({
        userId: agentUser._id.toString(),
        roleId: customRole._id.toString(),
      }, undefined, superAdminUser._id);

      // Check that user has both custom and inherited permissions
      const permissions = await rbacService.getUserPermissions(agentUser._id.toString());
      
      // Should have AGENT permissions
      expect(permissions).toContain(PERMISSIONS.LEADS_READ);
      expect(permissions).toContain(PERMISSIONS.LEADS_UPDATE);
      
      // Should have custom permissions
      expect(permissions).toContain(PERMISSIONS.LEADS_EXPORT);
    });
  });

  describe('Tenant Isolation', () => {
    it('should isolate roles by tenant', async () => {
      const tenant1Id = new Types.ObjectId();
      const tenant2Id = new Types.ObjectId();

      // Create roles for different tenants
      const role1 = await rbacService.createRole({
        name: 'TENANT1_ROLE',
        displayName: 'Tenant 1 Role',
        permissions: [PERMISSIONS.LEADS_READ],
      }, tenant1Id, superAdminUser._id);

      const role2 = await rbacService.createRole({
        name: 'TENANT2_ROLE',
        displayName: 'Tenant 2 Role',
        permissions: [PERMISSIONS.LEADS_UPDATE],
      }, tenant2Id, superAdminUser._id);

      // Verify roles are isolated
      const tenant1Roles = await rbacService.searchRoles({}, tenant1Id);
      const tenant2Roles = await rbacService.searchRoles({}, tenant2Id);

      expect(tenant1Roles.roles).toHaveLength(1);
      expect(tenant1Roles.roles[0].name).toBe('TENANT1_ROLE');
      expect(tenant2Roles.roles).toHaveLength(1);
      expect(tenant2Roles.roles[0].name).toBe('TENANT2_ROLE');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid role ID', async () => {
      const invalidRoleId = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .get(`/rbac/roles/${invalidRoleId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });

    it('should handle invalid user ID', async () => {
      const invalidUserId = new Types.ObjectId().toString();
      const role = await roleModel.findOne({ name: ROLES.AGENT }).exec();

      await request(app.getHttpServer())
        .get(`/rbac/users/${invalidUserId}/roles`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(404);
    });

    it('should handle invalid permissions', async () => {
      const createRoleDto = {
        name: 'INVALID_PERM_ROLE',
        displayName: 'Invalid Permission Role',
        permissions: ['invalid:permission'],
      };

      await request(app.getHttpServer())
        .post('/rbac/roles')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(createRoleDto)
        .expect(400);
    });
  });

  // Helper functions
  async function createTestUsers() {
    // Create test users with different roles
    superAdminUser = await usersService.createUser({
      email: 'superadmin@test.com',
      firstName: 'Super',
      lastName: 'Admin',
      roles: [ROLES.SUPER_ADMIN],
    });

    tenantAdminUser = await usersService.createUser({
      email: 'tenantadmin@test.com',
      firstName: 'Tenant',
      lastName: 'Admin',
      roles: [ROLES.TENANT_ADMIN],
    });

    managerUser = await usersService.createUser({
      email: 'manager@test.com',
      firstName: 'Manager',
      lastName: 'User',
      roles: [ROLES.MANAGER],
    });

    agentUser = await usersService.createUser({
      email: 'agent@test.com',
      firstName: 'Agent',
      lastName: 'User',
      roles: [ROLES.AGENT],
    });

    viewerUser = await usersService.createUser({
      email: 'viewer@test.com',
      firstName: 'Viewer',
      lastName: 'User',
      roles: [ROLES.VIEWER],
    });
  }

  async function createTestTokens() {
    // Create JWT tokens for each user
    superAdminToken = jwtService.sign({
      sub: superAdminUser._id.toString(),
      email: superAdminUser.email,
      roles: superAdminUser.roles,
    });

    tenantAdminToken = jwtService.sign({
      sub: tenantAdminUser._id.toString(),
      email: tenantAdminUser.email,
      roles: tenantAdminUser.roles,
    });

    managerToken = jwtService.sign({
      sub: managerUser._id.toString(),
      email: managerUser.email,
      roles: managerUser.roles,
    });

    agentToken = jwtService.sign({
      sub: agentUser._id.toString(),
      email: agentUser.email,
      roles: agentUser.roles,
    });

    viewerToken = jwtService.sign({
      sub: viewerUser._id.toString(),
      email: viewerUser.email,
      roles: viewerUser.roles,
    });
  }
}); 