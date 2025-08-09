import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/google', method: RequestMethod.GET },
        { path: 'auth/google/callback', method: RequestMethod.GET },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'auth/password-reset/request', method: RequestMethod.POST },
        { path: 'auth/password-reset/verify', method: RequestMethod.POST },
        { path: 'auth/password-reset/reset', method: RequestMethod.POST },
        { path: 'health', method: RequestMethod.GET },
        { path: 'metrics', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
} 