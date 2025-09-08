import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { TransactionsModule } from './transactions/transactions.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000, // 1 minute
        limit: parseInt(process.env.RATE_LIMIT_LIMIT) || 100, // 100 requests per minute
      },
    ]),
    DatabaseModule,
    TransactionsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
