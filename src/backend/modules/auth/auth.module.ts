import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TestModeService } from './services/test-mode.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { TestModeGuard } from './guards/test-mode.guard';
import { UsersModule } from '../users/users.module';
import testModeConfig from '../../config/test-mode.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forFeature(testModeConfig),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TestModeService,
    JwtStrategy,
    GoogleOAuthStrategy,
    JwtAuthGuard,
    GoogleOAuthGuard,
    TestModeGuard,
  ],
  exports: [AuthService, JwtAuthGuard, GoogleOAuthGuard, TestModeService, TestModeGuard],
})
export class AuthModule {} 