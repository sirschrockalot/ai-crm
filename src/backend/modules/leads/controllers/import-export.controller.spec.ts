import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LeadImportExportController } from './import-export.controller';
import { LeadImportExportService } from '../services/lead-import-export.service';

describe('LeadImportExportController', () => {
  let controller: LeadImportExportController;
  let service: LeadImportExportService;

  const mockLeadImportExportService = {
    importFromCsv: jest.fn(),
    exportToCsv: jest.fn(),
    getImportTemplate: jest.fn(),
    validateCsvStructure: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadImportExportController],
      providers: [
        {
          provide: LeadImportExportService,
          useValue: mockLeadImportExportService,
        },
      ],
    }).compile();

    controller = module.get<LeadImportExportController>(LeadImportExportController);
    service = module.get<LeadImportExportService>(LeadImportExportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('importLeads', () => {
    it('should successfully import leads from CSV file', async () => {
      const mockFile = {
        buffer: Buffer.from('firstName,lastName,email,phone\nJohn,Doe,john@example.com,555-123-4567'),
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockImportOptions = {
        updateExisting: false,
        skipDuplicates: true,
      };

      const mockValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      const mockImportResult = {
        success: true,
        totalRecords: 1,
        importedRecords: 1,
        failedRecords: 0,
        errors: [],
        warnings: [],
      };

      mockLeadImportExportService.validateCsvStructure.mockResolvedValue(mockValidationResult);
      mockLeadImportExportService.importFromCsv.mockResolvedValue(mockImportResult);

      const result = await controller.importLeads(mockFile, mockImportOptions, 'tenant-123');

      expect(result).toEqual(mockImportResult);
      expect(mockLeadImportExportService.validateCsvStructure).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockLeadImportExportService.importFromCsv).toHaveBeenCalledWith(
        mockFile.buffer,
        'tenant-123',
        mockImportOptions
      );
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      await expect(controller.importLeads(null, {}, 'tenant-123')).rejects.toThrow(
        new BadRequestException('No file uploaded')
      );
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'application/json',
      } as Express.Multer.File;

      await expect(controller.importLeads(mockFile, {}, 'tenant-123')).rejects.toThrow(
        new BadRequestException('Invalid file type. Please upload a CSV file.')
      );
    });

    it('should throw BadRequestException when CSV validation fails', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid,csv,data'),
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockValidationResult = {
        isValid: false,
        errors: ['Missing required field: email'],
        warnings: [],
      };

      mockLeadImportExportService.validateCsvStructure.mockResolvedValue(mockValidationResult);

      await expect(controller.importLeads(mockFile, {}, 'tenant-123')).rejects.toThrow(
        new BadRequestException({
          message: 'Invalid CSV structure',
          errors: ['Missing required field: email'],
          warnings: [],
        })
      );
    });
  });

  describe('exportLeads', () => {
    it('should successfully export leads to CSV', async () => {
      const mockExportOptions = {
        fields: ['firstName', 'lastName', 'email'],
        format: 'csv' as const,
      };

      const mockExportResult = {
        success: true,
        filePath: '/tmp/leads_export.csv',
        recordCount: 10,
      };

      mockLeadImportExportService.exportToCsv.mockResolvedValue(mockExportResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        setHeader: jest.fn(),
        download: jest.fn(),
      };

      await controller.exportLeads(mockExportOptions, 'tenant-123', mockResponse as any);

      expect(mockLeadImportExportService.exportToCsv).toHaveBeenCalledWith({
        ...mockExportOptions,
        tenantId: 'tenant-123',
      });
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename="leads_export_')
      );
    });

    it('should handle export failure', async () => {
      const mockExportOptions = {
        fields: ['firstName', 'lastName', 'email'],
      };

      const mockExportResult = {
        success: false,
        errors: ['Export failed'],
      };

      mockLeadImportExportService.exportToCsv.mockResolvedValue(mockExportResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        setHeader: jest.fn(),
        download: jest.fn(),
      };

      await expect(
        controller.exportLeads(mockExportOptions, 'tenant-123', mockResponse as any)
      ).rejects.toThrow(
        new BadRequestException({
          message: 'Export failed',
          errors: ['Export failed'],
        })
      );
    });

    it('should return 204 when no records to export', async () => {
      const mockExportOptions = {};

      const mockExportResult = {
        success: true,
        recordCount: 0,
      };

      mockLeadImportExportService.exportToCsv.mockResolvedValue(mockExportResult);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        setHeader: jest.fn(),
        download: jest.fn(),
      };

      await controller.exportLeads(mockExportOptions, 'tenant-123', mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('getImportTemplate', () => {
    it('should return CSV template', async () => {
      const mockTemplate = 'firstName,lastName,email,phone,status,source,priority\n';

      mockLeadImportExportService.getImportTemplate.mockResolvedValue(mockTemplate);

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.getImportTemplate(mockResponse as any);

      expect(mockLeadImportExportService.getImportTemplate).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="leads_import_template.csv"'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockTemplate);
    });
  });

  describe('validateCsvFile', () => {
    it('should validate CSV file structure', async () => {
      const mockFile = {
        buffer: Buffer.from('firstName,lastName,email,phone\nJohn,Doe,john@example.com,555-123-4567'),
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      mockLeadImportExportService.validateCsvStructure.mockResolvedValue(mockValidationResult);

      const result = await controller.validateCsvFile(mockFile);

      expect(result).toEqual(mockValidationResult);
      expect(mockLeadImportExportService.validateCsvStructure).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should throw BadRequestException when no file is uploaded for validation', async () => {
      await expect(controller.validateCsvFile(null)).rejects.toThrow(
        new BadRequestException('No file uploaded')
      );
    });

    it('should throw BadRequestException for invalid file type during validation', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'application/json',
      } as Express.Multer.File;

      await expect(controller.validateCsvFile(mockFile)).rejects.toThrow(
        new BadRequestException('Invalid file type. Please upload a CSV file.')
      );
    });
  });
}); 