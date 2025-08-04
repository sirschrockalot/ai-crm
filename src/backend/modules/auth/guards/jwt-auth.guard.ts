import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TestModeService } from '../services/test-mode.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly testModeService: TestModeService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // If test mode is enabled, bypass normal authentication
    if (this.testModeService.isTestModeEnabled()) {
      const request = context.switchToHttp().getRequest();
      
      // Inject test mode service into request for decorators
      request.testModeService = this.testModeService;
      
      // Get test user from query parameters or headers
      const testRole = request.query.testRole || request.headers['x-test-role'];
      const testEmail = request.query.testEmail || request.headers['x-test-email'];
      
      let testUser = null;
      if (testRole) {
        testUser = this.testModeService.getTestUser(testRole);
      } else if (testEmail) {
        testUser = this.testModeService.validateTestUser(testEmail);
      } else {
        testUser = this.testModeService.getDefaultTestUser();
      }
      
      if (testUser) {
        // Set test user in request
        request.user = this.testModeService.createTestUserPayload(testUser);
        this.testModeService.logTestModeUsage('Request authenticated', testUser);
        return true;
      }
    }
    
    // Fall back to normal JWT authentication
    return super.canActivate(context);
  }
} 