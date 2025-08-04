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
import { PERMISSIONS, ROLES } from '../../common/constants/permissions';

describe('RBAC Performance Tests', () => {
  let app: INestApplication;
  let mongoMemoryServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let roleModel: Model<RoleDocument>;
  let userRoleModel: Model<UserRoleDocument>;
  let userModel: Model<UserDocument>;
  let rbacService: RbacService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Test data
  let adminUser: User;
  let adminToken: string;
  let testUsers: User[] = [];
  let testRoles: Role[] = [];

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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Initialize system roles
    await rbacService.initializeSystemRoles();

    // Create admin user
    adminUser = await usersService.createUser({
      email: 'admin@performance.test',
      firstName: 'Admin',
      lastName: 'User',
      roles: [ROLES.SUPER_ADMIN],
    });

    adminToken = jwtService.sign({
      sub: adminUser._id.toString(),
      email: adminUser.email,
      roles: adminUser.roles,
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoConnection.close();
    await mongoMemoryServer.stop();
  });

  beforeEach(async () => {
    // Clear test data
    await userRoleModel.deleteMany({});
    await userModel.deleteMany({ _id: { $ne: adminUser._id } });
    await roleModel.deleteMany({ type: 'custom' });

    // Create test data
    await createTestData();
  });

  describe('Role Management Performance', () => {
    it('should handle bulk role creation efficiently', async () => {
      const startTime = Date.now();
      const roleCount = 100;

      const createPromises = [];
      for (let i = 0; i < roleCount; i++) {
        const roleData = {
          name: `PERF_ROLE_${i}`,
          displayName: `Performance Role ${i}`,
          description: `Role for performance testing ${i}`,
          permissions: [PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE],
        };

        createPromises.push(
          request(app.getHttpServer())
            .post('/rbac/roles')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(roleData)
        );
      }

      const responses = await Promise.all(createPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all roles were created successfully
      expect(responses.every(r => r.status === 201)).toBe(true);
      expect(responses).toHaveLength(roleCount);

      // Performance assertion: should complete within 10 seconds
      expect(duration).toBeLessThan(10000);

      console.log(`Bulk role creation (${roleCount} roles): ${duration}ms`);
    });

    it('should handle concurrent role searches efficiently', async () => {
      // Create test roles first
      const roleCount = 50;
      for (let i = 0; i < roleCount; i++) {
        await rbacService.createRole({
          name: `SEARCH_ROLE_${i}`,
          displayName: `Search Role ${i}`,
          permissions: [PERMISSIONS.LEADS_READ],
        }, undefined, adminUser._id);
      }

      const startTime = Date.now();
      const searchCount = 100;

      const searchPromises = [];
      for (let i = 0; i < searchCount; i++) {
        searchPromises.push(
          request(app.getHttpServer())
            .get('/rbac/roles?page=1&limit=10&search=search')
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }

      const responses = await Promise.all(searchPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all searches were successful
      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(responses).toHaveLength(searchCount);

      // Performance assertion: should complete within 5 seconds
      expect(duration).toBeLessThan(5000);

      console.log(`Concurrent role searches (${searchCount} requests): ${duration}ms`);
    });
  });

  describe('User-Role Assignment Performance', () => {
    it('should handle bulk role assignments efficiently', async () => {
      const userCount = 50;
      const roleCount = 10;

      // Create test users and roles
      const users = await createBulkUsers(userCount);
      const roles = await createBulkRoles(roleCount);

      const startTime = Date.now();
      const assignmentCount = userCount * roleCount;

      const assignmentPromises = [];
      for (let i = 0; i < userCount; i++) {
        for (let j = 0; j < roleCount; j++) {
          assignmentPromises.push(
            request(app.getHttpServer())
              .post(`/rbac/users/${users[i]._id}/roles`)
              .set('Authorization', `Bearer ${adminToken}`)
              .send({
                roleId: roles[j]._id.toString(),
                reason: `Performance test assignment ${i}-${j}`,
              })
          );
        }
      }

      const responses = await Promise.all(assignmentPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all assignments were successful
      expect(responses.every(r => r.status === 201)).toBe(true);
      expect(responses).toHaveLength(assignmentCount);

      // Performance assertion: should complete within 15 seconds
      expect(duration).toBeLessThan(15000);

      console.log(`Bulk role assignments (${assignmentCount} assignments): ${duration}ms`);
    });

    it('should handle concurrent permission checks efficiently', async () => {
      // Create test users with roles
      const userCount = 100;
      const users = await createBulkUsers(userCount);
      const role = await roleModel.findOne({ name: ROLES.AGENT }).exec();

      // Assign roles to users
      for (const user of users) {
        await rbacService.assignRoleToUser({
          userId: user._id.toString(),
          roleId: role._id.toString(),
        }, undefined, adminUser._id);
      }

      const startTime = Date.now();
      const checkCount = 200;

      const checkPromises = [];
      for (let i = 0; i < checkCount; i++) {
        const userIndex = i % userCount;
        checkPromises.push(
          request(app.getHttpServer())
            .get(`/rbac/users/${users[userIndex]._id}/permissions/check/${PERMISSIONS.LEADS_READ}`)
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }

      const responses = await Promise.all(checkPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all checks were successful
      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(responses).toHaveLength(checkCount);

      // Performance assertion: should complete within 10 seconds
      expect(duration).toBeLessThan(10000);

      console.log(`Concurrent permission checks (${checkCount} checks): ${duration}ms`);
    });
  });

  describe('Permission Resolution Performance', () => {
    it('should handle complex permission inheritance efficiently', async () => {
      // Create a complex role hierarchy
      const baseRole = await rbacService.createRole({
        name: 'BASE_ROLE',
        displayName: 'Base Role',
        permissions: [PERMISSIONS.LEADS_READ],
      }, undefined, adminUser._id);

      const intermediateRole = await rbacService.createRole({
        name: 'INTERMEDIATE_ROLE',
        displayName: 'Intermediate Role',
        permissions: [PERMISSIONS.LEADS_UPDATE],
        inheritedRoles: ['BASE_ROLE'],
      }, undefined, adminUser._id);

      const complexRole = await rbacService.createRole({
        name: 'COMPLEX_ROLE',
        displayName: 'Complex Role',
        permissions: [PERMISSIONS.LEADS_EXPORT],
        inheritedRoles: ['INTERMEDIATE_ROLE'],
      }, undefined, adminUser._id);

      // Create test users
      const userCount = 50;
      const users = await createBulkUsers(userCount);

      // Assign complex role to all users
      for (const user of users) {
        await rbacService.assignRoleToUser({
          userId: user._id.toString(),
          roleId: complexRole._id.toString(),
        }, undefined, adminUser._id);
      }

      const startTime = Date.now();
      const resolutionCount = 100;

      const resolutionPromises = [];
      for (let i = 0; i < resolutionCount; i++) {
        const userIndex = i % userCount;
        resolutionPromises.push(
          rbacService.getUserPermissions(users[userIndex]._id.toString())
        );
      }

      const results = await Promise.all(resolutionPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all resolutions were successful
      expect(results.every(permissions => Array.isArray(permissions))).toBe(true);
      expect(results).toHaveLength(resolutionCount);

      // Verify inherited permissions are present
      expect(results[0]).toContain(PERMISSIONS.LEADS_READ);
      expect(results[0]).toContain(PERMISSIONS.LEADS_UPDATE);
      expect(results[0]).toContain(PERMISSIONS.LEADS_EXPORT);

      // Performance assertion: should complete within 5 seconds
      expect(duration).toBeLessThan(5000);

      console.log(`Complex permission resolution (${resolutionCount} resolutions): ${duration}ms`);
    });

    it('should handle multiple role assignments efficiently', async () => {
      // Create multiple roles
      const roleCount = 5;
      const roles = await createBulkRoles(roleCount);

      // Create test users
      const userCount = 20;
      const users = await createBulkUsers(userCount);

      const startTime = Date.now();

      // Assign multiple roles to each user
      for (const user of users) {
        for (const role of roles) {
          await rbacService.assignRoleToUser({
            userId: user._id.toString(),
            roleId: role._id.toString(),
          }, undefined, adminUser._id);
        }
      }

      // Test permission resolution for all users
      const resolutionPromises = [];
      for (const user of users) {
        resolutionPromises.push(
          rbacService.getUserPermissions(user._id.toString())
        );
      }

      const results = await Promise.all(resolutionPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all resolutions were successful
      expect(results.every(permissions => Array.isArray(permissions))).toBe(true);
      expect(results).toHaveLength(userCount);

      // Performance assertion: should complete within 10 seconds
      expect(duration).toBeLessThan(10000);

      console.log(`Multiple role assignments (${userCount} users, ${roleCount} roles each): ${duration}ms`);
    });
  });

  describe('Database Query Performance', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Create large dataset
      const userCount = 1000;
      const roleCount = 50;
      const assignmentCount = 5000;

      console.log('Creating large dataset...');
      const users = await createBulkUsers(userCount);
      const roles = await createBulkRoles(roleCount);

      // Create random assignments
      const assignments = [];
      for (let i = 0; i < assignmentCount; i++) {
        const userIndex = Math.floor(Math.random() * userCount);
        const roleIndex = Math.floor(Math.random() * roleCount);
        
        assignments.push({
          userId: users[userIndex]._id,
          roleId: roles[roleIndex]._id,
          isActive: true,
          assignedAt: new Date(),
        });
      }

      // Bulk insert assignments
      await userRoleModel.insertMany(assignments);

      console.log('Testing query performance...');
      const startTime = Date.now();

      // Test various queries
      const queries = [
        userRoleModel.countDocuments({ isActive: true }),
        userRoleModel.distinct('userId'),
        userRoleModel.distinct('roleId'),
        userRoleModel.aggregate([
          { $group: { _id: '$userId', roleCount: { $sum: 1 } } },
          { $sort: { roleCount: -1 } },
          { $limit: 10 },
        ]),
      ];

      const results = await Promise.all(queries);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify queries were successful
      expect(results[0]).toBe(assignmentCount); // Total active assignments
      expect(results[1].length).toBeLessThanOrEqual(userCount); // Unique users
      expect(results[2].length).toBeLessThanOrEqual(roleCount); // Unique roles
      expect(results[3].length).toBeLessThanOrEqual(10); // Top 10 users by role count

      // Performance assertion: should complete within 3 seconds
      expect(duration).toBeLessThan(3000);

      console.log(`Large dataset queries (${assignmentCount} assignments): ${duration}ms`);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should maintain reasonable memory usage under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create moderate dataset
      const userCount = 100;
      const roleCount = 20;
      const users = await createBulkUsers(userCount);
      const roles = await createBulkRoles(roleCount);

      // Perform operations
      const operations = [];
      for (let i = 0; i < 1000; i++) {
        const userIndex = i % userCount;
        const roleIndex = i % roleCount;
        
        operations.push(
          rbacService.assignRoleToUser({
            userId: users[userIndex]._id.toString(),
            roleId: roles[roleIndex]._id.toString(),
          }, undefined, adminUser._id)
        );
      }

      await Promise.all(operations);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Memory assertion: should not increase by more than 100MB
      expect(memoryIncreaseMB).toBeLessThan(100);

      console.log(`Memory usage increase: ${memoryIncreaseMB.toFixed(2)}MB`);
    });
  });

  // Helper functions
  async function createTestData() {
    // Create test users and roles for performance testing
    testUsers = await createBulkUsers(10);
    testRoles = await createBulkRoles(5);
  }

  async function createBulkUsers(count: number): Promise<User[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await usersService.createUser({
        email: `perfuser${i}@test.com`,
        firstName: `Perf${i}`,
        lastName: 'User',
        roles: [ROLES.AGENT],
      });
      users.push(user);
    }
    return users;
  }

  async function createBulkRoles(count: number): Promise<Role[]> {
    const roles = [];
    for (let i = 0; i < count; i++) {
      const role = await rbacService.createRole({
        name: `PERF_ROLE_${i}`,
        displayName: `Performance Role ${i}`,
        description: `Role for performance testing ${i}`,
        permissions: [PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE],
      }, undefined, adminUser._id);
      roles.push(role);
    }
    return roles;
  }
}); 