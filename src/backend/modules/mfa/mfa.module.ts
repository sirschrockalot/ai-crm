import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MFAController } from './mfa.controller';
import { MFAService } from './mfa.service';
import { MFA, MFASchema } from './schemas/mfa.schema';
import { TOTPService } from '../../common/services/totp.service';
import { SecurityEventsService } from '../security/security-events.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MFA.name, schema: MFASchema },
    ]),
  ],
  controllers: [MFAController],
  providers: [
    MFAService,
    TOTPService,
    SecurityEventsService,
  ],
  exports: [MFAService, TOTPService],
})
export class MFAModule {} 