import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { LeadValidationService } from './services/lead-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
    ]),
    ConfigModule,
  ],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadValidationService,
  ],
  exports: [
    LeadsService,
    LeadValidationService,
  ],
})
export class LeadsModule {} 