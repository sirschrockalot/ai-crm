import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    GoogleStrategy,
    JwtStrategy,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {} 