import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from '../schemas/lead.schema';
import { FileProcessorService, ParsedRow, ValidationResult } from './file-processor.service';
import { ImportOptionsDto, ImportResultDto } from '../dto/import-leads.dto';

@Injectable()
export class LeadImportService {
  private readonly logger = new Logger(LeadImportService.name);
  private readonly importJobs = new Map<string, ImportResultDto>();

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    private fileProcessorService: FileProcessorService
  ) {}

  /**
   * Start import process
   */
  async startImport(
    file: Express.Multer.File,
    options: ImportOptionsDto,
    tenantId: string,
    userId: string
  ): Promise<ImportResultDto> {
    const importId = this.generateImportId();
    
    // Initialize import job
    const importJob: ImportResultDto = {
      importId,
      totalRecords: 0,
      successfulRows: 0,
      failedRows: 0,
      status: 'processing',
      errors: [],
      startedAt: new Date(),
    };

    this.importJobs.set(importId, importJob);

    // Process file asynchronously
    this.processImportAsync(file, options, tenantId, userId, importId);

    return importJob;
  }

  /**
   * Get import progress
   */
  getImportProgress(importId: string): ImportResultDto | null {
    return this.importJobs.get(importId) || null;
  }

  /**
   * Process import asynchronously
   */
  private async processImportAsync(
    file: Express.Multer.File,
    options: ImportOptionsDto,
    tenantId: string,
    userId: string,
    importId: string
  ): Promise<void> {
    try {
      const importJob = this.importJobs.get(importId);
      if (!importJob) return;

      // Process file
      const { rows, headers } = await this.fileProcessorService.processFile(file, options);
      importJob.totalRecords = rows.length;

      // Validate data
      const validation = this.fileProcessorService.validateData(rows);
      if (!validation.isValid) {
        importJob.errors.push(...validation.errors);
        importJob.failedRows = validation.errors.length;
        importJob.status = 'failed';
        importJob.completedAt = new Date();
        importJob.duration = importJob.completedAt.getTime() - importJob.startedAt.getTime();
        return;
      }

      // Process in batches
      const batchSize = options.batchSize || 100;
      const batches = this.chunkArray(rows, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        await this.processBatch(batch, options, tenantId, userId, importId);
        
        // Update progress
        importJob.successfulRows = (i + 1) * batchSize;
        if (importJob.successfulRows > importJob.totalRecords) {
          importJob.successfulRows = importJob.totalRecords;
        }
      }

      // Mark as completed
      importJob.status = 'completed';
      importJob.completedAt = new Date();
      importJob.duration = importJob.completedAt.getTime() - importJob.startedAt.getTime();

      this.logger.log(`Import ${importId} completed successfully: ${importJob.successfulRows} leads imported`);

    } catch (error) {
      this.logger.error(`Import ${importId} failed: ${error.message}`, error.stack);
      
      const importJob = this.importJobs.get(importId);
      if (importJob) {
        importJob.status = 'failed';
        importJob.errors.push({
          row: 0,
          field: 'system',
          value: '',
          message: `Import failed: ${error.message}`
        });
        importJob.completedAt = new Date();
        importJob.duration = importJob.completedAt.getTime() - importJob.startedAt.getTime();
      }
    }
  }

  /**
   * Process a batch of rows
   */
  private async processBatch(
    rows: ParsedRow[],
    options: ImportOptionsDto,
    tenantId: string,
    userId: string,
    importId: string
  ): Promise<void> {
    const importJob = this.importJobs.get(importId);
    if (!importJob) return;

    const operations: any[] = [];
    const tenantObjectId = new Types.ObjectId(tenantId);

    for (const row of rows) {
      try {
        const leadData = this.transformRowToLead(row, options, tenantObjectId, userId);
        
        if (options.updateExisting && (row.phone || row.email)) {
          // Try to find existing lead
          const existingLead = await this.findExistingLead(leadData, tenantObjectId);
          
          if (existingLead) {
            // Update existing lead
            operations.push({
              updateOne: {
                filter: { _id: existingLead._id },
                update: { $set: leadData }
              }
            });
          } else {
            // Insert new lead
            operations.push({
              insertOne: {
                document: leadData
              }
            });
          }
        } else {
          // Always insert new lead
          operations.push({
            insertOne: {
              document: leadData
            }
          });
        }
      } catch (error) {
        importJob.errors.push({
          row: row.rowNumber,
          field: 'system',
          value: '',
          message: `Failed to process row: ${error.message}`
        });
        importJob.failedRows++;
      }
    }

    if (operations.length > 0) {
      try {
        const result = await this.leadModel.bulkWrite(operations, { ordered: false });
        importJob.successfulRows += result.insertedCount + result.modifiedCount;
      } catch (error) {
        this.logger.error(`Batch processing failed: ${error.message}`, error.stack);
        
        // Add batch errors
        rows.forEach(row => {
          importJob.errors.push({
            row: row.rowNumber,
            field: 'system',
            value: '',
            message: `Batch processing failed: ${error.message}`
          });
          importJob.failedRows++;
        });
      }
    }
  }

  /**
   * Transform parsed row to lead document
   */
  private transformRowToLead(
    row: ParsedRow,
    options: ImportOptionsDto,
    tenantId: Types.ObjectId,
    userId: string
  ): Partial<Lead> {
    const leadData: Partial<Lead> = {
      tenant_id: tenantId,
      name: String(row.name || ''),
      phone: String(row.phone || ''),
      email: row.email ? String(row.email) : undefined,
      source: row.source ? String(row.source) : (options.defaultSource || 'import'),
      status: this.normalizeStatus(row.status, options.defaultStatus),
      priority: this.normalizePriority(row.priority, options.defaultPriority),
      notes: row.notes ? String(row.notes) : undefined,
      tags: this.processTags(row.tags, options.defaultTags),
      lead_score: 0,
      qualification_probability: 0,
      communication_count: 0,
    };

    // Handle address fields
    if (row['address.full_address'] || row['address.street'] || row['address.city']) {
      leadData.address = {
        street: row['address.street'] ? String(row['address.street']) : undefined,
        city: row['address.city'] ? String(row['address.city']) : undefined,
        state: row['address.state'] ? String(row['address.state']) : undefined,
        zip_code: row['address.zip_code'] ? String(row['address.zip_code']) : undefined,
        county: row['address.county'] ? String(row['address.county']) : undefined,
        full_address: row['address.full_address'] ? String(row['address.full_address']) : undefined,
      };
    }

    // Handle property details
    if (row['property_details.type'] || row['property_details.bedrooms'] || row['property_details.bathrooms']) {
      leadData.property_details = {
        type: row['property_details.type'] ? String(row['property_details.type']) : undefined,
        bedrooms: row['property_details.bedrooms'] ? Number(row['property_details.bedrooms']) : undefined,
        bathrooms: row['property_details.bathrooms'] ? Number(row['property_details.bathrooms']) : undefined,
        square_feet: row['property_details.square_feet'] ? Number(row['property_details.square_feet']) : undefined,
        lot_size: row['property_details.lot_size'] ? Number(row['property_details.lot_size']) : undefined,
        year_built: row['property_details.year_built'] ? Number(row['property_details.year_built']) : undefined,
      };
    }

    // Handle numeric fields
    if (row.estimated_value) {
      leadData.estimated_value = Number(row.estimated_value);
    }
    if (row.asking_price) {
      leadData.asking_price = Number(row.asking_price);
    }

    return leadData;
  }

  /**
   * Find existing lead by phone or email
   */
  private async findExistingLead(
    leadData: Partial<Lead>,
    tenantId: Types.ObjectId
  ): Promise<LeadDocument | null> {
    const query: any = { tenant_id: tenantId };
    
    if (leadData.phone) {
      query.phone = leadData.phone;
    } else if (leadData.email) {
      query.email = leadData.email;
    } else {
      return null;
    }

    return this.leadModel.findOne(query).exec();
  }

  /**
   * Normalize status value
   */
  private normalizeStatus(status: any, defaultStatus?: string): string {
    if (!status) return defaultStatus || 'new';
    
    const normalizedStatus = String(status).toLowerCase();
    const validStatuses = ['new', 'contacted', 'under_contract', 'closed', 'lost'];
    
    return validStatuses.includes(normalizedStatus) ? normalizedStatus : (defaultStatus || 'new');
  }

  /**
   * Normalize priority value
   */
  private normalizePriority(priority: any, defaultPriority?: string): string {
    if (!priority) return defaultPriority || 'medium';
    
    const normalizedPriority = String(priority).toLowerCase();
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    return validPriorities.includes(normalizedPriority) ? normalizedPriority : (defaultPriority || 'medium');
  }

  /**
   * Process tags field
   */
  private processTags(tags: any, defaultTags?: string[]): string[] {
    const result: string[] = [];
    
    // Add default tags
    if (defaultTags) {
      result.push(...defaultTags);
    }
    
    // Process row tags
    if (tags) {
      if (typeof tags === 'string') {
        // Split by comma, semicolon, or pipe
        const tagArray = tags.split(/[,;|]/).map(tag => tag.trim()).filter(tag => tag);
        result.push(...tagArray);
      } else if (Array.isArray(tags)) {
        result.push(...tags.map(tag => String(tag).trim()).filter(tag => tag));
      }
    }
    
    // Remove duplicates and empty tags
    return [...new Set(result)].filter(tag => tag.length > 0);
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Generate unique import ID
   */
  private generateImportId(): string {
    return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up completed imports (older than 24 hours)
   */
  async cleanupOldImports(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [importId, importJob] of this.importJobs.entries()) {
      if (importJob.completedAt && importJob.completedAt < cutoffTime) {
        this.importJobs.delete(importId);
      }
    }
  }
}
