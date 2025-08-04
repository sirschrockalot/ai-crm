import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { RbacModule } from '../modules/rbac/rbac.module';
import testModeConfig from '../config/test-mode.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [testModeConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dealcycle',
      }),
    }),
    AuthModule,
    UsersModule,
    RbacModule,
  ],
})
export class AppModule {} 