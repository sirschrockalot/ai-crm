import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { RbacModule } from '../modules/rbac/rbac.module';
import { TenantsModule } from '../modules/tenants/tenants.module';
import { LeadsModule } from '../modules/leads/leads.module';
import { TenantIsolationMiddleware } from '../common/middleware/tenant-isolation.middleware';
import { SecurityLoggingMiddleware } from '../common/middleware/security-logging.middleware';
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
    TenantsModule,
    LeadsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security logging middleware to all routes
    consumer
      .apply(SecurityLoggingMiddleware)
      .forRoutes('*');

    // Apply tenant isolation middleware to all routes except auth
    consumer
      .apply(TenantIsolationMiddleware)
      .exclude(
        { path: 'auth/login', method: 'POST' },
        { path: 'auth/google', method: 'GET' },
        { path: 'auth/google/callback', method: 'GET' },
        { path: 'auth/refresh', method: 'POST' },
        { path: 'auth/password-reset/request', method: 'POST' },
        { path: 'auth/password-reset/verify', method: 'POST' },
        { path: 'auth/password-reset/reset', method: 'POST' },
        { path: 'health', method: 'GET' },
        { path: 'metrics', method: 'GET' },
      )
      .forRoutes('*');
  }
} 