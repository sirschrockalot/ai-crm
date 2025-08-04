import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { UsersController } from './users.controller';
import { PasswordResetController } from './password-reset.controller';
import { UserPreferencesController } from './user-preferences.controller';
import { UserInvitationController, PublicInvitationController } from './user-invitation.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserActivity, UserActivitySchema } from './schemas/user-activity.schema';
import { UserStatusHistory, UserStatusHistorySchema } from './schemas/user-status-history.schema';
import { PasswordResetToken, PasswordResetTokenSchema } from './schemas/password-reset-token.schema';
import { UserPreferences, UserPreferencesSchema } from './schemas/user-preferences.schema';
import { UserInvitation, UserInvitationSchema } from './schemas/user-invitation.schema';
import { EmailService } from './services/email.service';
import { UserValidationService } from './services/user-validation.service';
import { PasswordResetService } from './services/password-reset.service';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserInvitationService } from './services/user-invitation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: UserStatusHistory.name, schema: UserStatusHistorySchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: UserPreferences.name, schema: UserPreferencesSchema },
      { name: UserInvitation.name, schema: UserInvitationSchema },
    ]),
    ConfigModule,
    ThrottlerModule.forRoot([
      {
        ttl: 3600, // 1 hour
        limit: 3, // 3 requests per hour for password reset
      },
    ]),
  ],
  controllers: [UsersController, PasswordResetController, UserPreferencesController, UserInvitationController, PublicInvitationController],
  providers: [
    UsersService,
    EmailService,
    UserValidationService,
    PasswordResetService,
    UserPreferencesService,
    UserInvitationService,
  ],
  exports: [UsersService, EmailService, UserValidationService, PasswordResetService, UserPreferencesService, UserInvitationService],
})
export class UsersModule {} 