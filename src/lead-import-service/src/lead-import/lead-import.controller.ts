import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { LeadImportService } from './services/lead-import.service';
import { FileProcessorService } from './services/file-processor.service';
import { ImportOptionsDto, ImportResultDto } from './dto/import-leads.dto';
import { ExportRequestDto, ExportResultDto } from './dto/export-leads.dto';

@ApiTags('Lead Import/Export')
@Controller('leads/import-export')
export class LeadImportController {
  constructor(
    private readonly leadImportService: LeadImportService,
    private readonly fileProcessorService: FileProcessorService,
  ) {}

  @Post('import')
  @ApiOperation({ summary: 'Import leads from CSV/Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file to import',
        },
        updateExisting: {
          type: 'boolean',
          description: 'Whether to update existing leads',
          default: false,
        },
        skipDuplicates: {
          type: 'boolean',
          description: 'Whether to skip duplicate leads',
          default: true,
        },
        batchSize: {
          type: 'number',
          description: 'Batch size for processing',
          default: 100,
        },
        defaultSource: {
          type: 'string',
          description: 'Default source for imported leads',
          default: 'import',
        },
        defaultStatus: {
          type: 'string',
          description: 'Default status for imported leads',
          default: 'new',
        },
        defaultPriority: {
          type: 'string',
          description: 'Default priority for imported leads',
          default: 'medium',
        },
        defaultTags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Default tags for imported leads',
        },
        fieldMapping: {
          type: 'string',
          description: 'JSON string of custom field mapping',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Import started successfully', type: ImportResultDto })
  @ApiResponse({ status: 400, description: 'Invalid file or options' })
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /\.(csv|xlsx|xls)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() importOptions: any,
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
  ): Promise<ImportResultDto> {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Parse field mapping if provided
    let fieldMapping;
    if (importOptions.fieldMapping) {
      try {
        fieldMapping = JSON.parse(importOptions.fieldMapping);
      } catch (error) {
        throw new BadRequestException('Invalid field mapping JSON');
      }
    }

    // Build options object
    const options: ImportOptionsDto = {
      updateExisting: importOptions.updateExisting === 'true',
      skipDuplicates: importOptions.skipDuplicates !== 'false', // Default to true
      batchSize: importOptions.batchSize ? parseInt(importOptions.batchSize) : 100,
      defaultSource: importOptions.defaultSource || 'import',
      defaultStatus: importOptions.defaultStatus || 'new',
      defaultPriority: importOptions.defaultPriority || 'medium',
      defaultTags: importOptions.defaultTags ? importOptions.defaultTags.split(',') : [],
      fieldMapping,
    };

    return this.leadImportService.startImport(file, options, tenantId, userId);
  }

  @Get('import/:importId/progress')
  @ApiOperation({ summary: 'Get import progress' })
  @ApiResponse({ status: 200, description: 'Import progress retrieved', type: ImportResultDto })
  @ApiResponse({ status: 404, description: 'Import not found' })
  async getImportProgress(@Param('importId') importId: string): Promise<ImportResultDto | null> {
    return this.leadImportService.getImportProgress(importId);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate file structure without importing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file to validate',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File validation completed' })
  @UseInterceptors(FileInterceptor('file'))
  async validateFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /\.(csv|xlsx|xls)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const options: ImportOptionsDto = {};
    const { rows, headers } = await this.fileProcessorService.processFile(file, options);
    const validation = this.fileProcessorService.validateData(rows);

    return {
      totalRows: rows.length,
      headers,
      validation,
      sampleData: rows.slice(0, 5), // First 5 rows as sample
    };
  }

  @Get('template')
  @ApiOperation({ summary: 'Download import template' })
  @ApiResponse({ status: 200, description: 'Template file downloaded' })
  async downloadTemplate(
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
    @Res() res: Response,
  ) {
    const templateData = this.generateTemplateData();
    
    if (format === 'xlsx') {
      // Generate Excel template
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Set column widths
      const columnWidths = [
        { wch: 20 }, // name
        { wch: 15 }, // phone
        { wch: 25 }, // email
        { wch: 40 }, // address
        { wch: 15 }, // city
        { wch: 10 }, // state
        { wch: 10 }, // zip
        { wch: 15 }, // property_type
        { wch: 10 }, // bedrooms
        { wch: 10 }, // bathrooms
        { wch: 15 }, // square_feet
        { wch: 15 }, // estimated_value
        { wch: 15 }, // asking_price
        { wch: 15 }, // source
        { wch: 15 }, // status
        { wch: 15 }, // priority
        { wch: 20 }, // tags
        { wch: 50 }, // notes
      ];
      
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Template');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_import_template.xlsx"');
      res.send(buffer);
    } else {
      // Generate CSV template
      const csvContent = this.generateCSVContent(templateData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_import_template.csv"');
      res.send(csvContent);
    }
  }

  @Post('export')
  @ApiOperation({ summary: 'Export leads to file' })
  @ApiResponse({ status: 201, description: 'Export started successfully', type: ExportResultDto })
  async exportLeads(@Body() exportRequest: ExportRequestDto): Promise<ExportResultDto> {
    // TODO: Implement export functionality
    throw new BadRequestException('Export functionality not yet implemented');
  }

  @Get('export/:exportId/status')
  @ApiOperation({ summary: 'Get export status' })
  @ApiResponse({ status: 200, description: 'Export status retrieved', type: ExportResultDto })
  async getExportStatus(@Param('exportId') exportId: string): Promise<ExportResultDto> {
    // TODO: Implement export status tracking
    throw new BadRequestException('Export functionality not yet implemented');
  }

  /**
   * Generate template data with sample records
   */
  private generateTemplateData(): any[] {
    return [
      {
        name: 'John Smith',
        phone: '555-123-4567',
        email: 'john.smith@example.com',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        property_type: 'single_family',
        bedrooms: '3',
        bathrooms: '2',
        square_feet: '1500',
        estimated_value: '350000',
        asking_price: '375000',
        source: 'website',
        status: 'new',
        priority: 'medium',
        tags: 'motivated seller, quick close',
        notes: 'Owner is motivated to sell quickly due to job relocation.',
      },
      {
        name: 'Jane Doe',
        phone: '555-987-6543',
        email: 'jane.doe@example.com',
        address: '456 Oak Ave',
        city: 'Somewhere',
        state: 'TX',
        zip: '75001',
        property_type: 'multi_family',
        bedrooms: '4',
        bathrooms: '3',
        square_feet: '2200',
        estimated_value: '450000',
        asking_price: '475000',
        source: 'referral',
        status: 'contacted',
        priority: 'high',
        tags: 'investment property, good cash flow',
        notes: 'Great investment opportunity with existing tenants.',
      },
    ];
  }

  /**
   * Generate CSV content from template data
   */
  private generateCSVContent(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escapedValue = String(value).replace(/"/g, '""');
        return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }
}
