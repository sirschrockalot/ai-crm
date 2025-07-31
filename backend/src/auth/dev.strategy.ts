import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class DevStrategy extends PassportStrategy(Strategy, 'dev') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // For development, create a mock user if credentials are 'dev'/'dev'
    if (email === 'dev' && password === 'dev') {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'dev@example.com',
        name: 'Development User',
        first_name: 'Development',
        last_name: 'User',
        role: 'admin',
        tenant_id: '507f1f77bcf86cd799439011',
        google_id: 'dev-google-id',
        avatar_url: 'https://via.placeholder.com/150',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Save or update the mock user
      const savedUser = await this.authService.validateOAuthUser(mockUser);
      return savedUser;
    }

    // For other credentials, return null (not supported in dev mode)
    return null;
  }
} 