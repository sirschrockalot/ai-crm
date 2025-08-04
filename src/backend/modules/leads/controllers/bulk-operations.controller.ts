import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserId } from '../../../common/decorators/user-id.decorator';
import { BulkOperationsService, BulkOperationRequest, BulkOperationResult } from '../services/bulk-operations.service';

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

    const { validIds, invalidIds } = await this.bulkOperationsService.validateLeadIds(leadIds, tenantId);

    return {
      validIds,
      invalidIds,
      totalIds: leadIds.length,
      validCount: validIds.length,
      invalidCount: invalidIds.length,
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
   * Bulk delete leads (soft delete)
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
   * Bulk change lead status
   */
  @Post('change-status')
  @Roles('admin', 'manager')
  async bulkChangeStatus(
    @Body() statusDto: {
      leadIds: string[];
      status: 'active' | 'inactive' | 'pending' | 'blocked';
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
   * Bulk change lead stage
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