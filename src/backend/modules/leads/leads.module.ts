import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LeadsController } from './leads.controller';
import { ScoringController } from './controllers/scoring.controller';
import { QueueController } from './controllers/queue.controller';
import { LeadImportExportController } from './controllers/import-export.controller';
import { BulkOperationsController } from './controllers/bulk-operations.controller';
import { CommunicationController } from './controllers/communication.controller';
import { LeadsService } from './leads.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { 
  QueueItem, 
  QueueItemSchema
} from './schemas/queue.schema';
import { CommunicationLog, CommunicationLogSchema } from './schemas/communication-log.schema';
import { LeadValidationService } from './services/lead-validation.service';
import { LeadScoringService } from './services/lead-scoring.service';
import { LeadQueueService } from './services/lead-queue.service';
import { QueueService } from './services/queue.service';
import { LeadImportExportService } from './services/lead-import-export.service';
import { BulkOperationsService } from './services/bulk-operations.service';
import { CommunicationService } from './services/communication.service';
import { CommunicationTrackingService } from './services/communication-tracking.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: QueueItem.name, schema: QueueItemSchema },
      { name: CommunicationLog.name, schema: CommunicationLogSchema },
    ]),
    ConfigModule,
  ],
  controllers: [
    LeadsController, 
    ScoringController, 
    QueueController,
    LeadImportExportController,
    BulkOperationsController,
    CommunicationController,
  ],
  providers: [
    LeadsService,
    LeadValidationService,
    LeadScoringService,
    LeadQueueService,
    QueueService,
    LeadImportExportService,
    BulkOperationsService,
    CommunicationService,
    CommunicationTrackingService,
  ],
  exports: [
    LeadsService,
    LeadValidationService,
    LeadScoringService,
    LeadQueueService,
    QueueService,
    LeadImportExportService,
    BulkOperationsService,
    CommunicationService,
    CommunicationTrackingService,
  ],
})
export class LeadsModule {} 