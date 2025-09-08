import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/presidential-digs-crm',
        // Remove deprecated options for newer MongoDB driver
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
