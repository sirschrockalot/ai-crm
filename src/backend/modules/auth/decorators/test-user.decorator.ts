import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TestModeService } from '../services/test-mode.service';

export const TestUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const testModeService = request.testModeService as TestModeService;

    if (!testModeService?.isTestModeEnabled()) {
      return null;
    }

    // Get test user from query parameter or header
    const testRole = request.query.testRole || request.headers['x-test-role'];
    const testEmail = request.query.testEmail || request.headers['x-test-email'];

    if (testRole) {
      return testModeService.getTestUser(testRole);
    }

    if (testEmail) {
      return testModeService.validateTestUser(testEmail);
    }

    // Return default test user
    return testModeService.getDefaultTestUser();
  },
); 