import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { BulkOperationsService, BulkOperationRequest, BulkOperationResult } from './bulk-operations.service';
import { Lead } from '../schemas/lead.schema';

describe('BulkOperationsService', () => {
  let service: BulkOperationsService;
  let leadModel: Model<Lead>;

  const mockLeadModel = {
    find: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkOperationsService,
        {
          provide: getModelToken(Lead.name),
          useValue: mockLeadModel,
        },
      ],
    }).compile();

    service = module.get<BulkOperationsService>(BulkOperationsService);
    leadModel = module.get<Model<Lead>>(getModelToken(Lead.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeBulkOperation', () => {
    it('should execute bulk update operation successfully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
        operation: 'update',
        data: { status: 'contacted', priority: 'high' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(3);
      expect(result.processedRecords).toBe(3);
      expect(result.failedRecords).toBe(0);
      expect(result.operationId).toBeDefined();
      expect(result.progress).toBe(100);
      expect(result.canUndo).toBe(true);
    });

    it('should execute bulk delete operation successfully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2'],
        operation: 'delete',
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(2);
      expect(result.processedRecords).toBe(2);
      expect(result.failedRecords).toBe(0);
      expect(result.canUndo).toBe(false); // Deletes cannot be undone
    });

    it('should execute bulk assign operation successfully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
        operation: 'assign',
        data: { assignedTo: 'user-456' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(3);
      expect(result.processedRecords).toBe(3);
      expect(result.failedRecords).toBe(0);
      expect(result.canUndo).toBe(true);
    });

    it('should execute bulk status change operation successfully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2'],
        operation: 'changeStatus',
        data: { status: 'qualified' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(2);
      expect(result.processedRecords).toBe(2);
      expect(result.failedRecords).toBe(0);
      expect(result.canUndo).toBe(true);
    });

    it('should execute bulk stage change operation successfully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
        operation: 'changeStage',
        data: { stageId: 'stage-456' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(3);
      expect(result.processedRecords).toBe(3);
      expect(result.failedRecords).toBe(0);
      expect(result.canUndo).toBe(true);
    });

    it('should handle operation failures gracefully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2'],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockRejectedValue(new Error('Database error'));

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(false);
      expect(result.totalRecords).toBe(2);
      expect(result.processedRecords).toBe(0);
      expect(result.failedRecords).toBe(2);
      expect(result.errors.length).toBe(2);
    });

    it('should validate operation request', async () => {
      const invalidRequest = {
        leadIds: [],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      } as BulkOperationRequest;

      await expect(service.executeBulkOperation(invalidRequest)).rejects.toThrow(
        new BadRequestException('No lead IDs provided')
      );
    });

    it('should limit operation size', async () => {
      const largeRequest = {
        leadIds: Array.from({ length: 1001 }, (_, i) => `lead-${i}`),
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      } as BulkOperationRequest;

      await expect(service.executeBulkOperation(largeRequest)).rejects.toThrow(
        new BadRequestException('Maximum 1000 leads can be processed in a single operation')
      );
    });
  });

  describe('undoBulkOperation', () => {
    it('should undo a completed operation successfully', async () => {
      // First execute an operation
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2'],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.find.mockResolvedValue([
        { _id: 'lead-1', status: 'new', assignedTo: 'user-123' },
        { _id: 'lead-2', status: 'new', assignedTo: 'user-123' },
      ]);
      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const result = await service.executeBulkOperation(request);
      const operationId = result.operationId!;

      // Now undo the operation
      mockLeadModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const undoResult = await service.undoBulkOperation(operationId, 'user-123');

      expect(undoResult.success).toBe(true);
      expect(undoResult.totalRecords).toBe(2);
      expect(undoResult.processedRecords).toBe(2);
      expect(undoResult.failedRecords).toBe(0);
      expect(undoResult.operationId).toBeDefined();
      expect(undoResult.operationId).not.toBe(operationId);
    });

    it('should reject undo for non-existent operation', async () => {
      await expect(service.undoBulkOperation('non-existent', 'user-123')).rejects.toThrow(
        new BadRequestException('Operation not found')
      );
    });

    it('should reject undo for delete operations', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1'],
        operation: 'delete',
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.executeBulkOperation(request);
      const operationId = result.operationId!;

      await expect(service.undoBulkOperation(operationId, 'user-123')).rejects.toThrow(
        new BadRequestException('This operation cannot be undone')
      );
    });
  });

  describe('getOperationProgress', () => {
    it('should return operation progress', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2'],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.find.mockResolvedValue([
        { _id: 'lead-1', status: 'new' },
        { _id: 'lead-2', status: 'new' },
      ]);
      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const result = await service.executeBulkOperation(request);
      const operationId = result.operationId!;

      const progress = await service.getOperationProgress(operationId);

      expect(progress).toBeDefined();
      expect(progress!.operationId).toBe(operationId);
      expect(progress!.status).toBe('completed');
      expect(progress!.progress).toBe(100);
      expect(progress!.totalRecords).toBe(2);
      expect(progress!.processedRecords).toBe(2);
    });

    it('should return null for non-existent operation', async () => {
      const progress = await service.getOperationProgress('non-existent');
      expect(progress).toBeNull();
    });
  });

  describe('getOperationHistory', () => {
    it('should return operation history for tenant', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1'],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.find.mockResolvedValue([
        { _id: 'lead-1', status: 'new' },
      ]);
      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      await service.executeBulkOperation(request);

      const history = await service.getOperationHistory('tenant-123');

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].tenantId).toBe('tenant-123');
      expect(history[0].operation).toBe('update');
    });

    it('should filter history by tenant', async () => {
      const history = await service.getOperationHistory('different-tenant');
      expect(history).toEqual([]);
    });
  });

  describe('getBulkOperationStats', () => {
    it('should return operation statistics', async () => {
      const mockLeads = [
        { _id: 'lead-1', status: 'new', stageId: 'stage-1' },
        { _id: 'lead-2', status: 'contacted', stageId: 'stage-2' },
        { _id: 'lead-3', status: 'new', stageId: 'stage-1' },
      ];

      mockLeadModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockLeads),
      });

      const stats = await service.getBulkOperationStats(['lead-1', 'lead-2', 'lead-3'], 'tenant-123');

      expect(stats.totalLeads).toBe(3);
      expect(stats.validLeads).toBe(3);
      expect(stats.invalidLeads).toBe(0);
      expect(stats.leadStatuses).toEqual({
        new: 2,
        contacted: 1,
      });
      expect(stats.leadStages).toEqual({
        'stage-1': 2,
        'stage-2': 1,
      });
    });
  });

  describe('validateLeadIds', () => {
    it('should validate lead IDs correctly', async () => {
      const mockLeads = [
        { _id: 'lead-1' },
        { _id: 'lead-2' },
      ];

      mockLeadModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockLeads),
      });

      const validation = await service.validateLeadIds(['lead-1', 'lead-2', 'lead-3'], 'tenant-123');

      expect(validation.validIds).toEqual(['lead-1', 'lead-2']);
      expect(validation.invalidIds).toEqual(['lead-3']);
    });
  });

  describe('batch processing', () => {
    it('should process large operations in batches', async () => {
      const request: BulkOperationRequest = {
        leadIds: Array.from({ length: 150 }, (_, i) => `lead-${i}`),
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockResolvedValue({ modifiedCount: 50 });

      const result = await service.executeBulkOperation(request);

      expect(result.totalRecords).toBe(150);
      expect(result.processedRecords).toBe(150);
      expect(mockLeadModel.updateMany).toHaveBeenCalledTimes(3); // 150 / 50 = 3 batches
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2'],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      mockLeadModel.updateMany.mockRejectedValue(new Error('Connection timeout'));

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(false);
      expect(result.failedRecords).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0].message).toContain('Connection timeout');
    });

    it('should handle partial failures', async () => {
      const request: BulkOperationRequest = {
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
        operation: 'update',
        data: { status: 'contacted' },
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      // First batch succeeds, second batch fails
      mockLeadModel.updateMany
        .mockResolvedValueOnce({ modifiedCount: 2 })
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await service.executeBulkOperation(request);

      expect(result.success).toBe(false);
      expect(result.processedRecords).toBe(2);
      expect(result.failedRecords).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });
}); 