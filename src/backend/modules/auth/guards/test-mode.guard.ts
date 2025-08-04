import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { TestModeService } from '../services/test-mode.service';

@Injectable()
export class TestModeGuard implements CanActivate {
  constructor(private readonly testModeService: TestModeService) {}

  canActivate(context: ExecutionContext): boolean {
    // If test mode is enabled, allow all requests
    if (this.testModeService.isTestModeEnabled()) {
      this.testModeService.logTestModeUsage('Authentication bypassed');
      return true;
    }

    // If test mode is disabled, let the normal authentication flow continue
    return true;
  }
} 