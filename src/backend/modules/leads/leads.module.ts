import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LeadsController } from './leads.controller';
import { ScoringController } from './controllers/scoring.controller';
import { QueueController } from './controllers/queue.controller';
import { ImportExportController } from './controllers/import-export.controller';
import { BulkOperationsController } from './controllers/bulk-operations.controller';
import { LeadsService } from './leads.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { 
  QueueEntry, 
  QueueEntrySchema, 
  QueueConfiguration, 
  QueueConfigurationSchema,
  AssignmentHistory,
  AssignmentHistorySchema,
  QueueAnalytics,
  QueueAnalyticsSchema 
} from './schemas/queue.schema';
import { LeadValidationService } from './services/lead-validation.service';
import { LeadScoringService } from './services/lead-scoring.service';
import { LeadQueueService } from './services/lead-queue.service';
import { LeadImportExportService } from './services/lead-import-export.service';
import { BulkOperationsService } from './services/bulk-operations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: QueueEntry.name, schema: QueueEntrySchema },
      { name: QueueConfiguration.name, schema: QueueConfigurationSchema },
      { name: AssignmentHistory.name, schema: AssignmentHistorySchema },
      { name: QueueAnalytics.name, schema: QueueAnalyticsSchema },
    ]),
    ConfigModule,
  ],
  controllers: [
    LeadsController, 
    ScoringController, 
    QueueController,
    ImportExportController,
    BulkOperationsController,
  ],
  providers: [
    LeadsService,
    LeadValidationService,
    LeadScoringService,
    LeadQueueService,
    LeadImportExportService,
    BulkOperationsService,
  ],
  exports: [
    LeadsService,
    LeadValidationService,
    LeadScoringService,
    LeadQueueService,
    LeadImportExportService,
    BulkOperationsService,
  ],
})
export class LeadsModule {} 