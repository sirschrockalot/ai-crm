import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const user = {
        google_id: profile.id,
        email: emails[0].value,
        name: name.givenName + ' ' + name.familyName,
        first_name: name.givenName,
        last_name: name.familyName,
        avatar_url: photos[0].value,
        accessToken,
      };
      
      // Create or update user in database
      const savedUser = await this.authService.validateOAuthUser(user);
      done(null, savedUser);
    } catch (error) {
      console.error('Google OAuth validation error:', error);
      done(error, null);
    }
  }
} 