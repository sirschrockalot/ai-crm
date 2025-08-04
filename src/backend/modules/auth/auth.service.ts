import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ActivityType, ActivitySeverity } from '../users/schemas/user-activity.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  roles?: string[];
  status?: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Generate JWT token for authenticated user
   */
  async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Validate JWT token and return payload
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | undefined {
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Handle Google OAuth user data and create JWT payload
   */
  async handleGoogleOAuthUser(googleUser: GoogleUser): Promise<JwtPayload> {
    // TODO: In future sprints, this will integrate with user management
    // For now, create a basic payload from Google user data
    return {
      sub: googleUser.id,
      email: googleUser.email,
      roles: ['user'], // Default role
    };
  }

  /**
   * Register user from Google OAuth data
   */
  async registerUserFromOAuth(googleUser: GoogleUser, tenantId?: string): Promise<JwtPayload> {
    try {
      // Find or create user from OAuth data
      const user = await this.usersService.findOrCreateFromOAuth(googleUser, tenantId);
      
      // Create JWT payload from user data
      return {
        sub: user._id.toString(),
        email: user.email,
        tenantId: user.tenantId?.toString(),
        roles: user.roles,
        status: user.status,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to register user: ${error.message}`);
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token: string): Promise<string> {
    try {
      const payload = await this.validateToken(token);
      
      // Create new token with same payload but new expiration
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: payload.roles,
        status: payload.status,
      };

      return this.generateToken(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate Google OAuth access token
   */
  async validateGoogleToken(accessToken: string): Promise<GoogleUser> {
    try {
      // TODO: Implement actual Google token validation
      // This would typically make a request to Google's userinfo endpoint
      // For now, return a mock user for development
      // In production, this should make a request to:
      // https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}
      
      // Mock implementation for development
      // Remove this when implementing actual Google API calls
      throw new BadRequestException('Google token validation not yet implemented - use OAuth flow instead');
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Logout user (invalidate token and log activity)
   */
  async logout(token: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Validate token to get user info
      const payload = await this.validateToken(token);
      
      // Log logout activity
      if (userId || payload.sub) {
        await this.usersService.logUserActivity({
          userId: userId || payload.sub,
          tenantId: payload.tenantId,
          type: ActivityType.LOGOUT,
          description: 'User logged out',
          severity: ActivitySeverity.LOW,
          metadata: {
            ipAddress,
            userAgent,
            method: 'jwt_logout',
          },
        });
      }

      // TODO: In future sprints, implement token blacklisting
      // For now, just return success
      return Promise.resolve();
    } catch (error) {
      // Log logout attempt even if token is invalid
      this.logger.warn(`Logout attempt with invalid token: ${error.message}`);
      return Promise.resolve();
    }
  }

  /**
   * Log login activity
   */
  async logLoginActivity(
    userId: string, 
    tenantId?: string, 
    method: string = 'unknown',
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true
  ): Promise<void> {
    try {
      await this.usersService.logUserActivity({
        userId,
        tenantId,
        type: ActivityType.LOGIN,
        description: success ? 'User logged in successfully' : 'Login attempt failed',
        severity: success ? ActivitySeverity.LOW : ActivitySeverity.MEDIUM,
        metadata: {
          ipAddress,
          userAgent,
          method,
          success,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log login activity for user ${userId}:`, error);
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');
    
    // Convert to seconds
    if (expiresIn.includes('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.includes('m')) {
      return parseInt(expiresIn) * 60;
    } else if (expiresIn.includes('s')) {
      return parseInt(expiresIn);
    }
    
    return 24 * 60 * 60; // Default to 24 hours
  }
} 