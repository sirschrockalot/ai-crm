import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Session, SessionSchema } from './schemas/session.schema';
import { DeviceFingerprintingService } from '../security/device-fingerprinting.service';
import { LocationTrackingService } from '../security/location-tracking.service';
import { SecurityEventsService } from '../security/security-events.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    DeviceFingerprintingService,
    LocationTrackingService,
    SecurityEventsService,
  ],
  exports: [SessionsService],
})
export class SessionsModule {} 