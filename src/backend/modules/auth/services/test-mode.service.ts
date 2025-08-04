import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestModeConfig, TestUser } from '../../../config/test-mode.config';

@Injectable()
export class TestModeService {
  private readonly logger = new Logger(TestModeService.name);
  private readonly testModeConfig: TestModeConfig;

  constructor(private readonly configService: ConfigService) {
    this.testModeConfig = this.configService.get<TestModeConfig>('testMode');
  }

  /**
   * Check if test mode is enabled
   */
  isTestModeEnabled(): boolean {
    return this.testModeConfig?.enabled || false;
  }

  /**
   * Get test user by role
   */
  getTestUser(role: string): TestUser | null {
    if (!this.isTestModeEnabled()) {
      return null;
    }

    const testUsers = this.testModeConfig?.testUsers;
    if (!testUsers) {
      return null;
    }

    switch (role.toLowerCase()) {
      case 'admin':
        return testUsers.admin;
      case 'acquisitions':
        return testUsers.acquisitions;
      case 'dispositions':
        return testUsers.dispositions;
      default:
        return testUsers.admin; // Default to admin
    }
  }

  /**
   * Get default test user
   */
  getDefaultTestUser(): TestUser | null {
    if (!this.isTestModeEnabled()) {
      return null;
    }

    const defaultRole = this.testModeConfig?.defaultRole || 'admin';
    return this.getTestUser(defaultRole);
  }

  /**
   * Get all test users
   */
  getAllTestUsers(): TestUser[] {
    if (!this.isTestModeEnabled()) {
      return [];
    }

    const testUsers = this.testModeConfig?.testUsers;
    if (!testUsers) {
      return [];
    }

    return Object.values(testUsers);
  }

  /**
   * Validate test user credentials
   */
  validateTestUser(email: string, role?: string): TestUser | null {
    if (!this.isTestModeEnabled()) {
      return null;
    }

    const testUsers = this.getAllTestUsers();
    const user = testUsers.find(u => u.email === email);

    if (!user) {
      return null;
    }

    // If role is specified, check if user has that role
    if (role && !user.roles.includes(role)) {
      return null;
    }

    return user;
  }

  /**
   * Create JWT payload for test user
   */
  createTestUserPayload(user: TestUser): any {
    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      tenantId: user.tenantId,
      isTestUser: true,
    };
  }

  /**
   * Log test mode usage
   */
  logTestModeUsage(action: string, user?: TestUser): void {
    if (this.isTestModeEnabled()) {
      this.logger.warn(`TEST MODE: ${action}${user ? ` by ${user.email} (${user.roles.join(', ')})` : ''}`);
    }
  }
} 