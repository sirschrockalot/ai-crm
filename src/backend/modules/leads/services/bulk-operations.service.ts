import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../schemas/lead.schema';

export interface BulkOperationRequest {
  leadIds: string[];
  operation: 'update' | 'delete' | 'assign' | 'changeStatus' | 'changeStage';
  data?: Record<string, any>;
  tenantId: string;
  userId: string;
}

export interface BulkOperationResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors: BulkOperationError[];
  warnings: string[];
  operationId?: string;
  progress?: number;
  canUndo?: boolean;
  undoOperationId?: string;
}

export interface BulkOperationError {
  leadId: string;
  operation: string;
  message: string;
  data?: any;
}

export interface BulkOperationLog {
  operationId: string;
  tenantId: string;
  userId: string;
  operation: string;
  leadIds: string[];
  data?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'undone';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors: BulkOperationError[];
  warnings: string[];
  createdAt: Date;
  completedAt?: Date;
  undoOperationId?: string;
  originalData?: Record<string, any>[];
}

@Injectable()
export class BulkOperationsService {
  private readonly logger = new Logger(BulkOperationsService.name);
  private operationLogs: Map<string, BulkOperationLog> = new Map();

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {}

  /**
   * Execute bulk operation on leads
   */
  async executeBulkOperation(request: BulkOperationRequest): Promise<BulkOperationResult> {
    const operationId = this.generateOperationId();
    
    const result: BulkOperationResult = {
      success: false,
      totalRecords: request.leadIds.length,
      processedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      operationId,
      progress: 0,
      canUndo: false,
    };

    // Create operation log
    const operationLog: BulkOperationLog = {
      operationId,
      tenantId: request.tenantId,
      userId: request.userId,
      operation: request.operation,
      leadIds: request.leadIds,
      data: request.data,
      status: 'pending',
      progress: 0,
      totalRecords: request.leadIds.length,
      processedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      createdAt: new Date(),
    };

    this.operationLogs.set(operationId, operationLog);

    try {
      // Validate operation
      this.validateBulkOperation(request);

      // Store original data for undo functionality
      const originalData = await this.getOriginalData(request.leadIds, request.tenantId);
      operationLog.originalData = originalData;
      operationLog.status = 'in_progress';

      // Execute operation based on type
      switch (request.operation) {
        case 'update':
          await this.bulkUpdate(request, result, operationId);
          break;
        case 'delete':
          await this.bulkDelete(request, result, operationId);
          break;
        case 'assign':
          await this.bulkAssign(request, result, operationId);
          break;
        case 'changeStatus':
          await this.bulkChangeStatus(request, result, operationId);
          break;
        case 'changeStage':
          await this.bulkChangeStage(request, result, operationId);
          break;
        default:
          throw new BadRequestException(`Invalid operation: ${request.operation}`);
      }

      result.success = result.failedRecords === 0;
      result.canUndo = request.operation !== 'delete'; // Can't undo deletes
      result.progress = 100;

      // Update operation log
      operationLog.status = result.success ? 'completed' : 'failed';
      operationLog.progress = 100;
      operationLog.processedRecords = result.processedRecords;
      operationLog.failedRecords = result.failedRecords;
      operationLog.errors = result.errors;
      operationLog.warnings = result.warnings;
      operationLog.completedAt = new Date();

      this.logger.log(`Bulk operation ${operationId} completed: ${result.processedRecords}/${result.totalRecords} records processed`);

      return result;
    } catch (error) {
      this.logger.error(`Bulk operation ${operationId} failed:`, error);
      
      // Update operation log
      operationLog.status = 'failed';
      operationLog.errors.push({
        leadId: 'system',
        operation: request.operation,
        message: error.message,
      });

      throw new BadRequestException(`Bulk operation failed: ${error.message}`);
    }
  }

  /**
   * Undo a bulk operation
   */
  async undoBulkOperation(operationId: string, userId: string): Promise<BulkOperationResult> {
    const operationLog = this.operationLogs.get(operationId);
    
    if (!operationLog) {
      throw new BadRequestException('Operation not found');
    }

    if (operationLog.status !== 'completed') {
      throw new BadRequestException('Only completed operations can be undone');
    }

    if (!operationLog.canUndo) {
      throw new BadRequestException('This operation cannot be undone');
    }

    const undoOperationId = this.generateOperationId();
    
    const result: BulkOperationResult = {
      success: false,
      totalRecords: operationLog.leadIds.length,
      processedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      operationId: undoOperationId,
      progress: 0,
      canUndo: false,
    };

    try {
      // Create undo operation log
      const undoLog: BulkOperationLog = {
        operationId: undoOperationId,
        tenantId: operationLog.tenantId,
        userId,
        operation: `undo_${operationLog.operation}`,
        leadIds: operationLog.leadIds,
        data: operationLog.originalData,
        status: 'in_progress',
        progress: 0,
        totalRecords: operationLog.leadIds.length,
        processedRecords: 0,
        failedRecords: 0,
        errors: [],
        warnings: [],
        createdAt: new Date(),
      };

      this.operationLogs.set(undoOperationId, undoLog);

      // Restore original data
      await this.restoreOriginalData(operationLog.leadIds, operationLog.originalData, operationLog.tenantId, result, undoOperationId);

      result.success = result.failedRecords === 0;
      result.progress = 100;

      // Update undo operation log
      undoLog.status = result.success ? 'completed' : 'failed';
      undoLog.progress = 100;
      undoLog.processedRecords = result.processedRecords;
      undoLog.failedRecords = result.failedRecords;
      undoLog.errors = result.errors;
      undoLog.warnings = result.warnings;
      undoLog.completedAt = new Date();

      // Mark original operation as undone
      operationLog.status = 'undone';
      operationLog.undoOperationId = undoOperationId;

      this.logger.log(`Undo operation ${undoOperationId} completed: ${result.processedRecords}/${result.totalRecords} records restored`);

      return result;
    } catch (error) {
      this.logger.error(`Undo operation ${undoOperationId} failed:`, error);
      throw new BadRequestException(`Undo operation failed: ${error.message}`);
    }
  }

  /**
   * Get operation progress
   */
  async getOperationProgress(operationId: string): Promise<{
    operationId: string;
    status: string;
    progress: number;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    errors: BulkOperationError[];
    warnings: string[];
  } | null> {
    const operationLog = this.operationLogs.get(operationId);
    
    if (!operationLog) {
      return null;
    }

    return {
      operationId: operationLog.operationId,
      status: operationLog.status,
      progress: operationLog.progress,
      totalRecords: operationLog.totalRecords,
      processedRecords: operationLog.processedRecords,
      failedRecords: operationLog.failedRecords,
      errors: operationLog.errors,
      warnings: operationLog.warnings,
    };
  }

  /**
   * Get operation history
   */
  async getOperationHistory(tenantId: string, limit: number = 50): Promise<BulkOperationLog[]> {
    const operations = Array.from(this.operationLogs.values())
      .filter(op => op.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return operations;
  }

  /**
   * Validate bulk operation request
   */
  private validateBulkOperation(request: BulkOperationRequest): void {
    if (!request.leadIds || request.leadIds.length === 0) {
      throw new BadRequestException('No lead IDs provided');
    }

    if (request.leadIds.length > 1000) {
      throw new BadRequestException('Maximum 1000 leads can be processed in a single operation');
    }

    if (!request.operation) {
      throw new BadRequestException('Operation type is required');
    }

    if (['update', 'assign', 'changeStatus', 'changeStage'].includes(request.operation) && !request.data) {
      throw new BadRequestException('Data is required for this operation');
    }
  }

  /**
   * Bulk update leads
   */
  private async bulkUpdate(request: BulkOperationRequest, result: BulkOperationResult, operationId: string): Promise<void> {
    const batchSize = 50;
    const totalBatches = Math.ceil(request.leadIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = request.leadIds.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        const updateResult = await this.leadModel.updateMany(
          { _id: { $in: batchIds }, tenantId: request.tenantId },
          { 
            $set: { 
              ...request.data,
              updatedBy: request.userId,
              updatedAt: new Date(),
            }
          }
        );

        result.processedRecords += updateResult.modifiedCount;
        
        // Update progress
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        result.progress = progress;
        
        const operationLog = this.operationLogs.get(operationId);
        if (operationLog) {
          operationLog.progress = progress;
          operationLog.processedRecords = result.processedRecords;
        }

        this.logger.log(`Bulk update batch ${i + 1}/${totalBatches} completed: ${updateResult.modifiedCount} records updated`);
      } catch (error) {
        this.logger.error(`Bulk update batch ${i + 1} failed:`, error);
        
        batchIds.forEach(leadId => {
          result.errors.push({
            leadId,
            operation: 'update',
            message: error.message,
            data: request.data,
          });
        });
        
        result.failedRecords += batchIds.length;
      }
    }
  }

  /**
   * Bulk delete leads (soft delete)
   */
  private async bulkDelete(request: BulkOperationRequest, result: BulkOperationResult, operationId: string): Promise<void> {
    const batchSize = 50;
    const totalBatches = Math.ceil(request.leadIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = request.leadIds.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        const deleteResult = await this.leadModel.updateMany(
          { _id: { $in: batchIds }, tenantId: request.tenantId },
          { 
            $set: { 
              deletedAt: new Date(),
              updatedBy: request.userId,
              updatedAt: new Date(),
            }
          }
        );

        result.processedRecords += deleteResult.modifiedCount;
        
        // Update progress
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        result.progress = progress;
        
        const operationLog = this.operationLogs.get(operationId);
        if (operationLog) {
          operationLog.progress = progress;
          operationLog.processedRecords = result.processedRecords;
        }

        this.logger.log(`Bulk delete batch ${i + 1}/${totalBatches} completed: ${deleteResult.modifiedCount} records deleted`);
      } catch (error) {
        this.logger.error(`Bulk delete batch ${i + 1} failed:`, error);
        
        batchIds.forEach(leadId => {
          result.errors.push({
            leadId,
            operation: 'delete',
            message: error.message,
          });
        });
        
        result.failedRecords += batchIds.length;
      }
    }
  }

  /**
   * Bulk assign leads
   */
  private async bulkAssign(request: BulkOperationRequest, result: BulkOperationResult, operationId: string): Promise<void> {
    const batchSize = 50;
    const totalBatches = Math.ceil(request.leadIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = request.leadIds.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        const assignResult = await this.leadModel.updateMany(
          { _id: { $in: batchIds }, tenantId: request.tenantId },
          { 
            $set: { 
              assignedTo: request.data.assignedTo,
              updatedBy: request.userId,
              updatedAt: new Date(),
            }
          }
        );

        result.processedRecords += assignResult.modifiedCount;
        
        // Update progress
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        result.progress = progress;
        
        const operationLog = this.operationLogs.get(operationId);
        if (operationLog) {
          operationLog.progress = progress;
          operationLog.processedRecords = result.processedRecords;
        }

        this.logger.log(`Bulk assign batch ${i + 1}/${totalBatches} completed: ${assignResult.modifiedCount} records assigned`);
      } catch (error) {
        this.logger.error(`Bulk assign batch ${i + 1} failed:`, error);
        
        batchIds.forEach(leadId => {
          result.errors.push({
            leadId,
            operation: 'assign',
            message: error.message,
            data: request.data,
          });
        });
        
        result.failedRecords += batchIds.length;
      }
    }
  }

  /**
   * Bulk change status
   */
  private async bulkChangeStatus(request: BulkOperationRequest, result: BulkOperationResult, operationId: string): Promise<void> {
    const batchSize = 50;
    const totalBatches = Math.ceil(request.leadIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = request.leadIds.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        const statusResult = await this.leadModel.updateMany(
          { _id: { $in: batchIds }, tenantId: request.tenantId },
          { 
            $set: { 
              status: request.data.status,
              updatedBy: request.userId,
              updatedAt: new Date(),
            }
          }
        );

        result.processedRecords += statusResult.modifiedCount;
        
        // Update progress
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        result.progress = progress;
        
        const operationLog = this.operationLogs.get(operationId);
        if (operationLog) {
          operationLog.progress = progress;
          operationLog.processedRecords = result.processedRecords;
        }

        this.logger.log(`Bulk status change batch ${i + 1}/${totalBatches} completed: ${statusResult.modifiedCount} records updated`);
      } catch (error) {
        this.logger.error(`Bulk status change batch ${i + 1} failed:`, error);
        
        batchIds.forEach(leadId => {
          result.errors.push({
            leadId,
            operation: 'changeStatus',
            message: error.message,
            data: request.data,
          });
        });
        
        result.failedRecords += batchIds.length;
      }
    }
  }

  /**
   * Bulk change stage
   */
  private async bulkChangeStage(request: BulkOperationRequest, result: BulkOperationResult, operationId: string): Promise<void> {
    const batchSize = 50;
    const totalBatches = Math.ceil(request.leadIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = request.leadIds.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        const stageResult = await this.leadModel.updateMany(
          { _id: { $in: batchIds }, tenantId: request.tenantId },
          { 
            $set: { 
              stageId: request.data.stageId,
              updatedBy: request.userId,
              updatedAt: new Date(),
            }
          }
        );

        result.processedRecords += stageResult.modifiedCount;
        
        // Update progress
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        result.progress = progress;
        
        const operationLog = this.operationLogs.get(operationId);
        if (operationLog) {
          operationLog.progress = progress;
          operationLog.processedRecords = result.processedRecords;
        }

        this.logger.log(`Bulk stage change batch ${i + 1}/${totalBatches} completed: ${stageResult.modifiedCount} records updated`);
      } catch (error) {
        this.logger.error(`Bulk stage change batch ${i + 1} failed:`, error);
        
        batchIds.forEach(leadId => {
          result.errors.push({
            leadId,
            operation: 'changeStage',
            message: error.message,
            data: request.data,
          });
        });
        
        result.failedRecords += batchIds.length;
      }
    }
  }

  /**
   * Get original data for undo functionality
   */
  private async getOriginalData(leadIds: string[], tenantId: string): Promise<Record<string, any>[]> {
    const leads = await this.leadModel.find(
      { _id: { $in: leadIds }, tenantId },
      { _id: 1, status: 1, assignedTo: 1, stageId: 1 }
    ).lean();

    return leads.map(lead => ({
      leadId: lead._id.toString(),
      status: lead.status,
      assignedTo: lead.assignedTo,
      stageId: lead.stageId,
    }));
  }

  /**
   * Restore original data
   */
  private async restoreOriginalData(
    leadIds: string[], 
    originalData: Record<string, any>[], 
    tenantId: string, 
    result: BulkOperationResult, 
    operationId: string
  ): Promise<void> {
    const batchSize = 50;
    const totalBatches = Math.ceil(leadIds.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const batchIds = leadIds.slice(i * batchSize, (i + 1) * batchSize);
      
      try {
        for (const leadId of batchIds) {
          const original = originalData.find(data => data.leadId === leadId);
          if (original) {
            await this.leadModel.updateOne(
              { _id: leadId, tenantId },
              { 
                $set: { 
                  status: original.status,
                  assignedTo: original.assignedTo,
                  stageId: original.stageId,
                  updatedAt: new Date(),
                }
              }
            );
            result.processedRecords++;
          }
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        result.progress = progress;
        
        const operationLog = this.operationLogs.get(operationId);
        if (operationLog) {
          operationLog.progress = progress;
          operationLog.processedRecords = result.processedRecords;
        }

        this.logger.log(`Restore batch ${i + 1}/${totalBatches} completed`);
      } catch (error) {
        this.logger.error(`Restore batch ${i + 1} failed:`, error);
        
        batchIds.forEach(leadId => {
          result.errors.push({
            leadId,
            operation: 'restore',
            message: error.message,
          });
        });
        
        result.failedRecords += batchIds.length;
      }
    }
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get bulk operation statistics
   */
  async getBulkOperationStats(leadIds: string[], tenantId: string): Promise<{
    totalLeads: number;
    validLeads: number;
    invalidLeads: number;
    leadStatuses: Record<string, number>;
    leadStages: Record<string, number>;
  }> {
    const leads = await this.leadModel.find(
      { _id: { $in: leadIds }, tenantId },
      { status: 1, stageId: 1 }
    ).lean();

    const leadStatuses: Record<string, number> = {};
    const leadStages: Record<string, number> = {};

    leads.forEach(lead => {
      leadStatuses[lead.status] = (leadStatuses[lead.status] || 0) + 1;
      if (lead.stageId) {
        leadStages[lead.stageId] = (leadStages[lead.stageId] || 0) + 1;
      }
    });

    return {
      totalLeads: leadIds.length,
      validLeads: leads.length,
      invalidLeads: leadIds.length - leads.length,
      leadStatuses,
      leadStages,
    };
  }

  /**
   * Validate lead IDs
   */
  async validateLeadIds(leadIds: string[], tenantId: string): Promise<{
    validIds: string[];
    invalidIds: string[];
  }> {
    const validLeads = await this.leadModel.find(
      { _id: { $in: leadIds }, tenantId },
      { _id: 1 }
    ).lean();

    const validIds = validLeads.map(lead => lead._id.toString());
    const invalidIds = leadIds.filter(id => !validIds.includes(id));

    return {
      validIds,
      invalidIds,
    };
  }
} 