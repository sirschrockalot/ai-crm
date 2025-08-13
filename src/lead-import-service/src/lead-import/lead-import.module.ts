import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadImportController } from './lead-import.controller';
import { LeadImportService } from './services/lead-import.service';
import { FileProcessorService } from './services/file-processor.service';
import { Lead, LeadSchema } from './schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema }
    ]),
  ],
  controllers: [LeadImportController],
  providers: [LeadImportService, FileProcessorService],
  exports: [LeadImportService, FileProcessorService],
})
export class LeadImportModule {}
