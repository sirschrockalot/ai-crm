import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    try {
      // Validate the payload structure
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // TODO: In future sprints, validate against user database
      // For now, return the payload as-is
      return {
        sub: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: payload.roles || ['user'],
      };
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 