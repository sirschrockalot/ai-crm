import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeadImportExportService, ImportResult, ExportOptions, ExportResult } from './lead-import-export.service';
import { Lead } from '../schemas/lead.schema';
import { LeadValidationService } from './lead-validation.service';
import { Readable } from 'stream';

describe('LeadImportExportService', () => {
  let service: LeadImportExportService;
  let leadModel: Model<Lead>;
  let leadValidationService: LeadValidationService;

  const mockLeadModel = {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockLeadValidationService = {
    validateLead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadImportExportService,
        {
          provide: getModelToken(Lead.name),
          useValue: mockLeadModel,
        },
        {
          provide: LeadValidationService,
          useValue: mockLeadValidationService,
        },
      ],
    }).compile();

    service = module.get<LeadImportExportService>(LeadImportExportService);
    leadModel = module.get<Model<Lead>>(getModelToken(Lead.name));
    leadValidationService = module.get<LeadValidationService>(LeadValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('importFromCsv', () => {
    it('should successfully import valid CSV data', async () => {
      const csvData = `firstName,lastName,email,phone,status,source,priority
John,Doe,john.doe@example.com,555-123-4567,new,website,medium
Jane,Smith,jane.smith@example.com,555-987-6543,contacted,referral,high`;

      const fileBuffer = Buffer.from(csvData);
      const tenantId = 'tenant-123';

      mockLeadValidationService.validateLead.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      mockLeadModel.create.mockResolvedValue([
        { _id: 'lead-1', leadId: 'uuid-1' },
        { _id: 'lead-2', leadId: 'uuid-2' },
      ]);

      const result = await service.importFromCsv(fileBuffer, tenantId);

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(2);
      expect(result.importedRecords).toBe(2);
      expect(result.failedRecords).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle validation errors during import', async () => {
      const csvData = `firstName,lastName,email,phone,status,source,priority
John,Doe,invalid-email,555-123-4567,new,website,medium`;

      const fileBuffer = Buffer.from(csvData);
      const tenantId = 'tenant-123';

      mockLeadValidationService.validateLead.mockResolvedValue({
        isValid: false,
        errors: ['Invalid email format'],
        warnings: [],
      });

      const result = await service.importFromCsv(fileBuffer, tenantId);

      expect(result.success).toBe(false);
      expect(result.totalRecords).toBe(1);
      expect(result.importedRecords).toBe(0);
      expect(result.failedRecords).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid email format');
    });

    it('should handle large files efficiently', async () => {
      // Create a large CSV with 1000 records
      const records = [];
      for (let i = 0; i < 1000; i++) {
        records.push(`User${i},Last${i},user${i}@example.com,555-${i.toString().padStart(3, '0')}-0000,new,website,medium`);
      }
      const csvData = `firstName,lastName,email,phone,status,source,priority\n${records.join('\n')}`;
      const fileBuffer = Buffer.from(csvData);
      const tenantId = 'tenant-123';

      mockLeadValidationService.validateLead.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      mockLeadModel.create.mockResolvedValue(Array(1000).fill({ _id: 'lead-1', leadId: 'uuid-1' }));

      const startTime = Date.now();
      const result = await service.importFromCsv(fileBuffer, tenantId);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(1000);
      expect(result.importedRecords).toBe(1000);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should support field mapping', async () => {
      const csvData = `first_name,last_name,email_address,phone_number,lead_status,lead_source,priority_level
John,Doe,john.doe@example.com,555-123-4567,new,website,medium`;

      const fileBuffer = Buffer.from(csvData);
      const tenantId = 'tenant-123';
      const fieldMapping = {
        first_name: 'firstName',
        last_name: 'lastName',
        email_address: 'email',
        phone_number: 'phone',
        lead_status: 'status',
        lead_source: 'source',
        priority_level: 'priority',
      };

      mockLeadValidationService.validateLead.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      mockLeadModel.create.mockResolvedValue([{ _id: 'lead-1', leadId: 'uuid-1' }]);

      const result = await service.importFromCsv(fileBuffer, tenantId, { fieldMapping });

      expect(result.success).toBe(true);
      expect(result.importedRecords).toBe(1);
    });

    it('should handle duplicate detection when skipDuplicates is true', async () => {
      const csvData = `firstName,lastName,email,phone,status,source,priority
John,Doe,john.doe@example.com,555-123-4567,new,website,medium`;

      const fileBuffer = Buffer.from(csvData);
      const tenantId = 'tenant-123';

      mockLeadValidationService.validateLead.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      // Mock finding existing lead
      mockLeadModel.findOne.mockResolvedValue({ _id: 'existing-lead' });

      const result = await service.importFromCsv(fileBuffer, tenantId, { skipDuplicates: true });

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(1);
      expect(result.importedRecords).toBe(0);
      expect(result.warnings).toContain('Skipped duplicate lead: john.doe@example.com');
    });
  });

  describe('exportToCsv', () => {
    it('should export leads to CSV format', async () => {
      const mockLeads = [
        {
          _id: 'lead-1',
          leadId: 'uuid-1',
          contactInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
          },
          status: 'new',
          source: 'website',
          priority: 'medium',
          createdAt: new Date('2023-01-01'),
        },
        {
          _id: 'lead-2',
          leadId: 'uuid-2',
          contactInfo: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '555-987-6543',
          },
          status: 'contacted',
          source: 'referral',
          priority: 'high',
          createdAt: new Date('2023-01-02'),
        },
      ];

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeads),
      });

      const options: ExportOptions = {
        tenantId: 'tenant-123',
        fields: ['firstName', 'lastName', 'email', 'phone', 'status', 'source', 'priority'],
      };

      const result = await service.exportToCsv(options);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(2);
      expect(result.filePath).toBeDefined();
    });

    it('should support custom field selection', async () => {
      const mockLeads = [
        {
          _id: 'lead-1',
          leadId: 'uuid-1',
          contactInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
          },
          status: 'new',
          source: 'website',
        },
      ];

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeads),
      });

      const options: ExportOptions = {
        tenantId: 'tenant-123',
        fields: ['firstName', 'lastName', 'email'],
      };

      const result = await service.exportToCsv(options);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(1);
    });

    it('should handle empty result set', async () => {
      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const options: ExportOptions = {
        tenantId: 'tenant-123',
      };

      const result = await service.exportToCsv(options);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(0);
    });

    it('should apply filters correctly', async () => {
      const mockLeads = [
        {
          _id: 'lead-1',
          leadId: 'uuid-1',
          status: 'new',
          contactInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-123-4567',
          },
        },
      ];

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLeads),
      });

      const options: ExportOptions = {
        tenantId: 'tenant-123',
        filters: { status: 'new' },
      };

      const result = await service.exportToCsv(options);

      expect(result.success).toBe(true);
      expect(mockLeadModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-123',
          status: 'new',
        })
      );
    });
  });

  describe('getImportTemplate', () => {
    it('should return CSV template with headers', async () => {
      const template = await service.getImportTemplate();

      expect(template).toContain('firstName');
      expect(template).toContain('lastName');
      expect(template).toContain('email');
      expect(template).toContain('phone');
      expect(template).toContain('status');
      expect(template).toContain('source');
      expect(template).toContain('priority');
    });
  });

  describe('validateCsvStructure', () => {
    it('should validate correct CSV structure', async () => {
      const csvData = `firstName,lastName,email,phone,status,source,priority
John,Doe,john.doe@example.com,555-123-4567,new,website,medium`;

      const fileBuffer = Buffer.from(csvData);

      const result = await service.validateCsvStructure(fileBuffer);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', async () => {
      const csvData = `firstName,lastName,email
John,Doe,john.doe@example.com`;

      const fileBuffer = Buffer.from(csvData);

      const result = await service.validateCsvStructure(fileBuffer);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: phone');
    });

    it('should detect invalid CSV format', async () => {
      const invalidData = `This is not CSV data
It has no proper structure`;

      const fileBuffer = Buffer.from(invalidData);

      const result = await service.validateCsvStructure(fileBuffer);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('field normalization', () => {
    it('should normalize phone numbers', () => {
      const serviceInstance = service as any;
      
      expect(serviceInstance.normalizePhoneNumber('(555) 123-4567')).toBe('5551234567');
      expect(serviceInstance.normalizePhoneNumber('555.123.4567')).toBe('5551234567');
      expect(serviceInstance.normalizePhoneNumber('555 123 4567')).toBe('5551234567');
    });

    it('should normalize priority values', () => {
      const serviceInstance = service as any;
      
      expect(serviceInstance.normalizePriority('HIGH')).toBe('high');
      expect(serviceInstance.normalizePriority('Medium')).toBe('medium');
      expect(serviceInstance.normalizePriority('low')).toBe('low');
    });

    it('should normalize status values', () => {
      const serviceInstance = service as any;
      
      expect(serviceInstance.normalizeStatus('NEW')).toBe('new');
      expect(serviceInstance.normalizeStatus('Contacted')).toBe('contacted');
      expect(serviceInstance.normalizeStatus('closed_won')).toBe('closed_won');
    });
  });
}); 