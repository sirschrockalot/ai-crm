import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
      issuer: 'dealcycle-auth-service',
      audience: 'dealcycle-crm',
    });
  }

  async validate(payload: any) {
    try {
      // Validate the token payload
      const user = await this.authService.getCurrentUser(payload.userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Return user data to be attached to request
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        sessionId: payload.sessionId,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
