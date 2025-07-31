import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOAuthUser(oauthUser: any): Promise<User> {
    const { google_id, email, name, first_name, last_name, avatar_url } = oauthUser;
    
    // Check if user exists
    let user = await this.usersService.findByGoogleId(google_id);
    
    if (!user) {
      // Create new user with default tenant (for MVP, we'll use a default tenant)
      const defaultTenantId = process.env.DEFAULT_TENANT_ID || '507f1f77bcf86cd799439011';
      
      user = await this.usersService.createUser({
        google_id,
        email,
        name,
        first_name,
        last_name,
        avatar_url,
        tenant_id: defaultTenantId,
        role: 'acquisition_rep',
        is_active: true,
        last_login: new Date(),
      });
    } else {
      // Update existing user's information
      user = await this.usersService.updateUser(google_id, {
        name,
        first_name,
        last_name,
        avatar_url,
        last_login: new Date(),
      });
    }

    return user;
  }

  async generateTokens(user: User) {
    const payload = { 
      sub: user._id, 
      email: user.email, 
      tenant_id: user.tenant_id,
      role: user.role,
    };
    
    return {
      access_token: this.jwtService.sign(payload, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
      }),
      refresh_token: this.jwtService.sign(payload, { 
        expiresIn: '7d' 
      }),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        tenant_id: user.tenant_id,
      }
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.validateUser(userId);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.validateUser(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just update the last login time
    await this.usersService.updateLastLogin(userId);
  }
} 