import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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

      // Get user from database to check status
      const user = await this.usersService.findById(payload.sub);
      
      // Check user status - block suspended and inactive users
      if (user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('User account is suspended');
      }
      
      if (user.status === UserStatus.INACTIVE) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Update last active timestamp
      await this.usersService.updateLastActive(payload.sub);

      return {
        sub: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: user.roles || ['user'],
        status: user.status,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 