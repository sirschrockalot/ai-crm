import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as csv from 'csv-parser';
import * as createCsvWriter from 'csv-writer';
import { createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';
import { Lead } from '../schemas/lead.schema';
import { LeadValidationService } from './lead-validation.service';

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ExportOptions {
  fields?: string[];
  filters?: Record<string, any>;
  format?: 'csv' | 'excel';
  tenantId: string;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  recordCount: number;
  errors?: string[];
}

@Injectable()
export class LeadImportExportService {
  private readonly logger = new Logger(LeadImportExportService.name);

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private leadValidationService: LeadValidationService,
  ) {}

  /**
   * Import leads from CSV file
   */
  async importFromCsv(
    fileBuffer: Buffer,
    tenantId: string,
    options: {
      updateExisting?: boolean;
      skipDuplicates?: boolean;
      fieldMapping?: Record<string, string>;
    } = {},
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRecords: 0,
      importedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
    };

    try {
      const records: any[] = [];
      const errors: ImportError[] = [];
      let rowNumber = 0;

      // Parse CSV
      const stream = Readable.from(fileBuffer);
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row) => {
            rowNumber++;
            records.push({ ...row, rowNumber });
          })
          .on('end', resolve)
          .on('error', reject);
      });

      result.totalRecords = records.length;

      // Process records
      for (const record of records) {
        try {
          const processedRecord = this.processImportRecord(record, options.fieldMapping);
          const validationResult = await this.leadValidationService.validateLead(processedRecord);

          if (!validationResult.isValid) {
            errors.push({
              row: record.rowNumber,
              field: 'validation',
              message: validationResult.errors.join(', '),
              value: record,
            });
            result.failedRecords++;
            continue;
          }

          // Check for duplicates if skipDuplicates is enabled
          if (options.skipDuplicates) {
            const existingLead = await this.findDuplicate(processedRecord, tenantId);
            if (existingLead) {
              result.warnings.push(`Row ${record.rowNumber}: Duplicate lead found (${existingLead.email})`);
              continue;
            }
          }

          // Create or update lead
          if (options.updateExisting) {
            const existingLead = await this.findExistingLead(processedRecord, tenantId);
            if (existingLead) {
              await this.leadModel.findByIdAndUpdate(existingLead._id, processedRecord);
            } else {
              await this.leadModel.create({ ...processedRecord, tenantId });
            }
          } else {
            await this.leadModel.create({ ...processedRecord, tenantId });
          }

          result.importedRecords++;
        } catch (error) {
          this.logger.error(`Error processing row ${record.rowNumber}:`, error);
          errors.push({
            row: record.rowNumber,
            field: 'processing',
            message: error.message,
            value: record,
          });
          result.failedRecords++;
        }
      }

      result.success = result.failedRecords === 0;
      result.errors = errors;

      this.logger.log(
        `Import completed: ${result.importedRecords}/${result.totalRecords} records imported`,
      );

      return result;
    } catch (error) {
      this.logger.error('CSV import failed:', error);
      throw new BadRequestException('Failed to process CSV file');
    }
  }

  /**
   * Export leads to CSV file
   */
  async exportToCsv(
    options: ExportOptions,
  ): Promise<ExportResult> {
    try {
      // Build query
      const query: any = { tenantId: options.tenantId };
      if (options.filters) {
        Object.assign(query, options.filters);
      }

      // Get leads
      const leads = await this.leadModel.find(query).lean();

      if (leads.length === 0) {
        return {
          success: true,
          recordCount: 0,
          warnings: ['No leads found matching the criteria'],
        };
      }

      // Define fields to export
      const fields = options.fields || this.getDefaultExportFields();
      const fieldMapping = this.getFieldMapping();

      // Create CSV writer
      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: `temp/leads_export_${Date.now()}.csv`,
        header: fields.map(field => ({
          id: field,
          title: fieldMapping[field] || field,
        })),
      });

      // Transform data for export
      const exportData = leads.map(lead => {
        const transformed: any = {};
        fields.forEach(field => {
          transformed[field] = this.transformFieldForExport(lead, field);
        });
        return transformed;
      });

      // Write CSV
      await csvWriter.writeRecords(exportData);

      return {
        success: true,
        filePath: csvWriter.path,
        recordCount: leads.length,
      };
    } catch (error) {
      this.logger.error('CSV export failed:', error);
      return {
        success: false,
        recordCount: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Process and validate import record
   */
  private processImportRecord(record: any, fieldMapping?: Record<string, string>): Partial<Lead> {
    const processed: any = {};

    // Apply field mapping if provided
    const mappedRecord = fieldMapping ? this.applyFieldMapping(record, fieldMapping) : record;

    // Process each field
    Object.keys(mappedRecord).forEach(key => {
      const value = mappedRecord[key];
      if (value !== undefined && value !== null && value !== '') {
        processed[key] = this.normalizeFieldValue(key, value);
      }
    });

    return processed;
  }

  /**
   * Apply field mapping to import record
   */
  private applyFieldMapping(record: any, fieldMapping: Record<string, string>): any {
    const mapped: any = {};
    Object.keys(fieldMapping).forEach(mappedField => {
      const sourceField = fieldMapping[mappedField];
      if (record[sourceField] !== undefined) {
        mapped[mappedField] = record[sourceField];
      }
    });
    return mapped;
  }

  /**
   * Normalize field value based on field type
   */
  private normalizeFieldValue(field: string, value: any): any {
    switch (field.toLowerCase()) {
      case 'email':
        return value.toLowerCase().trim();
      case 'phone':
        return this.normalizePhoneNumber(value);
      case 'company':
      case 'firstname':
      case 'lastname':
        return value.trim();
      case 'value':
      case 'score':
        return parseFloat(value) || 0;
      case 'priority':
        return this.normalizePriority(value);
      case 'status':
        return this.normalizeStatus(value);
      default:
        return value;
    }
  }

  /**
   * Normalize phone number format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as US phone number if 10 digits
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // Add +1 if 11 digits and starts with 1
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // Return as is if already formatted
    return phone;
  }

  /**
   * Normalize priority value
   */
  private normalizePriority(priority: string): string {
    const normalized = priority.toLowerCase().trim();
    if (['high', 'medium', 'low'].includes(normalized)) {
      return normalized;
    }
    return 'medium'; // default
  }

  /**
   * Normalize status value
   */
  private normalizeStatus(status: string): string {
    const normalized = status.toLowerCase().trim();
    if (['active', 'inactive', 'pending', 'blocked'].includes(normalized)) {
      return normalized;
    }
    return 'active'; // default
  }

  /**
   * Find duplicate lead
   */
  private async findDuplicate(lead: Partial<Lead>, tenantId: string): Promise<Lead | null> {
    if (lead.email) {
      return await this.leadModel.findOne({ email: lead.email, tenantId }).exec();
    }
    if (lead.phone) {
      return await this.leadModel.findOne({ phone: lead.phone, tenantId }).exec();
    }
    return null;
  }

  /**
   * Find existing lead for update
   */
  private async findExistingLead(lead: Partial<Lead>, tenantId: string): Promise<Lead | null> {
    if (lead.email) {
      return await this.leadModel.findOne({ email: lead.email, tenantId }).exec();
    }
    return null;
  }

  /**
   * Get default export fields
   */
  private getDefaultExportFields(): string[] {
    return [
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'title',
      'status',
      'priority',
      'value',
      'score',
      'source',
      'createdAt',
      'updatedAt',
    ];
  }

  /**
   * Get field mapping for export headers
   */
  private getFieldMapping(): Record<string, string> {
    return {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      title: 'Title',
      status: 'Status',
      priority: 'Priority',
      value: 'Value',
      score: 'Score',
      source: 'Source',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date',
    };
  }

  /**
   * Transform field for export
   */
  private transformFieldForExport(lead: any, field: string): any {
    switch (field) {
      case 'createdAt':
      case 'updatedAt':
        return new Date(lead[field]).toISOString();
      case 'value':
      case 'score':
        return lead[field] || 0;
      default:
        return lead[field] || '';
    }
  }

  /**
   * Get import template
   */
  async getImportTemplate(): Promise<string> {
    const fields = this.getDefaultExportFields();
    const fieldMapping = this.getFieldMapping();
    
    const headers = fields.map(field => fieldMapping[field] || field);
    const template = [headers.join(',')];
    
    return template.join('\n');
  }

  /**
   * Validate CSV structure
   */
  async validateCsvStructure(fileBuffer: Buffer): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const stream = Readable.from(fileBuffer);
      let headers: string[] = [];
      let rowCount = 0;

      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('headers', (headerList) => {
            headers = headerList;
          })
          .on('data', () => {
            rowCount++;
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Check required fields
      const requiredFields = ['firstName', 'lastName', 'email'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check for empty file
      if (rowCount === 0) {
        errors.push('CSV file is empty');
      }

      // Check for large files
      if (rowCount > 10000) {
        warnings.push('Large file detected. Import may take several minutes.');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid CSV format'],
        warnings: [],
      };
    }
  }
} 