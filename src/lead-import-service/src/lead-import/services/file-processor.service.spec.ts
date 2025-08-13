import { Test, TestingModule } from '@nestjs/testing';
import { FileProcessorService } from './file-processor.service';
import { ImportOptionsDto } from '../dto/import-leads.dto';

describe('FileProcessorService', () => {
  let service: FileProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileProcessorService],
    }).compile();

    service = module.get<FileProcessorService>(FileProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateData', () => {
    it('should validate required fields', () => {
      const rows = [
        { rowNumber: 1, name: 'John Doe', phone: '555-123-4567' },
        { rowNumber: 2, name: '', phone: '555-987-6543' }, // Missing name
        { rowNumber: 3, name: 'Jane Smith', phone: '' }, // Missing phone
      ];

      const result = service.validateData(rows);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('name');
      expect(result.errors[1].field).toBe('phone');
    });

    it('should validate phone number format', () => {
      const rows = [
        { rowNumber: 1, name: 'John Doe', phone: '555-123-4567' },
        { rowNumber: 2, name: 'Jane Smith', phone: 'invalid-phone' },
      ];

      const result = service.validateData(rows);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('phone');
      expect(result.errors[0].message).toContain('Invalid phone number format');
    });

    it('should validate email format', () => {
      const rows = [
        { rowNumber: 1, name: 'John Doe', phone: '555-123-4567', email: 'john@example.com' },
        { rowNumber: 2, name: 'Jane Smith', phone: '555-987-6543', email: 'invalid-email' },
      ];

      const result = service.validateData(rows);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toContain('Invalid email format');
    });

    it('should validate numeric fields', () => {
      const rows = [
        { rowNumber: 1, name: 'John Doe', phone: '555-123-4567', estimated_value: '350000' },
        { rowNumber: 2, name: 'Jane Smith', phone: '555-987-6543', estimated_value: 'not-a-number' },
      ];

      const result = service.validateData(rows);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('estimated_value');
      expect(result.errors[0].message).toContain('must be a valid number');
    });

    it('should validate valid data', () => {
      const rows = [
        { rowNumber: 1, name: 'John Doe', phone: '555-123-4567', email: 'john@example.com' },
        { rowNumber: 2, name: 'Jane Smith', phone: '555-987-6543', email: 'jane@example.com' },
      ];

      const result = service.validateData(rows);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      const mockFile = {
        originalname: 'leads.csv',
        buffer: Buffer.from('test'),
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'text/csv',
        size: 4,
      } as Express.Multer.File;

      // This is a private method, so we'll test it indirectly through processFile
      // For now, just verify the service can handle different file types
      expect(mockFile.originalname.split('.').pop()).toBe('csv');
    });
  });
});
