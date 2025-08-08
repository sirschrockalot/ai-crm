import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { BulkOperationsService, BulkOperationRequest, BulkOperationResult, BulkOperationLog } from '../services/bulk-operations.service';

export interface BulkOperationDto {
  leadIds: string[];
  operation: 'update' | 'delete' | 'assign' | 'changeStatus' | 'changeStage';
  data?: Record<string, any>;
}

@Controller('leads/bulk')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BulkOperationsController {
  constructor(
    private readonly bulkOperationsService: BulkOperationsService,
  ) {}

  /**
   * Execute bulk operation on leads
   */
  @Post('execute')
  @Roles('admin', 'manager')
  async executeBulkOperation(
    @Body() bulkOperationDto: BulkOperationDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    const request: BulkOperationRequest = {
      ...bulkOperationDto,
      tenantId,
      userId,
    };

    return await this.bulkOperationsService.executeBulkOperation(request);
  }

  /**
   * Undo a bulk operation
   */
  @Post('undo/:operationId')
  @Roles('admin', 'manager')
  async undoBulkOperation(
    @Param('operationId') operationId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    return await this.bulkOperationsService.undoBulkOperation(operationId, userId);
  }

  /**
   * Get operation progress
   */
  @Get('progress/:operationId')
  @Roles('admin', 'manager')
  async getOperationProgress(
    @Param('operationId') operationId: string,
  ): Promise<{
    operationId: string;
    status: string;
    progress: number;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    errors: any[];
    warnings: string[];
  } | null> {
    return await this.bulkOperationsService.getOperationProgress(operationId);
  }

  /**
   * Get operation history
   */
  @Get('history')
  @Roles('admin', 'manager')
  async getOperationHistory(
    @TenantId() tenantId: string,
    @Query('limit') limitParam?: string,
  ): Promise<BulkOperationLog[]> {
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    return await this.bulkOperationsService.getOperationHistory(tenantId, limit);
  }

  /**
   * Get bulk operation statistics
   */
  @Get('stats')
  @Roles('admin', 'manager')
  async getBulkOperationStats(
    @Query('leadIds') leadIdsParam: string,
    @TenantId() tenantId: string,
  ): Promise<{
    totalLeads: number;
    validLeads: number;
    invalidLeads: number;
    leadStatuses: Record<string, number>;
    leadStages: Record<string, number>;
  }> {
    if (!leadIdsParam) {
      throw new BadRequestException('leadIds parameter is required');
    }

    const leadIds = leadIdsParam.split(',').map(id => id.trim()).filter(id => id);
    
    if (leadIds.length === 0) {
      throw new BadRequestException('At least one lead ID is required');
    }

    return await this.bulkOperationsService.getBulkOperationStats(leadIds, tenantId);
  }

  /**
   * Validate lead IDs for bulk operations
   */
  @Get('validate')
  @Roles('admin', 'manager')
  async validateLeadIds(
    @Query('leadIds') leadIdsParam: string,
    @TenantId() tenantId: string,
  ): Promise<{
    validIds: string[];
    invalidIds: string[];
    totalIds: number;
    validCount: number;
    invalidCount: number;
  }> {
    if (!leadIdsParam) {
      throw new BadRequestException('leadIds parameter is required');
    }

    const leadIds = leadIdsParam.split(',').map(id => id.trim()).filter(id => id);
    
    if (leadIds.length === 0) {
      throw new BadRequestException('At least one lead ID is required');
    }

    const validation = await this.bulkOperationsService.validateLeadIds(leadIds, tenantId);

    return {
      ...validation,
      totalIds: leadIds.length,
      validCount: validation.validIds.length,
      invalidCount: validation.invalidIds.length,
    };
  }

  /**
   * Bulk update leads
   */
  @Post('update')
  @Roles('admin', 'manager')
  async bulkUpdate(
    @Body() updateDto: {
      leadIds: string[];
      data: Record<string, any>;
    },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    const request: BulkOperationRequest = {
      leadIds: updateDto.leadIds,
      operation: 'update',
      data: updateDto.data,
      tenantId,
      userId,
    };

    return await this.bulkOperationsService.executeBulkOperation(request);
  }

  /**
   * Bulk delete leads
   */
  @Post('delete')
  @Roles('admin', 'manager')
  async bulkDelete(
    @Body() deleteDto: {
      leadIds: string[];
    },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    const request: BulkOperationRequest = {
      leadIds: deleteDto.leadIds,
      operation: 'delete',
      tenantId,
      userId,
    };

    return await this.bulkOperationsService.executeBulkOperation(request);
  }

  /**
   * Bulk assign leads
   */
  @Post('assign')
  @Roles('admin', 'manager')
  async bulkAssign(
    @Body() assignDto: {
      leadIds: string[];
      assignedTo: string;
    },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    const request: BulkOperationRequest = {
      leadIds: assignDto.leadIds,
      operation: 'assign',
      data: { assignedTo: assignDto.assignedTo },
      tenantId,
      userId,
    };

    return await this.bulkOperationsService.executeBulkOperation(request);
  }

  /**
   * Bulk change status
   */
  @Post('change-status')
  @Roles('admin', 'manager')
  async bulkChangeStatus(
    @Body() statusDto: {
      leadIds: string[];
      status: string;
    },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    const request: BulkOperationRequest = {
      leadIds: statusDto.leadIds,
      operation: 'changeStatus',
      data: { status: statusDto.status },
      tenantId,
      userId,
    };

    return await this.bulkOperationsService.executeBulkOperation(request);
  }

  /**
   * Bulk change stage
   */
  @Post('change-stage')
  @Roles('admin', 'manager')
  async bulkChangeStage(
    @Body() stageDto: {
      leadIds: string[];
      stageId: string;
    },
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<BulkOperationResult> {
    const request: BulkOperationRequest = {
      leadIds: stageDto.leadIds,
      operation: 'changeStage',
      data: { stageId: stageDto.stageId },
      tenantId,
      userId,
    };

    return await this.bulkOperationsService.executeBulkOperation(request);
  }
} 