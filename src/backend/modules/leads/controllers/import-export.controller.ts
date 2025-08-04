import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { LeadImportExportService, ImportResult, ExportOptions } from '../services/lead-import-export.service';

export interface ImportRequestDto {
  updateExisting?: boolean;
  skipDuplicates?: boolean;
  fieldMapping?: Record<string, string>;
}

export interface ExportRequestDto {
  fields?: string[];
  filters?: Record<string, any>;
  format?: 'csv' | 'excel';
}

@Controller('leads/import-export')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LeadImportExportController {
  constructor(
    private readonly leadImportExportService: LeadImportExportService,
  ) {}

  /**
   * Import leads from CSV file
   */
  @Post('import')
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(
    @UploadedFile() file: Express.Multer.File,
    @Body() importOptions: ImportRequestDto,
    @TenantId() tenantId: string,
  ): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.mimetype.includes('text/csv')) {
      throw new BadRequestException('Invalid file type. Please upload a CSV file.');
    }

    // Validate CSV structure first
    const validation = await this.leadImportExportService.validateCsvStructure(file.buffer);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Invalid CSV structure',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    return await this.leadImportExportService.importFromCsv(
      file.buffer,
      tenantId,
      importOptions,
    );
  }

  /**
   * Export leads to CSV file
   */
  @Get('export')
  @Roles('admin', 'manager', 'user')
  async exportLeads(
    @Query() exportOptions: ExportRequestDto,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ): Promise<void> {
    const options: ExportOptions = {
      ...exportOptions,
      tenantId,
    };

    const result = await this.leadImportExportService.exportToCsv(options);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Export failed',
        errors: result.errors,
      });
    }

    if (result.recordCount === 0) {
      res.status(204).send();
      return;
    }

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads_export_${Date.now()}.csv"`);

    // Send file
    res.download(result.filePath!, `leads_export_${Date.now()}.csv`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  }

  /**
   * Get import template
   */
  @Get('template')
  @Roles('admin', 'manager', 'user')
  async getImportTemplate(@Res() res: Response): Promise<void> {
    const template = await this.leadImportExportService.getImportTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_import_template.csv"');
    res.send(template);
  }

  /**
   * Validate CSV file structure
   */
  @Post('validate')
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file'))
  async validateCsvFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.mimetype.includes('text/csv')) {
      throw new BadRequestException('Invalid file type. Please upload a CSV file.');
    }

    return await this.leadImportExportService.validateCsvStructure(file.buffer);
  }
} 