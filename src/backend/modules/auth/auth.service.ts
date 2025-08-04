import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  roles?: string[];
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
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      // TODO: Implement Google token validation
      // This would typically make a request to Google's userinfo endpoint
      // For now, return a mock user for development
      throw new BadRequestException('Google token validation not yet implemented');
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Logout user (invalidate token)
   */
  async logout(token: string): Promise<void> {
    // TODO: In future sprints, implement token blacklisting
    // For now, just return success
    return Promise.resolve();
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