import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeadValidationService, ValidationResult, DataQualityMetrics, DuplicateDetectionResult } from './lead-validation.service';
import { Lead, LeadStatus, LeadSource, LeadPriority, PropertyType, TransactionType } from '../schemas/lead.schema';
import { CreateLeadDto } from '../dto/lead.dto';

describe('LeadValidationService', () => {
  let service: LeadValidationService;
  let leadModel: Model<Lead>;

  const mockLeadModel = {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadValidationService,
        {
          provide: getModelToken(Lead.name),
          useValue: mockLeadModel,
        },
      ],
    }).compile();

    service = module.get<LeadValidationService>(LeadValidationService);
    leadModel = module.get<Model<Lead>>(getModelToken(Lead.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateLead', () => {
    it('should validate valid lead data successfully', async () => {
      const validLeadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          preferredContactMethod: 'email',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
      };

      const result = await service.validateCreateLead(validLeadData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', async () => {
      const invalidLeadData: CreateLeadDto = {
        contactInfo: {
          firstName: '',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
      };

      const result = await service.validateCreateLead(invalidLeadData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'contactInfo.firstName')).toBe(true);
      expect(result.errors.some(e => e.field === 'contactInfo.email')).toBe(true);
      expect(result.errors.some(e => e.field === 'contactInfo.phone')).toBe(true);
    });

    it('should validate email format correctly', async () => {
      const leadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email-format',
          phone: '555-123-4567',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
      };

      const result = await service.validateCreateLead(leadData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_EMAIL')).toBe(true);
    });

    it('should validate phone number format correctly', async () => {
      const leadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: 'invalid-phone',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
      };

      const result = await service.validateCreateLead(leadData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PHONE')).toBe(true);
    });
  });

  describe('validateUpdateLead', () => {
    it('should validate partial updates correctly', async () => {
      const updateData = {
        contactInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '555-987-6543',
        },
      };

      const result = await service.validateUpdateLead(updateData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate status transitions correctly', () => {
      const result = service.validateStatusTransition(LeadStatus.NEW, LeadStatus.CONTACTED);
      expect(result.isValid).toBe(true);

      const invalidResult = service.validateStatusTransition(LeadStatus.NEW, LeadStatus.CLOSED_WON);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('normalizeCompanyName', () => {
    it('should normalize company names correctly', () => {
      expect(service.normalizeCompanyName('ACME Corp Inc')).toBe('acme');
      expect(service.normalizeCompanyName('Tech Solutions LLC')).toBe('tech solutions');
      expect(service.normalizeCompanyName('Global Industries Ltd')).toBe('global industries');
      expect(service.normalizeCompanyName('  Test Company  ')).toBe('test company');
    });

    it('should handle empty or null company names', () => {
      expect(service.normalizeCompanyName('')).toBe('');
      expect(service.normalizeCompanyName(null as any)).toBe('');
      expect(service.normalizeCompanyName(undefined as any)).toBe('');
    });
  });

  describe('detectDuplicates', () => {
    it('should detect duplicates by email', async () => {
      const leadData = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
      };

      const mockExistingLead = {
        _id: 'existing-lead-id',
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
      };

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockExistingLead]),
      });

      const result = await service.detectDuplicates(leadData, 'tenant-123');

      expect(result.isDuplicate).toBe(true);
      expect(result.duplicateLeads).toHaveLength(1);
      expect(result.confidence).toBe(0.9);
      expect(result.matchCriteria).toContain('email');
    });

    it('should detect duplicates by phone number', async () => {
      const leadData = {
        contactInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '555-987-6543',
        },
      };

      const mockExistingLead = {
        _id: 'existing-lead-id',
        contactInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'different@example.com',
          phone: '555-987-6543',
        },
      };

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockExistingLead]),
      });

      const result = await service.detectDuplicates(leadData, 'tenant-123');

      expect(result.isDuplicate).toBe(true);
      expect(result.confidence).toBe(0.8);
      expect(result.matchCriteria).toContain('phone');
    });

    it('should not detect duplicates when no matches found', async () => {
      const leadData = {
        contactInfo: {
          firstName: 'New',
          lastName: 'Lead',
          email: 'new.lead@example.com',
          phone: '555-111-2222',
        },
      };

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.detectDuplicates(leadData, 'tenant-123');

      expect(result.isDuplicate).toBe(false);
      expect(result.duplicateLeads).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('cleanseLeadData', () => {
    it('should clean and normalize lead data correctly', () => {
      const rawData = {
        contactInfo: {
          firstName: '  john  ',
          lastName: '  DOE  ',
          email: '  JOHN.DOE@EXAMPLE.COM  ',
          phone: '5551234567',
          address: {
            street: '  123 Main St  ',
            city: '  new york  ',
            state: '  ny  ',
            zipCode: '  10001  ',
          },
        },
        status: 'NEW',
        priority: 'HIGH',
        source: 'WEBSITE',
      };

      const cleansed = service.cleanseLeadData(rawData);

      expect(cleansed.contactInfo.firstName).toBe('John');
      expect(cleansed.contactInfo.lastName).toBe('Doe');
      expect(cleansed.contactInfo.email).toBe('john.doe@example.com');
      expect(cleansed.contactInfo.phone).toBe('(555) 123-4567');
      expect(cleansed.contactInfo.address.street).toBe('123 Main St');
      expect(cleansed.contactInfo.address.city).toBe('New York');
      expect(cleansed.contactInfo.address.state).toBe('NY');
      expect(cleansed.contactInfo.address.zipCode).toBe('10001');
      expect(cleansed.status).toBe('new');
      expect(cleansed.priority).toBe('high');
      expect(cleansed.source).toBe('website');
    });
  });

  describe('calculateDataQualityMetrics', () => {
    it('should calculate quality metrics correctly', () => {
      const leadData = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
          },
        },
        status: 'new',
        source: 'website',
        priority: 'medium',
        // Missing fields
        propertyPreferences: null,
        financialInfo: undefined,
      };

      const metrics = service.calculateDataQualityMetrics(leadData);

      expect(metrics.totalFields).toBeGreaterThan(0);
      expect(metrics.validFields).toBeGreaterThan(0);
      expect(metrics.invalidFields).toBeGreaterThan(0);
      expect(metrics.qualityScore).toBeGreaterThan(0);
      expect(metrics.qualityScore).toBeLessThanOrEqual(100);
      expect(metrics.normalizedFields).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty data', () => {
      const metrics = service.calculateDataQualityMetrics({});

      expect(metrics.totalFields).toBe(0);
      expect(metrics.validFields).toBe(0);
      expect(metrics.invalidFields).toBe(0);
      expect(metrics.qualityScore).toBe(0);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate comprehensive validation report', async () => {
      const leadData = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
      };

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const report = await service.generateValidationReport(leadData, 'tenant-123');

      expect(report.validationResult).toBeDefined();
      expect(report.duplicateResult).toBeDefined();
      expect(report.qualityMetrics).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should include recommendations for validation errors', async () => {
      const invalidLeadData = {
        contactInfo: {
          firstName: '',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
      };

      mockLeadModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const report = await service.generateValidationReport(invalidLeadData, 'tenant-123');

      expect(report.recommendations.some(r => r.includes('Fix validation errors'))).toBe(true);
    });
  });

  describe('validateLeadSource', () => {
    it('should validate valid lead sources', () => {
      const result = service.validateLeadSource(LeadSource.WEBSITE);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid lead sources', () => {
      const result = service.validateLeadSource('invalid_source' as LeadSource);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_SOURCE');
    });
  });

  describe('validateLeadPriority', () => {
    it('should validate valid lead priorities', () => {
      const result = service.validateLeadPriority(LeadPriority.HIGH);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid lead priorities', () => {
      const result = service.validateLeadPriority('invalid_priority' as LeadPriority);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_PRIORITY');
    });
  });

  describe('validatePropertyPreferences', () => {
    it('should validate valid property types', async () => {
      const leadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
        propertyPreferences: {
          propertyType: [PropertyType.SINGLE_FAMILY],
          transactionType: TransactionType.BUY,
          preferredLocations: ['New York'],
          mustHaveFeatures: [],
          niceToHaveFeatures: [],
          dealBreakers: [],
        },
      };

      const result = await service.validateCreateLead(leadData);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid property types', async () => {
      const leadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
        propertyPreferences: {
          propertyType: ['invalid_type' as PropertyType],
          transactionType: TransactionType.BUY,
          preferredLocations: ['New York'],
          mustHaveFeatures: [],
          niceToHaveFeatures: [],
          dealBreakers: [],
        },
      };

      const result = await service.validateCreateLead(leadData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PROPERTY_TYPE')).toBe(true);
    });
  });

  describe('validateFinancialInfo', () => {
    it('should validate valid financial information', async () => {
      const leadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
        financialInfo: {
          preApproved: true,
          preApprovalAmount: 500000,
          employmentStatus: 'employed',
          creditScore: 750,
          loanType: 'conventional',
        },
      };

      const result = await service.validateCreateLead(leadData);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid credit scores', async () => {
      const leadData: CreateLeadDto = {
        contactInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
        },
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
        assignedTo: 'user-id',
        financialInfo: {
          creditScore: 200, // Invalid credit score
        },
      };

      const result = await service.validateCreateLead(leadData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_CREDIT_SCORE')).toBe(true);
    });
  });
}); 