import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { RbacModule } from '../modules/rbac/rbac.module';
import { UsersModule } from '../modules/users/users.module';
import { AuthModule } from '../modules/auth/auth.module';

export interface TestApp {
  app: INestApplication;
  mongoMemoryServer: MongoMemoryServer;
  mongoConnection: Connection;
}

export async function createTestApp(): Promise<TestApp> {
  // Start MongoDB Memory Server
  const mongoMemoryServer = await MongoMemoryServer.create();
  const mongoUri = mongoMemoryServer.getUri();
  const mongoConnection = await connect(mongoUri);

  // Create test module
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: mongoUri,
        }),
        inject: [ConfigService],
      }),
      RbacModule,
      UsersModule,
      AuthModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return {
    app,
    mongoMemoryServer,
    mongoConnection,
  };
}

export async function closeTestApp(testApp: TestApp): Promise<void> {
  await testApp.app.close();
  await testApp.mongoConnection.close();
  await testApp.mongoMemoryServer.stop();
}

export async function clearTestDatabase(testApp: TestApp): Promise<void> {
  const collections = testApp.mongoConnection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

// Test utilities
export const TestUtils = {
  /**
   * Create a test user with specified roles
   */
  async createTestUser(usersService: any, userData: {
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    tenantId?: string;
  }) {
    return usersService.createUser({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      roles: userData.roles,
      tenantId: userData.tenantId,
    });
  },

  /**
   * Create a JWT token for testing
   */
  createTestToken(jwtService: any, user: any) {
    return jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    });
  },

  /**
   * Create test roles for integration testing
   */
  async createTestRoles(rbacService: any, createdBy: any) {
    const roles = [
      {
        name: 'TEST_ROLE_1',
        displayName: 'Test Role 1',
        description: 'First test role',
        permissions: ['leads:read', 'leads:update'],
      },
      {
        name: 'TEST_ROLE_2',
        displayName: 'Test Role 2',
        description: 'Second test role',
        permissions: ['buyers:read', 'buyers:update'],
      },
      {
        name: 'TEST_ROLE_3',
        displayName: 'Test Role 3',
        description: 'Third test role with inheritance',
        permissions: ['analytics:read'],
        inheritedRoles: ['TEST_ROLE_1'],
      },
    ];

    const createdRoles = [];
    for (const roleData of roles) {
      const role = await rbacService.createRole(roleData, undefined, createdBy._id);
      createdRoles.push(role);
    }

    return createdRoles;
  },

  /**
   * Generate test data for bulk operations
   */
  generateTestData(count: number, prefix: string = 'test') {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        email: `${prefix}${i}@example.com`,
        firstName: `${prefix}${i}`,
        lastName: 'User',
        roles: ['AGENT'],
      });
    }
    return data;
  },

  /**
   * Wait for async operations to complete
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Create a mock request object for testing
   */
  createMockRequest(user: any, tenantId?: string) {
    return {
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        tenantId: tenantId || user.tenantId,
      },
      headers: {
        'x-tenant-id': tenantId,
      },
    };
  },
}; 