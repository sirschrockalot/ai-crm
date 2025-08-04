import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService, GoogleUser } from '../auth.service';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { name, emails, photos } = profile;
      
      const googleUser: GoogleUser = {
        id: profile.id,
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0]?.value,
      };

      // TODO: In future sprints, save/update user in database
      // For now, just pass the user data to the callback
      done(null, googleUser);
    } catch (error) {
      done(error, null);
    }
  }
} 