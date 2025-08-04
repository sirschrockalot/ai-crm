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
}

export interface BulkOperationError {
  leadId: string;
  operation: string;
  message: string;
  data?: any;
}

@Injectable()
export class BulkOperationsService {
  private readonly logger = new Logger(BulkOperationsService.name);

  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {}

  /**
   * Execute bulk operation on leads
   */
  async executeBulkOperation(request: BulkOperationRequest): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: false,
      totalRecords: request.leadIds.length,
      processedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Validate operation
      this.validateBulkOperation(request);

      // Execute operation based on type
      switch (request.operation) {
        case 'update':
          await this.bulkUpdate(request, result);
          break;
        case 'delete':
          await this.bulkDelete(request, result);
          break;
        case 'assign':
          await this.bulkAssign(request, result);
          break;
        case 'changeStatus':
          await this.bulkChangeStatus(request, result);
          break;
        case 'changeStage':
          await this.bulkChangeStage(request, result);
          break;
        default:
          throw new BadRequestException(`Invalid operation: ${request.operation}`);
      }

      result.success = result.failedRecords === 0;
      return result;
    } catch (error) {
      this.logger.error('Bulk operation failed:', error);
      throw new BadRequestException(`Bulk operation failed: ${error.message}`);
    }
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
  private async bulkUpdate(request: BulkOperationRequest, result: BulkOperationResult): Promise<void> {
    const { leadIds, data, tenantId } = request;

    // Validate update data
    const allowedFields = ['status', 'priority', 'value', 'score', 'source', 'notes', 'tags'];
    const updateData: any = {};
    
    Object.keys(data!).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = data![key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    // Add audit fields
    updateData.updatedAt = new Date();
    updateData.updatedBy = request.userId;

    // Execute bulk update
    const updateResult = await this.leadModel.updateMany(
      { _id: { $in: leadIds }, tenantId },
      { $set: updateData },
    );

    result.processedRecords = updateResult.modifiedCount;
    result.failedRecords = leadIds.length - updateResult.modifiedCount;

    if (result.failedRecords > 0) {
      result.warnings.push(`${result.failedRecords} leads were not updated (may not exist or be accessible)`);
    }
  }

  /**
   * Bulk delete leads
   */
  private async bulkDelete(request: BulkOperationRequest, result: BulkOperationResult): Promise<void> {
    const { leadIds, tenantId } = request;

    // Soft delete by setting status to 'deleted'
    const deleteResult = await this.leadModel.updateMany(
      { _id: { $in: leadIds }, tenantId },
      { 
        $set: { 
          status: 'deleted',
          updatedAt: new Date(),
          updatedBy: request.userId,
        }
      },
    );

    result.processedRecords = deleteResult.modifiedCount;
    result.failedRecords = leadIds.length - deleteResult.modifiedCount;

    if (result.failedRecords > 0) {
      result.warnings.push(`${result.failedRecords} leads were not deleted (may not exist or be accessible)`);
    }
  }

  /**
   * Bulk assign leads
   */
  private async bulkAssign(request: BulkOperationRequest, result: BulkOperationResult): Promise<void> {
    const { leadIds, data, tenantId } = request;

    if (!data!.assignedTo) {
      throw new BadRequestException('assignedTo field is required for assignment operation');
    }

    const assignResult = await this.leadModel.updateMany(
      { _id: { $in: leadIds }, tenantId },
      { 
        $set: { 
          assignedTo: data!.assignedTo,
          updatedAt: new Date(),
          updatedBy: request.userId,
        }
      },
    );

    result.processedRecords = assignResult.modifiedCount;
    result.failedRecords = leadIds.length - assignResult.modifiedCount;

    if (result.failedRecords > 0) {
      result.warnings.push(`${result.failedRecords} leads were not assigned (may not exist or be accessible)`);
    }
  }

  /**
   * Bulk change lead status
   */
  private async bulkChangeStatus(request: BulkOperationRequest, result: BulkOperationResult): Promise<void> {
    const { leadIds, data, tenantId } = request;

    if (!data!.status) {
      throw new BadRequestException('status field is required for status change operation');
    }

    const validStatuses = ['active', 'inactive', 'pending', 'blocked'];
    if (!validStatuses.includes(data!.status)) {
      throw new BadRequestException(`Invalid status: ${data!.status}. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const statusResult = await this.leadModel.updateMany(
      { _id: { $in: leadIds }, tenantId },
      { 
        $set: { 
          status: data!.status,
          updatedAt: new Date(),
          updatedBy: request.userId,
        }
      },
    );

    result.processedRecords = statusResult.modifiedCount;
    result.failedRecords = leadIds.length - statusResult.modifiedCount;

    if (result.failedRecords > 0) {
      result.warnings.push(`${result.failedRecords} leads were not updated (may not exist or be accessible)`);
    }
  }

  /**
   * Bulk change lead stage
   */
  private async bulkChangeStage(request: BulkOperationRequest, result: BulkOperationResult): Promise<void> {
    const { leadIds, data, tenantId } = request;

    if (!data!.stageId) {
      throw new BadRequestException('stageId field is required for stage change operation');
    }

    const stageResult = await this.leadModel.updateMany(
      { _id: { $in: leadIds }, tenantId },
      { 
        $set: { 
          stageId: data!.stageId,
          updatedAt: new Date(),
          updatedBy: request.userId,
        }
      },
    );

    result.processedRecords = stageResult.modifiedCount;
    result.failedRecords = leadIds.length - stageResult.modifiedCount;

    if (result.failedRecords > 0) {
      result.warnings.push(`${result.failedRecords} leads were not updated (may not exist or be accessible)`);
    }
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

    const stats = {
      totalLeads: leadIds.length,
      validLeads: leads.length,
      invalidLeads: leadIds.length - leads.length,
      leadStatuses: {} as Record<string, number>,
      leadStages: {} as Record<string, number>,
    };

    // Count statuses
    leads.forEach(lead => {
      stats.leadStatuses[lead.status] = (stats.leadStatuses[lead.status] || 0) + 1;
      stats.leadStages[lead.stageId] = (stats.leadStages[lead.stageId] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validate lead IDs exist and are accessible
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

    return { validIds, invalidIds };
  }
} 