import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class PasswordResetThrottleGuard extends ThrottlerGuard {
  protected getTracker(req: Request): string {
    // Use email as the tracker for forgot password requests
    if (req.body?.email) {
      return `password-reset-${req.body.email.toLowerCase()}`;
    }
    
    // Use IP address as fallback
    return this.getClientIp(req);
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getTracker(request);
    
    // Check if we're in a forgot password request
    const isForgotPassword = request.url.includes('forgot-password');
    
    // Apply stricter limits for password reset
    const resetLimit = isForgotPassword ? 3 : 5; // 3 requests per hour for forgot password
    const resetTtl = isForgotPassword ? 3600 : 3600; // 1 hour TTL
    
    const { totalHits, timeToExpire } = await this.storageService.increment(key, resetTtl);
    
    if (totalHits > resetLimit) {
      throw new HttpException(
        {
          message: 'Too many password reset requests. Please try again later.',
          retryAfter: Math.ceil(timeToExpire / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return true;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
} 