import { registerAs } from '@nestjs/config';

export interface TestModeConfig {
  enabled: boolean;
  defaultRole: string;
  testUsers: {
    admin: TestUser;
    acquisitions: TestUser;
    dispositions: TestUser;
  };
}

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId?: string;
}

export default registerAs('testMode', (): TestModeConfig => ({
  enabled: process.env.TEST_MODE === 'true',
  defaultRole: process.env.TEST_DEFAULT_ROLE || 'admin',
  testUsers: {
    admin: {
      id: 'test-admin-001',
      email: 'admin@test.dealcycle.com',
      firstName: 'Test',
      lastName: 'Admin',
      roles: ['admin'],
      tenantId: 'test-tenant-001',
    },
    acquisitions: {
      id: 'test-acquisitions-001',
      email: 'acquisitions@test.dealcycle.com',
      firstName: 'Test',
      lastName: 'Acquisitions',
      roles: ['acquisitions'],
      tenantId: 'test-tenant-001',
    },
    dispositions: {
      id: 'test-dispositions-001',
      email: 'dispositions@test.dealcycle.com',
      firstName: 'Test',
      lastName: 'Dispositions',
      roles: ['dispositions'],
      tenantId: 'test-tenant-001',
    },
  },
})); 