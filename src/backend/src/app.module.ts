import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { HealthController } from './health.controller';

// Common modules
import { CommonModule } from '../common/common.module';

// Feature modules - commented out until implemented
// import { AuthModule } from '../modules/auth/auth.module';
// import { UsersModule } from '../modules/users/users.module';
// import { RbacModule } from '../modules/rbac/rbac.module';
// import { LeadsModule } from '../modules/leads/leads.module';
// import { SettingsModule } from '../modules/settings/settings.module';
// import { TimeTrackingModule } from '../modules/time-tracking/time-tracking.module';
// import { SessionsModule } from '../modules/sessions/sessions.module';
// import { MFAModule } from '../modules/mfa/mfa.module';
// import { TenantsModule } from '../modules/tenants/tenants.module';

// Import BuyersModule
import { BuyersModule } from '../modules/buyers/buyers.module';


@Module({
  imports: [
    // Configuration module with environment file loading
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `env.${process.env.NODE_ENV || 'development'}`,
        `env.${process.env.NODE_ENV || 'development'}.template`,
        '.env.local',
        'env.local',
        '.env',
        'env',
        'env.example',
        'env.template',
        '.env.development', // fallback
      ],
      validationSchema: undefined, // We'll handle validation in the service
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      cache: true,
      expandVariables: true,
    }),

    // Database connection
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dealcycle_crm',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: parseInt(process.env.THROTTLE_TTL || '60'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      } as any),
    }),

    // Common modules - this provides StartupService and other common services
    CommonModule,

    // Feature modules - commented out until implemented
    // AuthModule,
    // UsersModule,
    // RbacModule,
    // LeadsModule,
    // SettingsModule,
    // TimeTrackingModule,
    // SessionsModule,
    // MFAModule,
    // TenantsModule,

    // Add BuyersModule
    BuyersModule,

  ],

  controllers: [AppController, HealthController],

  providers: [
    // Global guards and interceptors are now provided by CommonModule
  ],

  exports: [],
})
export class AppModule {} 