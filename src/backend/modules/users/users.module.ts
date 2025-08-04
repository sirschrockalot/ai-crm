import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserActivity, UserActivitySchema } from './schemas/user-activity.schema';
import { EmailService } from './services/email.service';
import { UserValidationService } from './services/user-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserActivity.name, schema: UserActivitySchema },
    ]),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    EmailService,
    UserValidationService,
  ],
  exports: [UsersService, EmailService, UserValidationService],
})
export class UsersModule {} 